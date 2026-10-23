import * as THREE from "three";
import { MeshBVH, acceleratedRaycast, CENTER } from "three-mesh-bvh";

/** Exact source-surface queries; no decimation, global prototype changes or index reordering.
 * @param {THREE.Mesh} mesh */
export function accelerateSourceMesh(mesh) {
  const geometry = mesh.geometry;
  if (
    mesh.isSkinnedMesh ||
    geometry.morphAttributes.position?.length ||
    (geometry.getAttribute("position")?.count ?? 0) < 128
  )
    return false;
  geometry.boundsTree ??= new MeshBVH(geometry, {
    indirect: true,
    strategy: CENTER,
    targetLeafSize: 12,
  });
  mesh.raycast = acceleratedRaycast;
  return true;
}

/** @param {THREE.Mesh} mesh */
export function releaseSourceAcceleration(mesh) {
  mesh.geometry.boundsTree = undefined;
  mesh.raycast = THREE.Mesh.prototype.raycast;
}

/** Yield between geometry builds and stop when a bundle is replaced/disposed.
 * @param {THREE.Mesh[]} meshes @param {()=>boolean} cancelled */
export async function prepareSourceAcceleration(meshes, cancelled) {
  let started = performance.now();
  for (const mesh of meshes) {
    if (cancelled()) return false;
    accelerateSourceMesh(mesh);
    if (performance.now() - started > 8) {
      await new Promise((resolve) => setTimeout(resolve, 0));
      started = performance.now();
    }
  }
  return !cancelled();
}
