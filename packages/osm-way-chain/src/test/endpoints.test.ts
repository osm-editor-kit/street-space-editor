import { describe, expect, it } from 'bun:test'
import {
  getEndpointNodeId,
  getOtherEndpointNodeId,
  getSharedNodeBetween,
} from '../traversal/endpoints'
import { makeSegment } from './helpers'

describe('getEndpointNodeId', () => {
  it('returns last node for forward', () => {
    expect(getEndpointNodeId(makeSegment(1, [10, 20, 30]), 'forward')).toBe(30)
  })

  it('returns first node for backward', () => {
    expect(getEndpointNodeId(makeSegment(1, [10, 20, 30]), 'backward')).toBe(10)
  })
})

describe('getOtherEndpointNodeId', () => {
  const segment = makeSegment(1, [10, 20, 30])

  it('returns the opposite endpoint', () => {
    expect(getOtherEndpointNodeId(segment, 10)).toBe(30)
    expect(getOtherEndpointNodeId(segment, 30)).toBe(10)
  })

  it('returns undefined for an inner or unknown node', () => {
    expect(getOtherEndpointNodeId(segment, 20)).toBeUndefined()
    expect(getOtherEndpointNodeId(segment, 99)).toBeUndefined()
  })
})

describe('getSharedNodeBetween', () => {
  it('finds the endpoint both segments share, in any digitizing direction', () => {
    const a = makeSegment(1, [10, 20])
    expect(getSharedNodeBetween(a, makeSegment(2, [20, 30]))).toBe(20)
    expect(getSharedNodeBetween(a, makeSegment(3, [30, 20]))).toBe(20)
    expect(getSharedNodeBetween(a, makeSegment(4, [0, 10]))).toBe(10)
  })

  it('ignores inner nodes and returns undefined when endpoints do not touch', () => {
    const a = makeSegment(1, [10, 20, 30])
    expect(getSharedNodeBetween(a, makeSegment(2, [20, 40]))).toBeUndefined()
    expect(getSharedNodeBetween(a, makeSegment(3, [50, 60]))).toBeUndefined()
  })
})
