import { describe, expect, it } from 'bun:test'
import { buildChain, extendChainAtJunction, recenterChain } from '../traversal/buildChain'
import { makeSegment, mockAdapter } from './helpers'

describe('buildChain', () => {
  it('builds a chain with center and neighbors', async () => {
    const adapter = mockAdapter([
      makeSegment(100, [1, 2]),
      makeSegment(101, [2, 3]),
      makeSegment(102, [0, 1]),
    ])

    const { chain, pendingJunctions } = await buildChain(adapter, {
      centerWayId: 100,
      maxPerSide: 2,
    })
    expect(chain.segments.map((s) => s.id)).toEqual([102, 100, 101])
    expect(chain.centerIndex).toBe(1)
    expect(pendingJunctions).toEqual([])
  })

  it('stops at an undecidable junction and reports it', async () => {
    const adapter = mockAdapter([
      makeSegment(100, [1, 2], { highway: 'residential' }),
      makeSegment(201, [2, 3], { highway: 'footway' }),
      makeSegment(202, [4, 2], { highway: 'cycleway' }),
    ])

    const { chain, pendingJunctions } = await buildChain(adapter, { centerWayId: 100 })
    expect(chain.segments.map((s) => s.id)).toEqual([100])
    expect(pendingJunctions).toHaveLength(1)
    expect(pendingJunctions[0]!.nodeId).toBe(2)
    expect(pendingJunctions[0]!.direction).toBe('forward')
    expect(pendingJunctions[0]!.candidates.map((s) => s.id).sort()).toEqual([201, 202])
  })
})

describe('extendChainAtJunction', () => {
  const forkForward = [
    makeSegment(100, [1, 2], { highway: 'residential' }),
    makeSegment(201, [2, 3], { highway: 'footway' }),
    makeSegment(202, [4, 2], { highway: 'cycleway', 'cycleway:left': 'lane' }),
    makeSegment(203, [4, 5], { highway: 'cycleway' }),
  ]

  it('continues forward with the selected way, oriented to the chain', async () => {
    const adapter = mockAdapter(forkForward)
    const built = await buildChain(adapter, { centerWayId: 100 })
    const choice = built.pendingJunctions[0]!

    const { chain, pendingJunctions } = await extendChainAtJunction(
      adapter,
      built.chain,
      choice,
      202,
    )

    expect(chain.segments.map((s) => s.id)).toEqual([100, 202, 203])
    expect(chain.centerIndex).toBe(0)
    expect(pendingJunctions).toEqual([])

    const selected = chain.segments[1]!
    expect(selected.reversed).toBe(true)
    expect(selected.nodeIds).toEqual([2, 4])
    expect(selected.tags['cycleway:right']).toBe('lane')
  })

  it('applies maxPerSide and candidateFilter after the selected way', async () => {
    const adapter = mockAdapter(forkForward)
    const built = await buildChain(adapter, { centerWayId: 100 })
    const choice = built.pendingJunctions[0]!

    const limited = await extendChainAtJunction(adapter, built.chain, choice, 202, {
      maxPerSide: 0,
    })
    expect(limited.chain.segments.map((s) => s.id)).toEqual([100, 202])

    const filtered = await extendChainAtJunction(adapter, built.chain, choice, 202, {
      candidateFilter: (segment) => segment.id !== 203,
    })
    expect(filtered.chain.segments.map((s) => s.id)).toEqual([100, 202])
  })

  it('prepends backward extensions and shifts the center index', async () => {
    const adapter = mockAdapter([
      makeSegment(100, [1, 2], { highway: 'residential' }),
      makeSegment(301, [3, 1], { highway: 'footway' }),
      makeSegment(302, [1, 4], { highway: 'cycleway' }),
      makeSegment(303, [5, 4], { highway: 'cycleway' }),
    ])
    const built = await buildChain(adapter, { centerWayId: 100 })
    const choice = built.pendingJunctions[0]!
    expect(choice.direction).toBe('backward')

    const { chain } = await extendChainAtJunction(adapter, built.chain, choice, 302)

    expect(chain.segments.map((s) => s.id)).toEqual([303, 302, 100])
    expect(chain.centerIndex).toBe(2)
    expect(chain.segments[1]!.nodeIds).toEqual([4, 1])
    expect(chain.segments[0]!.reversed).toBe(false)
  })
})

describe('recenterChain', () => {
  const chain = {
    segments: [makeSegment(1, [1, 2]), makeSegment(2, [2, 3]), makeSegment(3, [3, 4])],
    centerIndex: 1,
  }

  it('updates center index', () => {
    expect(recenterChain(chain, 3).centerIndex).toBe(2)
  })

  it('returns the same chain when the way is not part of it', () => {
    expect(recenterChain(chain, 99)).toBe(chain)
  })
})
