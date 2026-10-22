"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Icon, type IconName } from "./WorkspaceUI";

/* ---------------------------------- dữ liệu --------------------------------- */

const REGIONS = [
  {
    id: "shoulder",
    label: "Vai",
    joint: "Khớp vai",
    focus: "Chóp xoay và xương bả vai",
    note: "Nhìn rõ cơ trên gai, cơ dưới gai và cách bả vai trượt khi giơ tay.",
    angle: 142,
    max: 180,
    tags: ["Chóp xoay", "Giơ tay qua đầu", "Đẩy ngang"],
  },
  {
    id: "hip",
    label: "Hông",
    joint: "Khớp hông",
    focus: "Cơ mông và nhóm cơ gấp hông",
    note: "Hiểu vì sao mông yếu khiến gối đổ vào trong khi squat và khi tiếp đất.",
    angle: 98,
    max: 120,
    tags: ["Cơ mông lớn", "Hip hinge", "Ổn định khung chậu"],
  },
  {
    id: "knee",
    label: "Gối",
    joint: "Khớp gối",
    focus: "Cơ đùi trước và gân kheo",
    note: "Theo dõi trục gối, lực qua xương bánh chè và cách chọn biến thể bài tập.",
    angle: 112,
    max: 135,
    tags: ["Cơ tứ đầu", "Squat", "Trục gối"],
  },
  {
    id: "lumbar",
    label: "Thắt lưng",
    joint: "Cột sống thắt lưng",
    focus: "Cơ lõi và cơ dựng sống",
    note: "Phân biệt gập lưng do hông cứng với gập lưng do mất kiểm soát cơ lõi.",
    angle: 64,
    max: 90,
    tags: ["Cơ lõi", "Deadlift", "Kiểm soát thân"],
  },
  {
    id: "ankle",
    label: "Cổ chân",
    joint: "Khớp cổ chân",
    focus: "Cơ bắp chân và cơ chày trước",
    note: "Đo độ gập mu bàn chân. Chỉ số này quyết định độ sâu squat và dáng chạy.",
    angle: 34,
    max: 45,
    tags: ["Gập mu", "Bắp chân", "Tiếp đất"],
  },
] as const;

const FEATURES: {
  icon: IconName;
  title: string;
  desc: string;
  href: string;
  cta: string;
  accent: string;
}[] = [
  {
    icon: "atlas",
    title: "Atlas giải phẫu 3D",
    desc: "Xoay, phóng to và bóc từng lớp cơ. Mỗi cấu trúc đều gắn nguồn để bạn kiểm chứng lại.",
    href: "/atlas",
    cta: "Mở Atlas 3D",
    accent: "#2454cb",
  },
  {
    icon: "message",
    title: "Bàn tư vấn AI",
    desc: "Đặt câu hỏi theo vùng đau. AI trả lời kèm nguồn, đồng thời nhắc rõ giới hạn phạm vi PT.",
    href: "/consult",
    cta: "Vào bàn tư vấn",
    accent: "#176b58",
  },
  {
    icon: "activity",
    title: "Huấn luyện PT",
    desc: "Nối cơ với bài tập. Bạn thấy ngay cơ nào làm việc chính, cơ nào hỗ trợ và khớp nào chịu tải.",
    href: "/atlas?tab=hypertrophy",
    cta: "Xem bài tập",
    accent: "#8c4d0e",
  },
  {
    icon: "target",
    title: "Trigger Point",
    desc: "Tra điểm đau theo cơ hoặc theo vùng đau lan. Mỗi kết quả đều ghi rõ mức độ bằng chứng.",
    href: "/atlas?tab=trigger_points",
    cta: "Tra điểm đau",
    accent: "#b33132",
  },
  {
    icon: "users",
    title: "Hồ sơ học viên",
    desc: "Lưu sàng lọc PAR-Q+, chỉ số cơ thể và nhật ký tập. Mọi thay đổi đều theo thời gian thực.",
    href: "/clients",
    cta: "Quản lý hồ sơ",
    accent: "#2454cb",
  },
  {
    icon: "book",
    title: "Giáo trình NCSF",
    desc: "Đọc giáo trình ngay trong app. Hệ thống nhớ trang đã đọc và có 344 câu trắc nghiệm ôn tập.",
    href: "/knowledge",
    cta: "Học NCSF",
    accent: "#176b58",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Chọn vùng cần xem",
    desc: "Chạm vào vai, hông, gối hay bất cứ vùng nào trên bản đồ cơ thể.",
  },
  {
    n: "02",
    title: "Đọc kiến thức nền",
    desc: "Mỗi vùng có phần giải phẫu riêng. Mọi ý đều gắn nguồn OpenStax để đối chiếu.",
  },
  {
    n: "03",
    title: "Nối sang bài tập",
    desc: "Từ cơ, bạn đi thẳng tới bài tập phù hợp và cách điều chỉnh tải.",
  },
  {
    n: "04",
    title: "Áp vào học viên",
    desc: "Gắn kết quả vào hồ sơ. Buổi tập sau, bạn mở ra là thấy toàn bộ quá trình.",
  },
];

