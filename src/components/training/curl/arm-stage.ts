import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { StudioRenderer } from "../../atlas3d/studio-renderer";
import { resolveRenderQuality } from "../../atlas3d/render-policy";
import { cyclePhase } from "./motion-policy";
import {
  armHighlights,
  ARM_BONES,
  poseQuaternion,
  poseSwings,
  type ArmExerciseId,
} from "./arm-motion";

export type ArmView = "oblique" | "front" | "side";
export type ArmPlayback = { phase: number; playing: boolean };
export type ArmStructure = {
  id: string;
  english: string;
  layer: string;
};

type Part = {
  mesh: THREE.SkinnedMesh;
  english: string;
  material: THREE.MeshPhysicalMaterial;
  kind: string;
  boneLayer: boolean;
};

type Joint = {
  bone: THREE.Bone;
  rest: [number, number, number, number];
  rotation: THREE.Matrix4;
};

function release(root: THREE.Object3D) {
  const materials = new Set<THREE.Material>();
  root.traverse((o) => {
    if (o instanceof THREE.Mesh) {
      o.geometry.dispose();
      (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) =>
        materials.add(m),
      );
    }
  });
  materials.forEach((m) => m.dispose());
}

export class ArmStage {
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(35, 1, 0.001, 100);
  private renderer: THREE.WebGLRenderer;
  private studio: StudioRenderer;
  private controls: OrbitControls;
  private observer: ResizeObserver;
  private root: THREE.Group | null = null;
  private duration = 6;
  private phase = 0;
  private playing = false;
  private disposed = false;
  private raf = 0;
  private lastFrame = 0;
  private lastNotify = 0;
  private request = new AbortController();
  private parts: Part[] = [];
  private joints = new Map<string, Joint>();
  private highlighted = true;
  private view: ArmView = "oblique";
  private bounds = new THREE.Box3();
  private localAxis = new THREE.Vector3();

