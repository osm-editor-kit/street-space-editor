import type { ParsedOsmData } from '@osm-editor-kit/osm-data'
import initOsmToRouteSnapper, {
  convert as convertOsmToRouteSnapper,
} from '../vendor/osm-to-route-snapper/osm_to_route_snapper.js'
import { parsedOsmToXml } from './parsed-osm-to-xml'

let initPromise: Promise<void> | undefined

async function ensureOsmToRouteSnapperReady() {
  if (!initPromise) {
    initPromise = initOsmToRouteSnapper().then(() => undefined)
  }
  await initPromise
}

function coverageBoundaryGeoJson(data: ParsedOsmData): string | null {
  let west = Infinity
  let south = Infinity
  let east = -Infinity
  let north = -Infinity

  for (const coords of Object.values(data.nodeCoords)) {
    const [lat, lon] = coords
    west = Math.min(west, lon)
    east = Math.max(east, lon)
    south = Math.min(south, lat)
    north = Math.max(north, lat)
  }

  // No node coordinates: there is nothing to route on.
  if (!Number.isFinite(west)) return null

  const pad = 0.002
  west -= pad
  east += pad
  south -= pad
  north += pad

  return JSON.stringify({
    type: 'Polygon',
    coordinates: [
      [
        [west, south],
        [east, south],
        [east, north],
        [west, north],
        [west, south],
      ],
    ],
  })
}

/**
 * Convert merged session OSM coverage into route-snapper bincode graph bytes.
 * Uses prebuilt osm-to-route-snapper WASM (no Rust fork) — full rebuild from the
 * current ParsedOsmData whenever coverage grows (WASM has no incremental merge API).
 */
export async function buildRouteSnapperGraphBytes(data: ParsedOsmData) {
  const wayCount = Object.keys(data.ways).length
  if (wayCount === 0) return null

  const boundary = coverageBoundaryGeoJson(data)
  if (!boundary) return null

  await ensureOsmToRouteSnapperReady()
  const xml = parsedOsmToXml(data)
  const input = new TextEncoder().encode(xml)
  return convertOsmToRouteSnapper(input, boundary)
}
