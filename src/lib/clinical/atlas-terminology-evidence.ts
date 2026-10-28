/** Name comparison only; never upgrades catalog geometry or clinical evidence. */
export const ATLAS_TERMINOLOGY_CHECKED_AT = "2026-10-23";
export const ATLAS_TERMINOLOGY_REVIEWED_BY = null;

export const ATLAS_TERMINOLOGY_SOURCES = {
  "hmu-2004": {
    title: "ĐH Y Hà Nội · Bài giảng Giải phẫu học (2004)",
    authors: "Bộ môn Giải phẫu; Nguyễn Văn Huy, Lê Hữu Hưng và cộng sự",
    url: "https://dienthaiduong.com.vn/upload/file/bai-giang-giai-phau-hocdh-y-ha-noi-1755658431-1762569650.pdf",
    access: "Đọc bản quét: bìa, trang tên sách/ban biên soạn; các trang PDF 71, 86–134, 181, 184–185. Đối chiếu tên và ngữ cảnh; bảng/hình liên quan được xem trực tiếp, OCR chỉ hỗ trợ tìm kiếm.",
    hostNote: "Bản quét do website bên thứ ba lưu trữ, không phải website ĐH Y Hà Nội hay NXB. Trang tên sách ghi NXB Y học, Hà Nội 2004; không có xác nhận tính toàn vẹn từ nhà xuất bản.",
    bibliographyUrl: "https://phucvu.thuvientphcm.gov.vn/Item/ItemDetail/344751",
  },
  phcn: {
    title: "BV PHCN Trung ương · Giải phẫu một số cơ",
    authors: "BS. Cầm Bá Thức",
    url: "https://bvphcntw.gov.vn/uploads/news/2021_05/giai-phau-mot-so-co-bs-thuc.pdf",
    access: "Đọc phần tên cơ chi trên/chi dưới, trang PDF 18–48; xem trực tiếp trang 48 để phân biệt bó trong/ngoài. Chỉ dùng thuật ngữ, không nhập hướng dẫn điều trị, liều thuốc, điểm bám hay chi phối thần kinh từ slide.",
    hostNote: "Tài liệu trên website của bệnh viện. Tên và biến thể đầu/phần được ghi riêng cho từng mục.",
    bibliographyUrl: null,
  },
  "pnt-2025": {
    title: "Y Dược học Phạm Ngọc Thạch · Các phương pháp đánh giá chất lượng giọng nói (2025)",
    authors: "Ngô Minh Cường, Lê Trần Quang Minh",
    url: "https://scholar.dlu.edu.vn/thuvienso/bitstream/DLU123456789/284374/1/107962-2641-218830-1-10-20250210.pdf",
    access: "Đọc phần 1.2 và xem Hình 3, trang PDF 3 / trang in 21, để ghi biến thể tên cơ và phần nhẫn giáp. Không sao chép hình, dùng số đo hay hướng dẫn điều trị từ bài này.",
    hostNote: "Bài báo 4(1):19–29, DOI 10.59715/pntjmp.4.1.3; bản lưu tại thư viện ĐH Đà Lạt. Chú thích hình ghi năm Gray’s Anatomy không nhất quán; không dùng chú thích đó để xác nhận ấn bản Gray’s đã đọc.",
    bibliographyUrl: "https://doi.org/10.59715/pntjmp.4.1.3",
  },
} as const;

export type AtlasTerminologySourceId = keyof typeof ATLAS_TERMINOLOGY_SOURCES;
export type AtlasTerminologyStatus = "matched" | "partial" | "unresolved";
export interface AtlasTerminologyReference {
  sourceId: AtlasTerminologySourceId;
  /** One-based PDF page, not printed pagination. */
  page: number;
  /** Short term(s) actually seen in the source; display wording may differ. */
  sourceTerm: string;
}
export interface AtlasTerminologyComparison {
  /** matched = full named entity found in context; not official certification. */
  status: AtlasTerminologyStatus;
  references: readonly AtlasTerminologyReference[];
  note?: string;
}

export const ATLAS_TERMINOLOGY_STATUS_LABELS: Record<AtlasTerminologyStatus, string> = {
  matched: "Đã đối chiếu tên trong tài liệu",
  partial: "Đối chiếu một phần",
  unresolved: "Chưa đủ nguồn tiếng Việt cụ thể",
};

function comparison(
  status: AtlasTerminologyStatus,
  sourceId: AtlasTerminologySourceId,
  page: number,
  sourceTerm: string,
  note?: string,
): AtlasTerminologyComparison {
  return { status, references: [{ sourceId, page, sourceTerm }], ...(note ? { note } : {}) };
}

