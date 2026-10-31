import type { LatLngLiteral } from './geo'

export interface LocationAndZoom {
  location: LatLngLiteral
  zoom: number
}

const TEN_YEARS_MS = 10 * 365 * 24 * 60 * 60 * 1000

export function setLocationToCookie(center: LatLngLiteral, zoom: number): void {
  const expires = new Date(Date.now() + TEN_YEARS_MS).toUTCString()
  document.cookie = `location=${zoom}/${center.lat}/${center.lng}; expires=${expires}; path=/; SameSite=Lax`
}

/** Returns `undefined` on the server, when no cookie is set, or when its value is malformed. */
export function getLocationFromCookie(): LocationAndZoom | undefined {
  if (typeof document === 'undefined') return undefined

  const locationCookie = document.cookie.split('; ').find((e) => e.startsWith('location='))
  if (locationCookie == null) return undefined

  const rawLocation = locationCookie.slice('location='.length).split('/')
  const zoom = parseInt(rawLocation[0] ?? '')
  const lat = parseFloat(rawLocation[1] ?? '')
  const lng = parseFloat(rawLocation[2] ?? '')
  if (!Number.isFinite(zoom) || !Number.isFinite(lat) || !Number.isFinite(lng)) return undefined

  return { location: { lat, lng }, zoom }
}
