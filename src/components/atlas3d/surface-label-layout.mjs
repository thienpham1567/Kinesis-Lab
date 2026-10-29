import * as THREE from "three";
/** Actual camera-facing tissue hit; hide labels behind visible geometry or outside view.
 * Selected structures can sample source triangles when the box-center ray misses.
 * These hits position UI only; they are not anatomical landmarks.
 * @param {THREE.Mesh[]} tissue @param {THREE.Mesh[]} visible @param {THREE.PerspectiveCamera | THREE.OrthographicCamera} camera @param {number} width @param {number} height
 * @param {{sampleSurface?:boolean}} options */
export function surfaceLabelPoint(
  tissue, visible, camera, width, height, { sampleSurface = false } = {},
) {
  const meshes = tissue.filter((m) => m.visible);
  if (!meshes.length || width < 160 || height < 160) return null;
  const box = new THREE.Box3();
  for (const m of meshes) {
    m.updateWorldMatrix(true, false);
    box.expandByObject(m);
  }
  if (box.isEmpty()) return null;
  camera.updateMatrixWorld();
  const ray = new THREE.Raycaster();
  ray.firstHitOnly = true;
  const occluders = visible.filter((m) => m.visible);
  /** @param {THREE.Vector3} candidate */
  const probe = (candidate) => {
    const projected = candidate.clone().project(camera);
    if (
      !projected.toArray().every(Number.isFinite) ||
      projected.z < -1 || projected.z > 1 ||
      Math.abs(projected.x) > 1 || Math.abs(projected.y) > 1
    ) return null;
    // Orthographic rays start on the camera plane and remain parallel.
    ray.setFromCamera(new THREE.Vector2(projected.x, projected.y), camera);
    const hit = ray.intersectObjects(meshes, false)[0];
    if (!hit) return null;
    const first = ray.intersectObjects(occluders, false)[0];
    if (first && first.distance < hit.distance - 0.0002) return null;
    const p = hit.point.clone().project(camera);
    const x = ((p.x + 1) * width) / 2;
    const y = ((1 - p.y) * height) / 2;
    // Surface buttons need room around the hit. Callouts are placed separately.
    const marginX = sampleSurface ? 12 : 70;
    const marginBottom = sampleSurface ? 12 : 80;
    if (
      p.z < -1 || p.z > 1 ||
      x < marginX || x > width - marginX ||
      y < 24 || y > height - marginBottom
    ) return null;
    return { x, y, point: hit.point };
  };
  const center = probe(box.getCenter(new THREE.Vector3()));
  if (center || !sampleSurface) return center;
  // Bounded fallback for the selected label only. Triangle centroids stay inside
  // source faces, unlike box/grid guesses or vertices on triangle boundaries.
  const samplesPerMesh = Math.max(1, Math.floor(96 / meshes.length));
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
  for (const mesh of meshes) {
    const geometry = mesh.geometry;
    const positions = geometry.getAttribute("position");
    if (!positions) continue;
    const index = geometry.getIndex();
    const triangles = Math.floor((index?.count ?? positions.count) / 3);
    const samples = Math.min(samplesPerMesh, triangles);
    for (let i = 0; i < samples; i++) {
      const start = Math.floor(((i + 0.5) * triangles) / samples) * 3;
      a.fromBufferAttribute(positions, index ? index.getX(start) : start);
      b.fromBufferAttribute(positions, index ? index.getX(start + 1) : start + 1);
      c.fromBufferAttribute(positions, index ? index.getX(start + 2) : start + 2);
      const point = probe(
        a.add(b).add(c).multiplyScalar(1 / 3).applyMatrix4(mesh.matrixWorld),
      );
      if (point) return point;
    }
  }
  return null;
}
