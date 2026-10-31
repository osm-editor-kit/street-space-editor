import type { NeighborDirection, Segment } from '../domain/types'

/** Last node for `forward`, first node for `backward`. */
export function getEndpointNodeId(segment: Segment, direction: NeighborDirection): number {
  const { nodeIds } = segment
  return direction === 'forward' ? nodeIds[nodeIds.length - 1]! : nodeIds[0]!
}

/** The endpoint opposite `sharedNodeId`, or `undefined` when `sharedNodeId` is not an endpoint. */
export function getOtherEndpointNodeId(segment: Segment, sharedNodeId: number): number | undefined {
  const first = segment.nodeIds[0]
  const last = segment.nodeIds[segment.nodeIds.length - 1]
  if (first === sharedNodeId) return last
  if (last === sharedNodeId) return first
  return undefined
}

/** The node where the endpoints of `a` and `b` meet, or `undefined` when they do not touch. */
export function getSharedNodeBetween(a: Segment, b: Segment): number | undefined {
  const aEnds = new Set([a.nodeIds[0], a.nodeIds[a.nodeIds.length - 1]])
  for (const nodeId of [b.nodeIds[0], b.nodeIds[b.nodeIds.length - 1]]) {
    if (nodeId != null && aEnds.has(nodeId)) return nodeId
  }
  return undefined
}
