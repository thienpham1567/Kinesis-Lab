import * as THREE from "three";

export type StudyStatus = "idle" | "loading" | "ready" | "fallback";
export type StudyUniforms = {
  studyEnabled: { value: number };
  studyAlbedo: { value: THREE.Texture };
};
type RequestTexture = (
  loaded: (texture: THREE.Texture) => void,
  failed: () => void,
) => void;

/** Owns one lazy texture per stage, including images arriving after disposal. */
export class TissueStudyResources {
  status: StudyStatus = "idle";
  readonly uniforms: StudyUniforms;
  private wanted = false;
  private disposed = false;
  private placeholder = new THREE.DataTexture(
    new Uint8Array([255, 255, 255, 255]),
    1,
    1,
  );
  private texture: THREE.Texture | null = null;
  private changed: (status: StudyStatus) => void;
  private request: RequestTexture;

  constructor(
    changed: (status: StudyStatus) => void,
    request: RequestTexture = (loaded, failed) => {
      new THREE.TextureLoader().load(
        "/anatomy/3d/textures/muscle-simulated-v1.webp",
        loaded,
        undefined,
        failed,
      );
    },
  ) {
    this.changed = changed;
    this.request = request;
    this.placeholder.needsUpdate = true;
    this.uniforms = {
      studyEnabled: { value: 0 },
      studyAlbedo: { value: this.placeholder },
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
    this.status = "loading";
    this.changed(this.status);
    this.request(
      (texture) => {
        if (this.disposed) {
          texture.dispose();
          return;
        }
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.wrapS = texture.wrapT = THREE.MirroredRepeatWrapping;
        texture.anisotropy = 4;
        texture.needsUpdate = true;
        this.texture = texture;
        this.uniforms.studyAlbedo.value = texture;
        this.uniforms.studyEnabled.value = this.wanted ? 1 : 0;
        this.status = "ready";
        this.changed(this.status);
      },
      () => {
        if (this.disposed) return;
        this.status = "fallback";
        this.uniforms.studyEnabled.value = 0;
        this.changed(this.status);
      },
    );
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.uniforms.studyEnabled.value = 0;
    this.texture?.dispose();
    this.placeholder.dispose();
  }
}
