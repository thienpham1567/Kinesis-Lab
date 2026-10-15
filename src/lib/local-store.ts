import fs from "node:fs";
import path from "node:path";
import type { BiomarkerRecord, Client, KnowledgeDocument } from "@/lib/types";

type StoreShape = {
  clients: Client[];
  biomarkers: BiomarkerRecord[];
  documents: KnowledgeDocument[];
};

const STORE_DIR = path.join(process.cwd(), ".data");
const STORE_PATH = path.join(STORE_DIR, "clinical-store.json");

const SEED: StoreShape = {
  clients: [
    {
      id: "c-minh-quan",
      name: "Nguyễn Minh Quân",
      age: 42,
      sex: "Nam",
      goals: "Giảm mỡ nội tạng, hết đau lưng dưới khi ngồi lâu, tập mạnh thân dưới an toàn",
      training_level: "Trung cấp (tập lại sau 2 năm nghỉ)",
      medical_conditions: [
        {
          name: "Thoát vị đĩa đệm L4-L5 (lồi đĩa trung tâm lệch trái)",
          since: "2024",
          notes: "Đã qua giai đoạn viêm cấp, không tê lan xuống bàn chân",
        },
        {
          name: "Tăng huyết áp độ 1",
          since: "2025",
          notes: "Huyết áp nghỉ 132/84 mmHg khi uống thuốc đều",
        },
      ],
      medications: [
        {
          name: "Bisoprolol (Concor)",
          dose: "5mg sáng",
          notes: "Chẹn beta chọn lọc — làm giảm nhịp tim tối đa khi gắng sức",
        },
        {
          name: "Rosuvastatin",
          dose: "10mg tối",
          notes: "Theo dõi đau mỏi cơ toàn thân khác với DOMS",
        },
      ],
      orthopedic_issues: [
        {
          region: "Cột sống thắt lưng L4-L5",
          painTriggers: "Gập lưng dưới có tải (loaded spinal flexion), ngồi cuối biên độ lâu, xoay lưng nhanh",
          safeRom: "Hip hinge giữ cột sống trung tính, Trap-bar deadlift nâng cao tay cầm (high handle), Split squat",
          notes: "Đáp ứng tốt với McGill Big 3 khởi động",
        },
      ],
      red_flags: {
        parq: {
          chest: false,
          dizzy: false,
          heart: true,
          joint: true,
          meds: true,
          other: false,
          red_night: false,
        },
        notes: "Đã có giấy đồng ý tập luyện cường độ vừa từ BS Nội tim mạch (09/2026). Không có dấu hiệu chèn ép chùm đuôi ngựa.",
      },
      notes: "Làm việc văn phòng 9 tiếng/ngày. Tránh nghiệm pháp Valsalva kéo dài; điều chỉnh tải theo RPE 6.5–7.5.",
      created_at: "2026-09-15T08:00:00.000Z",
      updated_at: "2026-10-12T10:30:00.000Z",
    },
    {
      id: "c-thu-ha",
      name: "Trần Thu Hà",
      age: 34,
      sex: "Nữ",
      goals: "Tăng khối cơ xương (SMM), cải thiện đau vai phải khi đẩy qua đầu, kiểm soát đường huyết",
      training_level: "Mới bắt đầu (6 tháng)",
      medical_conditions: [
        {
          name: "Tiền tiểu đường (Prediabetes)",
          since: "2026",
          notes: "HbA1c 6.1%, đường huyết đói 5.9 mmol/L",
        },
      ],
      medications: [
        {
          name: "Metformin XR",
          dose: "500mg sau ăn tối",
          notes: "Hiếm gây hạ đường huyết đơn độc nhưng cần ăn nhẹ trước buổi tập chiều",
        },
      ],
      orthopedic_issues: [
        {
          region: "Khớp vai phải (Subacromial Impingement)",
          painTriggers: "Overhead press thanh đòn, Upright row, đưa tay ngang 70°–110° xoay trong",
          safeRom: "Landmine press góc 45°, Neutral-grip DB press mặt phẳng xương bả vai (scapular plane 30°), Face pull",
          notes: "Yếu cơ serratus anterior và hạ trapezius",
        },
      ],
      red_flags: {
        parq: {
          chest: false,
          dizzy: false,
          heart: false,
          joint: true,
          meds: true,
          other: false,
          red_night: false,
        },
        notes: "Đau cơ học thuần túy khi nâng tay quá đầu, không đau ban đêm.",
      },
      notes: "Ưu tiên tập kháng lực 3 buổi/tuần kết hợp đi bộ nhanh 15 phút sau bữa ăn lớn để tăng nhạy cảm GLUT4.",
      created_at: "2026-09-28T09:00:00.000Z",
      updated_at: "2026-10-14T15:00:00.000Z",
    },
  ],
  biomarkers: [
    {
      id: "b-quan-inbody",
      client_id: "c-minh-quan",
      recorded_at: "2026-10-10",
      kind: "inbody",
      metrics: {
        "Cân nặng": { value: 78.4, unit: "kg", flag: "normal" },
        "SMM (Cơ xương)": { value: 31.2, unit: "kg", flag: "normal" },
        "PBF (Phần trăm mỡ)": { value: 26.8, unit: "%", flag: "high" },
        "Mỡ nội tạng (VFA)": { value: 118, unit: "cm²", flag: "high" },
        "ECW Ratio": { value: 0.384, unit: "", flag: "normal" },
        "BMR": { value: 1640, unit: "kcal", flag: "normal" },
      },
      ai_summary:
        "Mỡ nội tạng (118 cm²) và PBF (26.8%) vượt ngưỡng khuyến nghị, liên quan trực tiếp tới đề kháng insulin và tải trọng cơ học lên đĩa đệm L4-L5. Khối cơ xương (SMM 31.2 kg) đạt mức trung bình khá và tỷ lệ nước ngoại bào (ECW 0.384) bình thường, cho phép tập kháng lực toàn thân kết hợp Zone 2 cardio (tính theo RPE 5–6 do dùng Bisoprolol).",
      created_at: "2026-10-10T10:00:00.000Z",
    },
    {
      id: "b-quan-blood",
      client_id: "c-minh-quan",
      recorded_at: "2026-10-08",
      kind: "blood_lab",
      metrics: {
        "Glucose đói": { value: 5.6, unit: "mmol/L", flag: "normal" },
        HbA1c: { value: 5.7, unit: "%", flag: "normal" },
        "LDL-C": { value: 2.4, unit: "mmol/L", flag: "normal" },
        Triglyceride: { value: 2.1, unit: "mmol/L", flag: "high" },
        "AST / ALT": { value: "26 / 31", unit: "U/L", flag: "normal" },
        "Vitamin D (25-OH)": { value: 21.4, unit: "ng/mL", flag: "low" },
        "CK (Creatine Kinase)": { value: 148, unit: "U/L", flag: "normal" },
      },
      ai_summary:
        "Triglyceride tăng nhẹ (2.1 mmol/L) và thiếu hụt Vitamin D (21.4 ng/mL) — yếu tố ảnh hưởng tới phục hồi cơ xương và mật độ xương cột sống. Chỉ số CK (148 U/L) và men gan bình thường khi đang dùng Rosuvastatin, chưa có dấu hiệu tiêu cơ vân do statin.",
      created_at: "2026-10-08T09:00:00.000Z",
    },
    {
      id: "b-ha-blood",
      client_id: "c-thu-ha",
      recorded_at: "2026-10-05",
      kind: "blood_lab",
      metrics: {
        "Glucose đói": { value: 5.9, unit: "mmol/L", flag: "high" },
        HbA1c: { value: 6.1, unit: "%", flag: "high" },
        Ferritin: { value: 22, unit: "ng/mL", flag: "low" },
        "Vitamin D (25-OH)": { value: 28.5, unit: "ng/mL", flag: "normal" },
        TSH: { value: 1.9, unit: "mIU/L", flag: "normal" },
      },
      ai_summary:
        "HbA1c 6.1% và Glucose đói 5.9 mmol/L ở ngưỡng tiền tiểu đường; tập kháng lực nhóm cơ lớn (chân, lưng) giúp tăng vận chuyển glucose qua GLUT4 độc lập với insulin. Ferritin dự trữ thấp (22 ng/mL) có thể gây mau hụt hơi khi tập volume cao — cần theo dõi mức năng lượng và tư vấn dinh dưỡng giàu sắt heme.",
      created_at: "2026-10-05T09:00:00.000Z",
    },
  ],
  documents: [],
};

export function readLocalStore(): StoreShape {
  try {
    if (!fs.existsSync(STORE_PATH)) {
      fs.mkdirSync(STORE_DIR, { recursive: true });
      fs.writeFileSync(STORE_PATH, JSON.stringify(SEED, null, 2), "utf8");
      return structuredClone(SEED);
    }
    const raw = fs.readFileSync(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw) as Partial<StoreShape>;
    return {
      clients: parsed.clients ?? SEED.clients,
      biomarkers: parsed.biomarkers ?? SEED.biomarkers,
      documents: parsed.documents ?? [],
    };
  } catch {
    return structuredClone(SEED);
  }
}

export function writeLocalStore(next: StoreShape) {
  fs.mkdirSync(STORE_DIR, { recursive: true });
  fs.writeFileSync(STORE_PATH, JSON.stringify(next, null, 2), "utf8");
}
