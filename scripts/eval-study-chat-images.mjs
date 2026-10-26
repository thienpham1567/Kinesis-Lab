import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

export const PROTOCOL = {
  createdAt: "2026-10-26",
  purpose: "chat-study",
  model: "openai/gpt-image-2.5-sunburst",
  provider: "openai",
  resolution: "auto",
  aspectRatio: "auto",
  quality: "auto",
  n: 1,
  automaticRetries: 0,
  fallbacks: false,
  maxImages: 6,
  imagesPerBrief: 2,
  paidApplyFlags: ["--apply", "--max-images"],
  briefs: [
    {
      id: "anatomy-upper-arm-labels",
      subjectKind: "anatomy",
      title: "Cánh tay trước: nhị đầu, cánh tay, xương cánh tay",
      visualDescription:
        "Một mô hình giảng dạy cánh tay phải người lớn, nhìn trước, khuỷu duỗi, lòng bàn tay hướng trước. Hiện cơ nhị đầu cánh tay nông, cơ cánh tay sâu hơn nơi nhìn thấy tự nhiên, và xương cánh tay. Không phải ảnh xác, phim bệnh nhân hay phép đo.",
      imageText: [
        "Cơ nhị đầu cánh tay (biceps brachii)",
        "Cơ cánh tay (brachialis), nằm sâu hơn",
        "Xương cánh tay (humerus)",
      ],
      explanation:
        "OpenStax A&P 2e §11.5 mô tả cơ đai vai và chi trên, gồm nhóm gập khuỷu với điểm bám khác nhau. Hình này chỉ gắn nhãn ba cấu trúc đó; không xác nhận hướng sợi, diện bám hay độ dày mô.",
      sources: [
        {
          id: "upper",
          title: "OpenStax A&P 2e · 11.5 Cơ đai vai và chi trên",
          url: "https://openstax.org/books/anatomy-and-physiology-2e/pages/11-5-muscles-of-the-pectoral-girdle-and-upper-limbs",
          checkedAt: "2026-10-23",
          access:
            "Văn bản §11.5 về cơ đai vai và chi trên; chú thích hình 11.22–11.26. Nguồn ngữ cảnh, không xác nhận ảnh AI.",
        },
      ],
      limitations: [
        "Nguồn hỗ trợ nội dung nhãn, không xác nhận từng pixel, mũi tên hay phép đo do model vẽ.",
        "Không gắn nhãn đã xác nhận y khoa; reviewedBy giữ null.",
      ],
      expectedText: [
        "Cánh tay trước: nhị đầu, cánh tay, xương cánh tay",
        "Cơ nhị đầu cánh tay (biceps brachii)",
        "Cơ cánh tay (brachialis), nằm sâu hơn",
        "Xương cánh tay (humerus)",
      ],
    },
    {
      id: "movement-squat-mechanics",
      subjectKind: "movement",
      title: "Squat: đổi độ rộng chân đổi cơ học",
      visualDescription:
        "Infographic học tập so sánh hai tư thế squat đứng, cùng người lớn khỏe, khác độ rộng chân. Không phải bài tập, không thiết bị thể thao, không sơ đồ chấn thương.",
      imageText: [
        "Độ rộng chân đổi góc gối, hông và thân",
        "Ảnh nghiên cứu là điều kiện đo, không chuẩn an toàn cá nhân",
        "Một chỉnh tư thế không xác định mô gây đau",
      ],
      explanation:
        "Lorenzetti 2018 đo động học squat ở người khỏe khi đổi độ rộng chân và hướng bàn chân. Đổi thiết lập có thể đổi góc khớp; một thay đổi không tự xác định mô gây đau hay chuẩn an toàn cá nhân.",
      sources: [
        {
          id: "squat",
          title:
            "How to squat? Effects of various stance widths, foot placement angles and level of experience on knee, hip and trunk motion and loading",
          url: "https://link.springer.com/article/10.1186/s13102-018-0103-7",
          checkedAt: "2026-10-22",
          access:
            "Đã đọc phương pháp, kết quả, giới hạn, Hình 1 và quyền sử dụng. 42 người khỏe; đo động học và mô-men khớp, không theo dõi chấn thương. Đã đọc đính chính 2020 về dấu chỉ số ΔD*: https://doi.org/10.1186/s13102-020-0160-6 . Không dùng các suy đoán nguy cơ trong bàn luận làm ngưỡng an toàn.",
        },
        {
          id: "bahr",
          title:
            "Why screening tests to predict injury do not work—and probably never will…: a critical review",
          url: "https://pubmed.ncbi.nlm.nih.gov/27095747/",
          checkedAt: "2026-10-22",
          access:
            "Đã đọc abstract PubMed. Phạm vi: sàng lọc dự báo chấn thương thể thao; không xác nhận phân loại bài tập, nguyên nhân đau hoặc cơ yếu.",
        },
      ],
      limitations: [
        "Mẫu người khỏe, không theo dõi chấn thương.",
        "Không dùng hình để chẩn đoán đau hoặc đặt ngưỡng an toàn cá nhân.",
      ],
      expectedText: [
        "Squat: đổi độ rộng chân đổi cơ học",
        "Độ rộng chân đổi góc gối, hông và thân",
        "Ảnh nghiên cứu là điều kiện đo, không chuẩn an toàn cá nhân",
        "Một chỉnh tư thế không xác định mô gây đau",
      ],
    },
    {
      id: "comparison-lsi-vs-raw",
      subjectKind: "comparison",
      title: "LSI và số từng bên sau ACL",
      visualDescription:
        "Hình so sánh hai cách đọc: cột trái là chỉ số đối xứng hai bên (LSI), cột phải là số tuyệt đối từng chân. Không phải phiếu chẩn đoán hay giấy phép trở lại thể thao.",
      imageText: [
        "LSI: tỷ lệ hai bên, mất thông tin bên nào mạnh hơn",
        "Giữ số tuyệt đối từng chân: lực, nhảy, thời gian",
        "Ngưỡng 10–15% không tự là ranh giới nguy hiểm",
        "LSI có thể đánh giá quá cao hồi phục sau ACL",
      ],
      explanation:
        "Parkinson 2021 cho thấy công thức và ngưỡng đối xứng phụ thuộc phép đo. Wellsandt 2017 ghi nhận LSI có thể đánh giá quá cao chức năng gối sau ACL vì chi đối diện cũng có thể giảm.",
      sources: [
        {
          id: "parkinson",
          title:
            "The Calculation, Thresholds and Reporting of Inter-Limb Strength Asymmetry: A Systematic Review",
          url: "https://www.jssm.org/volume20/iss4/cap/jssm-20-594.pdf",
          checkedAt: "2026-10-22",
          access:
            "Đã mở PDF nhà xuất bản; phần thực đọc là abstract và Introduction trang 594–595. Chưa đọc toàn bộ 24 trang. Phạm vi bất đối xứng sức mạnh; không suy một công thức/ngưỡng cho mọi phép đo.",
        },
        {
          id: "wellsandt",
          title:
            "Limb Symmetry Indexes Can Overestimate Knee Function After Anterior Cruciate Ligament Injury",
          url: "https://pubmed.ncbi.nlm.nih.gov/28355978/",
          checkedAt: "2026-10-22",
          access:
            "Đã đọc abstract; 70 vận động viên, sức mạnh tứ đầu và bốn hop test trước/sau tái tạo ACL. Không phải tiêu chí cho mọi bệnh hoặc giấy phép trở lại thể thao.",
        },
      ],
      limitations: [
        "Không suy một ngưỡng chung cho mọi phép đo hoặc mọi người.",
        "Không dùng hình làm tiêu chí trở lại thể thao.",
      ],
      expectedText: [
        "LSI và số từng bên sau ACL",
        "LSI: tỷ lệ hai bên, mất thông tin bên nào mạnh hơn",
        "Giữ số tuyệt đối từng chân: lực, nhảy, thời gian",
        "Ngưỡng 10–15% không tự là ranh giới nguy hiểm",
        "LSI có thể đánh giá quá cao hồi phục sau ACL",
      ],
    },
  ],
};

