import type { OsmTags } from '@osm-editor-kit/osm-data'
import type { Segment } from '../domain/types'
import type { OsmDataAdapter } from '../ports/OsmDataAdapter'

export function makeSegment(
  id: number,
  nodeIds: number[],
  tags: OsmTags = { highway: 'primary' },
): Segment {
  return {
    id,
    version: 1,
    nodeIds,
    tags,
    geometry: {
      type: 'LineString',
      coordinates: nodeIds.map((_, i) => [13.0 + i * 0.001, 52.0]),
    },
  }
}

/** Adapter over the given segments; the node index is derived from their `nodeIds`. */
export function mockAdapter(segments: Segment[]): OsmDataAdapter {
  const ways = new Map(segments.map((segment) => [segment.id, segment]))
  return {
    getWay: async (wayId) => {
      const way = ways.get(wayId)
      if (!way) throw new Error(`Way ${wayId} not found`)
      return way
    },
    getWaysForNode: async (nodeId) =>
      segments.filter((segment) => segment.nodeIds.includes(nodeId)),
  }
}
