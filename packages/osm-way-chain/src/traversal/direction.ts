import type { OsmTags } from '@osm-editor-kit/osm-data'
import type { Segment } from '../domain/types'
import { mirrorTags } from './mirror-tags'

const LEFT_RIGHT_RE = /:(left|right)(:|$)/

/** True when both segments start (or both end) at `sharedNodeId`, so one runs against the other. */
export function isReversedAtNode(
  current: Segment,
  neighbor: Segment,
  sharedNodeId: number,
): boolean {
  const currentEnd = current.nodeIds[current.nodeIds.length - 1] === sharedNodeId ? 'end' : 'start'
  const neighborEnd =
    neighbor.nodeIds[neighbor.nodeIds.length - 1] === sharedNodeId ? 'end' : 'start'
  return currentEnd === neighborEnd
}

/** Swaps the first `:left` / `:right` part of a tag key, e.g. `cycleway:left:surface`. */
export function swapLeftRightKey(key: string): string {
  return key.replace(LEFT_RIGHT_RE, (_match, side: string, suffix: string) => {
    const swapped = side === 'left' ? 'right' : 'left'
    return `:${swapped}${suffix}`
  })
}

/** `mirrorTags(tags)` when `reversed`, otherwise `tags` itself. */
export function normalizeTagsForDirection(tags: OsmTags, reversed: boolean): OsmTags {
  if (!reversed) return tags
  return mirrorTags(tags)
}

/**
 * Re-expresses `neighbor` in the direction of `fromSegment`: when they run against each other
 * at `sharedNodeId`, node order, geometry and directional tags are flipped and `reversed` is set.
 */
export function orientNeighbor(
  neighbor: Segment,
  sharedNodeId: number,
  fromSegment: Segment,
): Segment {
  const reversed = isReversedAtNode(fromSegment, neighbor, sharedNodeId)
  if (!reversed) return { ...neighbor, reversed: false }

  return {
    ...neighbor,
    nodeIds: [...neighbor.nodeIds].reverse(),
    geometry: {
      type: 'LineString',
      coordinates: [...neighbor.geometry.coordinates].reverse(),
    },
    tags: mirrorTags(neighbor.tags),
    reversed: true,
  }
}
