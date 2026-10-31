import { describe, expect, test } from 'bun:test'
import { changesetLinks, elementLinks, linksIn, type OsmLink, userLinks } from '../index'

const ids = (links: readonly OsmLink[]) => links.map((item) => item.id)
const urlOf = (links: readonly OsmLink[], id: string) => {
  const found = links.find((item) => item.id === id)
  if (!found) throw new Error(`no link ${id}`)
  return found.url
}

const place = { lat: 52.5, lng: 13.4 }

describe('elementLinks', () => {
  test('way: history, object page and editors, in order', () => {
    const links = elementLinks({ type: 'way', id: 123 })
    expect(ids(links)).toEqual([
      'osm-history',
      'osm',
      'deep-history',
      'pewu',
      'id',
      'rapid',
      'josm',
      'level0',
    ])
    expect(urlOf(links, 'osm-history')).toBe('https://www.openstreetmap.org/way/123/history')
    expect(urlOf(links, 'osm')).toBe('https://www.openstreetmap.org/way/123')
    expect(urlOf(links, 'deep-history')).toBe('https://osmlab.github.io/osm-deep-history/#/way/123')
    expect(urlOf(links, 'pewu')).toBe('https://pewu.github.io/osm-history/#/way/123')
    expect(urlOf(links, 'id')).toBe('https://www.openstreetmap.org/edit?way=123')
    expect(urlOf(links, 'rapid')).toBe('https://rapideditor.org/edit#id=w123')
    expect(urlOf(links, 'josm')).toBe('http://127.0.0.1:8111/load_object?objects=w123')
    expect(urlOf(links, 'level0')).toBe('https://level0.osmz.ru/?url=way/123')
  })

  test('node and relation use n and r in the Rapid and JOSM ids', () => {
    const node = elementLinks({ type: 'node', id: 7 })
    expect(urlOf(node, 'rapid')).toBe('https://rapideditor.org/edit#id=n7')
    expect(urlOf(node, 'josm')).toBe('http://127.0.0.1:8111/load_object?objects=n7')
    expect(urlOf(node, 'osm-history')).toBe('https://www.openstreetmap.org/node/7/history')

    const relation = elementLinks({ type: 'relation', id: '99' })
    expect(urlOf(relation, 'rapid')).toBe('https://rapideditor.org/edit#id=r99')
    expect(urlOf(relation, 'josm')).toBe('http://127.0.0.1:8111/load_object?objects=r99')
    expect(urlOf(relation, 'id')).toBe('https://www.openstreetmap.org/edit?relation=99')
  })

  test('the JOSM link is marked for the remote control, the others are not', () => {
    const links = elementLinks({ type: 'way', id: 1, loc: place })
    expect(links.filter((item) => item.josm).map((item) => item.id)).toEqual(['josm'])
  })

  test('with a place: imagery and TILDA links, TILDA only for Germany', () => {
    const links = elementLinks({ type: 'way', id: 123, loc: place })
    expect(ids(links).slice(-3)).toEqual(['mapillary', 'panoramax', 'tilda'])
    expect(urlOf(links, 'mapillary')).toBe('https://www.mapillary.com/app/?lat=52.5&lng=13.4&z=17')
    expect(urlOf(links, 'panoramax')).toBe('https://api.panoramax.xyz/?focus=map&map=17/52.5/13.4')
    expect(urlOf(links, 'tilda')).toBe('https://viewer.tilda-geo.de/?map=17/52.5/13.4')
    expect(links.find((item) => item.id === 'tilda')?.countries).toEqual(['de'])
  })

  test('zoom sets the place links', () => {
    const links = elementLinks({ type: 'node', id: 1, loc: place, zoom: 19 })
    expect(urlOf(links, 'mapillary')).toContain('z=19')
    expect(urlOf(links, 'panoramax')).toBe('https://api.panoramax.xyz/?focus=map&map=19/52.5/13.4')
  })

  test('a dev server gives only its own history and object page', () => {
    const links = elementLinks({
      type: 'way',
      id: 5,
      loc: place,
      server: 'https://master.apis.dev.openstreetmap.org',
    })
    expect(ids(links)).toEqual(['osm-history', 'osm'])
    expect(urlOf(links, 'osm')).toBe('https://master.apis.dev.openstreetmap.org/way/5')
    expect(urlOf(links, 'osm-history')).toBe(
      'https://master.apis.dev.openstreetmap.org/way/5/history',
    )
  })

  test('a trailing slash on the server is ignored', () => {
    const links = elementLinks({ type: 'way', id: 5, server: 'https://www.openstreetmap.org/' })
    expect(urlOf(links, 'osm')).toBe('https://www.openstreetmap.org/way/5')
    expect(ids(links)).toContain('josm')
  })
})