const FAQS = [
  {
    q: "Kinesis Lab có thay bác sĩ được không?",
    a: "Không. App hỗ trợ PT sàng lọc vận động và chọn bài tập. App không chẩn đoán và không kê đơn. Khi gặp dấu hiệu cờ đỏ, bạn cần khuyên học viên đi khám chuyên khoa.",
  },
  {
    q: "Kiến thức trong Atlas lấy từ đâu?",
    a: "Nội dung đối chiếu với OpenStax Anatomy and Physiology 2e và các nguồn uy tín khác. Mỗi phát biểu đều gắn link nguồn. Bạn bấm vào là đọc được nguyên văn để kiểm chứng.",
  },
  {
    q: "Tôi có cần cài thêm phần mềm không?",
    a: "Không. Bạn chỉ cần trình duyệt. Atlas 3D, bàn tư vấn và giáo trình đều chạy ngay trên web, kể cả trên điện thoại.",
  },
  {
    q: "Dữ liệu học viên lưu ở đâu?",
    a: "Dữ liệu lưu trên Supabase khi bạn đã kết nối. Bạn quản lý toàn bộ hồ sơ, chỉ số và nhật ký tập trong một nơi duy nhất.",
  },
];

/* ---------------------------------- trang ---------------------------------- */

export function LandingPage() {
  const [region, setRegion] = useState<(typeof REGIONS)[number]>(REGIONS[0]);
  const [faq, setFaq] = useState(0);
  const [progress, setProgress] = useState(0);
  const heroRef = useRef<HTMLElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  /* Thanh tiến độ cuộn + hiện dần từng khối khi cuộn tới */
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setProgress(max > 0 ? (h.scrollTop / max) * 100 : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.15 },
    );
    rootRef.current
      ?.querySelectorAll(".landing-reveal")
      .forEach((el) => io.observe(el));
    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, []);

  /* Chuột di chuyển tạo parallax nhẹ ở hero */
  function onHeroMouse(e: React.MouseEvent) {
    const el = heroRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
    el.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
    el.style.setProperty("--px", `${((e.clientX - r.left) / r.width - 0.5) * 14}px`);
    el.style.setProperty("--py", `${((e.clientY - r.top) / r.height - 0.5) * 10}px`);
  }

  return (
    <div ref={rootRef} className="landing-root">
      {/* Thanh tiến độ cuộn */}
      <div className="landing-progress" style={{ width: `${progress}%` }} aria-hidden="true" />

      {/* ------------------------------- Thanh điều hướng ------------------------------- */}
      <header className="landing-nav">
        <Link href="/" className="flex items-center gap-2.5" aria-label="Kinesis Lab">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="" className="size-9 rounded-[10px]" />
          <span className="text-[15px] font-bold tracking-tight text-white">
            Kinesis Lab<span className="text-emerald-400">.</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-7 text-[13px] font-medium text-white/70 md:flex" aria-label="Điều hướng trang giới thiệu">
          <a href="#tinh-nang" className="transition hover:text-white">Tính năng</a>
          <a href="#thu-ngay" className="transition hover:text-white">Thử ngay</a>
          <a href="#cach-dung" className="transition hover:text-white">Cách dùng</a>
          <a href="#hoi-dap" className="transition hover:text-white">Hỏi đáp</a>
        </nav>
        <Link href="/consult" className="landing-btn-light">
          Vào app
          <Icon name="arrow-right" className="size-4" />
        </Link>
      </header>

      {/* ------------------------------------ Hero ------------------------------------ */}
      <section ref={heroRef} onMouseMove={onHeroMouse} className="landing-hero">
        <div className="landing-orb landing-orb-a" aria-hidden="true" />
        <div className="landing-orb landing-orb-b" aria-hidden="true" />
        <div className="landing-orb landing-orb-c" aria-hidden="true" />
        <div className="landing-grid-bg" aria-hidden="true" />
        <div className="landing-hero-glow" aria-hidden="true" />

        <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-14 px-5 pb-24 pt-36 sm:px-8 lg:grid-cols-[1.05fr_.95fr] lg:pb-32 lg:pt-44">
          <div>
            <p className="landing-badge landing-anim" style={{ animationDelay: "0ms" }}>
              <span className="landing-dot" aria-hidden="true" />
              Nền tảng chuyên môn cho Personal Trainer
            </p>
            <h1
              className="landing-anim mt-6 text-[42px] font-bold leading-[1.08] tracking-[-0.03em] text-white sm:text-6xl lg:text-[68px]"
              style={{ animationDelay: "90ms" }}
            >
              Hiểu cơ thể.
              <br />
              <span className="landing-gradient-text">Dạy tự tin hơn.</span>
            </h1>
            <p
              className="landing-anim mt-6 max-w-xl text-base leading-8 text-white/70 sm:text-lg"
              style={{ animationDelay: "180ms" }}
            >
              Kinesis Lab gom giải phẫu 3D, cơ sinh học, sàng lọc lâm sàng và
              giáo trình NCSF vào một nơi. Mọi kiến thức đều có nguồn để bạn
              kiểm chứng trước khi áp dụng cho học viên.
            </p>
            <div className="landing-anim mt-9 flex flex-wrap items-center gap-3" style={{ animationDelay: "270ms" }}>
              <Link href="/consult" className="landing-btn-primary">
                Bắt đầu tư vấn
                <Icon name="arrow-right" className="size-4" />
              </Link>
              <Link href="/atlas" className="landing-btn-ghost">
                Khám phá Atlas 3D
              </Link>
            </div>
            <dl className="landing-anim mt-12 grid max-w-lg grid-cols-3 gap-4" style={{ animationDelay: "360ms" }}>
              <Counter value={1031} label="Cấu trúc 3D" />
              <Counter value={344} label="Câu ôn NCSF" />
              <Counter value={8} label="Vùng giải phẫu" />
            </dl>
          </div>

          {/* Thẻ nổi: ảnh giải phẫu + góc khớp chuyển động */}
          <div className="landing-hero-visual landing-anim" style={{ animationDelay: "240ms" }}>
            <div className="landing-photo-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/anatomy/full-body-muscles-openstax.jpg"
                alt="Cơ toàn thân nhìn từ phía trước theo OpenStax"
                className="h-full w-full object-cover object-top"
              />
              <div className="landing-photo-shade" aria-hidden="true" />
              <div className="landing-chip landing-chip-a">
                <Icon name="atlas" className="size-4" />
                1.031 cấu trúc có nguồn
              </div>
              <div className="landing-chip landing-chip-b">
                <Icon name="shield" className="size-4" />
                Sàng lọc cờ đỏ PAR-Q+
              </div>
            </div>

            <div className="landing-angle-card">
              <div className="flex items-center justify-between gap-3">
                <p className="font-mono text-[10px] font-semibold tracking-[.14em] text-white/60">
                  GÓC KHỚP TRỰC TIẾP
                </p>
                <span className="landing-live">
                  <span className="landing-dot" aria-hidden="true" /> LIVE
                </span>
              </div>
              <div className="mt-3 flex items-end gap-4">
                <JointSvg angle={region.angle} />
                <div>
                  <p className="text-3xl font-bold tabular-nums text-white">
                    {region.angle}°
                  </p>
                  <p className="mt-1 text-xs leading-5 text-white/60">
                    {region.joint}
                    <br />
                    Tối đa tham chiếu {region.max}°
                  </p>
                </div>
              </div>
              <div className="landing-meter" aria-hidden="true">
                <span style={{ width: `${(region.angle / region.max) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>

        <a href="#tinh-nang" className="landing-scroll-cue" aria-label="Cuộn xuống phần tính năng">
          <span aria-hidden="true" />
        </a>
      </section>

      {/* --------------------------------- Dải chạy chữ --------------------------------- */}
      <div className="landing-marquee" aria-hidden="true">
        <div className="landing-marquee-track">
          {[0, 1].map((n) => (
            <span key={n} className="landing-marquee-group">
              {["Giải phẫu 3D", "Cơ sinh học", "Trigger Point", "Sổ tay vận động", "Hồ sơ học viên", "Giáo trình NCSF", "Sàng lọc PAR-Q+", "Phân tích xét nghiệm"].map((t) => (
                <span key={t} className="landing-marquee-item">
                  {t} <i aria-hidden="true">✦</i>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ---------------------------------- Tính năng ---------------------------------- */}
      <section id="tinh-nang" className="mx-auto w-full max-w-7xl px-5 py-24 sm:px-8">
        <div className="landing-reveal max-w-2xl">
          <p className="eyebrow">Tính năng chính</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Sáu công cụ. Một quy trình khép kín.
          </h2>
          <p className="mt-4 text-[15px] leading-8 text-slate">
            Bạn không cần mở năm ứng dụng khác nhau nữa. Từ tra cứu cơ, chọn
            bài tập đến lưu hồ sơ học viên, mọi thứ nối tiếp nhau trong một luồng.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <TiltCard key={f.title} feature={f} delay={i * 70} />
          ))}
        </div>
      </section>

      {/* ------------------------------- Thử ngay: chọn vùng ------------------------------- */}
      <section id="thu-ngay" className="landing-band">
        <div className="mx-auto w-full max-w-7xl px-5 py-24 sm:px-8">
          <div className="landing-reveal max-w-2xl">
            <p className="eyebrow">Thử ngay tại đây</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Chạm vào một vùng. Xem cách Atlas suy nghĩ.
            </h2>
            <p className="mt-4 text-[15px] leading-8 text-white/65">
              Đây là bản xem trước rút gọn. Trong app, mỗi vùng mở ra mô hình
              3D, kiến thức nền có nguồn và bài tập liên quan.
            </p>
          </div>

          <div className="landing-reveal mt-12 grid gap-6 lg:grid-cols-[380px_1fr]">
            <div className="landing-region-list" role="tablist" aria-label="Chọn vùng cơ thể">
              {REGIONS.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  role="tab"
                  aria-selected={region.id === r.id}
                  onClick={() => setRegion(r)}
                  className={`landing-region-btn ${region.id === r.id ? "is-active" : ""}`}
                >
                  <span>{r.label}</span>
                  <span className="font-mono text-xs opacity-70">{r.angle}°</span>
                </button>
              ))}
            </div>

            <article key={region.id} className="landing-region-panel" aria-live="polite">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-[10px] font-semibold tracking-[.14em] text-emerald-300">
                    {region.joint.toUpperCase()}
                  </p>
                  <h3 className="mt-2 text-2xl font-bold text-white">{region.focus}</h3>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-bold tabular-nums text-white">{region.angle}°</p>
                  <p className="mt-1 text-xs text-white/55">trên {region.max}° tham chiếu</p>
                </div>
              </div>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70">{region.note}</p>
              <div className="landing-meter mt-6" aria-hidden="true">
                <span style={{ width: `${(region.angle / region.max) * 100}%` }} />
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                {region.tags.map((t) => (
                  <span key={t} className="landing-tag">{t}</span>
                ))}
              </div>
              <Link href="/atlas" className="landing-btn-primary mt-8">
                Mở vùng này trong Atlas
                <Icon name="arrow-right" className="size-4" />
              </Link>
            </article>
          </div>
        </div>
      </section>

      {/* ---------------------------------- Cách dùng ---------------------------------- */}
      <section id="cach-dung" className="mx-auto w-full max-w-7xl px-5 py-24 sm:px-8">
        <div className="landing-reveal max-w-2xl">
          <p className="eyebrow">Cách dùng</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Từ câu hỏi tới buổi tập, chỉ bốn bước.
          </h2>
        </div>
        <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <li key={s.n} className="landing-step landing-reveal" style={{ transitionDelay: `${i * 80}ms` }}>
              <span className="landing-step-n">{s.n}</span>
              <h3 className="mt-5 text-base font-semibold text-ink">{s.title}</h3>
              <p className="mt-2 text-sm leading-7 text-slate">{s.desc}</p>
              {i < STEPS.length - 1 && (
                <Icon name="arrow-right" className="landing-step-arrow size-5" />
              )}
            </li>
          ))}
        </ol>

        {/* Khối cam kết nguồn */}
        <div className="landing-source landing-reveal mt-14">
          <div className="landing-source-icon">
            <Icon name="shield" className="size-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-ink">
              Kiến thức có nguồn. Giới hạn nói rõ.
            </h3>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-slate">
              Mỗi phát biểu trong Atlas đều gắn nguồn OpenStax hoặc y văn để
              bạn đối chiếu. App cũng ghi rõ điều gì chưa chắc chắn. Bạn biết
              chắc phần nào, phần nào cần thận trọng khi dạy học viên.
            </p>
          </div>
          <Link href="/atlas?tab=clinical_rehab" className="button-secondary shrink-0">
            Xem mục nguồn
            <Icon name="external" className="size-4" />
          </Link>
        </div>
      </section>

      {/* ----------------------------------- Hỏi đáp ----------------------------------- */}
      <section id="hoi-dap" className="mx-auto w-full max-w-4xl px-5 pb-24 sm:px-8">
        <div className="landing-reveal text-center">
          <p className="eyebrow">Hỏi đáp</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Câu hỏi thường gặp
          </h2>
        </div>
        <div className="mt-10 space-y-3">
          {FAQS.map((f, i) => {
            const open = faq === i;
            return (
              <div key={f.q} className={`landing-faq landing-reveal ${open ? "is-open" : ""}`}>
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => setFaq(open ? -1 : i)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="text-[15px] font-semibold text-ink">{f.q}</span>
                  <Icon name="chevron-down" className={`size-5 shrink-0 text-slate transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
                </button>
                <div className="landing-faq-body">
                  <p className="px-5 pb-5 text-sm leading-7 text-slate">{f.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ------------------------------------- CTA ------------------------------------- */}
      <section className="px-5 pb-24 sm:px-8">
        <div className="landing-cta landing-reveal mx-auto w-full max-w-7xl">
          <div className="landing-orb landing-orb-a" aria-hidden="true" />
          <div className="landing-orb landing-orb-b" aria-hidden="true" />
          <div className="relative z-10 px-6 py-16 text-center sm:px-12">
            <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-[40px] sm:leading-[1.15]">
              Buổi dạy tiếp theo,
              <br />
              bạn đã có cơ sở vững hơn.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[15px] leading-8 text-white/65">
              Mở bàn tư vấn, hỏi ngay về ca học viên bạn đang băn khoăn.
              Câu trả lời kèm nguồn sẽ chờ bạn trong vài giây.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/consult" className="landing-btn-primary">
                Vào bàn tư vấn
                <Icon name="arrow-right" className="size-4" />
              </Link>
              <Link href="/knowledge" className="landing-btn-ghost">
                Ôn thi NCSF
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------ Footer ------------------------------------ */}
      <footer className="border-t border-rule bg-sheet">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-8 sm:px-8">
          <div className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="" className="size-8 rounded-lg" />
            <div>
              <p className="text-sm font-bold text-ink">
                Kinesis Lab<span className="text-cobalt">.</span>
              </p>
              <p className="text-xs text-slate">Giải phẫu · Cơ sinh học · Lâm sàng</p>
            </div>
          </div>
          <p className="max-w-md text-xs leading-6 text-slate">
            Phạm vi PT: sàng lọc vận động, điều chỉnh tải và bài tập.
            App không chẩn đoán, không kê đơn.
          </p>
          <Link href="/consult" className="button-secondary">
            Vào app
            <Icon name="arrow-right" className="size-4" />
          </Link>
        </div>
      </footer>
    </div>
  );
}

