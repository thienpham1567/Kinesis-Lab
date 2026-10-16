import * as THREE from "three";

/** @param {THREE.Vector3} point @param {THREE.Vector3} eye @param {number} size */
export function surfaceFocusPose(point, eye, size = 1) {
  const direction = eye.clone().sub(point);
  if (direction.lengthSq() < 1e-12) direction.set(0, 0, 1);
  direction.normalize();
  const distance = THREE.MathUtils.clamp(size * 0.4, 0.025, 0.06);
  return {
    target: point.clone(),
    position: point.clone().addScaledVector(direction, distance),
  };
}
/** Raycast actual selected geometry; triangle-centroid fallback handles holes/concavity.
 * @param {THREE.Mesh[]} meshes @param {THREE.Vector3} eye
 */
export function findSurfaceFocus(meshes, eye) {
  const visible = meshes.filter((mesh) => mesh.visible);
  if (!visible.length) return null;
  const box = new THREE.Box3();
  for (const mesh of visible) {
    mesh.updateWorldMatrix(true, false);
    box.expandByObject(mesh);
  }
  if (box.isEmpty()) return null;
  const center = box.getCenter(new THREE.Vector3()),
    size = box.getSize(new THREE.Vector3()).length();
  const ray = new THREE.Raycaster();
  const cast = (/** @type {THREE.Vector3} */ target) => {
    ray.set(eye, target.clone().sub(eye).normalize());
    return ray.intersectObjects(visible, false)[0];
  };
  let hit = cast(center);
  if (!hit) {
    const a = new THREE.Vector3(),
      b = new THREE.Vector3(),
      c = new THREE.Vector3(),
      normal = new THREE.Vector3(),
      candidate = new THREE.Vector3(),
      edge = new THREE.Vector3();
    let best = Infinity;
    const target = new THREE.Vector3();
    for (const mesh of visible) {
      const position = mesh.geometry.getAttribute("position"),
        index = mesh.geometry.getIndex();
      if (!position) continue;
      const count = index ? index.count : position.count;
      const orientation = Math.sign(mesh.matrixWorld.determinant()) || 1;
      for (let i = 0; i + 2 < count; i += 3) {
        a.fromBufferAttribute(position, index ? index.getX(i) : i).applyMatrix4(
          mesh.matrixWorld,
        );
        b.fromBufferAttribute(
          position,
          index ? index.getX(i + 1) : i + 1,
        ).applyMatrix4(mesh.matrixWorld);
        c.fromBufferAttribute(
          position,
          index ? index.getX(i + 2) : i + 2,
        ).applyMatrix4(mesh.matrixWorld);
        candidate
          .copy(a)
          .add(b)
          .add(c)
          .multiplyScalar(1 / 3);
        normal
          .copy(b)
          .sub(a)
          .cross(edge.copy(c).sub(a))
          .multiplyScalar(orientation);
        if (normal.dot(edge.copy(eye).sub(candidate)) <= 0) continue;
        const score = candidate.distanceToSquared(center);
        if (score < best) {
          best = score;
          target.copy(candidate);
        }
      }
    }
    if (best < Infinity) hit = cast(target);
  }
  return hit ? surfaceFocusPose(hit.point, eye, size) : null;
}
