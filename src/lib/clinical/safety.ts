import type { Client } from "../types.ts";

export const PARQ_ITEMS: { id: string; label: string }[] = [
  {
    id: "chest",
    label: "Đau ngực khi gắng sức hoặc khi nghỉ?",
  },
  {
    id: "dizzy",
    label: "Chóng mặt / mất thăng bằng / ngất khi vận động?",
  },
  {
    id: "heart",
    label: "Bác sĩ từng nói có bệnh tim, tăng huyết áp không kiểm soát, hoặc rối loạn nhịp?",
  },
  {
    id: "joint",
    label: "Đau khớp / xương / cơ đang hạn chế vận động hằng ngày?",
  },
  {
    id: "meds",
    label: "Đang dùng thuốc cho huyết áp, tim, tiểu đường, hoặc đông máu?",
  },
  {
    id: "other",
    label: "Có lý do khác khiến vận động có thể không an toàn?",
  },
  {
    id: "red_night",
    label: "Đau ban đêm không liên quan tư thế, sụt cân, sốt, hoặc tê bì tiến triển?",
  },
];

const DRUG_NOTES: [RegExp, string][] = [
  [/beta.?block|bisoprolol|atenolol|metoprolol|propranolol|chẹn beta/i, "Beta-blocker: nhịp tim tối đa bị chẹn — dùng RPE, không dùng %HRmax."],
  [/insulin|metformin|sulfonyl|glimepiride|empagliflozin|sglt/i, "Thuốc hạ đường: nguy cơ hạ đường khi tập — mang carb nhanh, tránh tập lúc đói kéo dài."],
  [/warfarin|rivaroxaban|apixaban|aspirin|clopidogrel/i, "Chống đông: tránh va chạm / bài tập có nguy cơ chấn thương cao."],
  [/statin|atorvastatin|rosuvastatin/i, "Statin: theo dõi đau cơ bất thường, không nhầm với DOMS thông thường."],
  [/nitroglycerin|isosorbide/i, "Nitrate: đau ngực khi tập là Red Flag — dừng, chuyển cấp cứu nếu không đỡ."],
];

const CONDITION_NOTES: [RegExp, string][] = [
  [/thoát vị|disc|herniation|L4|L5|S1/i, "Cột sống: tránh flexion có tải + xoay (sit-up, toe touch có tạ). Ưu tiên hip hinge trung tính, McGill Big 3 nếu phù hợp."],
  [/huyết áp|hypertension/i, "Tăng huyết áp: tránh Valsalva, isometric tối đa kéo dài; theo dõi triệu chứng đau đầu/đau ngực."],
  [/tiểu đường|đái tháo|diabetes/i, "Đái tháo đường: kiểm tra glucose trước tập nếu dùng insulin; mang giấy tờ/carb nhanh."],
  [/gối|acl|meniscus|patell/i, "Gối: tôn trọng pain trigger; kiểm soát valgus; regression depth / open-chain nếu đau."],
  [/vai|rotator|impingement|cuff/i, "Vai: hạn chế elevation quá đau, tránh behind-neck press; ưu tiên landmine / neutral grip."],
  [/ung thư|cancer|sốt|night sweat|sụt cân/i, "Red Flag hệ thống: không tiến hành tập nặng — chuyển bác sĩ."],
];

export function safetyNotes(client: Client) {
  const lines: string[] = [];
  const parq = client.red_flags?.parq ?? {};
  const yes = PARQ_ITEMS.filter((q) => parq[q.id] === true).map((q) => q.label);
  if (yes.length) lines.push(`PAR-Q+/Red Flags trả lời CÓ: ${yes.join(" | ")}`);

  for (const c of client.medical_conditions ?? []) {
    const hit = CONDITION_NOTES.find(([re]) => re.test(c.name + " " + (c.notes ?? "")));
    if (hit) lines.push(`${c.name}: ${hit[1]}`);
    else lines.push(`Bệnh nền: ${c.name}${c.notes ? ` — ${c.notes}` : ""}`);
  }
  for (const m of client.medications ?? []) {
    const hit = DRUG_NOTES.find(([re]) => re.test(m.name + " " + (m.notes ?? "")));
    if (hit) lines.push(`${m.name}: ${hit[1]}`);
    else lines.push(`Thuốc: ${m.name}${m.dose ? ` (${m.dose})` : ""}`);
  }
  for (const o of client.orthopedic_issues ?? []) {
    lines.push(
      `Cơ xương khớp ${o.region}: trigger=${o.painTriggers ?? "?"} ROM an toàn=${o.safeRom ?? "?"}`,
    );
  }
  if (!lines.length) lines.push("Chưa có cảnh báo tự động. Vẫn sàng lọc triệu chứng cấp trước khi lên bài.");
  return lines.join("\n");
}

export function formatClient(client: Client) {
  return [
    `Tên: ${client.name}`,
    `Tuổi/giới: ${client.age ?? "?"} / ${client.sex ?? "?"}`,
    `Trình độ: ${client.training_level ?? "?"}`,
    `Mục tiêu: ${client.goals ?? "?"}`,
    `Bệnh nền: ${jsonList(client.medical_conditions)}`,
    `Thuốc: ${jsonList(client.medications)}`,
    `Cơ xương khớp: ${jsonList(client.orthopedic_issues)}`,
    `Ghi chú: ${client.notes ?? "—"}`,
  ].join("\n");
}

function jsonList(items: unknown[]) {
  if (!items?.length) return "không";
  return JSON.stringify(items);
}
