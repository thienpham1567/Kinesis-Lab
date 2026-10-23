import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { GTAOPass } from "three/addons/postprocessing/GTAOPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { OutlinePass } from "three/addons/postprocessing/OutlinePass.js";
import type { AtlasCamera } from "./atlas-camera";
import {
  presentationBackground,
  type AtlasPresentation,
  type ResolvedRenderQuality,
} from "./render-policy";

/** Studio lighting and optional postprocessing; model geometry stays in AtlasStage. */
export class StudioRenderer {
  private environment: THREE.WebGLRenderTarget;
  private key = new THREE.DirectionalLight(0xfff4e7, 2.7);
  private fill = new THREE.DirectionalLight(0xe1ebff, 1.05);
  private rim = new THREE.DirectionalLight(0xffffff, 1.8);
  private ambient = new THREE.HemisphereLight(0xffffff, 0xaaa39c, 0.55);
  private composer: EffectComposer | null = null;
  private ao: GTAOPass | null = null;
  private output: OutputPass | null = null;
  private outline: OutlinePass | null = null;
  private selected: THREE.Object3D[] = [];
  private teaching = false;
  private quality: ResolvedRenderQuality = "fast";
  private width = 1;
  private height = 1;
  private allowAO = true;
  private renderTimings: number[] = [];

  constructor(
    private renderer: THREE.WebGLRenderer,
    private scene: THREE.Scene,
    private camera: AtlasCamera,
  ) {
    renderer.setClearColor(0xeeefeb);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.shadowMap.autoUpdate = false;
    renderer.info.autoReset = false;
    const room = new RoomEnvironment();
    const pmrem = new THREE.PMREMGenerator(renderer);
    this.environment = pmrem.fromScene(room, 0.04);
    scene.environment = this.environment.texture;
    scene.environmentIntensity = 0.65;
    room.dispose();
    pmrem.dispose();
    this.key.shadow.mapSize.set(2048, 2048);
    this.key.shadow.radius = 2.5;
    this.key.shadow.bias = -0.0001;
    this.key.shadow.normalBias = 0.0005;
    scene.add(
      this.ambient,
      this.key,
      this.key.target,
      this.fill,
      this.fill.target,
      this.rim,
      this.rim.target,
    );
  }

  setPresentation(presentation?: AtlasPresentation) {
    // A scene background clears in the active render target color space.
    // A renderer clear color can be copied as sRGB into the linear composer buffer.
    this.scene.background = new THREE.Color(
      presentationBackground(presentation),
    );
  }

  setCamera(camera: AtlasCamera) {
    if (camera === this.camera) return;
    this.camera = camera;
    // OutlinePass embeds perspective/orthographic depth conversion at construction.
    // Rebuild both passes so their shaders and every camera reference agree.
    this.disposePostprocessing();
    this.configure(this.quality, this.allowAO);
  }

  setSelection(objects: THREE.Object3D[], teaching: boolean) {
    this.selected = objects;
    this.teaching = teaching;
    this.syncOutline();
    if (this.outline) {
      this.outline.selectedObjects = objects;
      this.outline.enabled = teaching && objects.length > 0;
    }
  }

  private syncOutline() {
    if (this.outline && !this.teaching) {
      this.composer?.removePass(this.outline);
      this.outline.dispose();
      this.outline = null;
    }
    if (!this.teaching || !this.composer || this.outline) return;
    this.outline = new OutlinePass(
      new THREE.Vector2(1, 1),
      this.scene,
      this.camera,
    );
    this.outline.visibleEdgeColor.set(0x365cca);
    this.outline.hiddenEdgeColor.set(0x000000);
    this.outline.edgeStrength = 1.8;
    this.outline.edgeThickness = 1;
    this.outline.edgeGlow = 0;
    this.outline.pulsePeriod = 0;
    this.outline.selectedObjects = this.selected;
    this.outline.enabled = this.selected.length > 0;
    this.composer.insertPass(this.outline, this.composer.passes.length - 1);
  }

  setBounds(box: THREE.Box3) {
    if (box.isEmpty()) return;
    const center = box.getCenter(new THREE.Vector3());
    const radius = Math.max(
      box.getSize(new THREE.Vector3()).length() / 2,
      0.05,
    );
    for (const [light, direction] of [
      [this.key, new THREE.Vector3(-2, 3, 4)],
      [this.fill, new THREE.Vector3(3, 1, 1)],
      [this.rim, new THREE.Vector3(1, 2, -3)],
    ] as const) {
      light.target.position.copy(center);
      light.position.copy(center).addScaledVector(direction, radius);
    }
    const shadowCamera = this.key.shadow.camera;
    shadowCamera.left = shadowCamera.bottom = -radius * 1.15;
    shadowCamera.right = shadowCamera.top = radius * 1.15;
    shadowCamera.near = 0.001;
    shadowCamera.far = radius * 10;
    shadowCamera.updateProjectionMatrix();
    this.invalidateShadows();
  }

