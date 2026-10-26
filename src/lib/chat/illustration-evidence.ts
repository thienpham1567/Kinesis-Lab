import { normalizeEvidenceQuery, selectCuratedEvidence } from "@/lib/clinical/evidence-registry";
import type { ChatImageClaim, ChatImageSource } from "./illustration-types";

const checkedAt = "2026-10-26";
const elbowSources: ChatImageSource[] = [
  { id: "medical-elbow-openstax", title: "OpenStax A&P 2e §11.5 · Muscles That Move the Forearm", url: "https://openstax.org/books/anatomy-and-physiology-2e/pages/11-5-muscles-of-the-pectoral-girdle-and-upper-limbs", checkedAt, access: "Đã đọc đoạn Muscles That Move the Forearm: gấp khuỷu, ngửa cẳng tay và brachialis nằm sâu dưới biceps. Không dùng alt text mâu thuẫn để suy chức năng hoặc điểm bám." },
  { id: "medical-elbow-ttu", title: "TTUHSC El Paso · Anatomy Tables: Upper Limb Muscles", url: "https://anatomy.ttuhscep.edu/anatomytables/muscles_alpha.html", checkedAt, access: "Đã đọc hàng biceps brachii và brachialis: nguyên ủy, bám tận và chức năng. Chỉ giải phẫu đại thể; không có kích thước diện bám hoặc hướng bó sợi cá nhân." },
];
const elbowClaims: ChatImageClaim[] = [
  { id: "elbow:flexion", text: "Cơ nhị đầu cánh tay (biceps brachii) và cơ cánh tay (brachialis) đều góp phần gấp khuỷu.", sourceIds: [elbowSources[0].id] },
  { id: "elbow:layers", text: "Cơ cánh tay nằm sâu dưới cơ nhị đầu cánh tay; muốn thấy lớp sâu cần ô riêng hoặc minh họa bộc lộ lớp.", sourceIds: [elbowSources[0].id] },
  { id: "elbow:biceps-insertion", text: "Gân tận cơ nhị đầu cánh tay bám vào lồi củ xương quay, không phải xương trụ.", sourceIds: [elbowSources[1].id] },
  { id: "elbow:brachialis-insertion", text: "Cơ cánh tay đi từ mặt trước nửa dưới xương cánh tay tới vùng mỏm vẹt xương trụ; không bám tận vào xương quay.", sourceIds: [elbowSources[1].id] },
  { id: "elbow:supination", text: "Cơ nhị đầu cánh tay còn tham gia ngửa cẳng tay; không suy rằng mọi cơ gấp khuỷu đều có cùng chức năng này.", sourceIds: [elbowSources[0].id, elbowSources[1].id] },
];
const kneeSources: ChatImageSource[] = [
  { id: "medical-knee-aaos-acl", title: "AAOS OrthoInfo · Anterior Cruciate Ligament Injuries", url: "https://www.orthoinfo.org/diseases--conditions/anterior-cruciate-ligament-acl-injuries/", checkedAt, access: "Đã đọc Anatomy of the Knee: xương, vị trí bánh chè, dây chằng chéo và hướng hạn chế trượt xương chày. Không dùng số dịch tễ, điều trị hoặc diện bám định lượng." },
  { id: "medical-knee-aaos-pcl", title: "AAOS OrthoInfo · Posterior Cruciate Ligament Injuries", url: "https://www.orthoinfo.org/diseases--conditions/posterior-cruciate-ligament-injuries/", checkedAt, access: "Đã đọc đoạn mở đầu và Anatomy: PCL nối đùi–chày, phía sau ACL và hạn chế chày trượt ra sau so với đùi. Không suy phép đo, test chẩn đoán hoặc phác đồ điều trị từ sơ đồ." },
];
const kneeClaims: ChatImageClaim[] = [
  { id: "knee:connections", text: "ACL và PCL nằm trong khớp gối, nối xương đùi với xương chày và bắt chéo nhau; PCL ở phía sau ACL.", sourceIds: kneeSources.map(x => x.id) },
  { id: "knee:acl-restraint", text: "ACL hạn chế xương chày trượt quá mức ra trước so với xương đùi và góp phần ổn định xoay.", sourceIds: [kneeSources[0].id] },
  { id: "knee:pcl-restraint", text: "PCL hạn chế xương chày trượt quá mức ra sau so với xương đùi; phải nêu xương đùi là mốc so sánh.", sourceIds: [kneeSources[1].id] },
  { id: "knee:orientation", text: "Xương đùi ở trên, xương chày ở dưới; xương bánh chè nằm trước khớp gối, giúp phân biệt trước–sau trong sơ đồ.", sourceIds: [kneeSources[0].id, kneeSources[1].id] },
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
    for (const claim of packClaims) {
      const sourceIds = claim.sourceIds.map(id => ids.get(id));
      if (claims.length < 12 && sourceIds.every((id): id is string => Boolean(id)))
        claims.push({ ...claim, sourceIds });
    }
  }
  if (/\b(khuyu|brachialis|biceps brachii|nhi dau canh tay|co canh tay|elbow)\b/.test(normalized)) addPack(elbowSources, elbowClaims);
  if (/\b(acl|pcl|day chang cheo|goi|knee)\b/.test(normalized)) addPack(kneeSources, kneeClaims);
  if (!claims.length) {
    for (const record of selectCuratedEvidence(query, 3)) {
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
