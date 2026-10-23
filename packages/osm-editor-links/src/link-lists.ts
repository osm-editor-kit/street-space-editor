import { josmImportUrl, josmLoadObjectUrl, osmEditIdUrl } from './editors'
import { osmDeepHistoryUrl } from './history'
import {
  achaviBase,
  hdycBase,
  level0Base,
  mapillaryBase,
  missingMapsBase,
  osmProdUrl,
  osmRevertBase,
  panoramaxBase,
  pewuHistoryBase,
  rapidBase,
  resultMapsBase,
  tildaViewerBase,
} from './hosts'
import { osmChangesetUrl, osmObjectHistoryUrl, osmOrgUrl } from './osm-object'
import { type OsmObjectType, shortOsmType } from './osm-type'
import { osmchaChangesetUrl, osmchaFiltersUrl } from './osmcha'

/** One link of a list. `id` is stable: apps use it for their own translated label. */
export type OsmLink = {
  /** Stable id, e.g. `osm-history`. */
  id: string
  /** English default label. */
  label: string
  url: string
  /** ISO 3166 codes (lower case) where this link is offered, e.g. `['de']`; absent = everywhere. */
  countries?: readonly string[]
  /** JOSM remote control: open with `handleJosmLinkClick` instead of a new tab. */
  josm?: true
}

export type ElementLinksOptions = {
  type: OsmObjectType
  id: number | string
  /** Place for the imagery and TILDA links. Without it those links are left out. */
  loc?: { lat: number; lng: number }
  /** Map zoom for the place links. Default 17. */
  zoom?: number
  /** OSM website the app edits on. Default `osmProdUrl`. */
  server?: string
}

export type ChangesetLinksOptions = {
  id: number | string
  /** OSM website the app edits on. Default `osmProdUrl`. */
  server?: string
}

export type UserLinksOptions = {
  name: string
  /** OSM website the app edits on. Default `osmProdUrl`. */
  server?: string
}

type LinkExtra = { countries?: readonly string[]; josm?: true }

/** A link, or `undefined` when its URL could not be built (for example an empty id). */
function link(id: string, label: string, url: string | undefined, extra?: LinkExtra) {
  return url === undefined ? undefined : { id, label, url, ...extra }
}

function present(links: readonly (OsmLink | undefined)[]): OsmLink[] {
  return links.filter((item): item is OsmLink => item !== undefined)
}

/**
 * The server without a trailing slash, and whether it is the production website. Third-party
 * tools only read production data, so only production gets the links beyond the server's own.
 */
function website(server: string | undefined): { base: string; production: boolean } {
  const base = (server ?? osmProdUrl).replace(/\/+$/, '')
  return { base, production: base === osmProdUrl }
}

/** Links for one OSM element: history, object page, editors, viewers and imagery. */
export function elementLinks({ type, id, loc, zoom = 17, server }: ElementLinksOptions): OsmLink[] {
  const { base, production } = website(server)
  const object = { osmType: type, osmId: id }
  const links: (OsmLink | undefined)[] = [
    link('osm-history', 'OpenStreetMap history', osmObjectHistoryUrl(object, base)),
    link('osm', 'OpenStreetMap', osmOrgUrl(object, base)),
  ]
  if (production) {
    links.push(
      link('deep-history', 'OSM Deep History', osmDeepHistoryUrl(object)),
      link('pewu', 'PeWu history', id === '' ? undefined : `${pewuHistoryBase}/#/${type}/${id}`),
      link('id', 'iD', osmEditIdUrl(object)),
      link(
        'rapid',
        'Rapid',
        id === '' ? undefined : `${rapidBase}/edit#id=${shortOsmType[type]}${id}`,
      ),
      link('josm', 'JOSM', josmLoadObjectUrl({ osmType: type, osmId: id, changesetHashtags: '' }), {
        josm: true,
      }),
      link('level0', 'Level0', id === '' ? undefined : `${level0Base}/?url=${type}/${id}`),
    )
    if (loc) {
      const { lat, lng } = loc
      links.push(
        link(
          'mapillary',
          'Mapillary',
          `${mapillaryBase}/app/?${new URLSearchParams({ lat: String(lat), lng: String(lng), z: String(zoom) })}`,
        ),
        link('panoramax', 'Panoramax', `${panoramaxBase}/?focus=map&map=${zoom}/${lat}/${lng}`),
        link('tilda', 'TILDA Viewer', `${tildaViewerBase}/?map=${zoom}/${lat}/${lng}`, {
          countries: ['de'],
        }),
      )
    }
  }
  return present(links)
}

/** Links for one changeset. */
export function changesetLinks({ id, server }: ChangesetLinksOptions): OsmLink[] {
  if (id === '') return []
  const { base, production } = website(server)
  const links: (OsmLink | undefined)[] = [
    link('osm-changeset', 'OpenStreetMap changeset', osmChangesetUrl(id, base)),
  ]
  if (production) {
    links.push(
      link('osmcha', 'OSMCha', osmchaChangesetUrl(id)),
      link('achavi', 'achavi', `${achaviBase}/?changeset=${id}&relations=true`),
      link('resultmaps', 'ResultMaps', `${resultMapsBase}/osm-change-viz?c=${id}`),
      link('osm-revert', 'osm-revert', `${osmRevertBase}/?changesets=${id}`),
      link('josm', 'JOSM', `${josmImportUrl()}${osmProdUrl}/api/0.6/changeset/${id}/download`, {
        josm: true,
      }),
      link('level0', 'Level0', `${level0Base}/?url=changeset/${id}`),
    )
  }
  return present(links)
}

/** Links for one OSM user, by display name. */
export function userLinks({ name, server }: UserLinksOptions): OsmLink[] {
  if (name === '') return []
  const { base, production } = website(server)
  const encoded = encodeURIComponent(name)
  const links: (OsmLink | undefined)[] = [
    link('osm-user', 'OpenStreetMap profile', `${base}/user/${encoded}`),
  ]
  if (production) {
    links.push(
      link('hdyc', 'How did you contribute', `${hdycBase}/?${encoded}`),
      link('osmcha-user', 'OSMCha changesets', osmchaFiltersUrl({ users: name })),
      link('missingmaps', 'Missing Maps', `${missingMapsBase}/users/#/${encoded}`),
    )
  }
  return present(links)
}

/**
 * Links offered at a place: those without `countries`, and those whose `countries` contain one of
 * the codes. Codes are compared case-insensitively.
 */
export function linksIn(links: readonly OsmLink[], countryCodes: readonly string[]): OsmLink[] {
  const codes = new Set(countryCodes.map((code) => code.toLowerCase()))
  return links.filter(
    (item) => !item.countries || item.countries.some((code) => codes.has(code.toLowerCase())),
  )
}
