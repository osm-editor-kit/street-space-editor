import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import { getLocationFromCookie, setLocationToCookie } from '../location-cookie'

const globals = globalThis as { document?: unknown }
const originalDocument = globals.document

/** Minimal `document.cookie` jar: records the raw assignment and reads back `name=value` pairs. */
function stubDocument() {
  const assignments: string[] = []
  const jar = new Map<string, string>()
  globals.document = {
    get cookie() {
      return [...jar].map(([name, value]) => `${name}=${value}`).join('; ')
    },
    set cookie(raw: string) {
      assignments.push(raw)
      const [pair] = raw.split('; ')
      const separator = pair!.indexOf('=')
      jar.set(pair!.slice(0, separator), pair!.slice(separator + 1))
    },
  }
  return { assignments, jar }
}

beforeEach(() => {
  delete globals.document
})

afterEach(() => {
  globals.document = originalDocument
})

describe('setLocationToCookie / getLocationFromCookie', () => {
  test('round-trips location and zoom', () => {
    stubDocument()
    setLocationToCookie({ lat: 52.4751, lng: 13.4435 }, 17)
    expect(getLocationFromCookie()).toEqual({ location: { lat: 52.4751, lng: 13.4435 }, zoom: 17 })
  })

  test('writes a UTC expiry, path=/ and SameSite=Lax', () => {
    const { assignments } = stubDocument()
    setLocationToCookie({ lat: 1, lng: 2 }, 3)
    const [pair, expires, path, sameSite] = assignments[0]!.split('; ')
    expect(pair).toBe('location=3/1/2')
    expect(expires).toMatch(
      /^expires=[A-Z][a-z]{2}, \d{2} [A-Z][a-z]{2} \d{4} \d{2}:\d{2}:\d{2} GMT$/,
    )
    expect(Date.parse(expires!.slice('expires='.length))).toBeGreaterThan(Date.now())
    expect(path).toBe('path=/')
    expect(sameSite).toBe('SameSite=Lax')
  })

  test('returns undefined when no location cookie exists', () => {
    const { jar } = stubDocument()
    jar.set('other', 'value')
    expect(getLocationFromCookie()).toBeUndefined()
  })

  test('returns undefined for malformed values', () => {
    const { jar } = stubDocument()
    for (const value of ['', 'abc', '17/abc/13.4', '17/52.4', 'x/y/z']) {
      jar.set('location', value)
      expect(getLocationFromCookie()).toBeUndefined()
    }
  })

  test('returns undefined without a document (SSR)', () => {
    expect(globals.document).toBeUndefined()
    expect(getLocationFromCookie()).toBeUndefined()
  })
})
