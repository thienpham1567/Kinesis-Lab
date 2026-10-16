import * as THREE from "three";
import { STUDY_TEXTURE_ASSETS } from "./tissue-detail-config.mjs";

export type StudyStatus = "idle" | "loading" | "ready" | "fallback";
export type StudyUniforms = {
  studyEnabled: { value: number };
  studyAlbedo: { value: THREE.Texture };
  studyDetailMuscle: { value: THREE.Texture };
  studyDetailTendon: { value: THREE.Texture };
  studyDetailBone: { value: THREE.Texture };
  studyDetailCartilage: { value: THREE.Texture };
};
type TextureUniformName = Exclude<keyof StudyUniforms, "studyEnabled">;
type RequestTexture = (
  loaded: (texture: THREE.Texture) => void,
  failed: () => void,
  url: string,
) => void;

/** Owns an atomic lazy texture batch, including failed and late-arriving images. */
export class TissueStudyResources {
  status: StudyStatus = "idle";
  readonly uniforms: StudyUniforms;
  private wanted = false;
  private disposed = false;
  private generation = 0;
  private placeholder = new THREE.DataTexture(
    new Uint8Array([255, 255, 255, 255]),
    1,
    1,
  );
  private flatDetail = new THREE.DataTexture(
    new Uint8Array([128, 128, 128, 255]),
    1,
    1,
  );
  private active = new Set<THREE.Texture>();
  private pending = new Set<THREE.Texture>();
  private changed: (status: StudyStatus) => void;
  private request: RequestTexture;

  constructor(
    changed: (status: StudyStatus) => void,
    request: RequestTexture = (loaded, failed, url) => {
      new THREE.TextureLoader().load(url, loaded, undefined, failed);
    },
  ) {
    this.changed = changed;
    this.request = request;
    this.placeholder.needsUpdate = true;
    this.flatDetail.needsUpdate = true;
    this.uniforms = {
      studyEnabled: { value: 0 },
      studyAlbedo: { value: this.placeholder },
      studyDetailMuscle: { value: this.flatDetail },
      studyDetailTendon: { value: this.flatDetail },
      studyDetailBone: { value: this.flatDetail },
      studyDetailCartilage: { value: this.flatDetail },
    };
  }
  setEnabled(enabled: boolean) {
    if (this.disposed) return;
    this.wanted = enabled;
    this.uniforms.studyEnabled.value =
      enabled && this.status === "ready" ? 1 : 0;
    if (enabled && this.status === "idle") this.load();
  }
  retry() {
    if (!this.disposed && this.wanted && this.status === "fallback")
      this.load();
  }
  private load() {
    const generation = ++this.generation;
    const batch = new Map<TextureUniformName, THREE.Texture>();
    this.status = "loading";
    this.changed(this.status);
    for (const asset of STUDY_TEXTURE_ASSETS) {
      if (this.disposed || generation !== this.generation) break;
      const name = asset.uniform as TextureUniformName;
      this.request(
        (texture) => {
          if (this.disposed || generation !== this.generation) {
            texture.dispose();
            return;
          }
          // Packed normals use the generator’s increasing row coordinate; do not reflect its Y slope.
          texture.flipY = asset.color;
          texture.colorSpace = asset.color
            ? THREE.SRGBColorSpace
            : THREE.NoColorSpace;
          texture.wrapS = texture.wrapT = asset.color
            ? THREE.MirroredRepeatWrapping
            : THREE.RepeatWrapping;
          texture.minFilter = THREE.LinearMipmapLinearFilter;
          texture.magFilter = THREE.LinearFilter;
          texture.generateMipmaps = true;
          texture.anisotropy = 4;
          texture.needsUpdate = true;
          batch.set(name, texture);
          this.pending.add(texture);
          if (batch.size === STUDY_TEXTURE_ASSETS.length) {
            for (const [key, value] of batch) {
              this.uniforms[key].value = value;
              this.active.add(value);
            }
            this.pending.clear();
            this.status = "ready";
            this.uniforms.studyEnabled.value = this.wanted ? 1 : 0;
            this.changed(this.status);
          }
        },
        () => {
          if (this.disposed || generation !== this.generation) return;
          ++this.generation;
          for (const texture of this.pending) texture.dispose();
          this.pending.clear();
          batch.clear();
          this.status = "fallback";
          this.uniforms.studyEnabled.value = 0;
          this.changed(this.status);
        },
        asset.url,
      );
    }
  }
  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    ++this.generation;
    this.uniforms.studyEnabled.value = 0;
    for (const texture of new Set([...this.active, ...this.pending]))
      texture.dispose();
    this.active.clear();
    this.pending.clear();
    this.placeholder.dispose();
    this.flatDetail.dispose();
  }
}
