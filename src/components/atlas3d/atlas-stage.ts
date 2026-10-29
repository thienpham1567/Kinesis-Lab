import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { SurfaceLabels } from "./surface-labels.mjs";
import { StudioRenderer } from "./studio-renderer";
import { StructureCallouts } from "./structure-callouts";
import {
  prepareSourceAcceleration,
  releaseSourceAcceleration,
} from "./raycast-acceleration.mjs";
import {
  ATLAS_FOV,
  ATLAS_HALF_FOV,
  CameraTransition,
  setOrthographicSpan,
  type AtlasCamera,
} from "./atlas-camera";
import {
  createTissueMaterial,
  setTissueSelection,
  setTissueOpacity,
  surfaceKind,
  setThicknessView,
  setTissueStudy,
} from "./tissue-materials";
import { isHipStudyStructure, HIP_STUDY_SAMPLES } from "./hip-material-policy";
import { TissueStudyResources } from "./tissue-study-resources";
import { findSurfaceFocus, surfaceFocusPose } from "./surface-focus.mjs";
import { resolveRenderQuality, shouldUseOcclusion } from "./render-policy";
import { atlasSearchAppearance, isStructureVisible } from "@/lib/clinical/atlas-3d";
import type { AtlasCanvasProps, CameraCommand } from "./types";

type Mesh = THREE.Mesh<THREE.BufferGeometry, THREE.MeshPhysicalMaterial>;
function release(root: THREE.Object3D) {
  root.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      releaseSourceAcceleration(object);
      object.geometry.dispose();
      const materials = Array.isArray(object.material)
        ? object.material
        : [object.material];
      materials.forEach((material: THREE.Material) => material.dispose());
    }
  });
}

/** Owns GPU resources and DOM events. React owns the workspace state. */
export class AtlasStage {
  private scene = new THREE.Scene();
  private camera: AtlasCamera = new THREE.PerspectiveCamera(
    ATLAS_FOV,
    1,
    0.001,
    100,
  );
  private aspect = 1;
  private transition = new CameraTransition();
  private reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  private framed = false;
  private renderer: THREE.WebGLRenderer;
  private labels: SurfaceLabels;
  private callouts: StructureCallouts;
  private controls: OrbitControls;
  private studio: StudioRenderer;
  private coarsePointer = window.matchMedia("(pointer: coarse)");
  private decoder = new DRACOLoader()
    .setDecoderPath("/anatomy/3d/draco/")
    .setWorkerLimit(2);
  private loader = new GLTFLoader().setDRACOLoader(this.decoder);
  private observer: ResizeObserver;
  private root: THREE.Group | null = null;
  private meshes = new Map<string, Mesh[]>();
  private props: AtlasCanvasProps;
  private generation = 0;
  private disposed = false;
  private url = "";
  private pointer: { x: number; y: number; id: number } | null = null;
  private dragged = false;
  private studyRetry = 0;
  private frameTimings: number[] = [];
  private renderCount = 0;
  private study = new TissueStudyResources((status) => {
    if (this.disposed) return;
    this.props.onStudyStatus(status);
    this.update(this.props);
  });

