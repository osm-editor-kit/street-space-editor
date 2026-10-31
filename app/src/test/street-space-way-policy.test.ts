import { describe, expect, it } from 'bun:test'
import { compileOverpassWaySelector } from '@osm-editor-kit/osm-way-chain'
import {
  matchesStreetSpaceInclusion,
  matchesStreetSpaceWay,
  streetSpaceWayPolicy,
} from '../shell/map/street-space-way-policy'

describe('matchesStreetSpaceInclusion', () => {
  it('excludes private access and low-priority service roads in the public style', () => {
    expect(matchesStreetSpaceInclusion({ highway: 'service', service: 'driveway' })).toBe(false)
    expect(matchesStreetSpaceInclusion({ highway: 'service', service: 'emergency_access' })).toBe(
      false,
    )
    expect(matchesStreetSpaceInclusion({ highway: 'service', service: 'parking_aisle' })).toBe(
      false,
    )
    expect(matchesStreetSpaceInclusion({ highway: 'residential', access: 'private' })).toBe(false)
  })

  it('keeps ordinary public ways', () => {
    expect(matchesStreetSpaceInclusion({ highway: 'residential' })).toBe(true)
    expect(matchesStreetSpaceInclusion({ highway: 'service', service: 'alley' })).toBe(true)
  })

  it('keeps everything in the inclusive style', () => {
    expect(
      matchesStreetSpaceInclusion({ highway: 'service', service: 'driveway' }, 'inclusive'),
    ).toBe(true)
  })
})

describe('matchesStreetSpaceWay', () => {
  it('accepts road classes, their links and busway', () => {
    expect(matchesStreetSpaceWay({ highway: 'residential' })).toBe(true)
    expect(matchesStreetSpaceWay({ highway: 'primary_link' })).toBe(true)
    expect(matchesStreetSpaceWay({ highway: 'busway' })).toBe(true)
  })

  it('rejects non-road highways and whole-word mismatches', () => {
    expect(matchesStreetSpaceWay({ highway: 'footway' })).toBe(false)
    expect(matchesStreetSpaceWay({ highway: 'cycleway' })).toBe(false)
    expect(matchesStreetSpaceWay({ highway: 'service_road' })).toBe(false)
  })

  it('requires both road class and public access in the public style', () => {
    expect(matchesStreetSpaceWay({ highway: 'service', service: 'driveway' })).toBe(false)
    expect(matchesStreetSpaceWay({ highway: 'service', service: 'driveway' }, 'inclusive')).toBe(
      true,
    )
  })
})

describe('streetSpaceWayPolicy', () => {
  it('adds the access exclusions to the Overpass selector only in the public style', () => {
    expect(compileOverpassWaySelector(streetSpaceWayPolicy())).toContain('[access!=private]')
    expect(compileOverpassWaySelector(streetSpaceWayPolicy('inclusive'))).not.toContain(
      '[access!=private]',
    )
  })
})
