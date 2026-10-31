import { afterEach, beforeEach, describe, expect, mock, test } from 'bun:test'
import { handleJosmLinkClick } from '../index'

// bun:test has no DOM: a minimal Element and anchor stand in for the browser's.
class FakeElement {
  constructor(private readonly anchor: { href: string } | null) {}
  closest(selector: string) {
    return selector === 'a' ? this.anchor : null
  }
}

const globals = globalThis as unknown as { Element?: unknown; fetch?: unknown }
const original = { Element: globals.Element, fetch: globals.fetch }
const fetchMock = mock(async (_url: string) => ({}))

beforeEach(() => {
  fetchMock.mockClear()
  globals.Element = FakeElement
  globals.fetch = fetchMock
})

afterEach(() => {
  globals.Element = original.Element
  globals.fetch = original.fetch
})

describe('handleJosmLinkClick', () => {
  test('cancels the navigation and fetches the link of the clicked anchor', async () => {
    const preventDefault = mock(() => {})
    const target = new FakeElement({ href: 'http://127.0.0.1:8111/load_object?objects=w1' })
    await handleJosmLinkClick({ target: target as unknown as EventTarget, preventDefault })
    expect(preventDefault).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith('http://127.0.0.1:8111/load_object?objects=w1')
  })

  test('takes a React-style synthetic event without .nativeEvent', async () => {
    const syntheticEvent = {
      target: new FakeElement({ href: 'http://127.0.0.1:8111/import?url=x' }),
      currentTarget: {},
      nativeEvent: {},
      preventDefault: mock(() => {}),
    }
    await handleJosmLinkClick(syntheticEvent as never)
    expect(syntheticEvent.preventDefault).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith('http://127.0.0.1:8111/import?url=x')
  })

  test('does nothing when the click is not inside a link', async () => {
    const preventDefault = mock(() => {})
    await handleJosmLinkClick({ target: new FakeElement(null) as never, preventDefault })
    await handleJosmLinkClick({ target: null, preventDefault })
    expect(preventDefault).not.toHaveBeenCalled()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  test('rejects when JOSM is not running', async () => {
    fetchMock.mockImplementationOnce(async () => {
      throw new TypeError('Failed to fetch')
    })
    const target = new FakeElement({ href: 'http://127.0.0.1:8111/version' })
    await expect(
      handleJosmLinkClick({ target: target as never, preventDefault: () => {} }),
    ).rejects.toThrow('Failed to fetch')
  })
})
