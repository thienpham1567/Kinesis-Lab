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

// Text matches are reminders, not diagnosis, clearance or medication reconciliation.
const DRUG_NOTES: [RegExp, string][] = [
  [/beta.?block|bisoprolol|atenolol|metoprolol|propranolol|chẹn beta/i, "Beta-blocker: nhịp tim đáp ứng gắng sức có thể giảm. Dùng mức gắng sức cảm nhận/talk test hoặc mục tiêu nhịp tim do bác sĩ cá thể hóa; không tự đổi thuốc. [AHA: https://www.heart.org/en/health-topics/consumer-healthcare/medication-information/how-do-beta-blocker-drugs-affect-exercise]"],
  [/insulin|sulfonyl|glimepiride|gliclazide|glipizide|glyburide|glibenclamide|repaglinide|nateglinide/i, "Insulin/thuốc kích thích tiết insulin: có nguy cơ hạ đường huyết khi hoặc sau tập; cần kế hoạch theo dõi glucose và xử trí do nhóm điều trị hướng dẫn. Không tự chỉnh liều. [ADA: https://doi.org/10.2337/dc16-1728]"],
  [/metformin|empagliflozin|dapagliflozin|canagliflozin|sglt/i, "Metformin/SGLT2 dùng đơn độc không có cùng nguy cơ hạ glucose do tập như insulin; kiểm tra thuốc phối hợp và kế hoạch bệnh đái tháo đường của bác sĩ. Không tự đổi thuốc. [ADA: https://doi.org/10.2337/dc16-1728]"],
  [/warfarin|rivaroxaban|apixaban|dabigatran|edoxaban/i, "Thuốc chống đông: tăng nguy cơ chảy máu; thảo luận hoạt động có va chạm/nguy cơ chấn thương và chỉ định cá nhân với nhóm điều trị. [NHS: https://www.nhs.uk/medicines/anticoagulants/]"],
  [/aspirin|clopidogrel/i, "Thuốc kháng tiểu cầu: có thể tăng chảy máu; cần xác nhận chỉ định và kế hoạch hoạt động với nhóm điều trị. Đây là nhóm thuốc khác thuốc chống đông. [NHS: https://www.nhs.uk/medicines/clopidogrel/]"],
  [/statin|atorvastatin|rosuvastatin/i, "Statin: báo bác sĩ khi đau/yếu cơ bất thường không giải thích được; triệu chứng nặng cần đánh giá sớm. Không tự kết luận là DOMS hoặc tự ngừng thuốc. [NHS: https://www.nhs.uk/medicines/statins/]"],
  [/nitroglycerin|isosorbide/i, "Nitrate: xác nhận kế hoạch đau thắt ngực do bác sĩ cung cấp. Đau ngực mới, kéo dài, lan tay/hàm hoặc kèm khó thở, vã mồ hôi, choáng: dừng và gọi cấp cứu địa phương ngay. [NHS: https://www.nhs.uk/symptoms/chest-pain/]"],
];

const CONDITION_NOTES: [RegExp, string][] = [
  [/thoát vị|disc|herniation|\bL[45]\b|\bS1\b/i, "Cột sống: tên bệnh trong hồ sơ không xác định bài tập bị cấm. Cá thể hóa theo triệu chứng, chức năng và kế hoạch chuyên môn; đau mới kèm rối loạn tiểu tiện/đại tiện hoặc tê vùng yên ngựa cần đánh giá cấp cứu. [NICE NG59: https://www.nice.org.uk/guidance/ng59/chapter/Recommendations]"],
  [/huyết áp|hypertension/i, "Tăng huyết áp: xác nhận mức kiểm soát, thuốc và giới hạn gắng sức được bác sĩ hướng dẫn; đau ngực/khó thở bất thường cần dừng và đánh giá. Không cấp phép tập từ tên bệnh. [CSEP: https://csep.ca/2021/01/20/pre-screening-for-physical-activity/]"],
  [/tiểu đường|đái tháo|diabetes/i, "Đái tháo đường: kế hoạch vận động phụ thuộc loại bệnh, thuốc và biến chứng; đặc biệt xác nhận theo dõi glucose nếu dùng insulin/thuốc kích thích tiết insulin. [ADA: https://doi.org/10.2337/dc16-1728]"],
  [/gối|acl|meniscus|patell/i, "Gối: ghi đau, sưng, chức năng, giai đoạn chấn thương/phẫu thuật và giới hạn của nhóm điều trị; không tự chọn phác đồ từ từ khóa. [CSEP: https://csep.ca/2021/01/20/pre-screening-for-physical-activity/]"],
  [/vai|rotator|impingement|cuff/i, "Vai: điều chỉnh hoạt động theo đáp ứng và đánh giá chuyên môn; tên bệnh không xác định một kiểu grip hay bài thay thế bắt buộc. [CSEP: https://csep.ca/2021/01/20/pre-screening-for-physical-activity/]"],
  [/ung thư|cancer|sốt|night sweat|sụt cân/i, "Triệu chứng hệ thống mới hoặc không giải thích được cần đánh giá y tế trước khi quyết định tải tập. Tiền sử ung thư không tự động cấm mọi vận động; tuân thủ kế hoạch điều trị. [NICE NG59: https://www.nice.org.uk/guidance/ng59/chapter/Recommendations]"],
];

export function safetyNotes(client: Client) {
  const lines: string[] = [];
  const parq = client.red_flags?.parq ?? {};
  const yes = PARQ_ITEMS.filter((q) => parq[q.id] === true).map((q) => q.label);
  if (yes.length) lines.push(`Bảng kiểm trước tập (tự xây dựng, chưa thẩm định) trả lời CÓ: ${yes.join(" | ")}`);

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
