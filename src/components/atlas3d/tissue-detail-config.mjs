/** Cosmetic material fields: nominal scale/height are art parameters, not tissue measurements. */
export const TISSUE_DETAIL_MAPS = {
  muscle: {
    url: "/anatomy/3d/textures/muscle-detail-v1.png",
    scale: 0.01,
    height: 0.000006,
    roughness: 0.39,
    variation: 0.07,
    uniform: "studyDetailMuscle",
  },
  tendon: {
    url: "/anatomy/3d/textures/tendon-detail-v1.png",
    scale: 0.006,
    height: 0.000004,
    roughness: 0.44,
    variation: 0.06,
    uniform: "studyDetailTendon",
  },
  bone: {
    url: "/anatomy/3d/textures/bone-detail-v1.png",
    scale: 0.012,
    height: 0.000008,
    roughness: 0.62,
    variation: 0.09,
    uniform: "studyDetailBone",
  },
  cartilage: {
    url: "/anatomy/3d/textures/cartilage-detail-v1.png",
    scale: 0.01,
    height: 0.000002,
    roughness: 0.24,
    variation: 0.025,
    uniform: "studyDetailCartilage",
  },
};
export const STUDY_TEXTURE_ASSETS = [
  {
    uniform: "studyAlbedo",
    url: "/anatomy/3d/textures/muscle-simulated-v1.webp",
    color: true,
  },
  ...Object.values(TISSUE_DETAIL_MAPS).map((map) => ({
    uniform: map.uniform,
    url: map.url,
    color: false,
  })),
];
