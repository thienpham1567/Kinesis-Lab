import * as THREE from "three";
import type { AtlasLayer, TissueKind } from "@/lib/clinical/atlas-3d";

export const TISSUE_COLORS = {
  bone: 0xe3d9c3,
  muscle: 0x963f45,
  joint: 0x93b2a6,
  cartilage: 0xd4dfdf,
  tendon: 0xeee7d7,
  ligament: 0xc8c4a1,
  fat: 0xe0be79,
} satisfies Record<TissueKind, number>;

export function surfaceKind(name: string, fallback: AtlasLayer): TissueKind {
  const kind = name.replace(/^Kinesis_/, "");
  return Object.hasOwn(TISSUE_COLORS, kind) ? kind as TissueKind : fallback;
}

export function setThicknessView(material: THREE.MeshPhysicalMaterial, enabled: boolean) {
  material.userData.thicknessUniform.value = enabled ? 1 : 0;
}

/** Cosmetic micro-roughness only. Does not add anatomical fibers or alter geometry. */
export function createTissueMaterial(layer: TissueKind, hasThickness = false) {
  const material = new THREE.MeshPhysicalMaterial({
    color: TISSUE_COLORS[layer],
    metalness: 0,
    roughness: layer === "bone" ? 0.66 : layer === "muscle" ? 0.48 : 0.4,
    specularIntensity: layer === "bone" ? 0.28 : 0.4,
    sheen: layer === "muscle" ? 0.16 : 0,
    sheenColor: new THREE.Color(0xc37d80),
    sheenRoughness: 0.8,
    envMapIntensity: 0.55,
  });
  material.userData.thicknessUniform = { value: 0 };
  material.onBeforeCompile = (shader) => {
    shader.uniforms.thicknessView = material.userData.thicknessUniform;
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        `#include <common>\nvarying vec3 vTissuePosition;
        ${hasThickness ? "attribute float _thickness; attribute float _thickness_valid; varying float vThickness; varying float vThicknessValid;" : ""}`,
      )
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>\nvTissuePosition = position;
        ${hasThickness ? "vThickness = _thickness; vThicknessValid = _thickness_valid;" : ""}`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
        varying vec3 vTissuePosition;
        ${hasThickness ? "uniform float thicknessView; varying float vThickness; varying float vThicknessValid;" : ""}
        float tissueHash(vec3 p) { return fract(sin(dot(p, vec3(127.1,311.7,74.7))) * 43758.5453); }
        float tissueGrain(vec3 p) {
          vec3 i = floor(p), f = fract(p);
          f = f*f*(3.0-2.0*f);
          return mix(mix(mix(tissueHash(i), tissueHash(i+vec3(1,0,0)), f.x),
                         mix(tissueHash(i+vec3(0,1,0)), tissueHash(i+vec3(1,1,0)), f.x), f.y),
                     mix(mix(tissueHash(i+vec3(0,0,1)), tissueHash(i+vec3(1,0,1)), f.x),
                         mix(tissueHash(i+vec3(0,1,1)), tissueHash(i+vec3(1,1,1)), f.x), f.y), f.z);
        }
      `,
      )
      .replace(
        "#include <roughnessmap_fragment>",
        `#include <roughnessmap_fragment>
        vec3 grainPosition = vTissuePosition * 1800.0;
        float grainWeight = 1.0-smoothstep(0.2, 1.2, length(fwidth(grainPosition)));
        float grain = (tissueGrain(grainPosition)-0.5) * grainWeight;
        roughnessFactor = clamp(roughnessFactor + grain * 0.09, 0.2, 1.0);
        diffuseColor.rgb *= 1.0 + grain * 0.035;
      `,
      );
    if (hasThickness) shader.fragmentShader = shader.fragmentShader.replace(
      "#include <opaque_fragment>",
      `if (thicknessView > 0.5) {
        float t = clamp(vThickness / 0.1, 0.0, 1.0);
        vec3 heat = t < 0.33 ? mix(vec3(0.035,0.15,0.65), vec3(0.02,0.75,0.85), t/0.33)
          : t < 0.66 ? mix(vec3(0.02,0.75,0.85), vec3(1.0,0.55,0.035), (t-0.33)/0.33)
          : mix(vec3(1.0,0.55,0.035), vec3(0.7,0.025,0.02), (t-0.66)/0.34);
        outgoingLight = vThicknessValid < 0.999 ? vec3(0.38) : heat;
      }
      #include <opaque_fragment>`,
    );
  };
  material.customProgramCacheKey = () => `kinesis-tissue-grain-v2-${hasThickness}`;
  return material;
}

export function setTissueSelection(
  material: THREE.MeshPhysicalMaterial,
  layer: TissueKind,
  selected: boolean,
) {
  material.color.set(TISSUE_COLORS[layer]);
  if (selected) material.color.lerp(new THREE.Color(0x466cb5), 0.12);
  material.emissive.set(selected ? 0x14264f : 0);
  material.emissiveIntensity = selected ? 0.15 : 0;
}

export function setTissueOpacity(
  material: THREE.MeshPhysicalMaterial,
  opacity: number,
) {
  const transparent = opacity < 1;
  if (material.transparent !== transparent) {
    material.transparent = transparent;
    // Three caches OPAQUE in the shader program, independently of opacity.
    material.needsUpdate = true;
  }
  material.opacity = opacity;
  material.depthWrite = !transparent;
}