const NOTE_1 = "Tài liệu gọi “phần”; danh mục English gọi head cho phần đòn và ức-sườn. Giữ đầu/phần theo tên nguồn; đây là biến thể danh pháp, không suy ra cơ được phân đoạn trên mesh.";
const NOTE_2 = "Bảng 4.5 ghi cơ delta và các sợi trước/ngoài/sau cùng chỗ bám xương đòn, mỏm cùng, gai vai. Chưa có cặp tên phần theo đúng English nguồn; không đổi thành trước/giữa/sau bằng suy luận.";
const NOTE_3 = "Chưa tìm được cặp tên Việt–English/Latin đủ rõ trong tài liệu đã đọc. Không dùng tên khép bé của tài liệu cũ nếu không biết nó chỉ adductor brevis hay minimus; danh mục nguồn thiếu Latin.";
const NOTE_4 = "Hình 6.6 dùng “thượng thiệt”; app ghi “nắp thanh quản” cho epiglottic. Chưa đối chiếu được toàn bộ tên “phần của cơ…” theo danh mục nguồn.";
const NOTE_5 = "Bảng 4.5 ghi cơ thang và các sợi trên/dưới; chưa liệt kê các tên phần lên/ngang/xuống theo đúng danh mục English.";
const NOTE_6 = "Hình 4.39 vùng cẳng chân sau; “hãm gân” là cách gọi của mạc giữ gân trong giáo trình.";
const NOTE_7 = "Hình 4.22 có “cơ cụt”; phần mô tả trang PDF 100 dùng “cơ ngồi-cụt (m. ischiococcygeus)”. Giữ cách gọi ngắn và ghi biến thể này.";
const NOTE_8 = "Đã đọc tên cơ và hai đầu cánh tay/trụ. Chưa có đối chiếu trong nguồn này rằng tên sâu/nông của danh mục chính là hai đầu đó; giữ nguyên mô tả English, không đổi tên bằng suy luận.";
const NOTE_9 = "Chỉ đối chiếu được nhóm cơ gian ngang; chưa có cặp tên cho phần lưng/bụng của nhóm ngoài thắt lưng. Các từ chỉ phần vẫn là chuyển ngữ từ English nguồn.";
const NOTE_10 = "Hình 4.33 vùng cổ tay/cẳng tay sau; giáo trình dùng “hãm gân”, app dùng “mạc giữ gân”.";
const NOTE_11 = "Đối chiếu được cơ giáp-phễu; chưa có tên riêng của phần ngoài trong trang đã đọc.";
const NOTE_12 = "Peroneus trong giáo trình là cách gọi khác của fibularis trong danh mục; không sửa English/Latin nguồn.";
const NOTE_13 = "Giáo trình dùng tên có brevis/ngắn. Chuỗi nguồn nguyên bản “Flexor digiti minimi pedis pedis” lặp pedis; tên Latin hiển thị đã bỏ từ lặp theo hồ sơ hiệu chỉnh catalog riêng. Việc bỏ từ lặp không giải quyết đối chiếu biến thể brevis/ngắn của tên Việt trong giáo trình; hồ sơ tên Việt vẫn chỉ đối chiếu một phần.";
const NOTE_14 = "Giáo trình dùng tên có brevis/ngắn; English/Latin của danh mục thiếu brevis. Hiển thị tên có “ngắn” theo giáo trình nhưng không sửa tên nguồn và không coi cặp tên nguồn là đã khớp nguyên văn.";
const NOTE_15 = "Mục 5.3.1 mô tả dải cân giữ các gân ở cổ tay; giáo trình dùng “hãm gân”, app dùng “mạc giữ gân”.";
const NOTE_16 = "Bảng mô tả nguyên ủy ở xương cánh tay và xương trụ, nhưng chưa ghi riêng hai tên đầu cơ; đối chiếu được tên cơ mẹ.";
const NOTE_17 = "Đã thấy nhãn Việt trong Hình 4.12 về cơ nội tại lưng. Hình không in cặp English/Latin cho từng nhãn; hồ sơ này chưa xác nhận đầy đủ cặp tên nguồn.";
const NOTE_18 = "Hình 4.38 dùng “hãm” cho retinaculum; app dùng biến thể “mạc giữ gân”. Peroneus/fibularis là biến thể danh pháp.";
const NOTE_19 = "Mục 2.2.3 áo cơ hầu: danh sách cơ theo lớp, không có cặp Latin riêng từng cơ tại đoạn này.";
const NOTE_20 = "Tài liệu ghi nhóm cơ gian gai, chưa liệt kê riêng các phần cổ/ngực/thắt lưng.";
const NOTE_21 = "Tài liệu ghi bó trong/bó ngoài; app giữ cách gọi “đầu” theo English nguồn. Chỉ đối chiếu tên, không dùng mô tả điểm bám hay thần kinh từ slide làm nguồn cho tính năng.";
const NOTE_22 = "Mục các dây chằng ngoài bao khớp gối. “Hãm bánh chè” và “mạc giữ bánh chè” là hai cách chuyển ngữ retinaculum trong hồ sơ này.";
const NOTE_23 = "Chưa tìm được nguồn tiếng Việt đủ cụ thể cho nhóm nâng sườn ngắn trong các tài liệu đã đọc.";
const NOTE_24 = "Chưa tìm được nguồn tiếng Việt đủ cụ thể cho nhóm nâng sườn dài trong các tài liệu đã đọc.";
const NOTE_25 = "Hình 4.12 chỉ ghi nhóm “cơ nhiều chân”; chưa đối chiếu được riêng phần cổ, ngực, thắt lưng.";
const NOTE_26 = "Giáo trình 2004 dùng thẳng/chéo, phễu ngang; Hình 3 của bài báo 2025 dùng đứng/chếch, ngang phễu. Giữ tên hiển thị hiện tại và ghi biến thể; không sao chép hình hoặc lấy số đo từ bài báo.";
const NOTE_27 = "Tên Việt trong Hình 4.11 và ngữ cảnh các cơ dưới chẩm; “nhỏ/bé” là biến thể cách gọi. Không xác nhận vị trí trên mesh.";
const NOTE_28 = "Chưa có đối chiếu đủ rõ cặp tên của nhóm cơ xoay trong các tài liệu đã đọc.";
const NOTE_29 = "Chưa tìm được tên cơ gai đầu trong các trang giáo trình đã đọc; không suy từ cơ gai ngực.";
const NOTE_30 = "Chưa tìm được tên cơ gai cổ trong các trang giáo trình đã đọc; không suy từ cơ gai ngực.";
const NOTE_31 = "Chưa tìm được đối chiếu tiếng Việt cho dây chằng ngang nông đốt bàn tay; không lấy nguồn dây chằng ngang cổ tay hay dây chằng ngang sâu thay thế.";
const NOTE_32 = "Chưa tìm được đối chiếu tiếng Việt cho dây chằng ngang nông đốt bàn chân; không lấy nguồn dây chằng ngang sâu thay thế.";
const NOTE_33 = "Đã đối chiếu tên cơ mẹ; chưa tìm được cặp tên riêng cho gân trong những trang đã đọc. Từ “gân” là thành phần chuyển ngữ theo English nguồn.";