/* ------------------------------- Thẻ nghiêng 3D ------------------------------- */

function TiltCard({
  feature,
  delay,
}: {
  feature: (typeof FEATURES)[number];
  delay: number;
}) {
  const ref = useRef<HTMLElement>(null);

  function onMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateX(${(-y * 7).toFixed(2)}deg) rotateY(${(x * 7).toFixed(2)}deg) translateY(-4px)`;
    el.style.setProperty("--gx", `${(x + 0.5) * 100}%`);
    el.style.setProperty("--gy", `${(y + 0.5) * 100}%`);
  }
  function onLeave() {
    const el = ref.current;
    if (el) el.style.transform = "";
  }

  return (
    <article
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="landing-card landing-reveal"
      style={{ transitionDelay: `${delay}ms`, ["--accent" as string]: feature.accent }}
    >
      <div className="landing-card-glow" aria-hidden="true" />
      <span className="landing-card-icon">
        <Icon name={feature.icon} className="size-6" />
      </span>
      <h3 className="mt-5 text-lg font-semibold text-ink">{feature.title}</h3>
      <p className="mt-2 text-sm leading-7 text-slate">{feature.desc}</p>
      <Link
        href={feature.href}
        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-cobalt"
      >
        {feature.cta}
        <Icon name="arrow-right" className="size-4 transition-transform group-hover:translate-x-1" />
      </Link>
    </article>
  );
}

/* ------------------------------ Bộ đếm số chạy ------------------------------ */

function Counter({ value, label }: { value: number; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min((now - start) / 1400, 1);
          setDisplay(Math.round(value * (1 - Math.pow(1 - t, 3))));
          if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value]);

  return (
    <div ref={ref}>
      <dd className="text-[26px] font-bold tabular-nums text-white sm:text-3xl">
        {display.toLocaleString("vi-VN")}
      </dd>
      <dt className="mt-1 text-[11px] font-medium leading-4 text-white/55">{label}</dt>
    </div>
  );
}

/* --------------------------- SVG góc khớp chuyển động --------------------------- */

function JointSvg({ angle }: { angle: number }) {
  const rad = (angle * Math.PI) / 180;
  const x = 52 + 30 * Math.sin(rad);
  const y = 52 - 30 * Math.cos(rad);
  return (
    <svg viewBox="0 0 104 104" className="size-[104px] shrink-0" role="img" aria-label={`Góc khớp ${angle} độ`}>
      <circle cx="52" cy="52" r="46" fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="1.5" />
      <path
        d={`M 52 22 A 30 30 0 ${angle > 180 ? 1 : 0} 1 ${x.toFixed(1)} ${y.toFixed(1)}`}
        fill="none"
        stroke="#34d399"
        strokeWidth="3"
        strokeLinecap="round"
        className="landing-arc"
      />
      <line x1="52" y1="52" x2="52" y2="18" stroke="rgba(255,255,255,.45)" strokeWidth="3" strokeLinecap="round" />
      <line
        x1="52"
        y1="52"
        x2={x.toFixed(1)}
        y2={y.toFixed(1)}
        stroke="#60a5fa"
        strokeWidth="3"
        strokeLinecap="round"
        className="landing-arm"
      />
      <circle cx="52" cy="52" r="6" fill="#0b6a51" stroke="#fff" strokeWidth="2.5" />
      <circle cx={x.toFixed(1)} cy={y.toFixed(1)} r="4" fill="#60a5fa" stroke="#0f2233" strokeWidth="1.5" />
      <circle cx="52" cy="52" r="14" fill="none" stroke="rgba(52,211,153,.5)" className="landing-ping" />
    </svg>
  );
}
