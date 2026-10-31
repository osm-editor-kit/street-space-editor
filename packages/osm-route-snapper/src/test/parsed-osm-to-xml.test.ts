import { describe, expect, test } from 'bun:test'
import { emptyParsedOsmData } from '@osm-editor-kit/osm-data'
import { parsedOsmToXml } from '../parsed-osm-to-xml'

describe('parsedOsmToXml', () => {
  test('escapes XML special characters in tag keys and values', () => {
    const data = emptyParsedOsmData()
    data.nodeCoords[1] = [52.5, 13.4]
    data.ways[10] = {
      type: 'way',
      id: 10,
      nodes: [1],
      version: 2,
      changeset: 7,
      tags: { 'a&b': `"x" <y> 'z'` },
    }

    const xml = parsedOsmToXml(data)

    expect(xml).toContain('<tag k="a&amp;b" v="&quot;x&quot; &lt;y&gt; &apos;z&apos;"/>')
    expect(xml).not.toContain('<y>')
  })

  test('renders tagged nodes with their own version and changeset', () => {
    const data = emptyParsedOsmData()
    data.nodes[1] = {
      type: 'node',
      id: 1,
      lat: 52.5,
      lon: 13.4,
      version: 3,
      changeset: 9,
      tags: { highway: 'crossing' },
    }
    data.ways[10] = {
      type: 'way',
      id: 10,
      nodes: [1],
      version: 1,
      changeset: 0,
      tags: { highway: 'residential' },
    }

    const xml = parsedOsmToXml(data)

    expect(xml).toContain('<node id="1" lat="52.5" lon="13.4" version="3" changeset="9"/>')
    expect(xml).toContain('<way id="10" version="1" changeset="0"><nd ref="1"/>')
  })

  test('falls back to nodeCoords (lat, lon) for untagged nodes', () => {
    const data = emptyParsedOsmData()
    data.nodeCoords[2] = [52.51, 13.41]
    data.ways[10] = {
      type: 'way',
      id: 10,
      nodes: [2],
      version: 1,
      changeset: 0,
      tags: { highway: 'service' },
    }

    expect(parsedOsmToXml(data)).toContain(
      '<node id="2" lat="52.51" lon="13.41" version="1" changeset="0"/>',
    )
  })

  test('skips way nodes without any coordinates and wraps the document', () => {
    const data = emptyParsedOsmData()
    data.ways[10] = {
      type: 'way',
      id: 10,
      nodes: [99],
      version: 1,
      changeset: 0,
      tags: {},
    }

    const xml = parsedOsmToXml(data)

    expect(xml).not.toContain('<node ')
    expect(xml).toContain('<nd ref="99"/>')
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?><osm version="0.6"')).toBe(true)
    expect(xml.endsWith('</osm>')).toBe(true)
  })
})
