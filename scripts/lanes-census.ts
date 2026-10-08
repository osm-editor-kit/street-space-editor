#!/usr/bin/env bun
/**
 * Lanes census: run every road way of an OSM extract through the lane diagram code
 * and count what goes wrong, with example way ids per finding.
 *
 *   bun run lanes:census --pbf ~/Development/_osm-pbfs/berlin-latest.osm.pbf
 *   bun run lanes:census --pbf berlin.osm.pbf --examples 8 --json census.json
 *
 * Needs the `osmium` command line tool (brew install osmium-tool).
 */
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { parseArgs } from "node:util";
import {
    buildRoadSpaceSegment,
    hasCarriagewayIndicator,
    layoutRoadSpace,
    solveChainOffsets,
} from "../packages/osm-lane-diagram/src/index";

const ROAD_CLASSES = [
    "motorway",
    "trunk",
    "primary",
    "secondary",
    "tertiary",
    "unclassified",
    "residential",
    "living_street",
    "motorway_link",
    "trunk_link",
    "primary_link",
    "secondary_link",
    "tertiary_link",
];

type Tags = Record<string, string>;
type Way = { id: number; tags: Tags; nodes: string[] };
type Role = "prev" | "current" | "next";

const { values } = parseArgs({
    options: {
        pbf: { type: "string" },
        examples: { type: "string", default: "4" },
        json: { type: "string" },
        help: { type: "boolean", short: "h" },
    },
});

if (values.help || !values.pbf) {
    console.log(
        [
            "Usage: bun run lanes:census --pbf <file.osm.pbf> [--examples 4] [--json out.json]",
            "",
            "  --pbf       OSM extract to read (required)",
            "  --examples  example way ids printed per finding (default 4)",
            "  --json      also write all way ids per finding to this file",
        ].join("\n"),
    );
    process.exit(values.help ? 0 : 1);
}

const pbfPath = resolve(values.pbf);
if (!(await Bun.file(pbfPath).exists())) {
    console.error(`File not found: ${pbfPath}`);
    process.exit(1);
}
if (!Bun.which("osmium")) {
    console.error("The osmium command line tool is missing (brew install osmium-tool).");
    process.exit(1);
}
const exampleCount = Math.max(1, Number.parseInt(values.examples ?? "4", 10) || 4);

/** OPL escapes special characters as %hex% (code point). */
function unescapeOpl(text: string): string {
    return text.replace(/%([0-9a-fA-F]+)%/g, (_, hex: string) =>
        String.fromCodePoint(Number.parseInt(hex, 16)),
    );
}

async function readRoadWays(): Promise<Way[]> {
    const dir = mkdtempSync(join(tmpdir(), "lanes-census-"));
    const oplPath = join(dir, "roads.opl");
    try {
        const filter = `w/highway=${ROAD_CLASSES.join(",")}`;
        const proc = Bun.spawn(
            [
                "osmium",
                "tags-filter",
                pbfPath,
                filter,
                "-R",
                "-f",
                "opl",
                "-o",
                oplPath,
                "--overwrite",
            ],
            { stdout: "inherit", stderr: "inherit" },
        );
        if ((await proc.exited) !== 0) throw new Error("osmium tags-filter failed");

        const ways: Way[] = [];
        for (const line of (await Bun.file(oplPath).text()).split("\n")) {
            if (!line.startsWith("w")) continue;
            const fields = line.split(" ");
            const tags: Tags = {};
            let nodes: string[] = [];
            for (const field of fields) {
                if (field.startsWith("T") && field.length > 1) {
                    for (const pair of field.slice(1).split(",")) {
                        const eq = pair.indexOf("=");
                        if (eq > 0)
                            tags[unescapeOpl(pair.slice(0, eq))] = unescapeOpl(pair.slice(eq + 1));
                    }
                } else if (field.startsWith("N") && field.length > 1) {
                    nodes = field.slice(1).split(",");
                }
            }
            if (nodes.length >= 2)
                ways.push({ id: Number.parseInt(fields[0]!.slice(1), 10), tags, nodes });
        }
        return ways;
    } finally {
        rmSync(dir, { recursive: true, force: true });
    }
}

