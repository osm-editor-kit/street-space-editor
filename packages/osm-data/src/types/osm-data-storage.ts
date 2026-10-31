import { type OsmNode, type OsmRelation, type OsmWay } from './osm-data'

export type WaysInRelation = Record<number, boolean>

export interface ParsedOsmData {
  relations: { [relationId: number]: OsmRelation }

  ways: { [wayId: number]: OsmWay }

  nodes: { [nodeId: number]: OsmNode }

  nodeCoords: { [nodeId: number]: [number, number] }

  waysInRelation: WaysInRelation
}
