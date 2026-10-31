import type { OsmTags } from '@osm-editor-kit/osm-data'
import type { LineString } from 'geojson'

/** Walking direction along a way: `forward` follows its node order, `backward` goes against it. */
export type NeighborDirection = 'backward' | 'forward'

/** One OSM way as a chain member. */
export type Segment = {
  id: number
  version: number
  nodeIds: number[]
  tags: OsmTags
  geometry: LineString
  /** True when node order, geometry and directional tags were flipped to match the chain direction */
  reversed?: boolean
}

export type SegmentChain = {
  /** Ordered segments: predecessors (left), center, successors (right) */
  segments: Segment[]
  /** Index of the center segment in `segments` */
  centerIndex: number
}

/** A junction where several neighbors are equally good; the user picks one of `candidates`. */
export type JunctionChoice = {
  nodeId: number
  direction: NeighborDirection
  candidates: Segment[]
}
