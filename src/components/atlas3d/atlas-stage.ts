import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { StudioRenderer } from "./studio-renderer";
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
import { isStructureVisible } from "@/lib/clinical/atlas-3d";
import type { AtlasCanvasProps, CameraCommand } from "./types";

type Mesh = THREE.Mesh<THREE.BufferGeometry, THREE.MeshPhysicalMaterial>;
function release(root: THREE.Object3D) {
  root.traverse((object) => {
    if (object instanceof THREE.Mesh) {
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
  private camera = new THREE.PerspectiveCamera(35, 1, 0.001, 100);
  private renderer: THREE.WebGLRenderer;
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
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = false;
    this.controls.minDistance = 0.02;
    this.controls.maxDistance = 12;
    this.controls.listenToKeyEvents(canvas);
    this.controls.addEventListener("change", this.render);
    canvas.addEventListener("pointerdown", this.pointerDown);
    canvas.addEventListener("pointermove", this.pointerMove);
    canvas.addEventListener("pointerup", this.pointerUp);
    canvas.addEventListener("pointercancel", this.pointerCancel);
    canvas.addEventListener("dblclick", this.surfaceDoubleClick);
    this.observer = new ResizeObserver(this.resize);
    this.observer.observe(host);
    this.coarsePointer.addEventListener("change", this.resize);
    this.resize();
  }

  private resize = () => {
    const { width, height } = this.host.getBoundingClientRect();
    if (!width || !height || this.disposed) return;
    const halfFov = THREE.MathUtils.degToRad(this.camera.fov) / 2;
    const previousAngle = Math.min(
      halfFov,
      Math.atan(Math.tan(halfFov) * this.camera.aspect),
    );
    this.camera.aspect = width / height;
    if (this.root) {
      const nextAngle = Math.min(
        halfFov,
        Math.atan(Math.tan(halfFov) * this.camera.aspect),
      );
      const offset = this.camera.position.clone().sub(this.controls.target);
      this.camera.position
        .copy(this.controls.target)
        .addScaledVector(offset, Math.sin(previousAngle) / Math.sin(nextAngle));
      this.controls.update();
    }
    this.camera.updateProjectionMatrix();
    this.updateQuality();
    this.studio.resize(width, height);
    this.render();
  };
  private render = () => {
    if (!this.disposed) {
      this.studio.render();
      this.renderer.domElement.dataset.view = [
        ...this.camera.position.toArray(),
        ...this.controls.target.toArray(),
      ]
        .map((value) => value.toFixed(6))
        .join(",");
    }
  };
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
    ray.setFromCamera(
      new THREE.Vector2(
        ((clientX - bounds.left) / bounds.width) * 2 - 1,
        (-(clientY - bounds.top) / bounds.height) * 2 + 1,
      ),
      this.camera,
    );
    const candidates = [...this.meshes.values()]
      .flat()
      .filter((mesh) => mesh.visible);
    return ray.intersectObjects(candidates, false)[0];
  }
  private surfaceDoubleClick = (event: MouseEvent) => {
    if (event.button !== 0) return;
    const hit = this.hitAt(event.clientX, event.clientY);
    if (!hit) return;
    this.props.onSelect(hit.object.userData.structureId);
    const box = new THREE.Box3().setFromObject(hit.object);
    this.applySurfacePose(surfaceFocusPose(hit.point, this.camera.position, box.getSize(new THREE.Vector3()).length()));
  };
  private applySurfacePose(pose: { target: THREE.Vector3; position: THREE.Vector3 }) {
    this.controls.target.copy(pose.target);
    this.camera.position.copy(pose.position);
    this.controls.minDistance = .005;
    this.camera.near = .00005;
    this.camera.far = 10;
    this.camera.updateProjectionMatrix();
    this.controls.update();
    this.render();
  };

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
      shouldUseOcclusion(quality, visibleMuscles, this.props.muscleOpacity),
    );
  }

  update(props: AtlasCanvasProps) {
    this.props = props;
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
        const opacity = structure?.layer === "muscle" ? props.muscleOpacity : 1;
        setTissueStudy(
          mesh.material,
          mesh.userData.tissueKind,
          studyActive && isHipStudyStructure(id),
        );
        setTissueOpacity(mesh.material, opacity);
        mesh.castShadow = opacity === 1;
        mesh.receiveShadow = opacity === 1;
        shadowsChanged ||=
          mesh.visible !== previouslyVisible ||
          mesh.castShadow !== previousShadow;
        if (structure)
          setTissueSelection(
            mesh.material,
            mesh.userData.tissueKind,
            id === props.selectedId,
          );
        setThicknessView(mesh.material, id === props.thicknessId);
      }
    }
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
    this.root = gltf.scene;
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
      sourceMaterials.add(mesh.material);
      const kind = surfaceKind(mesh.material.name, metadata.get(id)!.layer);
      mesh.material = createTissueMaterial(
        kind,
        !!mesh.geometry.getAttribute("_thickness") &&
          !!mesh.geometry.getAttribute("_thickness_valid"),
        isHipStudyStructure(id) ? this.study.uniforms : undefined,
      );
      mesh.userData.structureId = id;
      mesh.userData.tissueKind = kind;
      this.meshes.set(id, [...(this.meshes.get(id) ?? []), mesh]);
    });
    sourceMaterials.forEach((material) => material.dispose());
    this.scene.add(gltf.scene);
    gltf.scene.updateMatrixWorld(true);
    this.studio.setBounds(new THREE.Box3().setFromObject(gltf.scene));
    this.update(this.props);
    this.command(this.props.command);
  }

  command(command: CameraCommand) {
    if (!this.root) return;
    if (command.type === "detail") {
      const pose = findSurfaceFocus(this.meshes.get(this.props.selectedId ?? "") ?? [], this.camera.position);
      if (pose) this.applySurfacePose(pose);
      return;
    }
    this.controls.minDistance = .02;
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
      for (const mesh of this.meshes.get(this.props.selectedId) ?? [])
        box.expandByObject(mesh);
    } else {
      // Fit the visible geometry; use regional bounds only when every layer is off.
      for (const meshes of this.meshes.values()) {
        for (const mesh of meshes) if (mesh.visible) box.expandByObject(mesh);
      }
      if (box.isEmpty()) box.setFromObject(this.root);
    }
    if (box.isEmpty()) return;
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const radius = Math.max(size.length() / 2, 0.015);
    const vfov = THREE.MathUtils.degToRad(this.camera.fov) / 2;
    const angle = Math.min(
      vfov,
      Math.atan(Math.tan(vfov) * this.camera.aspect),
    );
    const distance = (radius / Math.sin(angle)) * 1.08;
    const direction = new THREE.Vector3(0, 0, 1);
    if (command.type === "back") direction.set(0, 0, -1);
    if (command.type === "left") direction.set(1, 0, 0);
    if (command.type === "right") direction.set(-1, 0, 0);
    if (command.type === "hip") direction.set(1, 0.15, -0.15).normalize();
    if (command.type === "focus")
      direction
        .copy(this.camera.position)
        .sub(this.controls.target)
        .normalize();
    if (direction.lengthSq() < 0.001) direction.set(0, 0, 1);
    this.controls.target.copy(center);
    this.camera.position.copy(center).addScaledVector(direction, distance);
    this.camera.near = Math.max(distance / 1000, 0.0001);
    this.camera.far = Math.max(distance * 20, 10);
    this.camera.updateProjectionMatrix();
    this.controls.update();
    this.render();
  }

  dispose() {
    this.disposed = true;
    this.generation++;
    this.observer.disconnect();
    this.coarsePointer.removeEventListener("change", this.resize);
    this.controls.dispose();
    this.decoder.dispose();
    this.study.dispose();
    const canvas = this.renderer.domElement;
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