describe('changesetLinks', () => {
  test('production lists the changeset page and the third-party tools in order', () => {
    const links = changesetLinks({ id: 42 })
    expect(ids(links)).toEqual([
      'osm-changeset',
      'osmcha',
      'achavi',
      'resultmaps',
      'osm-revert',
      'josm',
      'level0',
    ])
    expect(urlOf(links, 'osm-changeset')).toBe('https://www.openstreetmap.org/changeset/42')
    expect(urlOf(links, 'osmcha')).toBe('https://osmcha.org/changesets/42')
    expect(urlOf(links, 'achavi')).toBe(
      'https://overpass-api.de/achavi/?changeset=42&relations=true',
    )
    expect(urlOf(links, 'resultmaps')).toBe('https://resultmaps.neis-one.org/osm-change-viz?c=42')
    expect(urlOf(links, 'osm-revert')).toBe('https://revert.monicz.dev/?changesets=42')
    expect(urlOf(links, 'josm')).toBe(
      'http://127.0.0.1:8111/import?url=https://www.openstreetmap.org/api/0.6/changeset/42/download',
    )
    expect(urlOf(links, 'level0')).toBe('https://level0.osmz.ru/?url=changeset/42')
    expect(links.find((item) => item.id === 'josm')?.josm).toBe(true)
  })

  test('a dev server gives only the changeset page', () => {
    const links = changesetLinks({ id: 42, server: 'https://master.apis.dev.openstreetmap.org' })
    expect(ids(links)).toEqual(['osm-changeset'])
    expect(urlOf(links, 'osm-changeset')).toBe(
      'https://master.apis.dev.openstreetmap.org/changeset/42',
    )
  })
})

describe('userLinks', () => {
  test('production lists the profile and the third-party tools in order', () => {
    const links = userLinks({ name: 'Tobias' })
    expect(ids(links)).toEqual(['osm-user', 'hdyc', 'osmcha-user', 'missingmaps'])
    expect(urlOf(links, 'osm-user')).toBe('https://www.openstreetmap.org/user/Tobias')
    expect(urlOf(links, 'hdyc')).toBe('https://hdyc.neis-one.org/?Tobias')
    expect(urlOf(links, 'missingmaps')).toBe('https://www.missingmaps.org/users/#/Tobias')
    expect(urlOf(links, 'osmcha-user')).toMatch(/^https:\/\/osmcha\.org\/\?filters=/)
  })

  test('names with spaces and special characters are encoded', () => {
    const name = 'Anna Müller & co/1?#'
    const encoded = 'Anna%20M%C3%BCller%20%26%20co%2F1%3F%23'
    const links = userLinks({ name })
    expect(urlOf(links, 'osm-user')).toBe(`https://www.openstreetmap.org/user/${encoded}`)
    expect(urlOf(links, 'hdyc')).toBe(`https://hdyc.neis-one.org/?${encoded}`)
    expect(urlOf(links, 'missingmaps')).toBe(`https://www.missingmaps.org/users/#/${encoded}`)
    const osmcha = decodeURIComponent(urlOf(links, 'osmcha-user'))
    expect(osmcha).toContain(`"users":[{"label":"${name}","value":"${name}"}]`)
  })

  test('a dev server gives only the profile', () => {
    const links = userLinks({ name: 'Anna', server: 'https://master.apis.dev.openstreetmap.org' })
    expect(ids(links)).toEqual(['osm-user'])
    expect(urlOf(links, 'osm-user')).toBe('https://master.apis.dev.openstreetmap.org/user/Anna')
  })
})

describe('linksIn', () => {
  const links = elementLinks({ type: 'way', id: 123, loc: place })

  test('with de keeps TILDA and every link without countries', () => {
    const kept = linksIn(links, ['de'])
    expect(ids(kept)).toContain('tilda')
    expect(ids(kept)).toContain('osm')
    expect(kept.length).toBe(links.length)
  })

  test('with fr drops TILDA and keeps the rest', () => {
    const kept = linksIn(links, ['fr'])
    expect(ids(kept)).not.toContain('tilda')
    expect(kept.length).toBe(links.length - 1)
  })

  test('country codes are compared case-insensitively', () => {
    expect(ids(linksIn(links, ['DE']))).toContain('tilda')
    const tilda = [{ id: 'x', label: 'x', url: 'https://example.org', countries: ['DE'] }]
    expect(linksIn(tilda, ['de']).length).toBe(1)
  })

  test('no codes keeps only the links without countries', () => {
    expect(ids(linksIn(links, []))).not.toContain('tilda')
  })
})
