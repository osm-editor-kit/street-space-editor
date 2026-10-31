import type { LatLngLiteral, OsmNode, OsmRelation, OsmWay } from '@osm-editor-kit/osm-data'
import { josmRemoteBase } from './hosts'
import type { OsmObjectType } from './osm-type'
import { toShortOsmType } from './osm-type'

type IdEditorUrlProps = {
  center?: LatLngLiteral
  zoom?: number
  background?: string
  osmObjectType?: OsmRelation['type'] | OsmWay['type'] | OsmNode['type']
  osmObjectId?: number | string
}

/** iD hosted on ideditor-release.netlify.app (parking-lanes default). */
export function idEditorUrl({
  center,
  zoom,
  background,
  osmObjectType,
  osmObjectId,
}: IdEditorUrlProps) {
  const params: Record<string, string> = {
    disable_features: 'boundaries',
    photo_overlay: 'streetside,mapillary,kartaview',
  }
  if (zoom && center) params.map = `${zoom}/${center.lat}/${center.lng}`
  if (background) params.background = background
  if (osmObjectType && osmObjectId) params.id = `${osmObjectType.charAt(0)}${osmObjectId}`
  const hashUrlParams = new URLSearchParams(params)

  return `https://ideditor-release.netlify.app/#${hashUrlParams.toString()}`
}

type OsmEditIdUrlProps = {
  osmType: OsmObjectType | null | undefined
  osmId: number | string | null | undefined
  comment?: string
  hashtags?: string
  source?: string
}

/** Official OSM.org iD edit URL (TILDA-style, with optional hashtags). */
export function osmEditIdUrl({
  osmType,
  osmId,
  comment,
  hashtags,
  source,
}: OsmEditIdUrlProps): string | undefined {
  if (!osmType || osmId == null || osmId === '') return undefined
  const url = new URL('https://www.openstreetmap.org/edit')
  url.searchParams.append(osmType, String(osmId))

  const hashParams = new URLSearchParams()
  if (comment) hashParams.append('comment', comment)
  if (source) hashParams.append('source', source)
  if (hashtags) hashParams.append('hashtags', hashtags)

  const hash = hashParams.toString()
  return hash ? `${url.toString()}#${hash}` : url.toString()
}

/** JOSM remote control `load_object` for a single OSM element. */
export function josmLoadObjectUrl(options: {
  osmType: OsmObjectType | null | undefined
  osmId: number | string | null | undefined
  /** Pre-fills the changeset hashtags in JOSM. Left out when empty. */
  changesetHashtags?: string
}): string | undefined {
  const { osmType, osmId, changesetHashtags } = options
  if (!osmType || osmId == null || osmId === '') return undefined
  const short = toShortOsmType(osmType)
  if (!short) return undefined
  const url = new URL(`${josmRemoteBase}/load_object`)
  url.searchParams.set('objects', `${short}${osmId}`)
  if (changesetHashtags) url.searchParams.set('changeset_hashtags', changesetHashtags)
  return url.toString()
}

/**
 * JOSM remote control `import?url=`: loads the data at `url` (an Overpass query, a map download
 * or a changeset download). The url is appended as is: JOSM reads everything after `url=` as the
 * URL, including `&`, so it must stay the last parameter and needs no percent-encoding.
 * @see https://josm.openstreetmap.de/wiki/Help/RemoteControlCommands#import
 */
export function josmImportUrl(url: string): string {
  return `${josmRemoteBase}/import?url=${url}`
}
