import type { RequestStatus } from "@/lib/types";
import { REQUEST_STATUS_LABELS } from "@/lib/types";

type StatusValue = RequestStatus | "expired";

const CONFIG: Record<StatusValue, string> = {
  new:         "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
  accepted:    "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  in_progress: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  completed:   "bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-300 border-green-200 dark:border-green-800",
  expired:     "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300 border-red-200 dark:border-red-800",
};

const LABEL: Record<StatusValue, string> = {
  ...REQUEST_STATUS_LABELS,
  expired: "Expired",
};

export function StatusBadge({ status }: { status: StatusValue }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${CONFIG[status]}`}>
      {LABEL[status]}
    </span>
  );
}