/** Every current translated key has an explicit result, including eight gaps. */
export const ATLAS_TERMINOLOGY_COMPARISONS: Readonly<Record<string, AtlasTerminologyComparison>> = {
  "Abdominal part of pectoralis major muscle": comparison("matched", "phcn", 32, "Cơ ngực lớn / phần bụng", NOTE_1),
  "Abductor digiti minimi of foot": comparison("matched", "hmu-2004", 133, "Cơ giạng ngón chân út (m. abductor digiti minimi)"),
  "Abductor digiti minimi of hand": comparison("matched", "hmu-2004", 119, "Cơ giạng ngón tay út (m. abductor digiti minimi)"),
  "Abductor hallucis": comparison("matched", "hmu-2004", 133, "Cơ giạng ngón chân cái (m. abductor hallucis)"),
  "Abductor pollicis brevis": comparison("matched", "hmu-2004", 119, "Cơ giạng ngón tay cái ngắn (m. abductor pollicis brevis)"),
  "Abductor pollicis longus": comparison("matched", "hmu-2004", 117, "Cơ giạng ngón tay cái dài"),
  "Acromial part of deltoid muscle": comparison("partial", "hmu-2004", 111, "Cơ delta (m. deltoideus)", NOTE_2),
  "Adductor brevis": comparison("matched", "hmu-2004", 124, "Cơ khép ngắn (m. adductor brevis)"),
  "Adductor longus": comparison("matched", "hmu-2004", 124, "Cơ khép dài (m. adductor longus)"),
  "Adductor magnus": comparison("matched", "hmu-2004", 124, "Cơ khép lớn (m. adductor magnus)"),
  "Adductor minimus": { status: "unresolved", references: [], note: NOTE_3 },
  "Anconeus muscle": comparison("matched", "hmu-2004", 117, "Cơ khuỷu (m. anconeus)"),
  "Anterior belly of digastric muscle": comparison("matched", "hmu-2004", 86, "Bụng trước cơ hai bụng"),
  "Ary-epiglottic part of oblique arytenoid muscle": comparison("partial", "hmu-2004", 184, "Cơ phễu-thượng thiệt", NOTE_4),
  "Ascending part of trapezius muscle": comparison("partial", "hmu-2004", 110, "Cơ thang (m. trapezius)", NOTE_5),
  "Brachialis muscle": comparison("matched", "hmu-2004", 113, "Cơ cánh tay (m. brachialis)"),
  "Brachioradialis muscle": comparison("matched", "hmu-2004", 117, "Cơ cánh tay-quay (m. brachioradialis)"),
  "Calcaneal tendon": comparison("matched", "hmu-2004", 128, "Gân gót", NOTE_6),
  "Clavicular head of pectoralis major muscle": comparison("matched", "phcn", 32, "Cơ ngực lớn / phần đòn", NOTE_1),
  "Clavicular part of deltoid muscle": comparison("partial", "hmu-2004", 111, "Cơ delta (m. deltoideus)", NOTE_2),
  "Coccygeus muscle": comparison("matched", "hmu-2004", 100, "Cơ cụt; cơ ngồi-cụt", NOTE_7),
  "Coracobrachialis muscle": comparison("matched", "hmu-2004", 111, "Cơ quạ cánh tay (m. coracobrachialis)"),
  "Deep head of flexor pollicis brevis": comparison("matched", "hmu-2004", 119, "Cơ gấp ngón tay cái ngắn / đầu sâu"),
  "Deep head of pronator teres": comparison("partial", "phcn", 24, "Cơ sấp tròn (M. pronator teres) / đầu trụ", NOTE_8),
  "Descending part of trapezius muscle": comparison("partial", "hmu-2004", 110, "Cơ thang (m. trapezius)", NOTE_5),
  "Diaphragm": comparison("matched", "hmu-2004", 97, "Cơ hoành (diaphragma)"),
  "Dorsal interossei muscles of foot": comparison("matched", "hmu-2004", 133, "Các cơ gian cốt mu chân"),
  "Dorsal interossei muscles of hand": comparison("matched", "hmu-2004", 120, "Các cơ gian cốt mu tay"),
  "Dorsal parts of lateral intertransversarii lumborum muscles": comparison("partial", "hmu-2004", 91, "Các cơ gian ngang (musculi intertransversarii)", NOTE_9),
  "Extensor carpi radialis brevis": comparison("matched", "hmu-2004", 117, "Cơ duỗi cổ tay quay ngắn"),
  "Extensor carpi radialis longus": comparison("matched", "hmu-2004", 117, "Cơ duỗi cổ tay quay dài"),
  "Extensor digiti minimi": comparison("matched", "hmu-2004", 117, "Cơ duỗi ngón tay út"),
  "Extensor digitorum": comparison("matched", "hmu-2004", 117, "Cơ duỗi các ngón tay (m. extensor digitorum)"),
  "Extensor digitorum brevis": comparison("matched", "hmu-2004", 129, "Cơ duỗi các ngón chân ngắn (m. extensor digitorum brevis)"),
  "Extensor digitorum longus": comparison("matched", "hmu-2004", 126, "Cơ duỗi các ngón chân dài"),
  "Extensor hallucis brevis": comparison("matched", "hmu-2004", 129, "Cơ duỗi ngón chân cái ngắn (m. extensor hallucis brevis)"),
  "Extensor hallucis longus": comparison("matched", "hmu-2004", 126, "Cơ duỗi ngón chân cái dài"),
  "Extensor indicis": comparison("matched", "hmu-2004", 117, "Cơ duỗi ngón tay trỏ"),
  "Extensor pollicis brevis": comparison("matched", "hmu-2004", 117, "Cơ duỗi ngón tay cái ngắn"),
  "Extensor pollicis longus": comparison("matched", "hmu-2004", 117, "Cơ duỗi ngón cái dài"),
  "Extensor retinaculum of wrist": comparison("matched", "hmu-2004", 116, "Hãm gân duỗi", NOTE_10),
  "External abdominal oblique muscle": comparison("matched", "hmu-2004", 94, "Cơ chéo bụng ngoài (m. obliquus externus abdominis)"),
  "External anal sphincter": comparison("matched", "hmu-2004", 102, "Cơ thắt hậu môn ngoài (m. sphincter ani externus)"),
  "External intercostal muscles": comparison("matched", "hmu-2004", 92, "Cơ gian sườn ngoài"),
  "External part of thyro-arytenoid muscle": comparison("partial", "hmu-2004", 184, "Cơ giáp-phễu (m. thyro-arytenoideus)", NOTE_11),
  "Fibularis brevis muscle": comparison("matched", "hmu-2004", 127, "Cơ mác ngắn (m. peroneus brevis)", NOTE_12),
  "Fibularis longus muscle": comparison("matched", "hmu-2004", 126, "Cơ mác dài (m. peroneus longus)", NOTE_12),
  "Fibularis tertius muscle": comparison("matched", "hmu-2004", 126, "Cơ mác ba (m. peroneus tertius)", NOTE_12),
  "Flexor carpi radialis": comparison("matched", "hmu-2004", 115, "Cơ gấp cổ tay quay (m. flexor carpi radialis)"),
  "Flexor digiti minimi of foot": comparison("partial", "hmu-2004", 133, "Cơ gấp ngón út ngắn (m. flexor digiti minimi brevis)", NOTE_13),
  "Flexor digiti minimi of hand": comparison("partial", "hmu-2004", 119, "Cơ gấp ngón tay út ngắn (m. flexor digiti minimi brevis)", NOTE_14),
  "Flexor digitorum brevis": comparison("matched", "hmu-2004", 133, "Cơ gấp các ngón chân ngắn"),
  "Flexor digitorum longus": comparison("matched", "hmu-2004", 130, "Cơ gấp các ngón chân dài"),
  "Flexor digitorum profundus": comparison("matched", "hmu-2004", 115, "Cơ gấp các ngón tay sâu (m. flexor digitorum profundus)"),
  "Flexor hallucis longus": comparison("matched", "hmu-2004", 130, "Cơ gấp ngón chân cái dài"),
  "Flexor pollicis longus": comparison("matched", "hmu-2004", 115, "Cơ gấp ngón tay cái dài (m. flexor pollicis longus)"),
  "Flexor retinaculum of ankle": comparison("matched", "hmu-2004", 128, "Hãm gân gấp", NOTE_6),
  "Flexor retinaculum of wrist": comparison("matched", "hmu-2004", 114, "Hãm gân gấp", NOTE_15),
  "Geniohyoid muscle": comparison("matched", "hmu-2004", 87, "Cơ cằm-móng (m. geniohyoideus)"),
  "Gluteus maximus muscle": comparison("matched", "hmu-2004", 121, "Cơ mông lớn (m. gluteus maximus)"),
  "Gluteus medius muscle": comparison("matched", "hmu-2004", 121, "Cơ mông nhỡ (m. gluteus medius)"),
  "Gluteus minimus muscle": comparison("matched", "hmu-2004", 121, "Cơ mông bé (m. gluteus minimus)"),
  "Gracilis muscle": comparison("matched", "hmu-2004", 124, "Cơ thon (m. gracilis)"),
  "Humeral head of extensor carpi ulnaris": comparison("partial", "hmu-2004", 117, "Cơ duỗi cổ tay-trụ (m. extensor carpi ulnaris)", NOTE_16),
  "Humeral head of flexor carpi ulnaris": comparison("matched", "phcn", 26, "Cơ gấp cổ tay trụ / đầu cánh tay"),
  "Humero-ulnar head of flexor digitorum superficialis": comparison("matched", "hmu-2004", 115, "Cơ gấp các ngón tay nông / đầu cánh tay trụ"),
  "Iliacus muscle": comparison("matched", "hmu-2004", 124, "Cơ chậu (m. iliacus)"),
  "Iliococcygeus muscle": comparison("matched", "hmu-2004", 99, "Cơ chậu-cụt (m. iliococcygeus)"),
  "Iliocostalis colli muscle": comparison("partial", "hmu-2004", 90, "Cơ chậu sườn cổ", NOTE_17),
  "Iliocostalis lumborum muscle": comparison("partial", "hmu-2004", 90, "Cơ chậu sườn-thắt lưng", NOTE_17),
  "Iliocostalis thoracis muscle": comparison("partial", "hmu-2004", 90, "Cơ chậu sườn-ngực", NOTE_17),
  "Iliotibial tract": comparison("matched", "hmu-2004", 121, "Dải chậu-chày"),
  "Inferior extensor retinaculum of ankle": comparison("matched", "hmu-2004", 127, "Hãm gân duỗi dưới", NOTE_18),
  "Inferior fibular retinaculum": comparison("matched", "hmu-2004", 127, "Hãm cơ mác dưới", NOTE_18),
  "Inferior gemellus muscle": comparison("matched", "hmu-2004", 121, "Cơ sinh đôi dưới"),
  "Inferior pharyngeal constrictor": comparison("matched", "hmu-2004", 180, "Cơ khít hầu dưới", NOTE_19),
  "Infraspinatus muscle": comparison("matched", "hmu-2004", 111, "Cơ dưới gai (m. infraspinatus)"),
  "Inguinal ligament": comparison("matched", "hmu-2004", 95, "Dây chằng bẹn"),
  "Innermost intercostal muscles": comparison("matched", "hmu-2004", 92, "Cơ gian sườn trong cùng"),
  "Intermediate tendon of digastric muscle": comparison("matched", "hmu-2004", 87, "Gân trung gian cơ hai bụng"),
  "Internal abdominal oblique muscle": comparison("matched", "hmu-2004", 94, "Cơ chéo bụng trong (m. obliquus internus abdominis)"),
  "Internal intercostal muscles": comparison("matched", "hmu-2004", 92, "Cơ gian sườn trong (Mm. intercostales interni)"),
  "Interspinales colli muscles": comparison("partial", "hmu-2004", 91, "Các cơ gian gai (musculi interspinales)", NOTE_20),
  "Interspinales lumborum muscles": comparison("partial", "hmu-2004", 91, "Các cơ gian gai (musculi interspinales)", NOTE_20),
  "Interspinales thoracis muscles": comparison("partial", "hmu-2004", 91, "Các cơ gian gai (musculi interspinales)", NOTE_20),
  "Lateral crico-arytenoid muscle": comparison("matched", "hmu-2004", 183, "Cơ nhẫn-phễu bên"),
  "Lateral head of flexor hallucis brevis": comparison("matched", "phcn", 48, "Cơ gấp ngắn ngón cái / bó ngoài", NOTE_21),
  "Lateral head of gastrocnemius": comparison("matched", "hmu-2004", 130, "Cơ bụng chân / đầu ngoài"),
  "Lateral head of triceps brachii": comparison("matched", "hmu-2004", 113, "Cơ tam đầu cánh tay / đầu ngoài"),
  "Lateral patellar retinaculum": comparison("matched", "hmu-2004", 70, "Hãm bánh chè ngoài (retinaculum patellae laterale)", NOTE_22),
  "Latissimus dorsi muscle": comparison("matched", "hmu-2004", 110, "Cơ lưng rộng (m. latissimus dorsi)"),
  "Levator scapulae": comparison("matched", "hmu-2004", 111, "Cơ nâng vai (m. levator scapulae)"),
  "Levatores breves costarum": { status: "unresolved", references: [], note: NOTE_23 },
  "Levatores longi costarum": { status: "unresolved", references: [], note: NOTE_24 },
  "Linea alba": comparison("matched", "hmu-2004", 94, "Đường trắng"),
  "Long head of biceps brachii": comparison("matched", "hmu-2004", 113, "Cơ nhị đầu cánh tay / đầu dài"),
  "Long head of biceps femoris": comparison("matched", "hmu-2004", 125, "Cơ nhị đầu đùi / đầu dài"),
  "Long head of triceps brachii": comparison("matched", "hmu-2004", 113, "Cơ tam đầu cánh tay / đầu dài"),
  "Longissimus capitis muscle": comparison("partial", "hmu-2004", 90, "Cơ dài đầu", NOTE_17),
  "Longissimus colli muscle": comparison("partial", "hmu-2004", 90, "Cơ dài cổ", NOTE_17),
  "Longissimus thoracis muscle": comparison("partial", "hmu-2004", 90, "Cơ dài ngực", NOTE_17),
  "Longus capitis muscle": comparison("matched", "hmu-2004", 88, "Cơ dài đầu (m. longus capitis)"),
  "Longus colli muscle": comparison("matched", "hmu-2004", 88, "Cơ dài cổ (m. longus colli)"),
  "Lumbrical muscles of foot": comparison("matched", "hmu-2004", 133, "Các cơ giun (Mm. lumbricales)"),
  "Lumbrical muscles of hand": comparison("matched", "hmu-2004", 120, "Các cơ giun (Mm. lumbricales)"),
  "Medial head of flexor hallucis brevis": comparison("matched", "phcn", 48, "Cơ gấp ngắn ngón cái / bó trong", NOTE_21),
  "Medial head of gastrocnemius": comparison("matched", "hmu-2004", 130, "Cơ bụng chân / đầu trong"),
  "Medial head of triceps brachii": comparison("matched", "hmu-2004", 113, "Cơ tam đầu cánh tay / đầu trong"),
  "Medial patellar retinaculum": comparison("matched", "hmu-2004", 70, "Hãm bánh chè trong (retinaculum patellae mediale)", NOTE_22),
  "Middle pharyngeal constrictor": comparison("matched", "hmu-2004", 180, "Cơ khít hầu giữa", NOTE_19),
  "Multifidus colli muscle": comparison("partial", "hmu-2004", 90, "Cơ nhiều chân", NOTE_25),
  "Multifidus lumborum muscle": comparison("partial", "hmu-2004", 90, "Cơ nhiều chân", NOTE_25),
  "Multifidus thoracis muscle": comparison("partial", "hmu-2004", 90, "Cơ nhiều chân", NOTE_25),
  "Mylohyoid muscle": comparison("matched", "hmu-2004", 87, "Cơ hàm-móng (m. mylohyoideus)"),
  "Oblique head of adductor hallucis": comparison("matched", "hmu-2004", 133, "Cơ khép ngón cái / đầu chéo"),
  "Oblique head of adductor pollicis": comparison("matched", "hmu-2004", 119, "Cơ khép ngón tay cái / đầu chéo"),
  "Oblique part of cricothyroid muscle": { status: "matched", references: [{ sourceId: "hmu-2004", page: 183, sourceTerm: "Cơ nhẫn-giáp / phần chéo" }, { sourceId: "pnt-2025", page: 3, sourceTerm: "Cơ nhẫn giáp / phần chếch" }], note: NOTE_26 },
  "Obliquus inferior capitis muscle": comparison("matched", "hmu-2004", 89, "Cơ chéo đầu dưới", NOTE_27),
  "Obliquus superior capitis muscle": comparison("matched", "hmu-2004", 89, "Cơ chéo đầu trên", NOTE_27),
  "Obturator externus": comparison("matched", "hmu-2004", 121, "Cơ bịt ngoài"),
  "Obturator internus": comparison("matched", "hmu-2004", 121, "Cơ bịt trong"),
  "Omohyoid muscle": comparison("matched", "hmu-2004", 87, "Cơ vai-móng (m. omohyoideus)"),
  "Opponens digiti minimi muscle of foot": comparison("matched", "hmu-2004", 133, "Cơ đối chiếu ngón út (m. opponens digiti minimi)"),
  "Opponens digiti minimi muscle of hand": comparison("matched", "hmu-2004", 120, "Cơ đối chiếu ngón tay út (m. opponens digiti minimi)"),
  "Opponens pollicis muscle": comparison("matched", "hmu-2004", 119, "Cơ đối chiếu ngón tay cái (m. opponens pollicis)"),
  "Palatopharyngeus muscle": comparison("matched", "hmu-2004", 183, "Cơ khẩu cái-hầu"),
  "Palmar interossei muscles": comparison("matched", "hmu-2004", 120, "Các cơ gian cốt gan tay"),
  "Palmaris longus muscle": comparison("matched", "hmu-2004", 115, "Cơ gan tay dài (m. palmaris longus)"),
  "Pectineus muscle": comparison("matched", "hmu-2004", 124, "Cơ lược (m. pectineus)"),
  "Pectoralis minor muscle": comparison("matched", "hmu-2004", 110, "Cơ ngực bé (m. pectoralis minor)"),
  "Piriformis muscle": comparison("matched", "hmu-2004", 121, "Cơ hình quả lê (m. piriformis)"),
  "Plantar aponeurosis": comparison("matched", "hmu-2004", 131, "Cân gan chân"),
  "Plantar interossei muscles": comparison("matched", "hmu-2004", 133, "Các cơ gian cốt gan chân"),
  "Plantaris muscle": comparison("matched", "hmu-2004", 130, "Cơ gan chân (m. plantaris)"),
  "Platysma": comparison("matched", "hmu-2004", 85, "Cơ bám da cổ (platysma)"),
  "Popliteus muscle": comparison("matched", "hmu-2004", 130, "Cơ khoeo (m. popliteus)"),
  "Posterior belly of digastric muscle": comparison("matched", "hmu-2004", 86, "Bụng sau cơ hai bụng"),
  "Posterior crico-arytenoid muscle": comparison("matched", "hmu-2004", 183, "Cơ nhẫn-phễu sau"),
  "Pronator quadratus": comparison("matched", "hmu-2004", 115, "Cơ sấp vuông (m. pronator quadratus)"),
  "Psoas major": comparison("matched", "hmu-2004", 124, "Cơ thắt lưng lớn (m. psoas major)"),
  "Pubo-analis muscle": comparison("matched", "hmu-2004", 99, "Cơ mu-hậu môn (m. puboanalis)"),
  "Pubococcygeus muscle": comparison("matched", "hmu-2004", 99, "Cơ mu-cụt (m. pubococcygeus)"),
  "Pyramidalis muscle": comparison("matched", "hmu-2004", 94, "Cơ tháp (m. pyramidalis)"),
  "Quadratus femoris muscle": comparison("matched", "hmu-2004", 121, "Cơ vuông đùi (m. quadratus femoris)"),
  "Quadratus lumborum muscle": comparison("matched", "hmu-2004", 97, "Cơ vuông thắt lưng"),
  "Quadratus plantae muscle": comparison("matched", "hmu-2004", 133, "Cơ vuông gan chân (m. quadratus plantae)"),
  "Radial head of flexor digitorum superficialis": comparison("matched", "hmu-2004", 115, "Cơ gấp các ngón tay nông / đầu quay"),
  "Rectus abdominis muscle": comparison("matched", "hmu-2004", 94, "Cơ thẳng bụng (m. rectus abdominis)"),
  "Rectus anterior capitis muscle": comparison("matched", "hmu-2004", 88, "Cơ thẳng đầu trước (m. rectus capitis anterior)"),
  "Rectus femoris muscle": comparison("matched", "hmu-2004", 124, "Cơ thẳng đùi (m. rectus femoris)"),
  "Rectus lateralis capitis muscle": comparison("matched", "hmu-2004", 88, "Cơ thẳng đầu bên (m. rectus capitis lateralis)"),
  "Rectus posterior major capitis muscle": comparison("matched", "hmu-2004", 89, "Cơ thẳng đầu sau lớn", NOTE_27),
  "Rectus posterior minor capitis muscle": comparison("matched", "hmu-2004", 89, "Cơ thẳng đầu sau nhỏ", NOTE_27),
  "Rhomboid major muscle": comparison("matched", "hmu-2004", 111, "Cơ trám lớn (m. rhomboideus major)"),
  "Rhomboid minor muscle": comparison("matched", "hmu-2004", 111, "Cơ trám bé (m. rhomboideus minor)"),
  "Rotatores": { status: "unresolved", references: [], note: NOTE_28 },
  "Sartorius muscle": comparison("matched", "hmu-2004", 124, "Cơ may (m. sartorius)"),
  "Scalenus anterior muscle": comparison("matched", "hmu-2004", 88, "Cơ bậc thang trước (m. scalenus anterior)"),
  "Scalenus medius muscle": comparison("matched", "hmu-2004", 88, "Cơ bậc thang giữa (m. scalenus medius)"),
  "Scalenus posterior muscle": comparison("matched", "hmu-2004", 88, "Cơ bậc thang sau (m. scalenus posterior)"),
  "Scapular spinal part of deltoid muscle": comparison("partial", "hmu-2004", 111, "Cơ delta (m. deltoideus)", NOTE_2),
  "Semimembranosus muscle": comparison("matched", "hmu-2004", 125, "Cơ bán màng (m. semimembranosus)"),
  "Semispinalis colli muscle": comparison("partial", "hmu-2004", 90, "Cơ bán gai cổ", NOTE_17),
  "Semispinalis thoracis muscle": comparison("partial", "hmu-2004", 90, "Cơ bán gai ngực", NOTE_17),
  "Semitendinosus muscle": comparison("matched", "hmu-2004", 125, "Cơ bán gân (m. semitendinosus)"),
  "Serratus anterior muscle": comparison("matched", "hmu-2004", 110, "Cơ răng trước (m. serratus anterior)"),
  "Serratus posterior inferior muscle": comparison("matched", "hmu-2004", 91, "Cơ răng sau dưới"),
  "Serratus posterior superior muscle": comparison("matched", "hmu-2004", 91, "Cơ răng sau trên (m. serratus posterior superior)"),
  "Short head of biceps brachii": comparison("matched", "hmu-2004", 113, "Cơ nhị đầu cánh tay / đầu ngắn"),
  "Short head of biceps femoris": comparison("matched", "hmu-2004", 125, "Cơ nhị đầu đùi / đầu ngắn"),
  "Soleus muscle": comparison("matched", "hmu-2004", 130, "Cơ dép (m. soleus)"),
  "Spinalis capitis muscle": { status: "unresolved", references: [], note: NOTE_29 },
  "Spinalis colli muscle": { status: "unresolved", references: [], note: NOTE_30 },
  "Spinalis thoracis muscle": comparison("partial", "hmu-2004", 90, "Cơ gai ngực", NOTE_17),
  "Splenius capitis muscle": comparison("partial", "hmu-2004", 90, "Cơ gối đầu", NOTE_17),
  "Splenius colli muscle": comparison("partial", "hmu-2004", 90, "Cơ gối cổ", NOTE_17),
  "Sternocleidomastoid muscle": comparison("matched", "hmu-2004", 85, "Cơ ức-đòn-chũm (m. sternocleidomastoideus)"),
  "Sternocostal head of pectoralis major muscle": comparison("matched", "phcn", 32, "Cơ ngực lớn / phần ức sườn", NOTE_1),
  "Sternohyoid muscle": comparison("matched", "hmu-2004", 87, "Cơ ức-móng (m. sternohyoideus)"),
  "Sternothyroid muscle": comparison("matched", "hmu-2004", 87, "Cơ ức-giáp (m. sternothyroideus)"),
  "Straight part of cricothyroid muscle": { status: "matched", references: [{ sourceId: "hmu-2004", page: 183, sourceTerm: "Cơ nhẫn-giáp / phần thẳng" }, { sourceId: "pnt-2025", page: 3, sourceTerm: "Cơ nhẫn giáp / phần đứng" }], note: NOTE_26 },
  "Stylohyoid muscle": comparison("matched", "hmu-2004", 87, "Cơ trâm-móng (m. stylohyoideus)"),
  "Stylopharyngeus muscle": comparison("matched", "hmu-2004", 180, "Cơ trâm hầu", NOTE_19),
  "Subclavius muscle": comparison("matched", "hmu-2004", 110, "Cơ dưới đòn (m. subclavius)"),
  "Subscapularis muscle": comparison("matched", "hmu-2004", 111, "Cơ dưới vai (m. subscapularis)"),
  "Superficial head of flexor pollicis brevis": comparison("matched", "hmu-2004", 119, "Cơ gấp ngón tay cái ngắn / đầu nông"),
  "Superficial head of pronator teres": comparison("partial", "phcn", 24, "Cơ sấp tròn (M. pronator teres) / đầu cánh tay", NOTE_8),
  "Superficial transverse metacarpal ligament": { status: "unresolved", references: [], note: NOTE_31 },
  "Superficial transverse metatarsal ligament": { status: "unresolved", references: [], note: NOTE_32 },
  "Superior extensor retinaculum of ankle": comparison("matched", "hmu-2004", 127, "Hãm gân duỗi trên", NOTE_18),
  "Superior fibular retinaculum": comparison("matched", "hmu-2004", 127, "Hãm cơ mác trên", NOTE_18),
  "Superior gemellus muscle": comparison("matched", "hmu-2004", 121, "Cơ sinh đôi trên"),
  "Superior pharyngeal constrictor": comparison("matched", "hmu-2004", 180, "Cơ khít hầu trên", NOTE_19),
  "Supinator": comparison("matched", "hmu-2004", 117, "Cơ ngửa (m. supinator)"),
  "Supraspinatus muscle": comparison("matched", "hmu-2004", 111, "Cơ trên gai (m. supraspinatus)"),
  "Tendinous arch of levator ani": comparison("matched", "hmu-2004", 99, "Cung gân cơ nâng hậu môn"),
  "Tendon of extensor digitorum longus": comparison("partial", "hmu-2004", 126, "Cơ duỗi các ngón chân dài", NOTE_33),
  "Tensor fasciae latae": comparison("matched", "hmu-2004", 121, "Cơ căng mạc đùi"),
  "Teres major muscle": comparison("matched", "hmu-2004", 111, "Cơ tròn lớn (m. teres major)"),
  "Teres minor muscle": comparison("matched", "hmu-2004", 111, "Cơ tròn bé (m. teres minor)"),
  "Thyro-epiglottic part of thyro-arytenoid muscle": comparison("partial", "hmu-2004", 184, "Cơ giáp-thượng thiệt", NOTE_4),
  "Thyrohyoid muscle": comparison("matched", "hmu-2004", 87, "Cơ giáp-móng (m. thyrohyoideus)"),
  "Tibialis anterior muscle": comparison("matched", "hmu-2004", 126, "Cơ chày trước (m. tibialis anterior)"),
  "Tibialis posterior muscle": comparison("matched", "hmu-2004", 130, "Cơ chày sau (m. tibialis posterior)"),
  "Transverse arytenoid muscle": { status: "matched", references: [{ sourceId: "hmu-2004", page: 183, sourceTerm: "Cơ phễu ngang" }, { sourceId: "pnt-2025", page: 3, sourceTerm: "Cơ ngang phễu" }], note: NOTE_26 },
  "Transverse head of adductor hallucis": comparison("matched", "hmu-2004", 133, "Cơ khép ngón cái / đầu ngang"),
  "Transverse head of adductor pollicis": comparison("matched", "hmu-2004", 119, "Cơ khép ngón tay cái / đầu ngang"),
  "Transverse part of trapezius muscle": comparison("partial", "hmu-2004", 110, "Cơ thang (m. trapezius)", NOTE_5),
  "Transversus abdominis muscle": comparison("matched", "hmu-2004", 94, "Cơ ngang bụng"),
  "Transversus thoracis muscle": comparison("matched", "hmu-2004", 92, "Cơ ngang ngực (m. transversus thoracis)"),
  "Ulnar head of extensor carpi ulnaris": comparison("partial", "hmu-2004", 117, "Cơ duỗi cổ tay-trụ (m. extensor carpi ulnaris)", NOTE_16),
  "Ulnar head of flexor carpi ulnaris": comparison("matched", "phcn", 26, "Cơ gấp cổ tay trụ / đầu trụ"),
  "Vastus intermedius muscle": comparison("matched", "hmu-2004", 124, "Cơ rộng giữa (m. vastus intermedius)"),
  "Vastus lateralis muscle": comparison("matched", "hmu-2004", 124, "Cơ rộng ngoài (m. vastus lateralis)"),
  "Vastus medialis muscle": comparison("matched", "hmu-2004", 124, "Cơ rộng trong (m. vastus medialis)"),
  "Ventral parts of lateral intertransversarii lumborum muscles": comparison("partial", "hmu-2004", 91, "Các cơ gian ngang (musculi intertransversarii)", NOTE_9),
};

export function getAtlasTerminologyComparison(english: string): AtlasTerminologyComparison | null {
  return Object.hasOwn(ATLAS_TERMINOLOGY_COMPARISONS, english)
    ? ATLAS_TERMINOLOGY_COMPARISONS[english]
    : null;
}

export function atlasTerminologyReferenceUrl(reference: AtlasTerminologyReference): string {
  return `${ATLAS_TERMINOLOGY_SOURCES[reference.sourceId].url}#page=${reference.page}`;
}
