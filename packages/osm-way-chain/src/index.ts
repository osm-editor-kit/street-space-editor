export type { JunctionChoice, NeighborDirection, Segment, SegmentChain } from './domain/types'
export type { OsmDataAdapter } from './ports/OsmDataAdapter'
export { createSessionGraphAdapter, osmWayToSegment } from './session-graph-adapter'
export {
  buildChain,
  extendChainAtJunction,
  recenterChain,
  type BuildChainOptions,
  type BuildChainResult,
  type ExtendChainAtJunctionOptions,
} from './traversal/buildChain'
export type { CandidateFilter } from './traversal/neighborMatch'
export {
  getEndpointNodeId,
  getOtherEndpointNodeId,
  getSharedNodeBetween,
} from './traversal/endpoints'
export { normalizeTagsForDirection, orientNeighbor, swapLeftRightKey } from './traversal/direction'
export { mirrorTags } from './traversal/mirror-tags'
export {
  buildWaysOverpassQuery,
  compileOverpassWaySelector,
  compileOverpassWaySelectors,
  matchesOsmWaySelection,
  matchesOsmWaySelectionSegment,
  tag,
  type OsmTagPredicate,
  type OsmWayFilterClause,
  type OsmWaySelectionPolicy,
} from './way-selection-policy'
