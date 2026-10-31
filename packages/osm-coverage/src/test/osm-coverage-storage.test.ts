import { describe, expect, test } from 'bun:test'
import { emptyParsedOsmData, type MapBounds } from '@osm-editor-kit/osm-data'
import { QueryClient } from '@tanstack/react-query'
import { boundsToPolygon } from '../coverage-geometry'
import { createOsmCoverageApi } from '../create-osm-coverage-api'
import {
  formatCoverageAgeHour,
  type OsmCoveragePersisted,
  type OsmCoverageStorage,
} from '../osm-coverage-storage'

const viewport: MapBounds = {
  south: 52.47,
  west: 13.44,
  north: 52.48,
  east: 13.45,
}

const mapSizePx = { width: 1000, height: 800 }

type TestSessionParams = {
  editorMode: boolean
  osmDataSource: string
}

function createMemoryStorage() {
  const store = new Map<string, OsmCoveragePersisted>()
  const storage: OsmCoverageStorage = {
    async load(sessionKey) {
      return store.get(JSON.stringify(sessionKey)) ?? null
    },
    async save(sessionKey, data) {
      store.set(JSON.stringify(sessionKey), data)
    },
    async clear(sessionKey) {
      store.delete(JSON.stringify(sessionKey))
    },
  }
  return { store, storage }
}

describe('formatCoverageAgeHour', () => {
  test('rounds down to the hour on the same day', () => {
    const now = new Date('2026-08-12T15:30:00.000Z')
    // Construct local hour via Date that matches "same day" in local TZ by using same now
    const savedAt = new Date(now)
    savedAt.setHours(14, 45, 30, 0)
    expect(formatCoverageAgeHour(savedAt.toISOString(), now)).toBe('14:00')
  })

  test('returns null for missing values', () => {
    expect(formatCoverageAgeHour(null)).toBeNull()
    expect(formatCoverageAgeHour(undefined)).toBeNull()
    expect(formatCoverageAgeHour('not-a-date')).toBeNull()
  })
})

describe('coverage storage', () => {
  test('restores session from storage before ensureCoverage skips covered viewport', async () => {
    const { storage, store } = createMemoryStorage()
    const params = { editorMode: false, osmDataSource: 'overpass-vk' }
    const sessionKey = ['test-osm-persist', false, 'overpass-vk'] as const

    store.set(JSON.stringify(sessionKey), {
      graph: emptyParsedOsmData(),
      coverage: boundsToPolygon(viewport),
      savedAt: '2026-08-12T10:00:00.000Z',
    })

    let downloads = 0
    const api = createOsmCoverageApi<TestSessionParams>({
      getSessionKey: ({ editorMode, osmDataSource }) =>
        ['test-osm-persist', editorMode, osmDataSource] as const,
      minZoom: 14,
      getDownloadUrl: () => 'https://example.test/overpass',
      download: async () => {
        downloads += 1
        return emptyParsedOsmData()
      },
      storage,
      storageSaveDebounceMs: 0,
    })

    const queryClient = new QueryClient()
    const restored = await api.restoreSession(queryClient, params)
    expect(restored).toBe(true)

    const result = await api.ensureCoverage(queryClient, {
      bounds: viewport,
      zoom: 18,
      mapSizePx,
      ...params,
    })

    expect(result.skipped).toBe(true)
    expect(downloads).toBe(0)
    expect(queryClient.getQueryData<ReturnType<typeof api.emptyData>>(sessionKey)?.savedAt).toBe(
      '2026-08-12T10:00:00.000Z',
    )
  })

  test('saves session after a successful fetch', async () => {
    const { storage, store } = createMemoryStorage()
    const params = { editorMode: false, osmDataSource: 'overpass-vk' }
    const sessionKey = ['test-osm-save', false, 'overpass-vk'] as const

    const api = createOsmCoverageApi<TestSessionParams>({
      getSessionKey: ({ editorMode, osmDataSource }) =>
        ['test-osm-save', editorMode, osmDataSource] as const,
      minZoom: 14,
      getDownloadUrl: () => 'https://example.test/overpass',
      download: async () => emptyParsedOsmData(),
      storage,
      storageSaveDebounceMs: 0,
    })

    const queryClient = new QueryClient()
    await api.ensureCoverage(queryClient, {
      bounds: viewport,
      zoom: 18,
      mapSizePx,
      ...params,
    })

    await Bun.sleep(20)

    const persisted = store.get(JSON.stringify(sessionKey))
    expect(persisted?.coverage).not.toBeNull()
    expect(persisted?.savedAt).toBeTruthy()
  })

  test('reports a failed save through onPersistError', async () => {
    const { storage } = createMemoryStorage()
    const failure = new Error('disk full')
    const errors: unknown[] = []

    const api = createOsmCoverageApi<TestSessionParams>({
      getSessionKey: ({ editorMode, osmDataSource }) =>
        ['test-osm-save-error', editorMode, osmDataSource] as const,
      minZoom: 14,
      getDownloadUrl: () => 'https://example.test/overpass',
      download: async () => emptyParsedOsmData(),
      storage: { ...storage, save: async () => Promise.reject(failure) },
      storageSaveDebounceMs: 0,
      onPersistError: (error) => errors.push(error),
    })

    await api.ensureCoverage(new QueryClient(), {
      bounds: viewport,
      zoom: 18,
      mapSizePx,
      editorMode: false,
      osmDataSource: 'overpass-vk',
    })

    await Bun.sleep(20)
    expect(errors).toEqual([failure])
  })

  test('clearPersisted removes durable data', async () => {
    const { storage, store } = createMemoryStorage()
    const params = { editorMode: false, osmDataSource: 'overpass-vk' }
    const sessionKey = ['test-osm-clear', false, 'overpass-vk'] as const

    store.set(JSON.stringify(sessionKey), {
      graph: emptyParsedOsmData(),
      coverage: boundsToPolygon(viewport),
      savedAt: '2026-08-12T10:00:00.000Z',
    })

    const api = createOsmCoverageApi<TestSessionParams>({
      getSessionKey: ({ editorMode, osmDataSource }) =>
        ['test-osm-clear', editorMode, osmDataSource] as const,
      minZoom: 14,
      getDownloadUrl: () => 'https://example.test/overpass',
      download: async () => emptyParsedOsmData(),
      storage,
    })

    await api.clearPersisted(params)
    expect(store.has(JSON.stringify(sessionKey))).toBe(false)
  })
})
