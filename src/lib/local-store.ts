import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import type { BiomarkerRecord, Client, KnowledgeDocument } from "@/lib/types";
import type { TrainingRecord } from "@/lib/training-log";

type StoreShape = {
  clients: Client[];
  biomarkers: BiomarkerRecord[];
  documents: KnowledgeDocument[];
  training_records?: TrainingRecord[];
  [key: string]: unknown;
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
      notes: "Hồ sơ minh họa của ứng dụng; không phải hồ sơ người thật. Thông tin bài tập và tải trong ví dụ chưa được chuyên gia xác nhận cho một cá nhân.",
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
          notes: "Dữ liệu thuốc minh họa; không suy ra yêu cầu ăn nhẹ hoặc tự thay đổi thuốc từ ví dụ này.",
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
      notes: "Hồ sơ minh họa của ứng dụng; không phải hồ sơ người thật. Lịch tập cần được trao đổi riêng với người phụ trách chuyên môn.",
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
        "Dữ liệu InBody minh họa: VFA 118 cm², PBF 26,8%, SMM 31,2 kg, ECW Ratio 0,384. Cờ chỉ số là dữ liệu ví dụ, chưa đối chiếu khoảng tham chiếu của thiết bị. Không dùng các con số này để xác nhận đủ điều kiện tập, suy ra bệnh lý hoặc quy đổi Zone 2 sang RPE.",
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
        "Kết quả xét nghiệm minh họa: triglyceride 2,1 mmol/L, vitamin D 21,4 ng/mL, CK 148 U/L. Chưa có khoảng tham chiếu và đánh giá lâm sàng cho ví dụ này; không kết luận mức độ thiếu vitamin, tổn thương cơ hoặc khả năng tập luyện từ các chỉ số đơn lẻ.",
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
        "Kết quả xét nghiệm minh họa: HbA1c 6,1%, glucose đói 5,9 mmol/L, ferritin 22 ng/mL. Cần đối chiếu nguồn xét nghiệm và bối cảnh lâm sàng; ví dụ này không xác định nguyên nhân hụt hơi, thiếu sắt hoặc chỉ định tập luyện/dinh dưỡng.",
      created_at: "2026-10-05T09:00:00.000Z",
    },
  ],
  documents: [],
  training_records: [],
};

export function readLocalStore(): StoreShape {
  if (!fs.existsSync(STORE_PATH)) {
    fs.mkdirSync(STORE_DIR, { recursive: true });
    fs.writeFileSync(STORE_PATH, JSON.stringify(SEED, null, 2), { encoding: "utf8", flag: "wx" });
    return structuredClone(SEED);
  }
  // Do not replace unreadable user data with demo records. Callers must surface the error.
  const parsed: unknown = JSON.parse(fs.readFileSync(STORE_PATH, "utf8"));
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Kho dữ liệu cục bộ không hợp lệ; giữ nguyên tệp để khôi phục.");
  }
  const store = parsed as StoreShape;
  for (const key of ["clients", "biomarkers", "documents"] as const) {
    if (!Array.isArray(store[key])) throw new Error(`Kho dữ liệu cục bộ thiếu mảng ${key}; không ghi đè dữ liệu.`);
  }
  if (store.training_records !== undefined && !Array.isArray(store.training_records)) {
    throw new Error("Nhật ký tập cục bộ không hợp lệ; không ghi đè dữ liệu.");
  }
  return { ...store, training_records: store.training_records ?? [] };
}

export function writeLocalStore(next: StoreShape) {
  fs.mkdirSync(STORE_DIR, { recursive: true });
  // Atomic replacement avoids leaving truncated JSON if the process is interrupted.
  const temporaryPath = `${STORE_PATH}.${process.pid}.${crypto.randomUUID()}.tmp`;
  try {
    fs.writeFileSync(temporaryPath, JSON.stringify(next, null, 2), { encoding: "utf8", flag: "wx" });
    fs.renameSync(temporaryPath, STORE_PATH);
  } finally {
    if (fs.existsSync(temporaryPath)) fs.unlinkSync(temporaryPath);
  }
}
