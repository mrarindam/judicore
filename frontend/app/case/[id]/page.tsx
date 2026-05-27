"use client";

import Link from "next/link";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import { motion } from "framer-motion";
import { StatusBadge } from "@/components/StatusBadge";
import { JurorCard } from "@/components/JurorCard";
import { EvidenceForm } from "@/components/EvidenceForm";
import { CaseActions } from "@/components/CaseActions";
import { JUROR_ROLES } from "@/lib/abis";
import { useCase, useVerdict } from "@/lib/hooks";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

export default function CasePage({ params }: { params: { id: string } }) {
  const { id } = params;
  const caseId = (() => {
    try { return BigInt(id); } catch { return undefined; }
  })();

  const { data: caseData, isLoading } = useCase(caseId);
  const { data: verdict } = useVerdict(caseData?.verdictId);
  const { address } = useAccount();

  if (!caseId) return <CenterMsg title="Invalid case id" />;
  if (isLoading && !caseData) return <CenterMsg title="Loading case…" />;
  if (!caseData) return <CenterMsg title="Case not found" />;

  const c = caseData;
  const isClaimant = address?.toLowerCase() === c.claimant.toLowerCase();
  const isRespondent = address?.toLowerCase() === c.respondent.toLowerCase();
  const juryActive = c.status >= 5;
  const isResolved = c.status === 6;
  const isTimedOut = c.status === 7;

  const claimantEv = c.claimantEvidence;
  const respondentEv = c.respondentEvidence;

  const claimantShareWei = (c.expectedAmount * BigInt(c.claimantSharePercent)) / 100n;
  const respondentShareWei = c.expectedAmount - claimantShareWei;

  return (
    <main className="min-h-screen pb-24 overflow-x-hidden">
      {/* ===================== HERO ===================== */}
      <section className="relative w-full pt-24 sm:pt-28 lg:pt-32 pb-8">
        <div aria-hidden className="absolute inset-0 bg-grid-fade -z-10" />
        <div
          aria-hidden
          className="absolute -top-24 left-1/2 -translate-x-1/2 h-[320px] w-[640px] rounded-full -z-10 opacity-50"
          style={{ background: "radial-gradient(closest-side, rgba(76,201,255,0.16), transparent)" }}
        />

        <div className="container-edge">
          <motion.div variants={fadeUp} initial="hidden" animate="show">
            <Link
              href="/disputes"
              className="inline-flex items-center gap-2 rounded-full border border-line bg-elev backdrop-blur px-3 py-1.5 text-xs text-muted hover:text-fg transition-colors"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              All disputes
            </Link>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.08 }}
            className="mt-7 flex items-start justify-between gap-6 flex-wrap"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-3">
                <span className="mono-label text-faint">CASE RECORD</span>
                <span className="h-1 w-1 rounded-full bg-faint/40" />
                <span className="mono-label text-faint">{fmtDate(c.createdAt)}</span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-cinematic text-fg leading-tight">
                Dispute Case #{c.id.toString().padStart(4, "0")}
              </h1>
              <p className="mt-4 text-base sm:text-lg lg:text-xl leading-relaxed text-muted max-w-none break-words">
                {c.description}
              </p>
            </div>
            <StatusBadge status={c.status} />
          </motion.div>

          {/* Bento info row */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.18 }}
            className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
          >
            <PartyTile label="Claimant" address={c.claimant} accent="electric" you={isClaimant} />
            <PartyTile label="Respondent" address={c.respondent} accent="rose" you={isRespondent} />
            <InfoTile label="Bond" value={`${formatEther(c.expectedAmount)} STT`} accent="violet" />
            <InfoTile label="Verdict ID" value={c.verdictId === 0n ? "—" : `#${c.verdictId.toString()}`} mono accent="gold" />
          </motion.div>
        </div>
      </section>

      {/* ===================== VERDICT BANNER ===================== */}
      {(juryActive || isResolved || isTimedOut) && (
        <section className="relative w-full">
          <div className="container-edge mt-4">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}>
              <VerdictBanner
                resolved={isResolved}
                timedOut={isTimedOut}
                inFlight={c.status === 5 && !verdict?.finalized}
                claimantPct={c.claimantSharePercent}
                claimantShareWei={claimantShareWei}
                respondentShareWei={respondentShareWei}
              />
            </motion.div>
          </div>
        </section>
      )}

      {/* ===================== PANEL ===================== */}
      {(juryActive || isResolved || isTimedOut) && (
        <section className="relative w-full pt-14 sm:pt-20">
          <div className="container-edge">
            <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
              <div>
                <p className="eyebrow">The panel</p>
                <h2 className="mt-3 font-display text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-fg">
                  Five jurors. Live deliberation.
                </h2>
              </div>
              <p className="mono-label text-faint">
                {verdict
                  ? `${verdict.successfulResponses}/5 SUCCESS · ${verdict.responsesReceived}/5 RESPONDED`
                  : "AWAITING RESPONSES"}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {JUROR_ROLES.map((_, i) => (
                <JurorCard
                  key={i}
                  index={i}
                  juror={verdict?.jurors[i]}
                  requestId={verdict?.requestIds[i]}
                  juryActive={juryActive}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===================== EVIDENCE + ACTIONS ===================== */}
      <section className="relative w-full pt-14 sm:pt-20">
        <div className="container-edge">
          <div className="grid grid-cols-12 gap-4 lg:gap-6">
            <div className="col-span-12 lg:col-span-7 space-y-4">
              <div>
                <p className="eyebrow">Evidence</p>
                <h2 className="mt-3 font-display text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-fg">
                  Both sides on the record.
                </h2>
              </div>

              <EvidenceCard role="claimant" address={c.claimant} ev={claimantEv} />
              <EvidenceCard role="respondent" address={c.respondent} ev={respondentEv} />

              {c.status === 3 && (
                <>
                  {isClaimant && !claimantEv?.submitted && <EvidenceForm caseId={c.id} role="claimant" />}
                  {isRespondent && !respondentEv?.submitted && <EvidenceForm caseId={c.id} role="respondent" />}
                </>
              )}
            </div>

            <div className="col-span-12 lg:col-span-5 space-y-4">
              <div>
                <p className="eyebrow">Actions</p>
                <h2 className="mt-3 font-display text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-fg">
                  Move the case forward.
                </h2>
              </div>
              <CaseActions c={c} />

              {/* Lifecycle */}
              <div className="glass p-6 relative overflow-hidden">
                <div aria-hidden className="absolute -top-20 -right-20 h-40 w-40 rounded-full opacity-30 pointer-events-none"
                  style={{ background: "radial-gradient(closest-side, #8B5CF6, transparent)" }} />
                <div className="relative">
                  <p className="eyebrow">Lifecycle</p>
                  <ol className="mt-4 space-y-3">
                    <Step done={c.status >= 1} active={c.status === 1} label="Open & funded" />
                    <Step done={c.status >= 3} active={c.status === 3} label="Dispute raised" />
                    <Step done={c.status >= 4} active={c.status === 4} label="Both evidence submitted" />
                    <Step done={c.status >= 5} active={c.status === 5} label="Jury deliberating" />
                    <Step
                      done={c.status === 6}
                      active={c.status === 7}
                      label={c.status === 7 ? "Settled (timed out)" : "Settled"}
                      tone={c.status === 7 ? "rose" : "mint"}
                    />
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

// ============================ Sub-components ============================

function CenterMsg({ title }: { title: string }) {
  return (
    <main className="min-h-screen">
      <div className="container-edge py-32 text-center">
        <p className="text-muted">{title}</p>
        <Link href="/disputes" className="mt-6 inline-flex items-center gap-2 text-electric hover:opacity-80">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to all cases
        </Link>
      </div>
    </main>
  );
}

function PartyTile({
  label,
  address,
  accent,
  you,
}: {
  label: string;
  address: string;
  accent: "electric" | "rose";
  you?: boolean;
}) {
  const colorClass = accent === "electric" 
    ? "text-sky-600 dark:text-sky-300" 
    : "text-rose-600 dark:text-rose-400";
  const bgClass = accent === "electric"
    ? "bg-sky-500/[0.04] dark:bg-sky-950/[0.1] border-sky-500/[0.1] dark:border-sky-900/30"
    : "bg-rose-500/[0.04] dark:bg-rose-950/[0.1] border-rose-500/[0.1] dark:border-rose-900/30";
  return (
    <div className={`relative glass p-5 sm:p-6 overflow-hidden tile-hover border ${bgClass}`}>
      <div className="flex items-center justify-between">
        <div className="mono-label text-muted">{label}</div>
        {you && (
          <span className={`rounded-full border border-sky-500/30 bg-sky-500/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${colorClass}`}>
            You
          </span>
        )}
      </div>
      <div className={`mt-2 font-mono text-sm sm:text-[15px] font-semibold ${colorClass}`}>
        {`${address.slice(0, 6)}…${address.slice(-4)}`}
      </div>
    </div>
  );
}

function InfoTile({
  label,
  value,
  mono,
  accent,
}: {
  label: string;
  value: string;
  mono?: boolean;
  accent: "violet" | "gold";
}) {
  const colorClass = accent === "violet"
    ? "text-violet-600 dark:text-violet-300"
    : "text-amber-600 dark:text-amber-400";
  const bgClass = accent === "violet"
    ? "bg-violet-500/[0.04] dark:bg-violet-950/[0.1] border-violet-500/[0.1] dark:border-violet-900/30"
    : "bg-amber-500/[0.04] dark:bg-amber-950/[0.1] border-amber-500/[0.1] dark:border-amber-900/30";
  return (
    <div className={`relative glass p-5 sm:p-6 overflow-hidden tile-hover border ${bgClass}`}>
      <div className="mono-label text-muted">{label}</div>
      <div className={`mt-2 text-sm sm:text-base font-semibold ${mono ? "font-mono" : ""} ${colorClass}`}>{value}</div>
    </div>
  );
}

function VerdictBanner({
  timedOut,
  inFlight,
  claimantPct,
  claimantShareWei,
  respondentShareWei,
}: {
  resolved: boolean;
  timedOut: boolean;
  inFlight: boolean;
  claimantPct: number;
  claimantShareWei: bigint;
  respondentShareWei: bigint;
}) {
  if (timedOut) {
    return (
      <div className="glass p-7 sm:p-8 relative overflow-hidden border border-rose-500/10 bg-rose-500/[0.04] dark:bg-rose-950/[0.05] ring-glow-rose">
        <div className="flex items-start gap-3 relative">
          <svg viewBox="0 0 24 24" className="h-6 w-6 mt-0.5 text-rose-500" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6M12 16h.01" />
          </svg>
          <div>
            <p className="eyebrow text-rose-600 dark:text-rose-400">Verdict timed out</p>
            <p className="mt-2 text-base text-fg">Jurors did not reach quorum. Full bond returned to the claimant.</p>
          </div>
        </div>
      </div>
    );
  }

  if (inFlight) {
    return (
      <div className="glass p-7 sm:p-8 relative overflow-hidden border border-violet-500/10 bg-violet-500/[0.04] dark:bg-violet-950/[0.05] ring-glow-violet">
        <div aria-hidden className="absolute -top-32 -right-32 h-72 w-72 rounded-full opacity-50"
          style={{ background: "radial-gradient(closest-side, rgba(139,92,246,0.30), transparent)" }} />
        <div className="relative">
          <p className="eyebrow text-violet-600 dark:text-violet-400">Verdict in flight</p>
          <div className="mt-4 flex items-center gap-3">
            <span className="flex gap-1.5">
              {["#0ea5e9", "#8b5cf6", "#10b981", "#ec4899", "#f59e0b"].map((color, i) => (
                <motion.span
                  key={i}
                  className="block h-2.5 w-2.5 rounded-full"
                  style={{ background: color, boxShadow: `0 0 12px ${color}` }}
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
                />
              ))}
            </span>
            <p className="text-base sm:text-lg font-semibold text-fg">Five jurors running inference in parallel</p>
          </div>
          <p className="mt-3 text-sm sm:text-base text-muted max-w-2xl leading-relaxed">
            Results stream in as each subcommittee reaches its threshold. The Arbiter casts a double-weighted vote once it has read the others.
          </p>
        </div>
      </div>
    );
  }

  const respondentPct = 100 - claimantPct;
  return (
    <div className="glass p-7 sm:p-8 lg:p-10 relative overflow-hidden border border-emerald-500/10 bg-emerald-500/[0.04] dark:bg-emerald-950/[0.05] ring-glow-mint">
      <div aria-hidden className="absolute -bottom-32 -right-32 h-72 w-72 rounded-full opacity-40"
        style={{ background: "radial-gradient(closest-side, rgba(52,211,153,0.30), transparent)" }} />
      <div className="relative">
        <p className="eyebrow text-emerald-600 dark:text-emerald-400">Verdict</p>
        <div className="mt-4 flex items-baseline gap-3 flex-wrap font-display text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight">
          <span className="tabular-nums text-emerald-600 dark:text-emerald-400">{claimantPct}%</span>
          <span className="text-base sm:text-lg font-normal text-muted">to claimant</span>
          <span className="text-faint">·</span>
          <span className="tabular-nums text-rose-600 dark:text-rose-400">{respondentPct}%</span>
          <span className="text-base sm:text-lg font-normal text-muted">to respondent</span>
        </div>

        {/* Split bar */}
        <div className="mt-6 h-3 w-full overflow-hidden rounded-full border border-line flex"
          style={{ background: "rgba(255,255,255,0.04)" }}>
          <div className="h-full transition-all duration-1000"
            style={{ width: `${claimantPct}%`, background: "linear-gradient(90deg, #10b981, #0ea5e9)" }} />
          <div className="h-full transition-all duration-1000"
            style={{ width: `${respondentPct}%`, background: "linear-gradient(90deg, #f472b6, #fb7185)" }} />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="mono-label text-muted">Claimant receives</div>
            <div className="mt-1.5 font-display text-xl sm:text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
              {formatEther(claimantShareWei)} <span className="mono-label">STT</span>
            </div>
          </div>
          <div>
            <div className="mono-label text-muted">Respondent receives</div>
            <div className="mt-1.5 font-display text-xl sm:text-2xl font-semibold text-rose-600 dark:text-rose-400">
              {formatEther(respondentShareWei)} <span className="mono-label">STT</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EvidenceCard({
  role,
  address,
  ev,
}: {
  role: "claimant" | "respondent";
  address: string;
  ev: {
    statement: string;
    ipfsCids: readonly string[];
    submittedAt: bigint;
    submitted: boolean;
  } | undefined;
}) {
  const isClaimant = role === "claimant";
  const roleColorClass = isClaimant ? "text-sky-600 dark:text-sky-300" : "text-rose-600 dark:text-rose-400";
  const bulletBgClass = isClaimant ? "bg-sky-500" : "bg-rose-500";
  const borderBgClass = isClaimant
    ? "border-sky-500/[0.1] bg-sky-500/[0.02] dark:bg-sky-950/[0.04]"
    : "border-rose-500/[0.1] bg-rose-500/[0.02] dark:bg-rose-950/[0.04]";
  return (
    <div className={`glass p-6 relative overflow-hidden border ${borderBgClass}`}>
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${bulletBgClass}`} style={{ boxShadow: isClaimant ? "0 0 12px rgba(14,165,233,0.4)" : "0 0 12px rgba(244,63,94,0.4)" }} />
          <p className={`mono-label ${roleColorClass}`}>{role}</p>
        </div>
        <p className="font-mono text-[10px] text-faint">{address.slice(0, 8)}…{address.slice(-4)}</p>
      </div>
      {ev?.submitted ? (
        <>
          <p className="text-[14px] sm:text-[15px] leading-relaxed text-fg whitespace-pre-wrap">{ev.statement}</p>
          {ev.ipfsCids.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {ev.ipfsCids.map((cid, i) => (
                <a
                  key={i}
                  href={`https://ipfs.io/ipfs/${cid}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-full border border-line bg-elev px-2.5 py-1 font-mono text-[11px] text-muted hover:text-fg transition-colors"
                >
                  {cid.slice(0, 12)}…
                  <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 17L17 7M7 7h10v10" />
                  </svg>
                </a>
              ))}
            </div>
          )}
        </>
      ) : (
        <p className="text-sm italic text-faint">Not submitted yet.</p>
      )}
    </div>
  );
}

function Step({
  done,
  active,
  label,
  tone = "mint",
}: {
  done: boolean;
  active?: boolean;
  label: string;
  tone?: "mint" | "rose";
}) {
  const doneColor = tone === "rose" ? "#FB7185" : "#34D399";
  const dotStyle = done
    ? { background: doneColor, boxShadow: `0 0 0 4px ${doneColor}25`, opacity: 1 }
    : active
      ? { background: "#A78BFA", boxShadow: "0 0 0 4px rgba(167,139,250,0.25)", opacity: 1 }
      : { background: "rgba(255,255,255,0.18)", boxShadow: "0 0 0 4px rgba(255,255,255,0.03)", opacity: 1 };
  const textColor = done ? doneColor : active ? "var(--fg-base)" : "var(--fg-faint)";
  return (
    <li className="flex items-center gap-3 text-sm">
      <motion.span
        className={`h-2 w-2 rounded-full ${active && !done ? "animate-pulse" : ""}`}
        style={dotStyle}
      />
      <span style={{ color: textColor }}>{label}</span>
    </li>
  );
}

function fmtDate(ts: bigint): string {
  if (ts === 0n) return "—";
  const ms = Number(ts) * 1000;
  return new Date(ms).toLocaleString();
}
