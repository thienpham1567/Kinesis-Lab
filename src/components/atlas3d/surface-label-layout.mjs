import * as THREE from "three";
/** Actual camera-facing tissue hit; hide labels behind visible geometry or outside view.
 * @param {THREE.Mesh[]} tissue @param {THREE.Mesh[]} visible @param {THREE.PerspectiveCamera} camera @param {number} width @param {number} height */
export function surfaceLabelPoint(tissue, visible, camera, width, height) {
  const meshes = tissue.filter((m) => m.visible);
  if (!meshes.length || width < 160 || height < 160) return null;
  const box = new THREE.Box3();
  for (const m of meshes) {
    m.updateWorldMatrix(true, false);
    box.expandByObject(m);
  }
  if (box.isEmpty()) return null;
  const center = box.getCenter(new THREE.Vector3()),
    ray = new THREE.Raycaster(
      camera.position,
      center.clone().sub(camera.position).normalize(),
    );
  const hit = ray.intersectObjects(meshes, false)[0];
  if (!hit) return null;
  const p = hit.point.clone().project(camera);
  if (
    !p.toArray().every(Number.isFinite) ||
    p.z < -1 ||
    p.z > 1 ||
    Math.abs(p.x) > 1 ||
    Math.abs(p.y) > 1
  )
    return null;
  const first = ray.intersectObjects(
    visible.filter((m) => m.visible),
    false,
  )[0];
  if (first && first.distance < hit.distance - 0.0002) return null;
  const x = ((p.x + 1) * width) / 2,
    y = ((1 - p.y) * height) / 2;
  // Keep the label at its true hit; do not slide it onto another tissue near edges.
  if (x < 70 || x > width - 70 || y < 24 || y > height - 80) return null;
  return { x, y, point: hit.point };
}