const ways = await readRoadWays();

/** Ways by their first / last node, to find the neighbour that continues a way. */
const startingAt = new Map<string, Way[]>();
const endingAt = new Map<string, Way[]>();
for (const way of ways) {
    const first = way.nodes[0]!;
    const last = way.nodes.at(-1)!;
    startingAt.set(first, [...(startingAt.get(first) ?? []), way]);
    endingAt.set(last, [...(endingAt.get(last) ?? []), way]);
}

/**
 * The one neighbour with the same name that is drawn in the same direction. Reversed
 * neighbours are left out: their tags would need mirroring first.
 */
function neighbour(way: Way, role: "prev" | "next"): Way | undefined {
    const name = way.tags.name;
    if (!name) return undefined;
    const candidates =
        role === "prev" ? endingAt.get(way.nodes[0]!) : startingAt.get(way.nodes.at(-1)!);
    const matches = (candidates ?? []).filter((c) => c.id !== way.id && c.tags.name === name);
    return matches.length === 1 ? matches[0] : undefined;
}

const findings = new Map<string, number[]>();
function report(finding: string, wayId: number): void {
    findings.set(finding, [...(findings.get(finding) ?? []), wayId]);
}

const KNOWN_TURNS = new Set([
    "",
    "none",
    "through",
    "left",
    "right",
    "slight_left",
    "slight_right",
    "sharp_left",
    "sharp_right",
    "merge_to_left",
    "merge_to_right",
    "reverse",
]);
const CYCLE_SIDE_KEYS = ["cycleway", "cycleway:left", "cycleway:right", "cycleway:both"];
const pipeLength = (value: string | undefined) => (value == null ? 0 : value.split("|").length);

