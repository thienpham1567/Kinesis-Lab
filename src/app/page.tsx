import { ChatPanel } from "@/components/ChatPanel";
import { PageHeading } from "@/components/WorkspaceUI";

export default async function HomePage({
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
