/** Head labels only: source comparison never certifies a mesh or clinical use. */
export const ATLAS_HEAD_TERMINOLOGY_SOURCES = {
  'hmu-2004-head': {
    format: 'pdf',
    checkedAt: '2026-11-05',
    title: 'ĐH Y Hà Nội · Bài giảng Giải phẫu học (2004) — tên xương và cơ đầu',
    authors: 'Bộ môn Giải phẫu; Nguyễn Văn Huy, Lê Hữu Hưng và cộng sự',
    url: 'https://dienthaiduong.com.vn/upload/file/bai-giang-giai-phau-hocdh-y-ha-noi-1755658431-1762569650.pdf',
    access: 'Xem trực tiếp bản quét trang PDF 16–24, 80, 82–84; chỉ dùng các tên Việt–Latin và phần/đầu cơ được dẫn ở trang 16, 83–84. Trang PDF là thứ tự một-based, khác số trang in. Không nhập điểm bám hay hướng dẫn điều trị.',
    hostNote: 'Bản quét do website bên thứ ba lưu trữ, không phải website ĐH Y Hà Nội hay NXB; không có xác nhận tính toàn vẹn từ nhà xuất bản. Lần đọc mới này không đổi ngày đọc của 216 hồ sơ cơ cũ.',
    bibliographyUrl: 'https://phucvu.thuvientphcm.gov.vn/Item/ItemDetail/344751',
  },
  'openstax-7-2-head-terms': {
    format: 'html', checkedAt: '2026-11-05',
    title: 'OpenStax · Anatomy and Physiology 2e §7.2 The Skull',
    authors: 'OpenStax',
    url: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/7-2-the-skull',
    access: 'Đọc HTML các mục Bones of the Brain Case và Facial Bones of the Skull để nối tên English với thực thể xương trong bản Việt–Latin; chỉ đối chiếu tên, không xác nhận bản dịch chính thức hay mesh.',
    hostNote: 'Giáo trình tiếng Anh; không phải nguồn tên tiếng Việt. Không dùng để xác nhận hình học, nhãn từng vertex hoặc đo đạc mô hình.',
    bibliographyUrl: null,
  },
  'openstax-11-3-head-terms': {
    format: 'html', checkedAt: '2026-11-05',
    title: 'OpenStax · Anatomy and Physiology 2e §11.3 Axial Muscles of the Head, Neck, and Back',
    authors: 'OpenStax',
    url: 'https://openstax.org/books/anatomy-and-physiology-2e/pages/11-3-axial-muscles-of-the-head-neck-and-back',
    access: 'Đọc HTML Muscles That Create Facial Expression và Muscles That Move the Lower Jaw, Figure 11.8 và Table 11.4: cách viết buccinator, temporalis, masseter và hai cơ pterygoid. Phân biệt phần/đầu riêng dựa vào HMU, không gán cho OpenStax.',
    hostNote: 'Chỉ dùng tên English và ngữ cảnh định danh cơ; không nhập các hàng điểm bám/động tác hoặc suy luận tính đúng của lưới 3D.',
    bibliographyUrl: null,
  },
} as const;

type HeadSourceId = keyof typeof ATLAS_HEAD_TERMINOLOGY_SOURCES;
type HeadReference = { sourceId: HeadSourceId; sourceTerm: string; sourceEnglishTerm?: string } &
  ({ page: number; locator?: never } | { page: null; locator: string });
