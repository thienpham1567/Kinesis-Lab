// Joint ROM reference means and measurement error.
// Evidence: reports/Bốn nền tảng đánh giá vận động.md (ROM section).

export type RomSide = "L" | "R" | "C";
export type RomInstrument = "goniometer" | "smartphone" | "inclinometer";
export type RomEntry = { movement: string; side: RomSide; value: number };
export type RomMetrics = { instrument: RomInstrument; entries: RomEntry[] };

type Sex = "F" | "M";

export type RomMovement = {
  id: string;
  region: string;
  label: string;
  sides: RomSide[];
  // CDC: means per age band [2–8, 9–19, 20–44, 45–69]; spine: one mean for everyone.
  means: Record<Sex, number[]> | number;
  sem?: Partial<Record<RomInstrument, number>>;
  source: string;
};

const CDC = "https://archive.cdc.gov/www_cdc_gov/ncbddd/jointrom/index.html";
const JTSS =
  "https://www.jtss.org/articles/normative-values-for-cervical-and-lumbar-range-of-motion-in-healthy-young-adults/doi/jtss.galenos.2023.33042";
const KNEE_SEM = "https://www.thieme-connect.de/products/ejournals/html/10.1055/s-0036-1593877";
const LR: RomSide[] = ["L", "R"];
const MID: RomSide[] = ["C"];

const cdc = (id: string, region: string, label: string, F: number[], M: number[]): RomMovement => ({
  id, region, label, sides: LR, means: { F, M }, source: CDC,
});

export const ROM_MOVEMENTS: RomMovement[] = [
  cdc("shoulder_flexion", "Vai", "Gập vai", [178.6, 171.8, 172.0, 168.1], [177.8, 170.9, 168.8, 164.0]),
  cdc("elbow_flexion", "Khuỷu", "Gập khuỷu", [152.9, 149.7, 150.0, 148.3], [151.4, 148.3, 144.6, 143.5]),
  cdc("elbow_extension", "Khuỷu", "Duỗi khuỷu (quá duỗi; âm = thiếu duỗi)", [6.8, 6.4, 4.7, 3.6], [2.2, 5.3, 0.8, -0.7]),
  cdc("forearm_pronation", "Cẳng tay", "Sấp cẳng tay", [84.6, 81.2, 82.0, 80.8], [79.6, 79.8, 76.9, 77.7]),
  cdc("forearm_supination", "Cẳng tay", "Ngửa cẳng tay", [93.7, 90.0, 90.6, 87.2], [86.4, 87.8, 85.0, 82.4]),
  cdc("hip_flexion", "Hông", "Gập hông", [140.8, 134.9, 133.8, 130.8], [131.1, 135.2, 130.4, 127.2]),
  cdc("hip_extension", "Hông", "Duỗi hông", [26.2, 20.5, 18.1, 16.7], [28.3, 18.2, 17.4, 13.5]),
  {
    ...cdc("knee_flexion", "Gối", "Gập gối", [152.6, 142.3, 141.9, 137.8], [147.8, 142.2, 137.7, 132.9]),
    sem: { goniometer: 3.41, smartphone: 2.72 },
  },
  {
    ...cdc("knee_extension", "Gối", "Duỗi gối (quá duỗi; âm = thiếu duỗi)", [5.4, 2.4, 1.6, 1.2], [1.6, 1.8, 1.0, 0.5]),
    sem: { goniometer: 1.62, smartphone: 1.18 },
  },
  cdc("ankle_dorsiflexion", "Cổ chân", "Gập mu cổ chân", [24.8, 17.3, 13.8, 11.6], [22.8, 16.3, 12.7, 11.9]),
  cdc("ankle_plantarflexion", "Cổ chân", "Gập gan cổ chân", [67.1, 57.3, 62.1, 56.5], [55.8, 52.8, 54.6, 49.4]),
  { id: "cervical_flexion", region: "Cột sống cổ", label: "Gập cổ", sides: MID, means: 57.7, source: JTSS },
  { id: "cervical_extension", region: "Cột sống cổ", label: "Duỗi cổ", sides: MID, means: 59.1, source: JTSS },
  { id: "cervical_lateral_flexion", region: "Cột sống cổ", label: "Nghiêng cổ", sides: LR, means: 42, source: JTSS },
  { id: "cervical_rotation", region: "Cột sống cổ", label: "Xoay cổ", sides: LR, means: 71, source: JTSS },
  { id: "lumbar_flexion", region: "Cột sống thắt lưng", label: "Gập thắt lưng", sides: MID, means: 69.9, source: JTSS },
  { id: "lumbar_extension", region: "Cột sống thắt lưng", label: "Duỗi thắt lưng", sides: MID, means: 40, source: JTSS },
];

export const KNEE_SEM_SOURCE = KNEE_SEM;

export const INSTRUMENT_LABELS: Record<RomInstrument, string> = {
  goniometer: "Thước đo góc",
  smartphone: "Ứng dụng điện thoại",
  inclinometer: "Inclinometer",
};

export const SIDE_LABELS: Record<RomSide, string> = { L: "Trái", R: "Phải", C: "Giữa" };

export function movementById(id: string) {
  return ROM_MOVEMENTS.find((m) => m.id === id);
}

export function parseSex(sex: string | null): Sex | null {
  const s = sex?.trim().toLowerCase();
  if (s && ["nữ", "nu", "female", "f"].includes(s)) return "F";
  if (s && ["nam", "male", "m"].includes(s)) return "M";
  return null;
}

const BANDS = [
  { max: 8, label: "2–8 tuổi" },
  { max: 19, label: "9–19 tuổi" },
  { max: 44, label: "20–44 tuổi" },
  { max: 69, label: "45–69 tuổi" },
];

export type NormResult = { mean: number; population: string } | { reason: string };

export function normFor(movementId: string, age: number | null, sex: string | null): NormResult {
  const m = movementById(movementId);
  if (!m) return { reason: "Động tác chưa có chuẩn tham chiếu" };
  if (typeof m.means === "number") {
    return { mean: m.means, population: "Người trẻ khỏe (JTSS 2023)" };
  }
  const s = parseSex(sex);
  if (age == null || s == null) return { reason: "Cần tuổi và giới trong hồ sơ để so chuẩn" };
  if (age < 2) return { reason: "Dữ liệu CDC chỉ từ 2 tuổi" };
  const i = BANDS.findIndex((b) => age <= b.max);
  const band = i === -1 ? BANDS.length - 1 : i;
  const sexLabel = s === "F" ? "Nữ" : "Nam";
  const population =
    i === -1
      ? `${sexLabel} ${BANDS[band].label} (CDC; ngoài khoảng tuổi nghiên cứu)`
      : `${sexLabel} ${BANDS[band].label} (CDC)`;
  return { mean: m.means[s][band], population };
}

export function sideGap(left: number, right: number) {
  return Math.abs(left - right);
}

// MDC95 = 1.96 × √2 × SEM ≈ 2.77 × SEM. Null when no SEM is published for this movement/instrument.
export function mdc95(movementId: string, instrument: RomInstrument) {
  const sem = movementById(movementId)?.sem?.[instrument];
  return sem == null ? null : Math.round(2.77 * sem * 10) / 10;
}

export function changeVsPrevious(
  movementId: string,
  instrument: RomInstrument,
  previous: number,
  current: number,
) {
  const delta = Math.round((current - previous) * 10) / 10;
  const mdc = mdc95(movementId, instrument);
  return { delta, mdc, beyondError: mdc == null ? null : Math.abs(delta) >= mdc };
}
