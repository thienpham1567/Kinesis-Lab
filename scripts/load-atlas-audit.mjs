import * as THREE from "three";
import { readFile, copyFile, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createRequire } from "node:module";
/** Read existing trusted local Draco code and GLB; no source files are changed. */
export async function loadAuditMeshes(bundle = "hip") {
  const dir = await mkdtemp(join(tmpdir(), "kinesis-draco-"));
  try {
    const path = join(dir, "decoder.cjs");
    await copyFile(
      new URL("../public/anatomy/3d/draco/draco_decoder.js", import.meta.url),
      path,
    );
    const draco = await createRequire(import.meta.url)(path)({});
    const manifest = JSON.parse(
      await readFile(
        new URL("../public/anatomy/3d/manifest.json", import.meta.url),
        "utf8",
      ),
    );
    const url =
      manifest.bundles[bundle]?.url ??
      manifest.bundles.find?.((b) => b.id === bundle)?.url;
    if (!url) throw new Error("Unknown bundle " + bundle);
    const bytes = await readFile(new URL("../public" + url, import.meta.url));
    const jsonSize = bytes.readUInt32LE(12),
      gltf = JSON.parse(bytes.subarray(20, 20 + jsonSize));
    const bin = bytes.subarray(28 + jsonSize);
    const result = [];
    function visit(i, parent, id) {
      const node = gltf.nodes[i],
        local = node.matrix
          ? new THREE.Matrix4().fromArray(node.matrix)
          : new THREE.Matrix4().compose(
              new THREE.Vector3().fromArray(node.translation ?? [0, 0, 0]),
              new THREE.Quaternion().fromArray(node.rotation ?? [0, 0, 0, 1]),
              new THREE.Vector3().fromArray(node.scale ?? [1, 1, 1]),
            );
      const world = parent.clone().multiply(local);
      if (node.name?.startsWith("za-")) id = node.name;
      if (node.mesh !== undefined && id)
        for (const primitive of gltf.meshes[node.mesh].primitives) {
          const ext = primitive.extensions.KHR_draco_mesh_compression,
            view = gltf.bufferViews[ext.bufferView],
            data = bin.subarray(
              view.byteOffset ?? 0,
              (view.byteOffset ?? 0) + view.byteLength,
            );
          const decoder = new draco.Decoder(),
            buffer = new draco.DecoderBuffer(),
            mesh = new draco.Mesh();
          buffer.Init(new Int8Array(data), data.length);
          const status = decoder.DecodeBufferToMesh(buffer, mesh);
          if (!status.ok()) throw new Error(status.error_msg());
          const geometry = new THREE.BufferGeometry();
          for (const [semantic, name] of [
            ["POSITION", "position"],
            ["NORMAL", "normal"],
          ]) {
            const attr = decoder.GetAttributeByUniqueId(
                mesh,
                ext.attributes[semantic],
              ),
              values = new draco.DracoFloat32Array();
            decoder.GetAttributeFloatForAllPoints(mesh, attr, values);
            const array = Float32Array.from({ length: values.size() }, (_, j) =>
              values.GetValue(j),
            );
            geometry.setAttribute(name, new THREE.BufferAttribute(array, 3));
            draco.destroy(values);
          }
          const face = new draco.DracoInt32Array(),
            indices = [];
          for (let j = 0; j < mesh.num_faces(); j++) {
            decoder.GetFaceFromMesh(mesh, j, face);
            indices.push(face.GetValue(0), face.GetValue(1), face.GetValue(2));
          }
          geometry.setIndex(indices);
          const object = new THREE.Mesh(geometry);
          object.matrixAutoUpdate = false;
          object.matrix.copy(world);
          object.updateMatrixWorld(true);
          object.userData = {
            structureId: id,
            tissueKind: gltf.materials[primitive.material].name.replace(
              "Kinesis_",
              "",
            ),
          };
          result.push(object);
          draco.destroy(face);
          draco.destroy(status);
          draco.destroy(mesh);
          draco.destroy(buffer);
          draco.destroy(decoder);
        }
      for (const child of node.children ?? []) visit(child, world, id);
    }
    for (const root of gltf.scenes[gltf.scene ?? 0].nodes)
      visit(root, new THREE.Matrix4(), null);
    return result;
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