export type AtlasHeadTerm = {
  vietnamese: string;
  status: 'matched';
  checkedAt: '2026-11-05';
  reviewedBy: null;
  references: readonly HeadReference[];
  note?: string;
};
function term(vietnamese: string, page: number, sourceTerm: string,
  english?: string, locator?: string, note?: string): AtlasHeadTerm {
  return {
    vietnamese, status: 'matched', checkedAt: '2026-11-05', reviewedBy: null,
    references: [
      { sourceId: 'hmu-2004-head', page, sourceTerm },
      ...(english ? [{ sourceId: page === 16 ? 'openstax-7-2-head-terms' as const : 'openstax-11-3-head-terms' as const,
        page: null, locator: locator!, sourceTerm: english, sourceEnglishTerm: english }] : []),
    ],
    ...(note ? { note } : {}),
  };
}
const SKULL = 'Bones of the Brain Case';
const FACE = 'Facial Bones of the Skull';
const JAW = 'Muscles That Move the Lower Jaw · Table 11.4';
const PART_NOTE = 'Tên phần/đầu riêng được đọc trong HMU; OpenStax chỉ nối tên cơ mẹ. Không xác nhận ranh giới phần hoặc hướng sợi trên mesh.';
/** Separate inventory: the historical 216 muscular-layer comparisons stay intact. */
export const ATLAS_HEAD_TERMS: Readonly<Record<string, AtlasHeadTerm>> = {
  'Frontal bone': term('Xương trán', 16, 'Xương trán (os frontale)', 'Frontal bone', SKULL),
  'Parietal bone': term('Xương đỉnh', 16, 'Xương đỉnh (os parietale)', 'Parietal bone', SKULL),
  'Temporal bone': term('Xương thái dương', 16, 'Xương thái dương (os temporale)', 'Temporal bone', SKULL),
  'Occipital bone': term('Xương chẩm', 16, 'Xương chẩm (os occipitale)', 'Occipital bone', SKULL),
  'Sphenoid bone': term('Xương bướm', 16, 'Xương bướm (os sphenoidale)', 'Sphenoid bone', SKULL),
  'Ethmoid bone': term('Xương sàng', 16, 'Xương sàng (os ethmoidale)', 'Ethmoid bone', SKULL),
  'Maxilla': term('Xương hàm trên', 16, 'Xương hàm trên (maxilla)', 'Maxilla', FACE),
  'Mandible': term('Xương hàm dưới', 16, 'Xương hàm dưới (os mandibula)', 'Mandible', FACE,
    'Giữ cách ghi Latin trong bản quét để truy nguồn; không dùng dòng này để sửa Latin hoặc gán mã FIPAT chính thức.'),
  'Zygomatic bone': term('Xương gò má', 16, 'Xương gò má (os zygomaticum)', 'Zygomatic bone', FACE),
  'Nasal bone': term('Xương mũi', 16, 'Xương mũi (os nasale)', 'Nasal bone', FACE),
  'Lacrimal bone': term('Xương lệ', 16, 'Xương lệ (os lacrimal)', 'Lacrimal bone', FACE,
    'Latin được giữ đúng cách ghi trong bản quét; không phải hiệu đính thuật ngữ Latin của catalog.'),
  'Palatine bone': term('Xương khẩu cái', 16, 'Xương khẩu cái (os palatinum)', 'Palatine bone', FACE),
  'Inferior nasal concha bone': term('Xương xoăn mũi dưới', 16, 'Xương xoăn mũi dưới (concha nasalis inferior)', 'Inferior nasal concha', FACE),
  'Vomer': term('Xương lá mía', 16, 'Xương lá mía (vomer)', 'Vomer', FACE),
  'Hyoid bone': term('Xương móng', 16, 'Xương móng (os hyoideum)'),
  'Bucinator': term('Cơ mút', 83, 'Cơ thổi kèn (m. buccinator) hay cơ mút', 'Buccinator', 'Muscles That Create Facial Expression · Figure 11.8',
    'Nguồn mesh ghi Bucinator; HMU và OpenStax ghi buccinator. Tên hiển thị English được hiệu đính riêng bằng hai ID và giá trị gốc được giữ trong sourceMetadata; đối chiếu này không xác nhận danh tính hoặc hình học mesh.'),
  'Temporalis muscle': term('Cơ thái dương', 83, 'Cơ thái dương (m. temporalis)', 'Temporalis', JAW),
  'Superficial part of masseter': term('Cơ cắn · phần nông', 83, 'Cơ cắn (m. masseter) / phần nông', 'Masseter', JAW, PART_NOTE),
  'Deep part of masseter': term('Cơ cắn · phần sâu', 83, 'Cơ cắn (m. masseter) / phần sâu', 'Masseter', JAW, PART_NOTE),
  'Medial pterygoid muscle': term('Cơ chân bướm trong', 84, 'Cơ chân bướm trong (m. pterygoideus medialis)', 'Medial pterygoid', JAW),
  'Superior head of lateral pterygoid muscle': term('Cơ chân bướm ngoài · đầu trên', 84, 'Cơ chân bướm ngoài / đầu trên', 'Lateral pterygoid', JAW, PART_NOTE),
  'Inferior head of lateral pterygoid muscle': term('Cơ chân bướm ngoài · đầu dưới', 84, 'Cơ chân bướm ngoài / đầu dưới', 'Lateral pterygoid', JAW, PART_NOTE),
};

/** Exact alias only; never infer a translation for unresearched head subdivisions. */
export function getAtlasHeadTerminologyComparison(english: string): AtlasHeadTerm | null {
  const key = english === 'Buccinator' ? 'Bucinator' : english;
  return Object.hasOwn(ATLAS_HEAD_TERMS, key) ? ATLAS_HEAD_TERMS[key] : null;
}
