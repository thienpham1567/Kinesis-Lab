import { normalizeEvidenceQuery, selectCuratedEvidence } from "@/lib/clinical/evidence-registry";
import type { ChatImageClaim, ChatImageSource } from "./illustration-types";
import { POSITIONAL_CLAIMS, POSITIONAL_SOURCES } from "./positional-evidence";

const checkedAt = "2026-10-26";
const elbowSources: ChatImageSource[] = [
  { id: "medical-elbow-openstax", title: "OpenStax A&P 2e §11.5 · Muscles That Move the Forearm", url: "https://openstax.org/books/anatomy-and-physiology-2e/pages/11-5-muscles-of-the-pectoral-girdle-and-upper-limbs", checkedAt, access: "Đã đọc đoạn Muscles That Move the Forearm: gấp khuỷu, ngửa cẳng tay và brachialis nằm sâu dưới biceps. Không dùng alt text mâu thuẫn để suy chức năng hoặc điểm bám." },
  { id: "medical-elbow-ttu", title: "TTUHSC El Paso · Anatomy Tables: Upper Limb Muscles", url: "https://anatomy.ttuhscep.edu/anatomytables/muscles_alpha.html", checkedAt, access: "Đã đọc hàng biceps brachii và brachialis: nguyên ủy, bám tận và chức năng. Chỉ giải phẫu đại thể; không có kích thước diện bám hoặc hướng bó sợi cá nhân." },
  { id: "medical-elbow-bones", title: "OpenStax A&P 2e §8.2 · Ulna and Radius", url: "https://openstax.org/books/anatomy-and-physiology-2e/pages/8-2-bones-of-the-upper-limb", checkedAt, access: "Đã đọc đoạn Ulna và Radius: quay ở ngoài/phía ngón cái, trụ ở trong; đầu/cổ quay, lồi củ quay và mỏm vẹt trụ. Không dùng các góc, số đo hoặc tỉ lệ diện bám." },
];
const elbowClaims: ChatImageClaim[] = [
  { id: "elbow:flexion", text: "Cơ nhị đầu cánh tay (biceps brachii) và cơ cánh tay (brachialis) đều góp phần gấp khuỷu.", sourceIds: [elbowSources[0].id] },
  { id: "elbow:layers", text: "Cơ cánh tay nằm sâu dưới cơ nhị đầu cánh tay; muốn thấy lớp sâu cần ô riêng hoặc minh họa bộc lộ lớp.", sourceIds: [elbowSources[0].id] },
  { id: "elbow:biceps-insertion", text: "Gân tận cơ nhị đầu cánh tay bám vào lồi củ xương quay, không phải xương trụ.", sourceIds: [elbowSources[1].id], requiredForDrawing: true },
  { id: "elbow:brachialis-insertion", text: "Cơ cánh tay đi từ mặt trước nửa dưới xương cánh tay tới vùng mỏm vẹt xương trụ; không bám tận vào xương quay.", sourceIds: [elbowSources[1].id], requiredForDrawing: true },
  { id: "elbow:supination", text: "Cơ nhị đầu cánh tay còn tham gia ngửa cẳng tay; không suy rằng mọi cơ gấp khuỷu đều có cùng chức năng này.", sourceIds: [elbowSources[0].id, elbowSources[1].id] },
  { id: "elbow:bones", text: "Ở tư thế giải phẫu, xương quay nằm phía ngoài/phía ngón cái, xương trụ phía trong. Đầu quay có dạng đĩa; mỏm vẹt thuộc xương trụ.", sourceIds: [elbowSources[2].id], requiredForDrawing: true },
  { id: "elbow:radial-landmark", text: "Lồi củ xương quay ở phía trong của phần gần xương quay, ngay dưới cổ quay; không đặt bám tận nhị đầu lên đầu khớp hoặc đầu dưới xương cánh tay.", sourceIds: [elbowSources[2].id, elbowSources[1].id], requiredForDrawing: true },
];
const kneeSources: ChatImageSource[] = [
  { id: "medical-knee-aaos-acl", title: "AAOS OrthoInfo · Anterior Cruciate Ligament Injuries", url: "https://www.orthoinfo.org/diseases--conditions/anterior-cruciate-ligament-acl-injuries/", checkedAt, access: "Đã đọc Anatomy of the Knee: xương, vị trí bánh chè, dây chằng chéo và hướng hạn chế trượt xương chày. Không dùng số dịch tễ, điều trị hoặc diện bám định lượng." },
  { id: "medical-knee-aaos-pcl", title: "AAOS OrthoInfo · Posterior Cruciate Ligament Injuries", url: "https://www.orthoinfo.org/diseases--conditions/posterior-cruciate-ligament-injuries/", checkedAt, access: "Đã đọc đoạn mở đầu và Anatomy: PCL nối đùi–chày, phía sau ACL và hạn chế chày trượt ra sau so với đùi. Không suy phép đo, test chẩn đoán hoặc phác đồ điều trị từ sơ đồ." },
  { id: "medical-knee-attachments", title: "StatPearls · Anatomy, Bony Pelvis and Lower Limb, Knee", url: "https://www.ncbi.nlm.nih.gov/sites/books/NBK500017/", checkedAt, access: "Đã đọc Structure and Function, Intraarticular ligaments: vùng gian lồi cầu chày và mặt lồi cầu đùi của ACL/PCL. Chỉ dùng vị trí bám đại thể; không lấy số đo, bệnh học hoặc điều trị. NCBI lưu trữ không là chứng nhận hình AI." },
];
const kneeClaims: ChatImageClaim[] = [
  { id: "knee:connections", text: "ACL và PCL nằm trong khớp gối, nối xương đùi với xương chày và bắt chéo nhau; PCL ở phía sau ACL.", sourceIds: [kneeSources[0].id, kneeSources[1].id] },
  { id: "knee:acl-restraint", text: "ACL hạn chế xương chày trượt quá mức ra trước so với xương đùi và góp phần ổn định xoay.", sourceIds: [kneeSources[0].id] },
  { id: "knee:pcl-restraint", text: "PCL hạn chế xương chày trượt quá mức ra sau so với xương đùi; phải nêu xương đùi là mốc so sánh.", sourceIds: [kneeSources[1].id] },
  { id: "knee:orientation", text: "Xương đùi ở trên, xương chày ở dưới; xương bánh chè nằm trước khớp gối, giúp phân biệt trước–sau trong sơ đồ.", sourceIds: [kneeSources[0].id, kneeSources[1].id] },
  { id: "knee:acl-attachments", text: "ACL nối vùng gian lồi cầu trước của xương chày với mặt sau-trong của lồi cầu ngoài xương đùi. Trên sơ đồ cắt dọc quy ước, đầu chày của ACL ở trước và đường dây đi lên-ra sau về đùi.", sourceIds: [kneeSources[2].id], requiredForDrawing: true },
  { id: "knee:pcl-attachments", text: "PCL nối vùng gian lồi cầu sau của xương chày với mặt trước-ngoài của lồi cầu trong xương đùi. Trên sơ đồ cắt dọc quy ước, đầu chày của PCL ở sau và đường dây đi lên-ra trước về đùi, khác đường ACL; không chỉ đổi màu đường ACL thành PCL.", sourceIds: [kneeSources[2].id], requiredForDrawing: true },
];