function checkWay(way: Way): void {
    const tags = way.tags;
    const chain = (
        [
            ["next", neighbour(way, "next")],
            ["current", way],
            ["prev", neighbour(way, "prev")],
        ] as Array<[Role, Way | undefined]>
    ).filter((entry): entry is [Role, Way] => entry[1] != null);
    const segments = chain.map(([role, w]) => buildRoadSpaceSegment(w.tags, { wayId: w.id, role }));
    const current = segments.find((s) => s.role === "current")!;

    const carriageway = current.slots.filter((s) => s.zone === "carriageway");
    const driving = carriageway.filter((s) => s.kind !== "cycle");
    const cycle = carriageway.filter((s) => s.kind === "cycle");
    const bus = carriageway.filter((s) => s.kind === "bus");
    const lanes = Number.parseInt(tags.lanes ?? "", 10);
    const oneway = tags.oneway === "yes";
    const cycleSides = CYCLE_SIDE_KEYS.map((k) => tags[k]).filter((v) => v != null);

    if (tags.lanes == null) {
        if (carriageway.length === 0) {
            report(
                hasCarriagewayIndicator(tags)
                    ? "no lanes=*: carriageway tags present but nothing drawn"
                    : "no lanes=* and no other carriageway tag: nothing drawn (by design)",
                way.id,
            );
        } else {
            report("no lanes=*: carriageway drawn from other tags", way.id);
        }
    }
    if (cycleSides.some((v) => v.includes("share_busway"))) {
        if (cycle.length > 0) report("share_busway draws an extra cycle lane", way.id);
        if (bus.length === 0) report("share_busway but no bus lane found", way.id);
    }
    if (Number.isFinite(lanes) && driving.length !== lanes) {
        report(
            `driving lanes drawn != lanes=* (${driving.length > lanes ? "more" : "fewer"})`,
            way.id,
        );
    }
    const expectedCycle = (["left", "right"] as const).filter((side) =>
        ["lane", "opposite_lane", "shared_lane"].includes(
            tags[`cycleway:${side}`] ?? tags["cycleway:both"] ?? tags.cycleway ?? "",
        ),
    ).length;
    if (cycle.length > expectedCycle) report("more cycle lanes drawn than cycleway:* says", way.id);
    if (oneway && Number.isFinite(lanes) && pipeLength(tags["turn:lanes"]) > 0) {
        if (pipeLength(tags["turn:lanes"]) !== lanes)
            report("turn:lanes count != lanes (oneway)", way.id);
    }
    if ((Number(tags["lanes:psv"]) > 0 || Number(tags["lanes:bus"]) > 0) && bus.length === 0) {
        report("lanes:psv / lanes:bus but no bus lane drawn", way.id);
    }
    if (
        oneway &&
        tags["oneway:bicycle"] === "no" &&
        !cycle.some((s) => s.direction === "backward")
    ) {
        report("oneway:bicycle=no without a drawn contraflow", way.id);
    }
    const keys = Object.keys(tags);
    if (keys.some((k) => k.startsWith("change:lanes"))) report("change:lanes (not drawn)", way.id);
    if (keys.some((k) => k.endsWith(":conditional") && k.includes("lanes"))) {
        report("conditional lane tags (ignored)", way.id);
    }
    if (keys.some((k) => /^placement(:forward|:backward)?:(start|end)$/.test(k))) {
        report("placement:start / placement:end (ignored)", way.id);
    }
    if (tags["lanes:unmarked"] != null) report("lanes:unmarked (ignored)", way.id);
    if (tags.junction === "circular" || tags.junction === "roundabout")
        report("roundabout", way.id);
    if (tags.bicycle_road === "yes") report("bicycle_road (no marker)", way.id);

    const turnValues = Object.entries(tags)
        .filter(([k]) => /^turn(:lanes)?(:forward|:backward|:both_ways)?$/.test(k))
        .flatMap(([, v]) => v.split(/[|;]/));
    if (turnValues.some((v) => !KNOWN_TURNS.has(v))) report("unknown turn value", way.id);
    if (turnValues.includes("reverse")) report("turn value reverse (U-turn lane)", way.id);

    if (segments.length < 2) return;
    const scene = layoutRoadSpace({ segments });
    if (JSON.stringify(scene).includes("null")) report("NaN in scene", way.id);
    for (const issue of scene.placementIssues ?? []) {
        const text = issue.replace(/^ways? \d+(→\d+)?: /, "").replace(/\d+(\.\d+)?/g, "N");
        report(`placement: ${text.slice(0, 70)}`, way.id);
    }
    const { correspondences } = solveChainOffsets(segments);
    correspondences.forEach((corr, i) => {
        for (const pair of corr.pairs) {
            const a = segments[i]!.slots[pair.indexA];
            const b = segments[i + 1]!.slots[pair.indexB];
            if (!a || !b) continue;
            if (a.kind !== b.kind) {
                report(
                    `joined lanes of different kind (${[a.kind, b.kind].sort().join(" / ")})`,
                    way.id,
                );
            }
            const opposite =
                (a.direction === "forward" && b.direction === "backward") ||
                (a.direction === "backward" && b.direction === "forward");
            if (opposite && a.zone === "carriageway")
                report("joined lanes of opposite direction", way.id);
        }
    });
    if ((scene.junctions ?? []).length > 0) report("implied junction band", way.id);
}

let failed = 0;
for (const way of ways) {
    try {
        checkWay(way);
    } catch (error) {
        failed++;
        report(`THROWS: ${String(error).slice(0, 80)}`, way.id);
    }
}

const rows = [...findings.entries()]
    .map(([finding, ids]) => [finding, [...new Set(ids)]] as const)
    .toSorted((a, b) => b[1].length - a[1].length);
console.log(`\n${ways.length} road ways in ${pbfPath}\n`);
for (const [finding, ids] of rows) {
    const examples = [...new Set(ids)].slice(0, exampleCount).join(", ");
    console.log(
        `${String(new Set(ids).size).padStart(7)}  ${finding}\n         e.g. way ${examples}`,
    );
}
if (values.json) {
    const out = Object.fromEntries(rows);
    await Bun.write(resolve(values.json), JSON.stringify(out, null, 2));
    console.log(`\nAll way ids written to ${resolve(values.json)}`);
}
process.exit(failed > 0 ? 1 : 0);
