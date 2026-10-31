import type { NeighborDirection, Segment } from '../domain/types'
import { getEndpointNodeId } from './endpoints'

/** Primary keys used for same-kind matching, in priority order */
const KIND_KEYS = ['highway', 'cycleway', 'footway', 'path', 'railway', 'waterway'] as const

/** Restricts which ways may join a chain. */
export type CandidateFilter = (segment: Segment) => boolean

export function getKindKey(tags: Segment['tags']): { key: string; value: string } | undefined {
  for (const key of KIND_KEYS) {
    const value = tags[key]
    if (value) return { key, value }
  }
  return undefined
}

export function sameKind(a: Segment, b: Segment): boolean {
  const kindA = getKindKey(a.tags)
  const kindB = getKindKey(b.tags)
  if (!kindA || !kindB) return false
  return kindA.key === kindB.key && kindA.value === kindB.value
}

/** Ways that start or end at `from`'s endpoint in `direction`; same-kind ways win if there are any. */
export function filterNeighborCandidates(
  from: Segment,
  candidates: Segment[],
  direction: NeighborDirection,
  candidateFilter?: CandidateFilter,
): Segment[] {
  const endpoint = getEndpointNodeId(from, direction)
  const touching = candidates.filter((c) => {
    if (c.id === from.id) return false
    if (candidateFilter && !candidateFilter(c)) return false
    const first = c.nodeIds[0]
    const last = c.nodeIds[c.nodeIds.length - 1]
    return first === endpoint || last === endpoint
  })

  const sameKindMatches = touching.filter((c) => sameKind(from, c))
  if (sameKindMatches.length > 0) return sameKindMatches
  return touching
}

/** Score for auto-follow (higher = better) */
export function scoreNeighborCandidate(from: Segment, candidate: Segment): number {
  let score = 0
  if (sameKind(from, candidate)) score += 100
  if (candidate.tags.name && candidate.tags.name === from.tags.name) score += 50
  if (candidate.tags.ref && candidate.tags.ref === from.tags.ref) score += 30
  return score
}

/** The neighbor to follow, or `undefined` when there is none or the top two tie below same kind. */
export function pickBestNeighbor(from: Segment, candidates: Segment[]): Segment | undefined {
  if (candidates.length === 0) return undefined
  if (candidates.length === 1) return candidates[0]

  const scored = candidates
    .map((c) => ({ segment: c, score: scoreNeighborCandidate(from, c) }))
    .sort((a, b) => b.score - a.score)

  const top = scored[0]!
  const second = scored[1]!
  if (top.score === second.score && top.score < 100) return undefined
  return top.segment
}
