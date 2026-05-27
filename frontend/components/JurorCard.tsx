"use client";

import { useChainId } from "wagmi";
import { JUROR_ROLES } from "@/lib/abis";
import { receiptUrl } from "@/lib/chains";
import type { JurorState } from "@/lib/hooks";

const ROLE_PROMPTS: Record<number, string> = {
  0: "Verifies facts and timeline from evidence.",
  1: "Evaluates technical correctness of deliverables.",
  2: "Weighs context, intent, and reasonableness.",
  3: "Argues the unpopular side; stress-tests claims.",
  4: "Synthesizes the panel. Final tie-breaker (weight ×2).",
};

function JurorGlyph({ index, className = "h-5 w-5" }: { index: number; className?: string }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
  };
  switch (index) {
    case 0: // Factual - magnifying glass
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      );
    case 1: // Technical - cog
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      );
    case 2: // Contextual - globe
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
        </svg>
      );
    case 3: // Devil's Advocate - lightning/zap
      return (
        <svg {...common}>
          <path d="M13 2 4 14h7l-2 8 9-12h-7l2-8z" />
        </svg>
      );
    case 4: // Arbiter - scales
      return (
        <svg {...common}>
          <path d="M12 3v18M5 7h14" />
          <path d="M5 7l-3 7a4 4 0 0 0 8 0L7 7zM19 7l-3 7a4 4 0 0 0 8 0l-3-7z" />
          <path d="M8 21h8" />
        </svg>
      );
  }
  return null;
}

export function JurorCard({
  index,
  juror,
  requestId,
  juryActive,
}: {
  index: number;
  juror: JurorState | undefined;
  requestId: bigint | undefined;
  juryActive: boolean;
}) {
  const chainId = useChainId();
  const role = JUROR_ROLES[index];
  const isArbiter = index === 4;

  const status = !juryActive
    ? "idle"
    : juror?.received
      ? juror.success
        ? "answered"
        : "failed"
      : "thinking";

  const ringClass =
    status === "answered"
      ? isArbiter ? "ring-glow-gold" : "ring-glow-mint"
      : status === "thinking"
        ? "ring-glow-violet animate-pulse-soft"
        : status === "failed"
          ? "ring-glow-rose"
          : "";

  const tint = isArbiter ? "tile-tint-gold" : status === "answered" ? "tile-tint-mint" : status === "thinking" ? "tile-tint-violet" : "";
  const iconColor = isArbiter
    ? "text-amber-600 dark:text-amber-400"
    : status === "answered"
      ? "text-emerald-600 dark:text-emerald-400"
      : status === "thinking"
        ? "text-violet-600 dark:text-violet-400"
        : "text-muted";

  return (
    <div className={`tile tile-pad ${tint} ${ringClass} relative overflow-hidden flex flex-col`}>
      {isArbiter && (
        <div className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full border border-amber-500/20 dark:border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold tracking-wide text-amber-700 dark:text-amber-300">
          <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor" aria-hidden="true">
            <path d="M12 2 9.2 8.6 2 9.2l5.5 4.8L5.8 22 12 18.3 18.2 22l-1.7-8 5.5-4.8-7.2-.6L12 2z" />
          </svg>
          WEIGHT ×2
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className={`relative inline-flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-elev ${iconColor}`}>
          <JurorGlyph index={index} className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint">{role.short}</div>
          <div className="text-[15px] font-semibold text-fg truncate">{role.name}</div>
        </div>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-muted min-h-10">{ROLE_PROMPTS[index]}</p>

      <div className="mt-4 pt-4 border-t border-line flex-1 flex flex-col justify-end">
        {status === "idle" && (
          <div className="flex items-center gap-2 text-[11px] text-faint">
            <span className="h-1.5 w-1.5 rounded-full bg-faint/30" />
            Awaiting verdict request
          </div>
        )}

        {status === "thinking" && (
          <div>
            <div className="flex items-center gap-2">
              <span className="flex gap-1">
                <span className="size-1.5 rounded-full bg-violet-500 animate-pulse" />
                <span className="size-1.5 rounded-full bg-violet-500 animate-pulse" style={{ animationDelay: "0.2s" }} />
                <span className="size-1.5 rounded-full bg-violet-500 animate-pulse" style={{ animationDelay: "0.4s" }} />
              </span>
              <span className="text-[11px] font-medium text-violet-600 dark:text-violet-300">Deliberating on-chain</span>
            </div>
            {requestId !== undefined && requestId > 0n && (
              <div className="mt-2 font-mono text-[10px] text-faint truncate">req #{requestId.toString()}</div>
            )}
          </div>
        )}

        {status === "answered" && juror && (
          <>
            <div className="flex items-baseline gap-2">
              <span className={`text-4xl font-black tracking-tight tabular-nums ${isArbiter ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                {juror.verdict.toString()}
              </span>
              <span className="text-[11px] text-faint">% to claimant</span>
            </div>
            {juror.receiptId > 0n && (
              <a
                href={receiptUrl(chainId, juror.receiptId)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-[11px] font-mono text-muted hover:text-fg transition-colors"
              >
                receipt #{juror.receiptId.toString()}
                <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M7 7h10v10" /></svg>
              </a>
            )}
          </>
        )}

        {status === "failed" && (
          <div className="flex items-center gap-2 text-[11px] text-rose-600 dark:text-rose-400">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="m15 9-6 6M9 9l6 6" /></svg>
            Did not respond in time
          </div>
        )}
      </div>
    </div>
  );
}
