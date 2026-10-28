// Asset engineering inventory only; polygon/topology metrics do not validate anatomy.
import { readFile, writeFile, realpath } from "node:fs/promises";
import { createHash } from "node:crypto";
import { pathToFileURL } from "node:url";
import * as THREE from "three";
import { loadAuditMeshes } from "./load-atlas-audit.mjs";
import { ATLAS_GEOMETRY_PILOTS, isSchematicGeometryPilot } from "../src/lib/clinical/atlas-geometry-pilots.mjs";

const WELD_GRID_METERS = 1e-7;
const BASELINE = {
  sourceCommit: "0dd2329622c42b4fdcaabbf5ff6ad234df49b659",
  assetVersion: 2,
  fullBundleSha256: "bb1a7269cabab3b86112962777bb4509527dda79bae6094324e266a9145c1b1f",
  structures: 1031,
  primitives: 1411,
  triangles: 2368785,
  structuresAtMost10Triangles: 154,
  structuresExactly2Triangles: 58,
};

/** Weld all material/normal seams within one structure after its world transform. */
export function measureStructureGeometry(meshes) {
  const result = {
    primitives: meshes.length,
    triangles: 0,
    vertexSlots: 0,
    nonfinitePositionComponents: 0,
    nonfiniteWorldPositionComponents: 0,
    weldedVertices: 0,
    boundaryEdges: 0,
    nonmanifoldEdges: 0,
    degenerateTrianglesAfterWeld: 0,
    invalidPositionTriangles: 0,
    worldBounds: null,
  };
  const welded = new Map();
  const edges = new Map();
  const minimum = [Infinity, Infinity, Infinity];
  const maximum = [-Infinity, -Infinity, -Infinity];
  const point = new THREE.Vector3();
  for (const mesh of meshes) {
    const position = mesh.geometry.getAttribute("position");
    if (!position || position.itemSize !== 3) throw new Error("Expected three-component position attribute");
    const index = mesh.geometry.index;
    const count = index ? index.count : position.count;
    if (count % 3 !== 0) throw new Error("Triangle index/vertex count must be divisible by three");
    result.triangles += count / 3;
    result.vertexSlots += position.count;
    const slots = new Array(position.count);
    for (let slot = 0; slot < position.count; slot++) {
      const local = [position.getX(slot), position.getY(slot), position.getZ(slot)];
      result.nonfinitePositionComponents += local.filter((value) => !Number.isFinite(value)).length;
      point.fromArray(local).applyMatrix4(mesh.matrixWorld);
      const world = point.toArray();
      result.nonfiniteWorldPositionComponents += world.filter((value) => !Number.isFinite(value)).length;
      if (!local.every(Number.isFinite) || !world.every(Number.isFinite)) {
        slots[slot] = null;
        continue;
      }
      for (let axis = 0; axis < 3; axis++) {
        minimum[axis] = Math.min(minimum[axis], world[axis]);
        maximum[axis] = Math.max(maximum[axis], world[axis]);
      }
      const key = world.map((value) => Math.round(value / WELD_GRID_METERS)).join(",");
      if (!welded.has(key)) welded.set(key, welded.size);
      slots[slot] = welded.get(key);
    }
    for (let triangle = 0; triangle < count; triangle += 3) {
      const vertices = [0, 1, 2].map((corner) => {
        const slot = index ? index.getX(triangle + corner) : triangle + corner;
        if (!Number.isInteger(slot) || slot < 0 || slot >= position.count) throw new Error("Triangle index outside position slots");
        return slots[slot];
      });
      if (vertices.includes(null)) {
        result.invalidPositionTriangles++;
        continue;
      }
      if (new Set(vertices).size < 3) {
        result.degenerateTrianglesAfterWeld++;
        continue;
      }
      for (let corner = 0; corner < 3; corner++) {
        const a = vertices[corner], b = vertices[(corner + 1) % 3];
        const key = a < b ? `${a}:${b}` : `${b}:${a}`;
        edges.set(key, (edges.get(key) ?? 0) + 1);
      }
    }
  }
  result.weldedVertices = welded.size;
  for (const incidence of edges.values()) {
    if (incidence === 1) result.boundaryEdges++;
    if (incidence > 2) result.nonmanifoldEdges++;
  }
  if (welded.size) result.worldBounds = [minimum, maximum];
  return result;
}

export function assertGeometryBaseline(inventory) {
  if (inventory.source.commit !== BASELINE.sourceCommit || inventory.source.assetVersion !== BASELINE.assetVersion || inventory.bundle.sha256 !== BASELINE.fullBundleSha256) {
    throw new Error("Asset version/hash differs from the recorded baseline. Explain the asset change and compare it explicitly; do not adjust totals merely to make this check pass.");
  }
  for (const name of ["structures", "primitives", "triangles", "structuresAtMost10Triangles", "structuresExactly2Triangles"]) {
    if (inventory.summary[name] !== BASELINE[name]) throw new Error(`Geometry baseline mismatch: ${name} expected ${BASELINE[name]}, observed ${inventory.summary[name]}. Investigate the asset version/hash; do not silently replace the baseline.`);
  }
  if (inventory.summary.nonfinitePositionComponents || inventory.summary.nonfiniteWorldPositionComponents) {
    throw new Error("Geometry contains nonfinite position components; finite positions are required.");
  }
}

