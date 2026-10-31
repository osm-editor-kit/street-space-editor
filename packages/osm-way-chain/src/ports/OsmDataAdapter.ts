import type { Segment } from '../domain/types'

/** Data source for chain building. */
export type OsmDataAdapter = {
  /** Rejects when the way is unknown. */
  getWay: (wayId: number) => Promise<Segment>
  /** All ways that use this node, at any position. */
  getWaysForNode: (nodeId: number) => Promise<Segment[]>
}
