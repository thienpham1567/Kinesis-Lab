import Image from "next/image";
import Link from "next/link";
import { LANDING_PREVIEWS, LANDING_STRUCTURE_COUNT } from "@/lib/landing-data";
import { LandingRegionPreview } from "./LandingRegionPreview";
import { Icon, type IconName } from "./WorkspaceUI";

const sourceGroups = Array.from(
  new Set(
    LANDING_PREVIEWS.flatMap((preview) =>
      preview.sources.map((source) => source.url),
    ),
  ),
).map((url) => {
  const previews = LANDING_PREVIEWS.filter((preview) =>
    preview.sources.some((source) => source.url === url),
  );
  return {
    source: previews[0].sources.find((source) => source.url === url)!,
    previews,
  };
});

const features: {
  icon: IconName;
  title: string;
  description: string;
  href: string;
  cta: string;
}[] = [
  {
    icon: "atlas",
    title: "Atlas giải phẫu 3D",
    description:
      "Xoay mô hình, chọn cấu trúc và quan sát theo lớp. Xem riêng xuất xứ mô hình và kiến thức được đối chiếu theo từng mục.",
    href: "/atlas",
    cta: "Khám phá Atlas",
  },
  {
    icon: "activity",
    title: "Cơ & bài tập",
    description:
      "Tra nhóm cơ liên quan, cách thực hiện và lưu ý của từng bài. Từ bài tập, mở nhật ký để ghi lại buổi tập của học viên.",
    href: "/atlas?tab=hypertrophy",
    cta: "Tra bài tập",
  },
  {
    icon: "message",
    title: "Bàn tư vấn AI",
    description:
      "Đặt câu hỏi về giải phẫu và vận động. Đọc nguồn được cung cấp, kiểm tra câu trả lời trước khi áp dụng. AI cần kết nối dịch vụ.",
    href: "/consult",
    cta: "Mở bàn tư vấn",
  },
  {
    icon: "target",
    title: "Trigger Point",
    description:
      "Tra cứu theo cơ hoặc vùng đau minh họa, kèm giới hạn bằng chứng. Bản đồ không xác định nguồn đau của một người.",
    href: "/atlas?tab=trigger_points",
    cta: "Mở mục Trigger Point",
  },
  {
    icon: "users",
    title: "Hồ sơ học viên",
    description:
      "Ghi sàng lọc trước tập, chỉ số và nhật ký huấn luyện. Kiểm tra chế độ lưu trữ của ứng dụng trước khi nhập thông tin cá nhân.",
    href: "/clients",
    cta: "Mở hồ sơ",
  },
  {
    icon: "book",
    title: "Giáo trình NCSF",
    description:
      "Đọc giáo trình tiếng Việt và làm câu hỏi ôn tập. Tài liệu được lưu riêng tư, cần mật khẩu dành cho người có quyền truy cập.",
    href: "/knowledge",
    cta: "Vào mục NCSF",
  },
];

const faqs = [
  {
    q: "Tôi nên bắt đầu từ đâu?",
    a: "Bạn có thể xem ví dụ có nguồn ngay trên trang này, rồi mở Atlas để khám phá cấu trúc 3D. Không cần cài phần mềm. Với sổ tay vận động, bạn có thể đọc bốn bài nền tảng tại mục Sổ tay trong app.",
  },
  {
    q: "Tôi có cần tài khoản hay mật khẩu không?",
    a: "Atlas và sổ tay có thể mở trực tiếp trên trình duyệt. Giáo trình NCSF cần mật khẩu dành cho người có quyền truy cập. Bàn tư vấn AI cần dịch vụ AI được kết nối; trạng thái kết nối hiển thị trong app.",
  },
  {
    q: "Kiến thức và mô hình 3D được kiểm tra thế nào?",
    a: "Các mục kiến thức có hồ sơ đối chiếu tài liệu, ghi nguồn, ngày kiểm tra và phạm vi đã đọc. Catalog 3D có thông tin xuất xứ Z-Anatomy; xuất xứ này không xác nhận tên gọi, hình học, điểm bám hay số đo của từng cấu trúc. Xem phần Nguồn & giới hạn ngay phía trên để đọc một số ví dụ.",
  },
  {
    q: "Dữ liệu học viên được lưu và dùng ở đâu?",
    a: "Khi đã cấu hình Supabase, hồ sơ được lưu trên dịch vụ này. Nếu chưa có Supabase, ứng dụng dùng tệp lưu trên máy chủ chạy app, không phải chỉ trong trình duyệt của bạn. Khi chọn hồ sơ cho bàn tư vấn AI, nội dung liên quan có thể được gửi đến dịch vụ AI để tạo câu trả lời. Hãy kiểm tra cấu hình triển khai và có sự đồng ý phù hợp trước khi nhập thông tin học viên.",
  },
  {
    q: "App có chẩn đoán hay thay bác sĩ được không?",
    a: "Không. Nội dung phục vụ học tập, tra cứu và hỗ trợ công việc trong phạm vi PT; không chẩn đoán, kê đơn hoặc đưa ra phác đồ cá nhân. Khi có dấu hiệu cảnh báo, cần dừng tập và tìm trợ giúp y tế phù hợp; biểu hiện khẩn cấp cần được xử trí ngay.",
  },
];