  constructor(
    private host: HTMLElement,
    props: AtlasCanvasProps,
  ) {
    this.props = props;
    if (props.projection === "orthographic")
      this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.001, 100);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.studio = new StudioRenderer(this.renderer, this.scene, this.camera);
    const canvas = this.renderer.domElement;
    canvas.style.cssText =
      "width:100%;height:100%;display:block;touch-action:none";
    canvas.tabIndex = 0;
    canvas.setAttribute(
      "aria-label",
      "Mô hình giải phẫu 3D. Kéo để xoay, cuộn để phóng to. Dùng danh sách cấu trúc và nút góc nhìn để điều khiển bằng bàn phím.",
    );
    this.host.appendChild(canvas);
    this.labels = new SurfaceLabels(this.host, (kind: string) => {
      const meshes = (
        this.meshes.get(this.props.selectedId ?? "") ?? []
      ).filter((mesh) => mesh.userData.tissueKind === kind);
      const pose = findSurfaceFocus(meshes, this.camera.position);
      if (pose) this.applySurfacePose(pose);
    });
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = false;
    this.controls.minDistance = 0.02;
    this.controls.maxDistance = 12;
    this.controls.minZoom = 0.05;
    this.controls.maxZoom = 100;
    this.controls.listenToKeyEvents(canvas);
    this.controls.addEventListener("change", this.render);
    this.controls.addEventListener("start", this.transition.cancel);
    this.callouts = new StructureCallouts(this.host, (id) =>
      this.props.onSelect(id),
    );
    // Capture before OrbitControls handles input, including keyboard pan and zoom.
    canvas.addEventListener("pointerdown", this.transition.cancel, true);
    canvas.addEventListener("wheel", this.transition.cancel, true);
    canvas.addEventListener("keydown", this.transition.cancel, true);
    canvas.addEventListener("pointerdown", this.pointerDown);
    canvas.addEventListener("pointermove", this.pointerMove);
    canvas.addEventListener("pointerup", this.pointerUp);
    canvas.addEventListener("pointercancel", this.pointerCancel);
    canvas.addEventListener("dblclick", this.surfaceDoubleClick);
    this.observer = new ResizeObserver(this.resize);
    this.observer.observe(host);
    this.coarsePointer.addEventListener("change", this.resize);
    this.reducedMotion.addEventListener("change", this.motionChanged);
    this.resize();
  }

  private resize = () => {
    const { width, height } = this.host.getBoundingClientRect();
    if (!width || !height || this.disposed) return;
    this.transition.cancel();
    const halfFov = ATLAS_HALF_FOV;
    const previousAngle = Math.min(
      halfFov,
      Math.atan(Math.tan(halfFov) * this.aspect),
    );
    const previousAspect = this.aspect;
    this.aspect = width / height;
    if (this.camera instanceof THREE.PerspectiveCamera)
      this.camera.aspect = this.aspect;
    if (this.root) {
      const nextAngle = Math.min(
        halfFov,
        Math.atan(Math.tan(halfFov) * this.aspect),
      );
      if (this.camera instanceof THREE.PerspectiveCamera) {
        const offset = this.camera.position.clone().sub(this.controls.target);
        this.camera.position
          .copy(this.controls.target)
          .addScaledVector(
            offset,
            Math.sin(previousAngle) / Math.sin(nextAngle),
          );
        const distance = this.camera.position.distanceTo(this.controls.target);
        this.camera.near = Math.min(
          this.camera.near,
          Math.max(0.00005, distance / 1000),
        );
        this.camera.far = Math.max(this.camera.far, distance * 20, 10);
      }
      this.controls.update();
    }
    if (this.camera instanceof THREE.OrthographicCamera) {
      const halfHeight = this.camera.top / this.camera.zoom;
      setOrthographicSpan(
        this.camera,
        (halfHeight * Math.min(1, previousAspect)) / Math.min(1, this.aspect),
        this.aspect,
      );
    }
    this.camera.updateProjectionMatrix();
    this.updateQuality();
    this.studio.resize(width, height);
    this.render();
  };
  private render = () => {
    if (!this.disposed) {
      const started = performance.now();
      this.studio.render();
      const labelsStarted = performance.now();
      const bounds = this.host.getBoundingClientRect();
      this.labels.update(
        this.props.selectedId,
        this.props.showSurfaceLabels,
        this.meshes,
        this.camera,
        bounds.width,
        bounds.height,
      );
      this.callouts.update(
        (!!this.props.learningMode ||
          !!this.props.searchTargetIds?.size ||
          !!this.props.selectedId) && !!this.props.showStructureLabels,
        this.props.selectedId,
        this.props.structures,
        this.meshes,
        this.camera,
        bounds.width,
        bounds.height,
        this.labels.occupiedBounds,
        this.props.searchTargetIds,
      );
      const finished = performance.now();
      this.frameTimings.push(finished - started);
      if (this.frameTimings.length > 32) this.frameTimings.shift();
      const sorted = [...this.frameTimings].sort((a, b) => a - b);
      const stats = this.renderer.domElement.dataset;
      // Main-thread elapsed work, including label raycasts/layout. Not GPU time/FPS.
      stats.frameCpuMsMedian = sorted[Math.floor(sorted.length / 2)].toFixed(2);
      stats.frameCpuMsP95 =
        sorted[
          Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))
        ].toFixed(2);
      stats.labelsCpuMs = (finished - labelsStarted).toFixed(2);
      stats.frameCount = String(++this.renderCount);
      this.renderer.domElement.dataset.projection =
        this.camera instanceof THREE.OrthographicCamera
          ? "orthographic"
          : "perspective";
      this.renderer.domElement.dataset.view = [
        ...this.camera.position.toArray(),
        ...this.controls.target.toArray(),
      ]
        .map((value) => value.toFixed(6))
        .join(",");
    }
  };
  private motionChanged = () => {
    if (this.reducedMotion.matches) this.transition.cancel();
  };

  private setProjection(projection: AtlasCanvasProps["projection"]) {
    const orthographic = projection === "orthographic";
    if (orthographic === this.camera instanceof THREE.OrthographicCamera)
      return;
    this.transition.cancel();
    const previous = this.camera;
    const offset = previous.position.clone().sub(this.controls.target);
    const halfHeight = Math.max(
      0.0001,
      previous instanceof THREE.OrthographicCamera
        ? previous.top / previous.zoom
        : (offset.length() * Math.tan(ATLAS_HALF_FOV)) / previous.zoom,
    );
    const camera: AtlasCamera = orthographic
      ? new THREE.OrthographicCamera(-1, 1, 1, -1, previous.near, previous.far)
      : new THREE.PerspectiveCamera(
          ATLAS_FOV,
          this.aspect,
          previous.near,
          previous.far,
        );
    camera.position.copy(previous.position);
    camera.quaternion.copy(previous.quaternion);
    camera.up.copy(previous.up);
    if (camera instanceof THREE.OrthographicCamera)
      setOrthographicSpan(camera, halfHeight, this.aspect);
    else {
      const distance = Math.max(0.0001, halfHeight / Math.tan(ATLAS_HALF_FOV));
      if (offset.lengthSq() < 1e-12) offset.set(0, 0, 1);
      camera.position
        .copy(this.controls.target)
        .addScaledVector(offset.normalize(), distance);
    }
    // Keep clipping valid after orthographic zoom is converted to eye distance.
    const distance = camera.position.distanceTo(this.controls.target);
    this.controls.minDistance = Math.min(this.controls.minDistance, distance);
    this.controls.maxDistance = Math.max(this.controls.maxDistance, distance);
    camera.near = Math.min(previous.near, Math.max(0.00005, distance / 1000));
    camera.far = Math.max(previous.far, distance * 20, 10);
    camera.updateProjectionMatrix();
    this.camera = camera;
    this.controls.object = camera;
    this.studio.setCamera(camera);
    this.controls.update();
  }

  private moveCamera(
    target: THREE.Vector3,
    position: THREE.Vector3,
    near: number,
    far: number,
    immediate = false,
  ) {
    const camera = this.camera;
    const fromPosition = camera.position.clone();
    const fromTarget = this.controls.target.clone();
    const fromOffset = fromPosition.sub(fromTarget);
    const toOffset = position.clone().sub(target);
    const fromRadius = fromOffset.length();
    const toRadius = toOffset.length();
    if (fromRadius < 1e-12) fromOffset.set(0, 0, 1);
    fromOffset.normalize();
    const rotation = new THREE.Quaternion().setFromUnitVectors(
      fromOffset,
      toOffset.clone().normalize(),
    );
    const interpolatedRotation = new THREE.Quaternion();
    const fromSpan =
      camera instanceof THREE.OrthographicCamera ? camera.top / camera.zoom : 0;
    const toSpan = position.distanceTo(target) * Math.tan(ATLAS_HALF_FOV);
    camera.near = Math.min(camera.near, near);
    camera.far = Math.max(camera.far, far);
    this.transition.run(
      (progress) => {
        this.controls.target.lerpVectors(fromTarget, target, progress);
        interpolatedRotation.identity().slerp(rotation, progress);
        camera.position
          .copy(fromOffset)
          .applyQuaternion(interpolatedRotation)
          .multiplyScalar(THREE.MathUtils.lerp(fromRadius, toRadius, progress))
          .add(this.controls.target);
        if (camera instanceof THREE.OrthographicCamera)
          setOrthographicSpan(
            camera,
            THREE.MathUtils.lerp(fromSpan, toSpan, progress),
            this.aspect,
          );
        if (progress === 1) {
          camera.near = near;
          camera.far = far;
        }
        camera.updateProjectionMatrix();
        if (!this.controls.update()) this.render();
      },
      immediate || !this.props.learningMode || this.reducedMotion.matches,
    );
  }
  private pointerDown = (event: PointerEvent) => {
    if (!event.isPrimary || event.button !== 0) {
      this.dragged = true;
      return;
    }
    this.pointer = { x: event.clientX, y: event.clientY, id: event.pointerId };
    this.dragged = false;
  };
  private pointerMove = (event: PointerEvent) => {
    if (
      this.pointer &&
      Math.hypot(
        event.clientX - this.pointer.x,
        event.clientY - this.pointer.y,
      ) > 5
    )
      this.dragged = true;
  };
  private pointerCancel = () => {
    this.pointer = null;
  };
  private pointerUp = (event: PointerEvent) => {
    const start = this.pointer;
    this.pointer = null;
    if (!start || start.id !== event.pointerId || this.dragged) return;
    const hit = this.hitAt(event.clientX, event.clientY);
    if (hit) this.props.onSelect(hit.object.userData.structureId);
  };
  private hitAt(clientX: number, clientY: number) {
    const bounds = this.renderer.domElement.getBoundingClientRect();
    const ray = new THREE.Raycaster();
    ray.firstHitOnly = true;
    ray.setFromCamera(
      new THREE.Vector2(
        ((clientX - bounds.left) / bounds.width) * 2 - 1,
        (-(clientY - bounds.top) / bounds.height) * 2 + 1,
      ),
      this.camera,
    );
    const candidates = [...this.meshes.values()]
      .flat()
      .filter((mesh) => mesh.visible && (!this.props.searchTargetIds?.size || this.props.searchTargetIds.has(mesh.userData.structureId)));
    return ray.intersectObjects(candidates, false)[0];
  }
  private surfaceDoubleClick = (event: MouseEvent) => {
    if (event.button !== 0) return;
    const hit = this.hitAt(event.clientX, event.clientY);
    if (!hit) return;
    this.props.onSelect(hit.object.userData.structureId);
    const box = new THREE.Box3().setFromObject(hit.object);
    this.applySurfacePose(
      surfaceFocusPose(
        hit.point,
        this.camera.position,
        box.getSize(new THREE.Vector3()).length(),
      ),
    );
  };
  private applySurfacePose(pose: {
    target: THREE.Vector3;
    position: THREE.Vector3;
  }) {
    this.controls.minDistance = 0.005;
    this.moveCamera(pose.target, pose.position, 0.00005, 10);
  }

  private updateQuality() {
    const quality = resolveRenderQuality(this.props.quality, {
      width: window.innerWidth,
      coarsePointer: this.coarsePointer.matches,
    });
    const visibleMuscles = this.props.structures.some(
      (structure) =>
        structure.layer === "muscle" &&
        this.meshes.has(structure.id) &&
        isStructureVisible(
          structure,
          this.props.layers,
          this.props.hiddenIds,
          this.props.isolatedId,
        ),
    );
    this.studio.configure(
      quality,
      // Screen-space AO would darken the deliberately visible deep-tissue overlay.
      !this.props.searchTargetIds?.size && shouldUseOcclusion(quality, visibleMuscles, this.props.muscleOpacity),
    );
  }

  update(props: AtlasCanvasProps) {
    this.props = props;
    this.setProjection(props.projection);
    this.studio.setPresentation(props.presentation);
    this.study.setEnabled(
      props.materialStudy &&
        props.structures.some(
          (structure) =>
            this.meshes.has(structure.id) &&
            isHipStudyStructure(structure.id) &&
            isStructureVisible(
              structure,
              props.layers,
              props.hiddenIds,
              props.isolatedId,
            ),
        ),
    );
    if (props.studyRetry !== this.studyRetry) {
      this.studyRetry = props.studyRetry;
      this.study.retry();
    }
    const studyActive = this.study.uniforms.studyEnabled.value === 1;
    this.renderer.domElement.dataset.materialStudy = this.study.status;
    this.renderer.domElement.dataset.studyApplied = String(studyActive);
    const metadata = new Map(
      props.structures.map((structure) => [structure.id, structure]),
    );
    let shadowsChanged = false;
    for (const [id, meshes] of this.meshes) {
      const structure = metadata.get(id);
      for (const mesh of meshes) {
        const previouslyVisible = mesh.visible;
        const previousShadow = mesh.castShadow;
        mesh.visible =
          !!structure &&
          isStructureVisible(
            structure,
            props.layers,
            props.hiddenIds,
            props.isolatedId,
          );
        const appearance = structure
          ? atlasSearchAppearance(structure, props.selectedId, props.searchTargetIds, props.muscleOpacity)
          : { opacity: 1, highlighted: false, overlay: false };
        const opacity = appearance.opacity;
        setTissueStudy(
          mesh.material,
          mesh.userData.tissueKind,
          studyActive && isHipStudyStructure(id),
        );
        setTissueOpacity(mesh.material, opacity);
        mesh.material.depthTest = !appearance.overlay;
        mesh.material.depthWrite = opacity === 1 && !appearance.overlay;
        mesh.renderOrder = appearance.overlay ? 10 : 0;
        mesh.castShadow = opacity === 1;
        mesh.receiveShadow = opacity === 1;
        shadowsChanged ||=
          mesh.visible !== previouslyVisible ||
          mesh.castShadow !== previousShadow;
        if (structure)
          setTissueSelection(
            mesh.material,
            mesh.userData.tissueKind,
            appearance.highlighted,
            props.searchTargetIds?.size ? 1 : 0.65,
          );
        setThicknessView(mesh.material, id === props.thicknessId);
      }
    }
    const highlightedIds = props.searchTargetIds?.size
      ? [...props.searchTargetIds]
      : props.selectedId ? [props.selectedId] : [];
    const highlightedMeshes = highlightedIds.flatMap((id) => this.meshes.get(id) ?? []).filter((mesh) => mesh.visible);
    this.renderer.domElement.dataset.highlightedIds = [...new Set(highlightedMeshes.map((mesh) => mesh.userData.structureId))].sort().join(",");
    this.studio.setSelection(highlightedMeshes, !!props.learningMode || !!props.searchTargetIds?.size);
    this.updateQuality();
    if (shadowsChanged) this.studio.invalidateShadows();
    this.render();
  }

  async load(
    url: string,
    progress: (value: number | null) => void,
    force = false,
  ) {
    if (url === this.url && !force) return;
    this.url = url;
    this.transition.cancel();
    this.framed = false;
    this.studio.setSelection([], !!this.props.learningMode);
    const generation = ++this.generation;
    if (this.root) {
      this.scene.remove(this.root);
      release(this.root);
      this.root = null;
    }
    this.meshes.clear();
    this.render();
    const gltf = await this.loader.loadAsync(url, (event) => {
      if (!this.disposed && generation === this.generation)
        progress(
          event.total ? Math.round((event.loaded / event.total) * 100) : null,
        );
    });
    if (this.disposed || generation !== this.generation) {
      release(gltf.scene);
      return;
    }
    const metadata = new Map(
      this.props.structures.map((structure) => [structure.id, structure]),
    );
    const ids = new Set(metadata.keys());
    const sourceMaterials = new Set<THREE.Material>();
    gltf.scene.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      let ancestor: THREE.Object3D | null = object;
      while (ancestor && !ids.has(ancestor.name)) ancestor = ancestor.parent;
      if (!ancestor) {
        object.visible = false;
        return;
      }
      const id = ancestor.name;
      const mesh = object as Mesh;
      const sourceMaterial = mesh.material;
      sourceMaterials.add(sourceMaterial);
      const kind = surfaceKind(sourceMaterial.name, metadata.get(id)!.layer);
      mesh.material = createTissueMaterial(
        kind,
        !!mesh.geometry.getAttribute("_thickness") &&
          !!mesh.geometry.getAttribute("_thickness_valid"),
        isHipStudyStructure(id) ? this.study.uniforms : undefined,
        sourceMaterial.side,
      );
      mesh.userData.structureId = id;
      mesh.userData.tissueKind = kind;
      this.meshes.set(id, [...(this.meshes.get(id) ?? []), mesh]);
    });
    sourceMaterials.forEach((material) => material.dispose());
    try {
      const ready = await prepareSourceAcceleration(
        [...this.meshes.values()].flat(),
        () => this.disposed || generation !== this.generation,
      );
      if (!ready) {
        release(gltf.scene);
        return;
      }
    } catch (error) {
      release(gltf.scene);
      throw error;
    }
    this.root = gltf.scene;
    this.scene.add(gltf.scene);
    gltf.scene.updateMatrixWorld(true);
    this.studio.setBounds(new THREE.Box3().setFromObject(gltf.scene));
    this.update(this.props);
    this.command(this.props.command);
  }

  command(command: CameraCommand) {
    this.transition.cancel();
    if (!this.root) return;
    if (command.type === "detail") {
      const pose = findSurfaceFocus(
        this.meshes.get(this.props.selectedId ?? "") ?? [],
        this.camera.position,
      );
      if (pose) this.applySurfacePose(pose);
      return;
    }
    this.controls.minDistance = 0.02;
    const box = new THREE.Box3();
    if (command.type === "hip") {
      for (const mesh of this.meshes.get(HIP_STUDY_SAMPLES.joint.selectedId) ??
        [])
        box.expandByObject(mesh);
      // Contextual camera framing only: no source geometry is clipped or cut.
      if (!box.isEmpty()) box.expandByScalar(0.09);
    } else if (
      (command.type === "focus" || command.type === "muscle") &&
      this.props.selectedId
    ) {
      const focusIds = this.props.searchTargetIds?.size ? [...this.props.searchTargetIds] : [this.props.selectedId];
      for (const id of focusIds)
        for (const mesh of this.meshes.get(id) ?? []) if (mesh.visible) box.expandByObject(mesh);
    } else {
      // Fit the visible geometry; use regional bounds only when every layer is off.
      for (const [id, meshes] of this.meshes) {
        if (command.type !== "search" && this.props.frameIds?.size && !this.props.frameIds.has(id)) continue;
        for (const mesh of meshes) if (mesh.visible) box.expandByObject(mesh);
      }
      if (box.isEmpty()) box.setFromObject(this.root);
    }
    if (box.isEmpty()) return;
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const radius = Math.max(size.length() / 2, 0.015);
    const vfov = ATLAS_HALF_FOV;
    const angle = Math.min(vfov, Math.atan(Math.tan(vfov) * this.aspect));
    let distance = (radius / Math.sin(angle)) * 1.08;
    const direction = new THREE.Vector3(0, 0, 1);
    if (command.type === "back") direction.set(0, 0, -1);
    if (command.type === "front-oblique")
      direction.set(0.65, 0.12, 1).normalize();
    if (command.type === "back-oblique")
      direction.set(-0.65, 0.12, -1).normalize();
    if (command.type === "left") direction.set(1, 0, 0);
    if (command.type === "right") direction.set(-1, 0, 0);
    if (command.type === "hip") direction.set(1, 0.15, -0.15).normalize();
    if (command.type === "focus" || command.type === "search")
      direction
        .copy(this.camera.position)
        .sub(this.controls.target)
        .normalize();
    if (direction.lengthSq() < 0.001) direction.set(0, 0, 1);
    if (
      this.props.learningMode &&
      this.camera instanceof THREE.OrthographicCamera
    ) {
      // Fit the projected box rather than its enclosing sphere: tall regional
      // bundles otherwise leave most of a narrow teaching stage empty.
      const right = new THREE.Vector3().crossVectors(this.camera.up, direction);
      if (right.lengthSq() < 0.001) right.set(1, 0, 0);
      right.normalize();
      const up = new THREE.Vector3().crossVectors(direction, right).normalize();
      const extent = (axis: THREE.Vector3) =>
        (Math.abs(axis.x) * size.x +
          Math.abs(axis.y) * size.y +
          Math.abs(axis.z) * size.z) /
        2;
      const halfHeight =
        Math.max(extent(up), extent(right) / this.aspect, 0.015) * 1.15;
      distance = halfHeight / Math.tan(ATLAS_HALF_FOV);
    }
    this.moveCamera(
      center,
      center.clone().addScaledVector(direction, distance),
      Math.max(distance / 1000, 0.0001),
      Math.max(distance * 20, 10),
      !this.framed,
    );
    this.framed = true;
  }

  dispose() {
    this.disposed = true;
    this.transition.cancel();
    this.generation++;
    this.observer.disconnect();
    this.coarsePointer.removeEventListener("change", this.resize);
    this.reducedMotion.removeEventListener("change", this.motionChanged);
    this.labels.dispose();
    this.callouts.dispose();
    this.controls.removeEventListener("start", this.transition.cancel);
    this.controls.dispose();
    this.decoder.dispose();
    this.study.dispose();
    const canvas = this.renderer.domElement;
    canvas.removeEventListener("pointerdown", this.transition.cancel, true);
    canvas.removeEventListener("wheel", this.transition.cancel, true);
    canvas.removeEventListener("keydown", this.transition.cancel, true);
    canvas.removeEventListener("pointerdown", this.pointerDown);
    canvas.removeEventListener("pointermove", this.pointerMove);
    canvas.removeEventListener("pointerup", this.pointerUp);
    canvas.removeEventListener("pointercancel", this.pointerCancel);
    canvas.removeEventListener("dblclick", this.surfaceDoubleClick);
    if (this.root) release(this.root);
    this.studio.dispose();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
    canvas.remove();
  }
}
