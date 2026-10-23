import * as THREE from "three";

export type AtlasCamera = THREE.PerspectiveCamera | THREE.OrthographicCamera;
export const ATLAS_FOV = 35;
export const ATLAS_HALF_FOV = THREE.MathUtils.degToRad(ATLAS_FOV) / 2;

export function setOrthographicSpan(
  camera: THREE.OrthographicCamera,
  halfHeight: number,
  aspect: number,
) {
  camera.top = halfHeight;
  camera.bottom = -halfHeight;
  camera.left = -halfHeight * aspect;
  camera.right = halfHeight * aspect;
  camera.zoom = 1;
  camera.updateProjectionMatrix();
}

/** A finite, interruptible transition. No scheduled work remains once idle. */
export class CameraTransition {
  private frame: number | null = null;
  private generation = 0;
  cancel = () => {
    this.generation++;
    if (this.frame !== null) cancelAnimationFrame(this.frame);
    this.frame = null;
  };

  run(update: (progress: number) => void, immediate: boolean) {
    this.cancel();
    if (immediate) {
      update(1);
      return;
    }
    const started = performance.now();
    const generation = this.generation;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - started) / 280);
      // Clear before updating: input or disposal can cancel from a change callback.
      this.frame = null;
      update(1 - Math.pow(1 - progress, 3));
      if (progress < 1 && generation === this.generation)
        this.frame = requestAnimationFrame(tick);
    };
    this.frame = requestAnimationFrame(tick);
  }
}
