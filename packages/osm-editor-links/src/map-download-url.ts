import type { MapBounds } from './geo'
import { osmDevUrl, osmProdApiUrl } from './hosts'

export function getUrl(bounds: MapBounds, useDevServer: boolean): string {
  const bbox = [bounds.west, bounds.south, bounds.east, bounds.north].join(',')
  return (useDevServer ? osmDevUrl : osmProdApiUrl) + '/api/0.6/map?bbox=' + bbox
}
