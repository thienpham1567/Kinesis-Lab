"use client";

import Link from "next/link";
import { Icon } from "@/components/WorkspaceUI";
import { PARQ_ITEMS } from "@/lib/clinical/safety";
import type { Client } from "@/lib/types";

export function clientStatus(client: Client) {
  const parq = client.red_flags?.parq ?? {};
  const redNight =
    parq.red_night === true || parq.chest === true || parq.dizzy === true;
  const hasCaution =
    (client.medical_conditions?.length ?? 0) > 0 ||
    (client.medications?.length ?? 0) > 0 ||
    (client.orthopedic_issues?.length ?? 0) > 0 ||
    PARQ_ITEMS.some((question) => parq[question.id] === true);
  const screeningComplete = PARQ_ITEMS.every(
    (question) => typeof parq[question.id] === "boolean",
  );

  return redNight
    ? {
        level: "referral",
        label: "Cần chuyển khám BS",
        className: "border-crimson/25 bg-crimson-soft text-ink",
        icon: "alert" as const,
      }
    : hasCaution
      ? {
          level: "caution",
          label: "Cần điều chỉnh tải / bài tập",
          className: "border-caution/25 bg-caution-soft text-ink",
          icon: "activity" as const,
        }
      : !screeningComplete ? {
          level: "incomplete",
          label: "Chưa hoàn tất sàng lọc",
          className: "border-rule bg-canvas text-slate",
          icon: "clock" as const,
        }
      : {
          level: "standard",
          label: "Chưa ghi nhận cảnh báo trong hồ sơ",
          className: "border-cleared/25 bg-cleared-soft text-ink",
          icon: "check" as const,
        };
}

export function ClientRecordCard({ client }: { client: Client }) {
  const status = clientStatus(client);
  const initials = client.name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part[0])
    .join("");
  return (
    <Link
      href={`/clients/${client.id}`}
      className="panel group flex min-w-0 flex-col p-5 transition-colors hover:border-cobalt/50"
    >
      <div className="flex items-start gap-3.5">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-rule bg-canvas text-sm font-semibold text-cobalt">
          {initials}
        </span>
        <div className="min-w-0">
          <h3 className="break-words text-base font-semibold text-ink group-hover:text-cobalt">
            {client.name}
          </h3>
          <p className="mt-1 text-xs leading-5 text-slate">
            {client.age != null ? `${client.age} tuổi` : "Chưa rõ tuổi"} ·{" "}
            {client.sex ?? "Chưa rõ giới"}
          </p>
        </div>
      </div>
      <span
        className={`mt-4 flex w-fit max-w-full items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs font-medium ${status.className}`}
      >
        <Icon name={status.icon} className="size-3.5" />
        {status.label}
      </span>
      <p className="mt-4 break-words text-sm leading-6 text-ink">
        <span className="text-slate">Mục tiêu · </span>
        {client.goals || "Chưa cập nhật mục tiêu tập luyện."}
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {(client.medical_conditions ?? []).map((condition, index) => (
          <span
            key={`${condition.name}-${index}`}
            className="max-w-full break-words rounded-md bg-surface px-2 py-1 text-xs leading-5 text-slate"
          >
            {condition.name}
          </span>
        ))}
        {(client.medications ?? []).map((medication, index) => (
          <span
            key={`${medication.name}-${index}`}
            className="max-w-full break-words rounded-md bg-caution-soft px-2 py-1 text-xs leading-5 text-caution"
          >
            Thuốc: {medication.name}
          </span>
        ))}
        {(client.orthopedic_issues ?? []).map((issue, index) => (
          <span
            key={`${issue.region}-${index}`}
            className="max-w-full break-words rounded-md bg-cobalt-soft px-2 py-1 text-xs leading-5 text-cobalt"
          >
            Cơ xương khớp: {issue.region}
          </span>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-rule pt-4 text-xs">
        <span className="text-slate">
          {client.training_level ?? "Chưa phân cấp độ"}
        </span>
        <span className="flex items-center gap-2 font-semibold text-cobalt">
          Mở hồ sơ
          <Icon name="arrow-right" className="size-4" />
        </span>
      </div>
    </Link>
  );
}
