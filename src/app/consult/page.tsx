import type { Metadata } from "next";
import { ChatPanel } from "@/components/ChatPanel";
import { PageHeading } from "@/components/WorkspaceUI";

export const metadata: Metadata = {
  title: "Bàn tư vấn",
  description:
    "Đặt câu hỏi lâm sàng và khoa học vận động theo hồ sơ học viên. Câu trả lời kèm nguồn để PT kiểm chứng trước khi áp dụng.",
};

export default async function ConsultPage({
  searchParams,
}: {
  searchParams: Promise<{ prompt?: string; clientId?: string }>;
}) {
  const params = await searchParams;
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeading
        eyebrow="Lâm sàng & khoa học vận động"
        title="Bàn tư vấn chuyên môn"
        description="Kết nối hồ sơ học viên, cơ sinh học và y văn để thiết kế bài tập có cơ sở."
      />
      <ChatPanel
        key={`${params.clientId ?? ""}-${params.prompt ?? ""}`}
        initialClientId={params.clientId}
        initialPrompt={params.prompt}
      />
    </div>
  );
}
