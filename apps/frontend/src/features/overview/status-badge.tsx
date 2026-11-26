import { CheckCircle2, HelpCircle, XCircle } from "lucide-react";
import { getServiceStatusLabel } from "./formatters";
import type { ServiceStatus } from "./types";

interface StatusBadgeProps {
  status: ServiceStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const label = getServiceStatusLabel(status);

  if (status === "HEALTHY") {
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
        style={{
          backgroundColor: "var(--rs-ok-soft)",
          color: "var(--rs-ok)",
        }}
      >
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        {label}
      </span>
    );
  }

  if (status === "UNHEALTHY") {
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
        style={{
          backgroundColor: "var(--rs-bad-soft)",
          color: "var(--rs-bad)",
        }}
      >
        <XCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        {label}
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
      style={{
        backgroundColor: "var(--rs-warn-soft)",
        color: "var(--rs-warn)",
      }}
    >
      <HelpCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      {label}
    </span>
  );
}