function imageTextBudget(brief) {
  return brief.title.length + brief.imageText.join("").length;
}

export function compileEvalPrompt(brief) {
  return [
    "Create one original educational infographic for Kinesis Lab study chat.",
    "Paint the title and every caption below as readable Vietnamese text directly in the raster. Do not omit diacritics. Do not add extra labels, numbers, measurements, diagnoses or arrows beyond this brief.",
    `Subject kind: ${brief.subjectKind}.`,
    `Title (max 60 characters, draw exactly): ${brief.title}`,
    `Visual: ${brief.visualDescription}`,
    `Captions to paint exactly, 2–4 items: ${brief.imageText.map((t, i) => `${i + 1}. ${t}`).join(" | ")}`,
    "Leave breathing room around lettering. Lettering must stay large enough to read when the image is fit on a phone screen.",
    "This is a simulated teaching graphic, not a cadaver photo, patient scan or verified measurement.",
  ].join("\n\n");
}

function parseArgs(argv) {
  const apply = argv.includes("--apply");
  const maxFlag = argv.findIndex((a) => a === "--max-images");
  const maxImages =
    maxFlag >= 0 && argv[maxFlag + 1] ? Number(argv[maxFlag + 1]) : null;
  return { apply, maxImages };
}

function printProtocol() {
  const briefs = PROTOCOL.briefs.map((brief) => ({
    id: brief.id,
    subjectKind: brief.subjectKind,
    title: brief.title,
    imageText: brief.imageText,
    expectedText: brief.expectedText,
    imageCharCount: imageTextBudget(brief),
    sources: brief.sources.map((s) => ({
      id: s.id,
      url: s.url,
      checkedAt: s.checkedAt,
      access: s.access,
    })),
  }));
  process.stdout.write(
    JSON.stringify(
      {
        model: PROTOCOL.model,
        provider: PROTOCOL.provider,
        resolution: PROTOCOL.resolution,
        aspectRatio: PROTOCOL.aspectRatio,
        quality: PROTOCOL.quality,
        n: PROTOCOL.n,
        automaticRetries: PROTOCOL.automaticRetries,
        fallbacks: PROTOCOL.fallbacks,
        paidCalls: false,
        note: "Default prints protocol only. Paid OpenRouter calls require --apply --max-images=N with N<=6.",
        briefs,
      },
      null,
      2,
    ) + "\n",
  );
}

