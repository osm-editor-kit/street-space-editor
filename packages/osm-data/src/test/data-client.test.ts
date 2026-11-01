import { afterEach, describe, expect, test } from 'bun:test'
import { downloadOsmData, emptyParsedOsmData, mergeParsedOsm, parseOsmResp } from '../data-client'

const originalFetch = globalThis.fetch

function stubFetch(response: Response) {
  const calls: { url: string; init?: RequestInit }[] = []
  globalThis.fetch = (async (url: string, init?: RequestInit) => {
    calls.push({ url, init })
    return response
  }) as typeof fetch
  return calls
}

afterEach(() => {
  globalThis.fetch = originalFetch
})

describe('downloadOsmData', () => {
  test('requests JSON and parses the elements', async () => {
    const calls = stubFetch(
      Response.json({ elements: [{ type: 'node', id: 1, lat: 52.47, lon: 13.44 }] }),
    )

    const parsed = await downloadOsmData('https://example.org/map')

    expect(calls[0]?.url).toBe('https://example.org/map')
    expect(calls[0]?.init?.headers).toEqual({ Accept: 'application/json' })
    expect(parsed.nodeCoords[1]).toEqual([52.47, 13.44])
  })

  test('rejects on an HTTP error, with the message the app matches for 429', async () => {
    stubFetch(new Response('Too Many Requests', { status: 429 }))

    await expect(downloadOsmData('https://example.org/map')).rejects.toThrow(
      'Request failed with status code 429',
    )
  })
})

describe('mergeParsedOsm', () => {
  test('merges nodes and keeps newer way versions', () => {
    const existing = emptyParsedOsmData()
    existing.ways[1] = {
      type: 'way',
      id: 1,
      version: 1,
      nodes: [10, 11],
      tags: { highway: 'residential' },
    }

    const incoming = emptyParsedOsmData()
    incoming.nodeCoords[10] = [52.47, 13.44]
    incoming.ways[1] = {
      type: 'way',
      id: 1,
      version: 2,
      nodes: [10, 11],
      tags: { highway: 'residential', 'parking:lane:right': 'parallel' },
    }

    const merged = mergeParsedOsm(existing, incoming)
    expect(merged.nodeCoords[10]).toEqual([52.47, 13.44])
    expect(merged.ways[1]?.version).toBe(2)
    expect(merged.ways[1]?.tags['parking:lane:right']).toBe('parallel')
  })

  test('keeps existing way when incoming version is older', () => {
    const existing = emptyParsedOsmData()
    existing.ways[1] = {
      type: 'way',
      id: 1,
      version: 3,
      nodes: [10],
      tags: { highway: 'residential', name: 'Kept' },
    }

    const incoming = emptyParsedOsmData()
    incoming.ways[1] = {
      type: 'way',
      id: 1,
      version: 2,
      nodes: [10],
      tags: { highway: 'residential', name: 'Stale' },
    }

    const merged = mergeParsedOsm(existing, incoming)
    expect(merged.ways[1]?.tags.name).toBe('Kept')
  })
})

describe('parseOsmResp', () => {
  test('parses ways and relation membership', () => {
    const parsed = parseOsmResp({
      elements: [
        {
          type: 'way',
          id: 42,
          version: 1,
          nodes: [1, 2],
          tags: { highway: 'residential' },
        },
        {
          type: 'relation',
          id: 7,
          version: 1,
          members: [{ type: 'way', ref: 42, role: 'outer' }],
          tags: { amenity: 'parking' },
        },
      ],
    })

    expect(parsed.ways[42]?.id).toBe(42)
    expect(parsed.relations[7]?.id).toBe(7)
    expect(parsed.waysInRelation[42]).toBe(true)
  })
})