export function buildGeometryInventory(meshes, manifest, bundle) {
  const grouped = new Map();
  for (const mesh of meshes) {
    const id = mesh.userData.structureId;
    if (!grouped.has(id)) grouped.set(id, []);
    grouped.get(id).push(mesh);
  }
  const manifestIds = manifest.structures.map((structure) => structure.id);
  if (new Set(manifestIds).size !== manifestIds.length || grouped.size !== manifestIds.length || [...grouped.keys()].some((id) => !manifestIds.includes(id)) || manifestIds.some((id) => !grouped.has(id))) {
    throw new Error("Decoded structure IDs must exactly match the unique full manifest IDs");
  }
  for (const pilot of ATLAS_GEOMETRY_PILOTS) {
    const row = manifest.structures.find((structure) => structure.id === pilot.id);
    if (!row || row.english !== pilot.english || row.side !== pilot.side) throw new Error(`Pilot source identity mismatch: ${pilot.id}`);
  }
  const structures = manifest.structures.map(({ id, english, side }) => ({
    id, english, side,
    ...measureStructureGeometry(grouped.get(id)),
    ...(isSchematicGeometryPilot(id) ? {
      representation: "schematic-open-surface",
      verifiedAnatomicalVolume: false,
      verifiedTissueThickness: false,
    } : {}),
  })).sort((a, b) => a.id.localeCompare(b.id, "en"));
  const sum = (key) => structures.reduce((total, structure) => total + structure[key], 0);
  return {
    schemaVersion: 1,
    checkedAt: "2026-10-28",
    reviewedBy: null,
    source: manifest.source,
    bundle,
    method: {
      positionSpace: "Decoded POSITION slots transformed by each primitive's matrixWorld; source-export units m",
      weld: "Per structure across all primitives: each finite world component maps to Math.round(component / gridMeters); identical integer triples share a vertex. This is grid quantization, not a Euclidean distance weld. Adjacent cells do not merge; negative half values follow JavaScript Math.round.",
      gridMeters: WELD_GRID_METERS,
      edgeIncidence: "Undirected welded vertex pairs counted once per incident triangle; boundary=1, nonmanifold>2. Triangles with repeated welded vertices are reported and excluded; collinear distinct vertices are not removed. Invalid-position triangles are reported and excluded, but any nonfinite position fails the audit.",
      vertexSlots: "Sum of decoded position attribute counts, including duplicate seam slots and unused slots; not a count of unique anatomical points",
      worldBounds: "Axis-aligned min/max from finite transformed slots, before welding; engineering extents in m, not tissue measurements",
    },
    limitations: [
      "These are engineering counts and source-mesh metadata, not medical accuracy scores or clinical validation.",
      "An open boundary can be intentional in a schematic membrane/surface; it is not automatically an asset error.",
      "Polygon count, closed topology and authored thickness do not establish anatomical accuracy, measured tissue thickness or verified volume.",
      "The ten curated pilots retain their source schematic open surfaces; no production geometry was replaced. Other structures are not classified by polygon thresholds.",
    ],
    comparisonDocument: "docs/research/2026-10-28-atlas-geometry-candidates.md",
    summary: {
      structures: structures.length,
      primitives: sum("primitives"),
      triangles: sum("triangles"),
      vertexSlots: sum("vertexSlots"),
      nonfinitePositionComponents: sum("nonfinitePositionComponents"),
      nonfiniteWorldPositionComponents: sum("nonfiniteWorldPositionComponents"),
      boundaryEdges: sum("boundaryEdges"),
      nonmanifoldEdges: sum("nonmanifoldEdges"),
      degenerateTrianglesAfterWeld: sum("degenerateTrianglesAfterWeld"),
      structuresAtMost10Triangles: structures.filter((structure) => structure.triangles <= 10).length,
      structuresExactly2Triangles: structures.filter((structure) => structure.triangles === 2).length,
      schematicPilots: structures.filter((structure) => structure.representation).length,
    },
    structures,
  };
}

async function main(args) {
  if (args.some((arg) => !["--apply", "--check"].includes(arg)) || args.length > 1) throw new Error("Usage: node scripts/audit-atlas-geometry-quality.mjs [--check | --apply]; only --apply writes geometry-quality.json");
  const manifestBytes = await readFile(new URL("../public/anatomy/3d/manifest.json", import.meta.url));
  const manifest = JSON.parse(manifestBytes);
  const bundleUrl = manifest.bundles.full.url;
  const pathname = new URL(bundleUrl, "http://local").pathname;
  const bytes = await readFile(new URL(`../public${pathname}`, import.meta.url));
  const sha256 = (value) => createHash("sha256").update(value).digest("hex");
  const inventory = buildGeometryInventory(await loadAuditMeshes("full"), manifest, {
    id: "full", url: bundleUrl, bytes: bytes.length, sha256: sha256(bytes), manifestSha256: sha256(manifestBytes),
  });
  assertGeometryBaseline(inventory);
  const output = JSON.stringify(inventory, null, 2) + "\n";
  const target = new URL("../public/anatomy/3d/geometry-quality.json", import.meta.url);
  if (args.includes("--apply")) await writeFile(target, output);
  if (args.includes("--check")) {
    const saved = await readFile(target, "utf8");
    if (saved !== output) throw new Error("Geometry inventory is stale. Review the asset/version/method difference before intentionally running --apply.");
  }
  console.log(`${inventory.summary.structures} structures; ${inventory.summary.primitives} primitives; ${inventory.summary.triangles} triangles; ${inventory.summary.schematicPilots} schematic pilots. ${args.includes("--apply") ? "Inventory written." : "Read-only audit passed."}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(await realpath(process.argv[1])).href) {
  main(process.argv.slice(2)).catch((error) => { console.error(error.message); process.exitCode = 1; });
}
