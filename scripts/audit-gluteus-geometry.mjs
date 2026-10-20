import * as THREE from "three";
import { writeFile, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { loadAuditMeshes } from "./load-atlas-audit.mjs";
const meshes = await loadAuditMeshes(),
  report = [];
for (const id of ["za-98cfd2e47395", "za-cc11824f98a0"]) {
  const own = meshes.filter((m) => m.userData.structureId === id),
    edges = new Map();
  let invalid = 0,
    degenerate = 0,
    normalErrors = 0,
    maxEdge = 0;
  const regions = [];
  const buckets = new Map(),
    welded = [];
  const weld = (p) => {
    const cell = p.toArray().map((x) => Math.floor(x / 0.00002));
    for (let dx = -1; dx <= 1; dx++)
      for (let dy = -1; dy <= 1; dy++)
        for (let dz = -1; dz <= 1; dz++) {
          const key = [cell[0] + dx, cell[1] + dy, cell[2] + dz].join(",");
          for (const index of buckets.get(key) ?? [])
            if (welded[index].distanceToSquared(p) <= 0.00002 ** 2)
              return index;
        }
    const index = welded.length,
      key = cell.join(",");
    welded.push(p.clone());
    buckets.set(key, [...(buckets.get(key) ?? []), index]);
    return index;
  };
  for (const mesh of own) {
    const p = mesh.geometry.attributes.position,
      n = mesh.geometry.attributes.normal,
      index = mesh.geometry.index;
    regions.push({
      kind: mesh.userData.tissueKind,
      vertices: p.count,
      triangles: index.count / 3,
    });
    for (let i = 0; i < p.count; i++) {
      const v = new THREE.Vector3().fromBufferAttribute(p, i);
      if (!v.toArray().every(Number.isFinite)) invalid++;
      if (
        Math.abs(new THREE.Vector3().fromBufferAttribute(n, i).length() - 1) >
        0.01
      )
        normalErrors++;
    }
    for (let i = 0; i < index.count; i += 3) {
      const v = [0, 1, 2].map((j) =>
        new THREE.Vector3()
          .fromBufferAttribute(p, index.getX(i + j))
          .applyMatrix4(mesh.matrixWorld),
      );
      const ids = v.map(weld);
      if (v[1].clone().sub(v[0]).cross(v[2].clone().sub(v[0])).length() < 1e-12)
        degenerate++;
      for (let j = 0; j < 3; j++) {
        const a = ids[j],
          b = ids[(j + 1) % 3],
          key = a < b ? a + ":" + b : b + ":" + a;
        edges.set(key, (edges.get(key) ?? 0) + 1);
        maxEdge = Math.max(maxEdge, v[j].distanceTo(v[(j + 1) % 3]));
      }
    }
  }
  report.push({
    id,
    regions,
    invalidPositions: invalid,
    nonUnitNormals: normalErrors,
    degenerateTriangles: degenerate,
    weldToleranceMetres: 0.00002,
    openEdgesAfterDistanceWeld: [...edges.values()].filter((n) => n === 1)
      .length,
    nonManifoldEdgesAfterDistanceWeld: [...edges.values()].filter((n) => n > 2)
      .length,
    maxTriangleEdgeMillimetres: maxEdge * 1000,
  });
}
const bytes = await readFile(
  new URL("../public/anatomy/3d/hip.glb", import.meta.url),
);
const out = {
  source: "public/anatomy/3d/hip.glb",
  sha256: createHash("sha256").update(bytes).digest("hex"),
  note: "Decoded GLB audit; Distance welding is diagnostic and does not alter source or certify anatomy. Original source regions and silhouette retained.",
  structures: report,
};
await writeFile(
  new URL(
    "../docs/superpowers/reviews/2026-10-19-gluteus-geometry.json",
    import.meta.url,
  ),
  JSON.stringify(out, null, 2) + "\n",
);
console.log(JSON.stringify(report, null, 2));
for (const m of meshes) {
  m.geometry.dispose();
  m.material.dispose();
}