  constructor(
    private host: HTMLElement,
    private exerciseId: ArmExerciseId,
    private onPlayback: (state: ArmPlayback) => void,
  ) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.studio = new StudioRenderer(this.renderer, this.scene, this.camera);
    this.studio.setPresentation("dark");
    const canvas = this.renderer.domElement;
    canvas.style.cssText =
      "width:100%;height:100%;display:block;touch-action:none";
    canvas.tabIndex = 0;
    canvas.setAttribute(
      "aria-label",
      "Mô hình chuyển động tay trái. Kéo để xoay, cuộn để phóng to.",
    );
    this.host.appendChild(canvas);
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = false;
    this.controls.minDistance = 0.1;
    this.controls.maxDistance = 4;
    this.controls.listenToKeyEvents(canvas);
    this.controls.addEventListener("change", this.render);
    this.observer = new ResizeObserver(this.resize);
    this.observer.observe(host);
    this.resize();
  }

  async load(url: string, structures: ArmStructure[]) {
    const response = await fetch(url, { signal: this.request.signal });
    if (!response.ok) throw new Error("Không tải được mô hình chuyển động.");
    const buffer = await response.arrayBuffer();
    const gltf = await new GLTFLoader().parseAsync(
      buffer,
      "/anatomy/3d/motion/",
    );
    if (this.disposed) {
      release(gltf.scene);
      return;
    }
    this.root = gltf.scene;
    const map = new Map(structures.map((s) => [s.id, s]));
    const oldMaterials = new Set<THREE.Material>();
    this.root.traverse((o) => {
      if (!(o instanceof THREE.Mesh)) return;
      let ancestor: THREE.Object3D | null = o;
      while (ancestor && !map.has(ancestor.name)) ancestor = ancestor.parent;
      const data = ancestor ? map.get(ancestor.name) : undefined;
      if (!data || !(o instanceof THREE.SkinnedMesh)) {
        o.visible = false;
        return;
      }
      const old = Array.isArray(o.material) ? o.material[0] : o.material;
      oldMaterials.add(old);
      const kind = old.name.replace("Kinesis_", "");
      const mat = new THREE.MeshPhysicalMaterial({
        side: old.side,
        roughness: kind === "muscle" ? 0.48 : 0.65,
        metalness: 0,
        envMapIntensity: 0.55,
      });
      o.material = mat;
      o.frustumCulled = false;
      o.castShadow = o.receiveShadow = true;
      this.parts.push({
        mesh: o,
        english: data.english,
        material: mat,
        kind,
        boneLayer: data.layer === "bone",
      });
    });
    oldMaterials.forEach((m) => m.dispose());
    if (!this.parts.length)
      throw new Error("Thiếu các cấu trúc giải phẫu của bản mẫu.");
    this.scene.add(this.root);
    this.root.updateMatrixWorld(true);
    for (const name of ARM_BONES) {
      let bone: THREE.Bone | null = null;
      this.root.traverse((o) => {
        if (o.name === name && o instanceof THREE.Bone) bone = o;
      });
      if (!bone) throw new Error("Thiếu xương hiển thị.");
      const joint = bone as THREE.Bone;
      this.joints.set(name, {
        bone: joint,
        rest: [joint.quaternion.x, joint.quaternion.y, joint.quaternion.z, joint.quaternion.w],
        rotation: new THREE.Matrix4().extractRotation(joint.matrixWorld),
      });
    }
    this.updateColors();
    this.reframe();
    this.resize();
    this.seek(0);
  }

  private applyPose() {
    if (!this.root) return;
    for (const swing of poseSwings(this.exerciseId, this.phase)) {
      const joint = this.joints.get(swing.bone);
      if (!joint) continue;
      this.localAxis
        .set(swing.worldAxis[0], swing.worldAxis[1], swing.worldAxis[2])
        .transformDirection(joint.rotation.clone().invert());
      const q = poseQuaternion(joint.rest, this.localAxis.toArray(), swing.degrees);
      joint.bone.quaternion.set(q[0], q[1], q[2], q[3]);
    }
    this.root.updateMatrixWorld(true);
    for (const p of this.parts) p.mesh.skeleton.update();
    this.studio.invalidateShadows();
  }

  private updateColors() {
    for (const p of this.parts) {
      const marked =
        this.highlighted &&
        p.kind === "muscle" &&
        armHighlights(this.exerciseId, p.english);
      const base = p.kind === "tendon"
        ? 0xeee7d7
        : p.kind === "cartilage"
          ? 0xd4dfdf
          : p.boneLayer
            ? 0xe3d9c3
            : 0x874d54;
      p.material.color.setHex(marked ? 0xd47736 : base);
      p.material.emissive.setHex(marked ? 0x2b0d00 : 0x000000);
    }
  }

  private reframe() {
    if (!this.root) return;
    this.bounds.makeEmpty();
    const phase = this.phase;
    for (const sample of [0, 0.25, 0.5, 0.75]) {
      this.phase = sample;
      this.applyPose();
      for (const p of this.parts) {
        p.mesh.computeBoundingBox();
        this.bounds.union(
          p.mesh.boundingBox!.clone().applyMatrix4(p.mesh.matrixWorld),
        );
      }
    }
    this.phase = phase;
    this.applyPose();
    if (this.bounds.isEmpty()) return;
    this.studio.setBounds(this.bounds);
    this.fitView();
  }

  private fitView() {
    if (this.bounds.isEmpty()) return;
    const center = this.bounds.getCenter(new THREE.Vector3());
    const vfov = THREE.MathUtils.degToRad(this.camera.fov) / 2;
    const direction =
      this.view === "front"
        ? new THREE.Vector3(0, 0.05, 1)
        : this.view === "side"
          ? new THREE.Vector3(1, 0.05, 0)
          : new THREE.Vector3(1.2, 0.12, 1);
    direction.normalize();
    const right = new THREE.Vector3()
      .crossVectors(this.camera.up, direction)
      .normalize();
    const up = new THREE.Vector3().crossVectors(direction, right).normalize();
    let distance = 0.05;
    for (const x of [this.bounds.min.x, this.bounds.max.x])
      for (const y of [this.bounds.min.y, this.bounds.max.y])
        for (const z of [this.bounds.min.z, this.bounds.max.z]) {
          const offset = new THREE.Vector3(x, y, z).sub(center);
          distance = Math.max(
            distance,
            offset.dot(direction) +
              (1.08 * Math.abs(offset.dot(right))) /
                (Math.tan(vfov) * this.camera.aspect),
            offset.dot(direction) +
              (1.08 * Math.abs(offset.dot(up))) / Math.tan(vfov),
          );
        }
    this.controls.target.copy(center);
    this.camera.position.copy(center).addScaledVector(direction, distance);
    this.camera.near = Math.max(0.0001, distance / 1000);
    this.camera.far = Math.max(10, distance * 20);
    this.camera.updateProjectionMatrix();
    this.controls.update();
  }

  private resize = () => {
    if (this.disposed) return;
    const { width, height } = this.host.getBoundingClientRect();
    if (!width || !height) return;
    const oldAngle = Math.min(1, this.camera.aspect);
    this.camera.aspect = width / height;
    const offset = this.camera.position.clone().sub(this.controls.target);
    this.camera.position
      .copy(this.controls.target)
      .addScaledVector(offset, oldAngle / Math.min(1, this.camera.aspect));
    this.camera.updateProjectionMatrix();
    const quality = resolveRenderQuality("auto", {
      width: window.innerWidth,
      coarsePointer: window.matchMedia("(pointer: coarse)").matches,
    });
    this.studio.configure(quality, true);
    this.studio.resize(width, height);
    this.render();
  };

  private render = () => {
    if (this.disposed) return;
    this.studio.render();
    this.renderer.domElement.dataset.phase = this.phase.toFixed(5);
    this.renderer.domElement.dataset.playing = String(this.playing);
    this.renderer.domElement.dataset.exercise = this.exerciseId;
  };

  private emit() {
    if (!this.disposed) this.onPlayback({ phase: this.phase, playing: this.playing });
  }

  private tick = (now: number) => {
    if (!this.playing || this.disposed) return;
    this.phase = cyclePhase(
      this.phase * this.duration + Math.max(0, (now - this.lastFrame) / 1000),
      this.duration,
      1,
    );
    this.lastFrame = now;
    this.applyPose();
    this.render();
    if (now - this.lastNotify > 90) {
      this.lastNotify = now;
      this.emit();
    }
    this.raf = requestAnimationFrame(this.tick);
  };

  play() {
    if (this.disposed || !this.root || this.playing) return;
    if (this.phase === 1) this.phase = 0;
    this.playing = true;
    this.lastFrame = performance.now();
    this.emit();
    this.raf = requestAnimationFrame(this.tick);
  }

  pause(notify = true) {
    this.playing = false;
    cancelAnimationFrame(this.raf);
    this.raf = 0;
    if (notify) this.emit();
  }

  seek(phase: number, notify = true) {
    if (this.disposed || !this.root) return;
    this.pause(false);
    this.phase = Number.isFinite(phase) ? Math.max(0, Math.min(1, phase)) : 0;
    this.applyPose();
    this.render();
    if (notify) this.emit();
  }

  setView(view: ArmView) {
    this.view = view;
    this.fitView();
    this.render();
  }

  setHighlight(enabled: boolean) {
    this.highlighted = enabled;
    this.updateColors();
    this.render();
  }

  dispose() {
    if (this.disposed) return;
    this.pause(false);
    this.disposed = true;
    this.request.abort();
    this.observer.disconnect();
    this.controls.removeEventListener("change", this.render);
    this.controls.dispose();
    if (this.root) release(this.root);
    this.studio.dispose();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
    this.renderer.domElement.remove();
  }
}