/** Local, bounded source comparison. No arbitrary URL or user text is sent to web search. */
export function resolveChatImageEvidence(query: string, supplied: ChatImageSource[]) {
  const normalized = normalizeEvidenceQuery(query.slice(0, 5600));
  const sources: ChatImageSource[] = [];
  const claims: ChatImageClaim[] = [];
  const limitations: string[] = ["Nguồn đối chiếu hỗ trợ các nhận định được liệt kê, không xác nhận từng pixel, diện bám, kích thước hoặc mọi chi tiết của ảnh AI."];
  function addSource(source: ChatImageSource) {
    const existing = sources.find(x => x.url === source.url);
    if (existing) return existing.id;
    if (sources.length >= 8) return null;
    sources.push(source);
    return source.id;
  }
  function addPack(packSources: ChatImageSource[], packClaims: ChatImageClaim[]) {
    const ids = new Map(packSources.map(source => [source.id, addSource(source)]));
    for (const claim of [...packClaims].sort((a, b) => Number(Boolean(b.requiredForDrawing)) - Number(Boolean(a.requiredForDrawing)))) {
      const sourceIds = claim.sourceIds.map(id => ids.get(id));
      if (claims.length < 12 && sourceIds.every((id): id is string => Boolean(id)))
        claims.push({ ...claim, sourceIds });
    }
  }
  const elbowTopic = /\b(khuyu|brachialis|biceps brachii|nhi dau canh tay|co canh tay|elbow)\b/.test(normalized);
  const kneeTopic = /\b(acl|pcl|cruciate ligaments?|day chang cheo|khop goi|dau goi|goi phai|goi trai|knee)\b/.test(normalized) || /\bgối\b/iu.test(query.normalize("NFC"));
  const words = new Set(normalized.split(" "));
  const directionalPair = [["anterior", "posterior"], ["superior", "inferior"], ["medial", "lateral"], ["proximal", "distal"], ["superficial", "deep"]]
    .some(pair => pair.every(word => words.has(word)));
  const explicitPositionTopic = /\b(positional terms|directional terms|anatomical terminology|thuat ngu (ve )?vi tri|midline|midaxillary|axillary line|duong nach (truoc|giua|sau)|ipsilateral|contralateral)\b/.test(normalized);
  // Region examples must not crowd the actual terminology lesson out of the cap.
  if (explicitPositionTopic || (directionalPair && !elbowTopic && !kneeTopic)) {
    addPack(POSITIONAL_SOURCES, POSITIONAL_CLAIMS);
  } else {
    if (elbowTopic) addPack(elbowSources, elbowClaims);
    if (kneeTopic) addPack(kneeSources, kneeClaims);
  }
  if (!claims.length) {
    // Learning/composer wording alone must not select clinical facts. Otherwise
    // “Đọc bài / Tự kiểm tra” matches handbook labels and blocks a simple card
    // for correctly declining to cite unrelated movement research.
    const topicQuery = normalized
      .replace(/\bhinh le\b/g, "piriformis")
      .replace(/\b(chu dong|ro rang|bo cuc|tieu de)\b/g, " ")
      .replace(/\b(doc|hoc|bai|kiem|tra|hinh|tao|anh|minh|hoa|hai)\b/g, " ");
    for (const record of selectCuratedEvidence(topicQuery, 3)) {
      limitations.push(...record.evidence.limitations);
      const ids = record.evidence.sources.map((source, index) => addSource({ ...source, id: `app:${record.id}:${index + 1}` }));
      for (const [index, statement] of record.evidence.supportedClaims.slice(0, 4).entries()) {
        const refs = [...statement.matchAll(/\[([\d,\s]+)\]/g)].flatMap(match => match[1].split(",").map(x => Number(x.trim())));
        const referenced = refs.map(ref => ids[ref - 1]);
        if (!refs.length || referenced.some(id => !id)) continue;
        const sourceIds = [...new Set(referenced)] as string[];
        if (sourceIds.length && claims.length < 12) claims.push({ id: `app:${record.id}:claim:${index + 1}`, text: statement, sourceIds });
      }
    }
  }
  for (const source of supplied) addSource(source);
  if (!claims.length) limitations.push("Chưa có nhận định được đối chiếu phù hợp trong kho hữu hạn cho chủ đề này; không suy chi tiết y khoa từ yêu cầu hoặc URL nguồn.");
  return { sources, claims, limitations: [...new Set(limitations)] };
}
