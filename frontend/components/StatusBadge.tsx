"use client";

import { CASE_STATUS } from "@/lib/abis";

type StyleEntry = { tone: string; dot: string; pulse?: boolean };

const STATUS_STYLES: Record<string, StyleEntry> = {
  None:          { tone: "border-line bg-elev text-muted",                                                 dot: "bg-faint/50" },
  Open:          { tone: "border-sky-500/20 bg-sky-500/5 text-sky-600 dark:text-sky-300",                  dot: "bg-sky-500" },
  Completed:     { tone: "border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-300",  dot: "bg-emerald-500" },
  Disputed:      { tone: "border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-400",          dot: "bg-amber-500" },
  EvidenceReady: { tone: "border-violet-500/20 bg-violet-500/5 text-violet-600 dark:text-violet-300",     dot: "bg-violet-500" },
  JuryActive:    { tone: "border-indigo-500/35 bg-indigo-500/5 text-indigo-600 dark:text-indigo-300",      dot: "bg-indigo-500", pulse: true },
  Resolved:      { tone: "border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-300",  dot: "bg-emerald-500" },
  TimedOut:      { tone: "border-rose-500/20 bg-rose-500/5 text-rose-600 dark:text-rose-400",              dot: "bg-rose-500" },
};

export function StatusBadge({ status }: { status: number }) {
  const name = CASE_STATUS[status] ?? "Unknown";
  const s = STATUS_STYLES[name] ?? STATUS_STYLES.None;
  return (
    <span className={`badge ${s.tone}`}>
      {s.pulse ? (
        <span className="relative inline-flex h-1.5 w-1.5">
          <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${s.dot}`} />
          <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${s.dot}`} />
        </span>
      ) : (
        <span className={`badge-dot ${s.dot}`} />
      )}
      {name}
    </span>
  );
}