async function applyPaid(maxImages) {
  if (!Number.isInteger(maxImages) || maxImages < 1 || maxImages > 6) {
    throw new Error("Cần --max-images từ 1 đến 6.");
  }
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("Thiếu OPENROUTER_API_KEY.");
  const dir = path.resolve(".data/study-chat-image-eval");
  mkdirSync(dir, { recursive: true });
  const jobs = [];
  for (const brief of PROTOCOL.briefs) {
    jobs.push(brief, brief);
  }
  const selected = jobs.slice(0, maxImages);
  const results = [];
  for (const [index, brief] of selected.entries()) {
    const prompt = compileEvalPrompt(brief);
    const started = Date.now();
    const res = await fetch("https://openrouter.ai/api/v1/images", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        "X-Title": "Kinesis Lab study-chat image eval",
      },
      signal: AbortSignal.timeout(140_000),
      body: JSON.stringify({
        model: PROTOCOL.model,
        prompt,
        n: 1,
        aspect_ratio: PROTOCOL.aspectRatio,
        quality: PROTOCOL.quality,
        provider: { only: [PROTOCOL.provider], allow_fallbacks: false },
      }),
    });
    const elapsedMs = Date.now() - started;
    const rawText = await res.text();
    let data = null;
    try {
      data = JSON.parse(rawText);
    } catch {
      data = null;
    }
    const b64 = data?.data?.[0]?.b64_json;
    const bytes =
      typeof b64 === "string" ? Buffer.from(b64, "base64") : Buffer.alloc(0);
    const result = {
      briefId: brief.id,
      attempt: index + 1,
      httpStatus: res.status,
      elapsedMs,
      costUsd:
        typeof data?.usage?.cost === "number" &&
        Number.isFinite(data.usage.cost) &&
        data.usage.cost >= 0
          ? data.usage.cost
          : null,
      sha256: bytes.length
        ? createHash("sha256").update(bytes).digest("hex")
        : null,
      expectedText: brief.expectedText,
      error: res.ok ? null : `OpenRouter ${res.status}`,
    };
    results.push(result);
    if (bytes.length) {
      writeFileSync(path.join(dir, `${brief.id}-${index + 1}.bin`), bytes);
    }
    writeFileSync(
      path.join(dir, `${brief.id}-${index + 1}.json`),
      JSON.stringify(result, null, 2),
    );
  }
  writeFileSync(path.join(dir, "results.json"), JSON.stringify(results, null, 2));
  process.stdout.write(JSON.stringify({ paidCalls: results.length, results }, null, 2) + "\n");
}

const invokedDirectly = process.argv[1]?.endsWith("eval-study-chat-images.mjs");
if (invokedDirectly) {
  const { apply, maxImages } = parseArgs(process.argv.slice(2));
  if (!apply) printProtocol();
  else applyPaid(maxImages).catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  });
}
