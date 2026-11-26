import { CircleCheck, CircleDashed, CircleX } from "lucide-react";
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
        <CircleCheck
          className="h-3.5 w-3.5 shrink-0"
          strokeWidth={1.75}
          aria-hidden="true"
        />
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
        <CircleX
          className="h-3.5 w-3.5 shrink-0"
          strokeWidth={1.75}
          aria-hidden="true"
        />
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
      <CircleDashed
        className="h-3.5 w-3.5 shrink-0"
        strokeWidth={1.75}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}