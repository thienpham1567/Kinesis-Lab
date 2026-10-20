import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { StudioRenderer } from "../../atlas3d/studio-renderer";
import { resolveRenderQuality } from "../../atlas3d/render-policy";
import {
  clampPhase,
  cyclePhase,
  exportImageRect,
  phaseLabel,
} from "./motion-policy";
import type {
  CurlInfo,
  CurlPlayback,
  CurlStructure,
  CurlView,
} from "./curl-types";

type Part = {
  mesh: THREE.SkinnedMesh;
  info: CurlStructure;
  material: THREE.MeshPhysicalMaterial;
  kind: string;
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

/** A dedicated pilot stage: it never mutates the static Atlas scene or source GLB. */
export class CurlStage {
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(35, 1, 0.001, 100);
  private renderer: THREE.WebGLRenderer;
  private studio: StudioRenderer;
  private controls: OrbitControls;
  private observer: ResizeObserver;
  private root: THREE.Group | null = null;
  private mixer: THREE.AnimationMixer | null = null;
  private duration = 6;
  private phase = 0;
  private speed = 1;
  private playing = false;
  private disposed = false;
  private raf = 0;
  private lastFrame = 0;
  private lastNotify = 0;
  private request = new AbortController();
  private parts: Part[] = [];
  private highlighted = true;
  private isolated: string | null = null;
  private view: CurlView = "oblique";
  private bounds = new THREE.Box3();
  private hand: THREE.SkinnedMesh | null = null;
  private cableGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(),
    new THREE.Vector3(),
  ]);
  private cable = new THREE.Line(
    this.cableGeometry,
    new THREE.LineBasicMaterial({ color: 0x6ba9ba }),
  );
  private handle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.006, 0.006, 0.065, 16),
    new THREE.MeshStandardMaterial({
      color: 0x89989d,
      metalness: 0.3,
      roughness: 0.4,
    }),
  );
  private pulley = new THREE.Mesh(
    new THREE.TorusGeometry(0.014, 0.004, 8, 24),
    new THREE.MeshStandardMaterial({ color: 0x6ba9ba, roughness: 0.5 }),
  );
  private cableAnchor = new THREE.Vector3();

  constructor(
    private host: HTMLElement,
    private info: CurlInfo,
    private onPlayback: (state: CurlPlayback) => void,
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
      "Mô hình chuyển động gập khuỷu thử nghiệm. Kéo để xoay, cuộn để phóng to; dùng các nút góc nhìn để điều khiển bằng bàn phím.",
    );
    this.host.appendChild(canvas);
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = false;
    this.controls.minDistance = 0.1;
    this.controls.maxDistance = 4;
    this.controls.listenToKeyEvents(canvas);
    this.controls.addEventListener("change", this.render);
    this.handle.rotation.z = Math.PI / 2;
    this.scene.add(this.cable, this.handle, this.pulley);
    this.cable.visible = this.handle.visible = this.pulley.visible = false;
    this.observer = new ResizeObserver(this.resize);
    this.observer.observe(host);
    this.resize();
  }

  async load(url: string) {
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
    const clip = gltf.animations[0];
    if (
      !clip ||
      !Number.isFinite(clip.duration) ||
      Math.abs(clip.duration - this.info.motion.durationSeconds) > 0.05
    ) {
      release(gltf.scene);
      throw new Error("Mô hình chưa có chu kỳ chuyển động phù hợp.");
    }
    this.root = gltf.scene;
    this.duration = clip.duration;
    const map = new Map(this.info.structures.map((s) => [s.id, s]));
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
        roughness: kind === "muscle" ? 0.48 : 0.65,
        metalness: 0,
        envMapIntensity: 0.55,
      });
      o.material = mat;
      // Source bounds are static while this pilot deforms vertices.
      o.frustumCulled = false;
      o.castShadow = o.receiveShadow = true;
      this.parts.push({ mesh: o, info: data, material: mat, kind });
      if (/third metacarpal/i.test(data.english) && !this.hand) this.hand = o;
    });
    oldMaterials.forEach((m) => m.dispose());
    if (!this.parts.length)
      throw new Error("Thiếu các cấu trúc giải phẫu của bản mẫu.");
    this.scene.add(this.root);
    this.mixer = new THREE.AnimationMixer(this.root);
    this.mixer.clipAction(clip).play();
    this.updateColors();
    this.reframe();
    this.resize();
    this.seek(0);
  }

  private applyPose() {
    if (!this.root || !this.mixer) return;
    // The closing frame is identical to frame zero, so looping does not snap.
    this.mixer.setTime(this.phase * this.duration);
    this.root.updateMatrixWorld(true);
    for (const p of this.parts) p.mesh.skeleton.update();
    if (this.hand) {
      this.hand.computeBoundingBox();
      const point = this.hand
        .boundingBox!.getCenter(new THREE.Vector3())
        .applyMatrix4(this.hand.matrixWorld);
      const positions = this.cableGeometry.getAttribute(
        "position",
      ) as THREE.BufferAttribute;
      positions.setXYZ(0, point.x, point.y, point.z);
      positions.setXYZ(
        1,
        this.cableAnchor.x,
        this.cableAnchor.y,
        this.cableAnchor.z,
      );
      positions.needsUpdate = true;
      this.handle.position.copy(point);
      this.pulley.position.copy(this.cableAnchor);
      this.cable.visible =
        this.handle.visible =
        this.pulley.visible =
          !this.isolated;
    }
    this.studio.invalidateShadows();
  }
  private updateColors() {
    for (const p of this.parts) {
      const base =
        p.kind === "tendon"
          ? 0xeee7d7
          : p.kind === "cartilage"
            ? 0xd4dfdf
            : p.info.layer === "bone"
              ? 0xe3d9c3
              : 0x874d54;
      p.material.color.setHex(
        this.highlighted &&
          p.info.role === "elbow-flexor" &&
          p.kind === "muscle"
          ? 0xd47736
          : base,
      );
      p.material.emissive.setHex(
        this.highlighted &&
          p.info.role === "elbow-flexor" &&
          p.kind === "muscle"
          ? 0x2b0d00
          : 0x000000,
      );
      p.mesh.visible = !this.isolated || p.info.id === this.isolated;
    }
  }
  private reframe() {
    if (!this.root || !this.mixer) return;
    this.bounds.makeEmpty();
    const phase = this.phase;
    for (const sample of [0, 0.25, 0.5, 0.75]) {
      this.phase = sample;
      this.applyPose();
      for (const p of this.parts)
        if (p.mesh.visible) {
          p.mesh.computeBoundingBox();
          this.bounds.union(
            p.mesh.boundingBox!.clone().applyMatrix4(p.mesh.matrixWorld),
          );
        }
    }
    this.phase = phase;
    this.applyPose();
    if (this.bounds.isEmpty()) return;
    const center = this.bounds.getCenter(new THREE.Vector3());
    this.cableAnchor.set(
      center.x + 0.12,
      this.bounds.min.y - 0.09,
      center.z + 0.38,
    );
    this.pulley.position.copy(this.cableAnchor);
    if (!this.isolated && this.hand)
      this.bounds.expandByPoint(this.cableAnchor);
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
    const right = new THREE.Vector3().crossVectors(this.camera.up, direction).normalize();
    const up = new THREE.Vector3().crossVectors(direction, right).normalize();
    // Fit the complete cycle in the chosen view. A sphere fit wastes most of
    // the narrow mobile canvas around this tall, thin anatomy asset.
    let distance = 0.05;
    for (const x of [this.bounds.min.x, this.bounds.max.x])
      for (const y of [this.bounds.min.y, this.bounds.max.y])
        for (const z of [this.bounds.min.z, this.bounds.max.z]) {
          const offset = new THREE.Vector3(x, y, z).sub(center);
          distance = Math.max(distance,
            offset.dot(direction) + 1.08 * Math.abs(offset.dot(right)) / (Math.tan(vfov) * this.camera.aspect),
            offset.dot(direction) + 1.08 * Math.abs(offset.dot(up)) / Math.tan(vfov));
        }
    this.controls.target.copy(center);
    this.camera.position
      .copy(center)
      .addScaledVector(direction, distance);
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
    this.renderer.domElement.dataset.highlight = String(this.highlighted);
    this.renderer.domElement.dataset.isolated = this.isolated ?? "";
  };
  private emit() {
    if (!this.disposed)
      this.onPlayback({ phase: this.phase, playing: this.playing });
  }
  private tick = (now: number) => {
    if (!this.playing || this.disposed) return;
    this.phase = cyclePhase(
      this.phase * this.duration +
        Math.max(0, (now - this.lastFrame) / 1000) * this.speed,
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
    if (this.disposed || !this.mixer || this.playing) return;
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
    this.renderer.domElement.dataset.playing = "false";
    if (notify) this.emit();
  }
  seek(phase: number, notify = true) {
    if (this.disposed) return;
    this.pause(false);
    this.phase = clampPhase(phase);
    this.applyPose();
    this.render();
    if (notify) this.emit();
  }
  setSpeed(speed: number) {
    if (![0.5, 1, 1.5].includes(speed)) return;
    this.speed = speed;
  }
  setView(view: CurlView) {
    this.view = view;
    this.fitView();
    this.render();
  }
  setHighlight(enabled: boolean) {
    this.highlighted = enabled;
    this.updateColors();
    this.render();
  }
  setIsolation(id: string | null) {
    if (
      id &&
      !this.info.structures.some(
        (s) => s.id === id && s.role === "elbow-flexor",
      )
    )
      return;
    this.isolated = id;
    this.updateColors();
    this.reframe();
    this.render();
  }

  renderExport(phase: number, target: HTMLCanvasElement) {
    if (this.disposed || !this.mixer) throw new Error("Mô hình đã đóng.");
    this.seek(phase, false);
    const ctx = target.getContext("2d");
    if (!ctx) throw new Error("Không tạo được khung video.");
    const width = target.width,
      height = target.height;
    ctx.fillStyle = "#101c24";
    ctx.fillRect(0, 0, width, height);
    const source = this.renderer.domElement;
    const rect = exportImageRect(source.width, source.height, width, height);
    ctx.drawImage(source, rect.x, rect.y, rect.width, rect.height);
    ctx.fillStyle = "#f8fafc";
    ctx.font = "600 25px sans-serif";
    ctx.fillText("Gập khuỷu — tham chiếu cuốn cáp một tay", 30, 36);
    ctx.fillStyle = "#ffcc91";
    ctx.font = "17px sans-serif";
    ctx.fillText("MÔ PHỎNG THỬ NGHIỆM · CHƯA ĐƯỢC CHUYÊN GIA DUYỆT", 30, 66);
    ctx.fillStyle = "#e2e8f0";
    ctx.font = "17px sans-serif";
    ctx.fillText(
      `${phaseLabel(phase)} · ${this.highlighted ? "Cam: cấu trúc gập khuỷu được chú giải" : "Đã tắt tô màu"} · Không phải % hoạt hóa`,
      30,
      height - 46,
    );
    ctx.font = "14px sans-serif";
    ctx.fillStyle = "#bdcbd5";
    ctx.fillText(
      "Z-Anatomy / BodyParts3D · CC BY-SA 4.0 · OpenStax A&P 2e §11.5 · Rig & trọng số hiển thị do app tạo",
      30,
      height - 20,
    );
  }
  dispose() {
    if (this.disposed) return;
    this.pause(false);
    this.disposed = true;
    this.request.abort();
    this.observer.disconnect();
    this.controls.removeEventListener("change", this.render);
    this.controls.dispose();
    this.mixer?.stopAllAction();
    if (this.root) {
      this.mixer?.uncacheRoot(this.root);
      release(this.root);
    }
    this.cableGeometry.dispose();
    this.cable.material.dispose();
    release(this.handle);
    release(this.pulley);
    this.studio.dispose();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
    this.renderer.domElement.remove();
  }
}