function Brand() {
  return (
    <Link
      href="/"
      className="landing-brand"
      aria-label="Kinesis Lab — Trang chủ"
    >
      <Image src="/logo.svg" alt="" width={36} height={36} />
      <span>
        Kinesis Lab<span className="landing-brand-dot">.</span>
      </span>
    </Link>
  );
}

export function LandingPage() {
  return (
    <div className="landing-root">
      <a href="#landing-main" className="skip-link">
        Đến nội dung chính
      </a>
      <header className="landing-nav">
        <Brand />
        <nav aria-label="Điều hướng trang giới thiệu">
          <a href="#thu-ngay">Thử Atlas</a>
          <a href="#tinh-nang">Công cụ</a>
          <a href="#nguon">Nguồn</a>
          <a href="#hoi-dap">Hỏi đáp</a>
        </nav>
        <Link href="/atlas" prefetch={false} className="landing-btn-light">
          Vào app <Icon name="arrow-right" className="size-4" />
        </Link>
      </header>
      <main id="landing-main" tabIndex={-1}>
        <section className="landing-hero" aria-labelledby="landing-title">
          <div className="landing-container landing-hero-grid">
            <div className="landing-hero-copy">
              <p className="landing-eyebrow">
                Giải phẫu & vận động cho Personal Trainer
              </p>
              <h1 id="landing-title">
                Hiểu cơ thể.
                <br />
                <span>Dạy tự tin hơn.</span>
              </h1>
              <p className="landing-hero-description">
                Tra cấu trúc 3D, đọc kiến thức có nguồn và kết nối với bài tập —
                trong cùng một không gian làm việc.
              </p>
              <div className="landing-actions">
                <Link
                  href="/atlas"
                  prefetch={false}
                  className="landing-btn-primary"
                >
                  Khám phá Atlas 3D{" "}
                  <Icon name="arrow-right" className="size-4" />
                </Link>
                <a href="#thu-ngay" className="landing-btn-ghost">
                  Xem ví dụ có nguồn
                </a>
              </div>
              <p className="landing-start-note">
                Mở ngay trong trình duyệt, không cần cài đặt.
              </p>
              <dl className="landing-stats">
                <div>
                  <dt>Cấu trúc 3D có xuất xứ</dt>
                  <dd>{LANDING_STRUCTURE_COUNT.toLocaleString("vi-VN")}</dd>
                </div>
                <div>
                  <dt>Vùng kiến thức giải phẫu</dt>
                  <dd>8</dd>
                </div>
                <div>
                  <dt>Bài nền tảng vận động</dt>
                  <dd>4</dd>
                </div>
              </dl>
            </div>
            <figure className="landing-product">
              <div className="landing-product-bar">
                <span>
                  <Icon name="atlas" className="size-4" /> Kinesis Lab / Học
                  giải phẫu
                </span>
                <span>Hình có nguồn</span>
              </div>
              <Link
                href="/atlas?area=full"
                prefetch={false}
                aria-label="Mở toàn thân trong Atlas 3D"
                className="landing-product-image"
              >
                <Image
                  src="/landing/atlas-full-body.webp"
                  alt="Hình giải phẫu cơ toàn thân nhìn từ phía trước của OpenStax, hiển thị đầy đủ từ đầu đến bàn chân và giữ nguyên nhãn nguồn"
                  width={1040}
                  height={1188}
                  sizes="(max-width: 767px) 92vw, (max-width: 1023px) 46vw, 560px"
                  preload
                />
              </Link>
              <figcaption>
                <p>Quan sát toàn thân. Khám phá từng cấu trúc.</p>
                <span>
                  Hình giải phẫu mặt trước theo OpenStax, giữ nguyên nhãn nguồn.
                  Bấm vào hình để mở Atlas 3D toàn thân.
                </span>
                <a href="https://commons.wikimedia.org/wiki/File:1105_Anterior_and_Posterior_Views_of_Muscles.jpg" target="_blank" rel="noreferrer">
                  OpenStax · CC BY 4.0{" "}
                  <Icon name="arrow-right" className="size-3.5" />
                </a>
              </figcaption>
            </figure>
          </div>
        </section>
        <section
          id="thu-ngay"
          className="landing-section landing-demo-section"
          aria-labelledby="landing-demo-title"
        >
          <div className="landing-container">
            <div className="landing-section-heading">
              <p className="landing-eyebrow">Thử ngay trên trang</p>
              <h2 id="landing-demo-title">
                Một vùng cơ thể.
                <br />
                Một kiến thức có thể kiểm chứng.
              </h2>
              <p>
                Chọn vùng để đọc một ý từ nội dung thật của Atlas. Mở nguồn ngay
                bên cạnh, rồi tiếp tục khám phá trong app.
              </p>
            </div>
            <LandingRegionPreview previews={LANDING_PREVIEWS} />
          </div>
        </section>
        <section
          id="tinh-nang"
          className="landing-section"
          aria-labelledby="landing-tools-title"
        >
          <div className="landing-container">
            <div className="landing-section-heading">
              <p className="landing-eyebrow">Không gian làm việc của PT</p>
              <h2 id="landing-tools-title">Tra cứu, chuẩn bị, theo dõi.</h2>
              <p>
                Bắt đầu từ điều bạn cần cho buổi tập tiếp theo. Mỗi công cụ có
                mục đích và giới hạn riêng.
              </p>
            </div>
            <div className="landing-feature-grid">
              {features.map((feature, i) => (
                <article key={feature.title} className="landing-feature">
                  <div className="landing-feature-top">
                    <Icon name={feature.icon} className="size-6" />
                    <span>0{i + 1}</span>
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                  <Link
                    href={feature.href}
                    prefetch={false}
                    className="landing-text-link"
                  >
                    {feature.cta} <Icon name="arrow-right" className="size-4" />
                  </Link>
                </article>
              ))}
            </div>
            <div className="landing-handbook">
              <Icon name="book" />
              <p>
                Mới bắt đầu học vận động?{" "}
                <Link href="/movement" prefetch={false}>
                  Đọc sổ tay bốn bài nền tảng <span aria-hidden="true">→</span>
                </Link>
              </p>
            </div>
          </div>
        </section>
        <section
          id="nguon"
          className="landing-section landing-evidence-section"
          aria-labelledby="landing-evidence-title"
        >
          <div className="landing-container">
            <div className="landing-section-heading">
              <p className="landing-eyebrow">Nguồn & giới hạn</p>
              <h2 id="landing-evidence-title">Biết mình đang dựa vào đâu.</h2>
              <p>
                Nội dung kiến thức có nguồn đối chiếu theo từng mục. Ngày kiểm
                tra và phạm vi đã đọc được giữ cùng nguồn, để bạn tự xem xét
                trước khi áp dụng.
              </p>
            </div>
            <div className="landing-evidence-grid">
              <div className="landing-source-list">
                <h3>Nguồn cho năm ví dụ phía trên</h3>
                {sourceGroups.map(({ source, previews }) => (
                  <article key={source.url} className="landing-source-entry">
                    {previews.map((preview) => (
                      <span
                        key={preview.id}
                        id={`nguon-${preview.id}`}
                        className="landing-source-anchor"
                        aria-hidden="true"
                      />
                    ))}
                    <h4>
                      {previews.map((preview) => preview.label).join(" · ")}
                    </h4>
                    <div>
                      <a href={source.url} target="_blank" rel="noreferrer">
                        {source.title}
                        <Icon name="external" className="size-3.5 shrink-0" />
                      </a>
                      <p>
                        Đối chiếu{" "}
                        {source.checkedAt.split("-").reverse().join("/")} · Giải
                        phẫu đại thể
                      </p>
                      <details>
                        <summary>Phạm vi đã đọc trong tài liệu gốc</summary>
                        <p lang="en">{source.access}</p>
                      </details>
                    </div>
                  </article>
                ))}
              </div>
              <aside className="landing-evidence-aside">
                <div id="xuat-xu-mo-hinh">
                  <Icon name="atlas" className="size-6" />
                  <h3>Xuất xứ mô hình ≠ xác nhận giải phẫu</h3>
                  <p>
                    Catalog {LANDING_STRUCTURE_COUNT.toLocaleString("vi-VN")}{" "}
                    cấu trúc ghi xuất xứ bộ mô hình Z-Anatomy. Thông tin này
                    không xác nhận hình học, tên gọi, điểm bám, hướng sợi hay số
                    đo của từng cấu trúc.
                  </p>
                  <a
                    href="https://github.com/Z-Anatomy/Models-of-human-anatomy/tree/0dd2329622c42b4fdcaabbf5ff6ad234df49b659"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Bộ mô hình nguồn{" "}
                    <Icon name="external" className="size-3.5" />
                  </a>
                  <a
                    href="https://creativecommons.org/licenses/by-sa/4.0/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Giấy phép CC BY-SA 4.0{" "}
                    <Icon name="external" className="size-3.5" />
                  </a>
                </div>
                <div>
                  <Icon name="shield" className="size-6" />
                  <h3>Kiến thức để học và đối chiếu</h3>
                  <p>
                    Nguồn giải phẫu không xác định nguyên nhân đau, tình trạng
                    của học viên hoặc chương trình tập phù hợp cho một cá nhân.
                    Câu trả lời AI cũng cần được kiểm tra theo nguồn và bối cảnh
                    thực tế.
                  </p>
                </div>
              </aside>
            </div>
          </div>
        </section>
        <section
          id="hoi-dap"
          className="landing-section"
          aria-labelledby="landing-faq-title"
        >
          <div className="landing-container landing-faq-layout">
            <div className="landing-section-heading">
              <p className="landing-eyebrow">Trước khi bắt đầu</p>
              <h2 id="landing-faq-title">Bạn cần biết gì?</h2>
              <p>Cách truy cập, dữ liệu và phạm vi sử dụng.</p>
            </div>
            <div className="landing-faq-list">
              {faqs.map((faq, i) => (
                <details key={faq.q} className="landing-faq" open={i === 0}>
                  <summary>
                    {faq.q}
                    <Icon name="plus" className="size-4 shrink-0" />
                  </summary>
                  <p>{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
        <section
          className="landing-bottom-section"
          aria-labelledby="landing-cta-title"
        >
          <div className="landing-container">
            <div className="landing-cta">
              <div>
                <p className="landing-eyebrow">Bắt đầu từ một cấu trúc</p>
                <h2 id="landing-cta-title">
                  Mang hiểu biết vào
                  <br />
                  buổi tập tiếp theo.
                </h2>
                <p>Mở Atlas để tra cứu. Đối chiếu nguồn trước khi áp dụng.</p>
              </div>
              <div className="landing-actions">
                <Link
                  href="/atlas"
                  prefetch={false}
                  className="landing-btn-primary"
                >
                  Khám phá Atlas 3D{" "}
                  <Icon name="arrow-right" className="size-4" />
                </Link>
                <Link
                  href="/consult"
                  prefetch={false}
                  className="landing-btn-ghost"
                >
                  Mở bàn tư vấn AI
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="landing-footer">
        <div className="landing-container">
          <Brand />
          <p>
            Hỗ trợ học tập và công việc trong phạm vi PT.
            <br />
            Không chẩn đoán, không kê đơn.
          </p>
          <nav aria-label="Thông tin sử dụng">
            <a href="#nguon">Nguồn & giới hạn</a>
            <a href="#hoi-dap">Truy cập & dữ liệu</a>
            <a href="/landing/SOURCES.md">Nguồn ảnh giao diện</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
