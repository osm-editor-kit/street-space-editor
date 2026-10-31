import type { JunctionChoice, NeighborDirection, Segment, SegmentChain } from '../domain/types'
import type { OsmDataAdapter } from '../ports/OsmDataAdapter'
import { orientNeighbor } from './direction'
import { getEndpointNodeId } from './endpoints'
import { type CandidateFilter, filterNeighborCandidates, pickBestNeighbor } from './neighborMatch'

const DEFAULT_MAX_PER_SIDE = 5

export type BuildChainOptions = {
  centerWayId: number
  /** Maximum number of ways to add on each side of the center. Default 5. */
  maxPerSide?: number
  /** Already loaded segments keyed by id; skips `adapter.getWay` for these. */
  knownSegments?: Map<number, Segment>
  /** Restricts which ways may join the chain. */
  candidateFilter?: CandidateFilter
}

export type ExtendChainAtJunctionOptions = {
  /** Maximum number of ways to add after the selected way. Default 5. */
  maxPerSide?: number
  /** Restricts which ways may join the chain. */
  candidateFilter?: CandidateFilter
}

export type BuildChainResult = {
  chain: SegmentChain
  pendingJunctions: JunctionChoice[]
}

async function loadSegment(
  adapter: OsmDataAdapter,
  id: number,
  cache: Map<number, Segment>,
): Promise<Segment> {
  const cached = cache.get(id)
  if (cached) return cached
  const segment = await adapter.getWay(id)
  cache.set(id, segment)
  return segment
}

async function extendChain(
  adapter: OsmDataAdapter,
  cache: Map<number, Segment>,
  start: Segment,
  direction: NeighborDirection,
  maxCount: number,
  candidateFilter?: CandidateFilter,
): Promise<{ extension: Segment[]; pendingJunctions: JunctionChoice[] }> {
  const extension: Segment[] = []
  const pendingJunctions: JunctionChoice[] = []
  let current = start

  for (let i = 0; i < maxCount; i++) {
    const endpoint = getEndpointNodeId(current, direction)
    const rawNeighbors = await adapter.getWaysForNode(endpoint)
    const candidates = filterNeighborCandidates(current, rawNeighbors, direction, candidateFilter)
    const best = pickBestNeighbor(current, candidates)

    if (!best) {
      if (candidates.length > 1) {
        pendingJunctions.push({ nodeId: endpoint, direction, candidates })
      }
      break
    }

    const fullBest = await loadSegment(adapter, best.id, cache)
    const oriented = orientNeighbor(fullBest, endpoint, current)
    extension.push(oriented)
    current = oriented
  }

  return { extension, pendingJunctions }
}

/**
 * Walks connected ways backward and forward from `centerWayId` and orients them into one chain.
 * Stops on each side at `maxPerSide`, at a dead end, or at a junction it cannot decide
 * (reported in `pendingJunctions`).
 */
export async function buildChain(
  adapter: OsmDataAdapter,
  options: BuildChainOptions,
): Promise<BuildChainResult> {
  const cache = new Map(options.knownSegments ?? [])
  const maxPerSide = options.maxPerSide ?? DEFAULT_MAX_PER_SIDE
  const { candidateFilter } = options

  const center = await loadSegment(adapter, options.centerWayId, cache)

  const [backwardResult, forwardResult] = await Promise.all([
    extendChain(adapter, cache, center, 'backward', maxPerSide, candidateFilter),
    extendChain(adapter, cache, center, 'forward', maxPerSide, candidateFilter),
  ])

  const segments = [...backwardResult.extension.reverse(), center, ...forwardResult.extension]

  return {
    chain: {
      segments,
      centerIndex: backwardResult.extension.length,
    },
    pendingJunctions: [...backwardResult.pendingJunctions, ...forwardResult.pendingJunctions],
  }
}

/**
 * Continues `chain` at a pending junction with the way the user picked, then keeps walking
 * in the junction's direction. The center way stays the same.
 */
export async function extendChainAtJunction(
  adapter: OsmDataAdapter,
  chain: SegmentChain,
  choice: JunctionChoice,
  selectedWayId: number,
  options: ExtendChainAtJunctionOptions = {},
): Promise<BuildChainResult> {
  const maxPerSide = options.maxPerSide ?? DEFAULT_MAX_PER_SIDE
  const cache = new Map(chain.segments.map((s) => [s.id, s]))
  const selected = await loadSegment(adapter, selectedWayId, cache)

  const anchorIndex = choice.direction === 'forward' ? chain.segments.length - 1 : 0
  const anchor = chain.segments[anchorIndex]!
  const oriented = orientNeighbor(selected, choice.nodeId, anchor)

  const { extension, pendingJunctions } = await extendChain(
    adapter,
    cache,
    oriented,
    choice.direction,
    maxPerSide,
    options.candidateFilter,
  )

  const segments =
    choice.direction === 'forward'
      ? [...chain.segments, oriented, ...extension]
      : [...extension.reverse(), oriented, ...chain.segments]

  return {
    chain: {
      segments,
      centerIndex: chain.centerIndex + (choice.direction === 'backward' ? extension.length + 1 : 0),
    },
    pendingJunctions,
  }
}

/**
 * Moves the center to `newCenterWayId` without reloading.
 * Returns `chain` itself, unchanged, when the way is not part of the chain.
 */
export function recenterChain(chain: SegmentChain, newCenterWayId: number): SegmentChain {
  const index = chain.segments.findIndex((s) => s.id === newCenterWayId)
  if (index === -1) return chain
  return { segments: chain.segments, centerIndex: index }
}
