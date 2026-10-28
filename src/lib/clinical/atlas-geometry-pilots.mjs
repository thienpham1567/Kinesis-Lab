// Exact source objects inspected in the 2026-10-28 geometry comparison.
// This bounded display list does not classify other low-polygon structures.
export const ATLAS_GEOMETRY_PILOTS = [
  { id: "za-acb77fda82d0", english: "Anterior talofibular ligament", side: "left" },
  { id: "za-975efd6a59c5", english: "Anterior talofibular ligament", side: "right" },
  { id: "za-ee5019dbe021", english: "Calcaneofibular ligament", side: "left" },
  { id: "za-95cebea24bd4", english: "Calcaneofibular ligament", side: "right" },
  { id: "za-c17313116801", english: "Articular disc of acromioclavicular joint", side: "left" },
  { id: "za-41a7661225ac", english: "Articular disc of acromioclavicular joint", side: "right" },
  { id: "za-eb3a5b3df5ad", english: "Articular disc of sternoclavicular joint", side: "left" },
  { id: "za-f6dee78bae20", english: "Articular disc of sternoclavicular joint", side: "right" },
  { id: "za-76671b911ccb", english: "Articular disc of distal radio-ulnar joint", side: "left" },
  { id: "za-d7748ccf7a30", english: "Articular disc of distal radio-ulnar joint", side: "right" },
];

const pilotIds = new Set(ATLAS_GEOMETRY_PILOTS.map((pilot) => pilot.id));

export function isSchematicGeometryPilot(id) {
  return pilotIds.has(id);
}

export const SCHEMATIC_GEOMETRY_NOTE =
  "Bề mặt này là biểu diễn sơ đồ của mô hình nguồn; không dùng để đọc thể tích hoặc độ dày mô thật.";
