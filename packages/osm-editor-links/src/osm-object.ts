import { osmProdUrl } from './hosts'
import type { OsmObjectType } from './osm-type'

export type OsmTypeId = {
  osmType: OsmObjectType | null | undefined
  osmId: number | string | null | undefined
}

/** `https://www.openstreetmap.org/{type}/{id}` (or the same path on `server`). */
export function osmOrgUrl({ osmType, osmId }: OsmTypeId, server = osmProdUrl): string | undefined {
  if (!osmType || osmId == null || osmId === '') return undefined
  return `${server}/${osmType}/${osmId}`
}

/** OSM website object history page (`…/{type}/{id}/history`, or on `server`). */
export function osmObjectHistoryUrl(
  { osmType, osmId }: OsmTypeId,
  server = osmProdUrl,
): string | undefined {
  if (!osmType || osmId == null || osmId === '') return undefined
  return `${server}/${osmType}/${osmId}/history`
}

/** `https://www.openstreetmap.org/changeset/{id}` (or the same path on `server`). */
export function osmChangesetUrl(changesetId: number | string, server = osmProdUrl): string {
  return `${server}/changeset/${changesetId}`
}
