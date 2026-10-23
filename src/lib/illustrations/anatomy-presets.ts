// Authored visual briefs, not verified anatomical images or measurement data.
// Sources provide regional textbook context; no source image is sent upstream.
export const ANATOMY_CONTEXT_SOURCES = {
  upper: {
    title: "OpenStax A&P 2e · 11.5 Cơ đai vai và chi trên",
    url: "https://openstax.org/books/anatomy-and-physiology-2e/pages/11-5-muscles-of-the-pectoral-girdle-and-upper-limbs",
    checkedAt: "2026-10-23",
    access: "Văn bản §11.5 về cơ đai vai và chi trên; chú thích hình 11.22–11.26. Nguồn ngữ cảnh, không xác nhận ảnh AI.",
  },
  trunk: {
    title: "OpenStax A&P 2e · 11.4 Cơ thành bụng và lồng ngực",
    url: "https://openstax.org/books/anatomy-and-physiology-2e/pages/11-4-axial-muscles-of-the-abdominal-wall-and-thorax",
    checkedAt: "2026-10-23",
    access: "Mục tiêu, đoạn giới thiệu, phần cơ bụng và chú thích hình 11.16. Nguồn ngữ cảnh, không xác nhận ảnh AI.",
  },
  lower: {
    title: "OpenStax A&P 2e · 11.6 Cơ đai chậu và chi dưới",
    url: "https://openstax.org/books/anatomy-and-physiology-2e/pages/11-6-appendicular-muscles-of-the-pelvic-girdle-and-lower-limbs",
    checkedAt: "2026-10-23",
    access: "Mục tiêu, đoạn giới thiệu, phần cơ vùng mông và chú thích hình 11.29. Nguồn ngữ cảnh, không xác nhận ảnh AI.",
  },
};

export const ANATOMY_IMAGE_PRESETS = [
  {
    id: "upper-arm",
    label: "Cánh tay · cơ, xương và gân",
    brief: "A single adult right upper limb in anterior view, from shoulder girdle to the complete hand, palm facing forward and elbow extended in neutral anatomical position. Focus on biceps brachii, brachialis and their relationships with the scapula, humerus, radius and ulna. Distinguish superficial and deep structures without placing them all in one surface layer.",
    sourceIds: ["upper"],
  },
  {
    id: "whole-body",
    label: "Toàn thân · lớp cơ nông",
    brief: "One adult whole-body anatomical teaching model, anterior view in neutral anatomical position, showing the superficial muscle layer with the entire head, hands and feet inside the frame. Use restrained detail appropriate to a whole-body overview, not a detailed attachment map.",
    sourceIds: ["upper", "trunk", "lower"],
  },
  {
    id: "shoulder",
    label: "Vai · đai vai và cơ quanh khớp",
    brief: "An adult right shoulder region in a single posterior view, showing the scapula, proximal humerus and surrounding muscles. Preserve a coherent single viewing direction and distinguish exposed skeletal structures from overlying muscle. No exercise pose.",
    sourceIds: ["upper"],
  },
  {
    id: "trunk",
    label: "Thân mình · ngực và thành bụng",
    brief: "An adult torso in anterior view, showing the superficial chest and abdominal musculature, framed from the shoulder girdle to the pelvis. Do not combine all abdominal layers into one superficial layer. No action pose.",
    sourceIds: ["trunk"],
  },
  {
    id: "hip-pelvis",
    label: "Hông · chậu và nhóm cơ mông",
    brief: "An adult hip and pelvic region in a single posterolateral view, framed from the iliac crests to the proximal thighs. Show the superficial gluteal region with coherent pelvic and femoral relationships. Do not expose all deep muscles as if they were simultaneously superficial.",
    sourceIds: ["lower"],
  },
  {
    id: "thigh-knee",
    label: "Đùi và gối · cơ, xương và gân",
    brief: "A single adult right thigh and knee region in anterior view, from the proximal thigh through the proximal lower leg, knee extended in a neutral position. Distinguish the superficial muscles, tendons and exposed bony landmarks without invented measurement markings.",
    sourceIds: ["lower"],
  },
  {
    id: "lower-leg-foot",
    label: "Cẳng chân và bàn chân",
    brief: "A single adult right lower leg and complete foot in an anterior three-quarter view, from just above the knee to the toes. Show the superficial musculature and visible tendon relationships in a neutral resting position. Preserve coherent bones and five toes; no action pose.",
    sourceIds: ["lower"],
  },
] as const;