  configure(quality: ResolvedRenderQuality, allowAO: boolean) {
    const changed = quality !== this.quality;
    this.quality = quality;
    this.allowAO = allowAO;
    this.renderer.shadowMap.enabled = quality === "detailed";
    this.key.castShadow = quality === "detailed";
    if (quality === "detailed" && !this.composer) {
      const target = new THREE.WebGLRenderTarget(1, 1, {
        type: THREE.HalfFloatType,
        samples: Math.min(4, this.renderer.capabilities.maxSamples),
      });
      this.composer = new EffectComposer(this.renderer, target);
      this.composer.addPass(new RenderPass(this.scene, this.camera));
      this.ao = new GTAOPass(this.scene, this.camera, 1, 1);
      this.ao.blendIntensity = 0.65;
      this.ao.updateGtaoMaterial({
        radius: 0.025,
        thickness: 0.008,
        distanceExponent: 1.5,
        samples: 8,
        screenSpaceRadius: false,
      });
      this.ao.updatePdMaterial({ radius: 4, samples: 8, depthPhi: 0.02 });
      this.composer.addPass(this.ao);
      this.output = new OutputPass();
      this.composer.addPass(this.output);
      this.syncOutline();
      this.resize(this.width, this.height);
    }
    if (quality === "fast" && this.composer) {
      this.disposePostprocessing();
      this.key.shadow.dispose();
      this.key.shadow.map = null;
      this.key.shadow.mapPass = null;
    }
    if (this.ao) this.ao.enabled = allowAO;
    if (changed) {
      this.resize(this.width, this.height);
      this.invalidateShadows();
    }
  }

  resize(width: number, height: number) {
    this.width = width;
    this.height = height;
    const ratio = Math.min(
      window.devicePixelRatio,
      this.quality === "detailed" ? 1.75 : 1.25,
    );
    this.renderer.setPixelRatio(ratio);
    this.renderer.setSize(width, height, false);
    if (this.composer) {
      this.composer.setPixelRatio(ratio);
      this.composer.setSize(width, height);
      // Bound AO cost independently of the display's pixel density.
      const aoRatio = Math.min(1, 900 / Math.max(width, height));
      this.ao?.setSize(
        Math.max(1, Math.round(width * aoRatio)),
        Math.max(1, Math.round(height * aoRatio)),
      );
    }
  }

  invalidateShadows() {
    this.renderer.shadowMap.needsUpdate = true;
  }

  render() {
    const started = performance.now();
    this.renderer.info.reset();
    if (this.quality === "detailed" && this.composer) this.composer.render();
    else this.renderer.render(this.scene, this.camera);
    this.renderTimings.push(performance.now() - started);
    this.renderTimings = this.renderTimings.slice(-32);
    const stats = this.renderer.domElement.dataset;
    // CPU submission timing and resource counts; not GPU time or a frame-rate claim.
    const sorted = [...this.renderTimings].sort((a, b) => a - b);
    stats.renderMs = sorted[Math.floor(sorted.length / 2)].toFixed(2);
    stats.renderSamples = String(sorted.length);
    stats.renderCalls = String(this.renderer.info.render.calls);
    stats.renderTriangles = String(this.renderer.info.render.triangles);
    stats.renderTextures = String(this.renderer.info.memory.textures);
    this.renderer.domElement.dataset.renderQuality = this.quality;
    this.renderer.domElement.dataset.occlusion = String(
      this.quality === "detailed" && this.allowAO,
    );
  }

  private disposePostprocessing() {
    this.composer?.dispose();
    // r186 GTAOPass.dispose does not release these two shader materials.
    this.ao?.dispose();
    this.ao?.gtaoMaterial.dispose();
    this.ao?.blendMaterial.dispose();
    this.output?.dispose();
    this.outline?.dispose();
    this.composer = null;
    this.ao = null;
    this.output = null;
    this.outline = null;
  }

  dispose() {
    this.disposePostprocessing();
    this.key.shadow.dispose();
    this.environment.dispose();
    this.scene.environment = null;
    this.scene.remove(
      this.ambient,
      this.key,
      this.key.target,
      this.fill,
      this.fill.target,
      this.rim,
      this.rim.target,
    );
  }
}
