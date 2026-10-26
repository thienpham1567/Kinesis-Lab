import { randomUUID, createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

export const MEDICAL_IMAGE_CASES = [
  {
    id: "elbow-flexors",
    instruction: "Tạo hình giảng dạy y khoa tiếng Việt về cơ nhị đầu cánh tay và cơ cánh tay, là hai cơ gấp khuỷu. Dùng chi trên phải ở tư thế giải phẫu với khuỷu duỗi và lòng bàn tay hướng trước, tách hai ô nhìn trước cùng tư thế để phân biệt lớp nông và lớp sâu. Ưu tiên sơ đồ sạch, không cần vẻ ảnh chụp. Ghi nhãn hai cơ, xương cánh tay, quay, trụ và hai điểm bám tận; dùng ô phóng đại nếu cần để phân biệt gân nhị đầu tới lồi củ quay với cơ cánh tay tới mỏm vẹt trụ. Giải thích ngắn trong ảnh về chức năng và sự khác nhau điểm bám. Không thêm thần kinh, số đo hay chẩn đoán.",
    checks: ["Brachialis nằm sâu dưới biceps, bộc lộ lớp sâu được nêu rõ", "Biceps tới xương quay; brachialis tới xương trụ", "Nhãn không trỏ nhầm xương/gân và hai ô cùng hướng nhìn", "Chữ/giải thích không đảo chức năng hoặc điểm bám"],
  },
  {
    id: "knee-cruciates",
    instruction: "Tạo hình giảng dạy y khoa tiếng Việt so sánh ACL và PCL ở gối phải. Dùng hai ô cùng hướng nhìn bên/cắt dọc đã ghi rõ để phân biệt trước–sau, xương đùi và xương chày; có xương bánh chè làm mốc phía trước. Ghi nhãn ACL, PCL, các xương liên quan; giải thích ngay trong ảnh hướng trượt xương chày mà mỗi dây chằng hạn chế so với xương đùi cố định. Nếu dùng mũi tên, ghi rõ đó là hướng bị hạn chế, không phải chuyển động bình thường. Không vẽ gối chấn thương, diện bám định lượng hoặc số đo.",
    checks: ["ACL/PCL nối đùi–chày, không tới xương mác hoặc bánh chè", "ACL hạn chế chày ra trước; PCL hạn chế chày ra sau, mốc đùi rõ", "Bánh chè ở phía trước, hai ô không đảo hướng", "Mũi tên không bị hiểu là hướng dây chằng kéo hoặc vận động bình thường"],
  },
];

const apply = process.argv.includes("--apply");
const expectedModel = "bytedance-seed/seedream-5-0-flash";
const origin = process.argv.find(x => x.startsWith("--url="))?.slice(6) ?? "http://localhost:3000";
const out = path.resolve(".data/medical-image-policy");
if (!apply) {
  console.log(JSON.stringify({ paidCalls: false, model: expectedModel, cases: MEDICAL_IMAGE_CASES, note: "--apply makes exactly two initial app-route requests; no automatic retries. Source comparison and visual review are required." }, null, 2));
} else {
  mkdirSync(out, { recursive: true });
  const headers = { origin, "content-type": "application/json" };
  const ready = await fetch(`${origin}/api/chat/illustrations`, { headers });
  const status = await ready.json();
  if (!ready.ok || status.promptVersion !== "medical-image-v2-2026-10-26" || status.model !== expectedModel || status.resolution !== "2K" || status.aspectRatio !== "auto")
    throw new Error("Deployment does not expose the expected Seedream model, image settings and medical prompt version.");
  headers.cookie = ready.headers.getSetCookie().map(x => x.split(";")[0]).join("; ");
  const results = [];
  for (const item of MEDICAL_IMAGE_CASES) {
    const request = { requestId: randomUUID(), conversationId: randomUUID(), sourceMessageId: randomUUID(), instruction: item.instruction, selectedContext: "", sourceIds: [] };
    writeFileSync(path.join(out, `${item.id}-request.private.json`), JSON.stringify({ origin, cookie: headers.cookie, request }, null, 2), { mode: 0o600 });
    const start = Date.now();
    try {
      const response = await fetch(`${origin}/api/chat/illustrations`, { method: "POST", headers, body: JSON.stringify(request), signal: AbortSignal.timeout(178000) });
      const body = await response.json();
      const result = { id: item.id, requestId: request.requestId, status: response.status, state: body.state, error: body.error, errorCode: body.errorCode, elapsedMs: Date.now() - start, receipt: body.receipt, brief: body.brief, checks: item.checks };
      writeFileSync(path.join(out, `${item.id}.json`), JSON.stringify(result, null, 2));
      if (response.ok && body.state === "succeeded" && body.assetUrl) {
        const asset = await fetch(body.assetUrl);
        if (!asset.ok) throw new Error(`Asset HTTP ${asset.status}`);
        const bytes = Buffer.from(await asset.arrayBuffer());
        if (createHash("sha256").update(bytes).digest("hex") !== body.receipt.sha256) throw new Error("Asset hash mismatch");
        writeFileSync(path.join(out, `${item.id}.png`), bytes);
      }
      results.push(result);
      console.log(JSON.stringify({ id: item.id, status: response.status, state: body.state, error: body.error, promptVersion: body.receipt?.promptVersion, claimIds: body.brief?.claims?.map(x => x.id), captions: body.brief?.imageText, imageExplanation: body.brief?.imageExplanation, elapsedMs: result.elapsedMs, costUsd: body.receipt?.costUsd }));
    } catch (err) {
      results.push({ id: item.id, requestId: request.requestId, error: String(err), elapsedMs: Date.now() - start });
      console.log(JSON.stringify(results.at(-1)));
    }
  }
  writeFileSync(path.join(out, "results.json"), JSON.stringify(results, null, 2));
  if (results.some(result => result.state !== "succeeded")) process.exitCode = 1;
}
