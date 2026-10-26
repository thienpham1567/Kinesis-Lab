import type { ChatImageClaim, ChatImageSource } from "./illustration-types";

const checkedAt = "2026-10-26";
export const POSITIONAL_SOURCES: ChatImageSource[] = [
  {
    id: "medical-position-openstax", title: "OpenStax A&P 2e §1.6 · Anatomical Terminology",
    url: "https://openstax.org/books/anatomy-and-physiology-2e/pages/1-6-anatomical-terminology", checkedAt,
    access: "Đã đọc các mục Anatomical Position, Directional Terms và Body Planes. Đối chiếu thuật ngữ định hướng; không xác nhận hình AI hay số đo mô.",
  },
  {
    id: "medical-position-unlv", title: "UNLV School of Medicine · Terms of laterality",
    url: "https://som-anatomy-tables.faculty.unlv.edu/resources/terminology/term10.html", checkedAt,
    access: "Đã đọc trang 10: định nghĩa ipsilateral/contralateral và ví dụ phải–trái. Không phải thẩm định ảnh.",
  },
  {
    id: "medical-position-loyola", title: "Loyola University Chicago · Chest reference lines",
    url: "https://www.meddean.luc.edu/lumen/meded/medicine/pulmonar/apd/lines.htm", checkedAt,
    access: "Đã đọc mô tả chữ của anterior axillary và mid-axillary lines. Chỉ đường quy ước trên bề mặt; không hướng dẫn thủ thuật hoặc định vị cá nhân.",
  },
];

export const POSITIONAL_CLAIMS: ChatImageClaim[] = [
  { id: "position:reference-frame", text: "Các hướng theo tư thế giải phẫu chuẩn; phải/trái theo người được vẽ.", sourceIds: [POSITIONAL_SOURCES[0].id], requiredForDrawing: true },
  { id: "position:midline", text: "Midline là đường giữa; mặt phẳng giữa chia cơ thể thành hai phần phải–trái bằng nhau.", sourceIds: [POSITIONAL_SOURCES[0].id] },
  { id: "position:axes", text: "Anterior/posterior: trước/sau; superior/inferior: trên/dưới so với cấu trúc làm mốc.", sourceIds: [POSITIONAL_SOURCES[0].id] },
  { id: "position:medial-lateral", text: "Medial/lateral: hướng về/ra xa đường giữa cơ thể.", sourceIds: [POSITIONAL_SOURCES[0].id] },
  { id: "position:proximal-distal", text: "Proximal/distal: gần/xa gốc chi hoặc chỗ chi gắn vào thân; không mặc định lấy nguyên ủy cơ làm mốc.", sourceIds: [POSITIONAL_SOURCES[0].id], requiredForDrawing: true },
  { id: "position:depth", text: "Superficial/deep: gần/xa bề mặt cơ thể; là quan hệ tương đối.", sourceIds: [POSITIONAL_SOURCES[0].id] },
  { id: "position:laterality", text: "Ipsilateral/contralateral: các cấu trúc cùng/khác phía cơ thể; không diễn tả ở phía trên.", sourceIds: [POSITIONAL_SOURCES[1].id] },
  { id: "position:axillary-lines", text: "Đường nách trước đi dọc nếp nách trước; đường nách giữa đi thẳng đứng ở giữa đường nách trước và sau.", sourceIds: [POSITIONAL_SOURCES[2].id] },
];
