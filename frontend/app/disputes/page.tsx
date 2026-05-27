"use client";

import { useState } from "react";
import Link from "next/link";
import { formatEther } from "viem";
import { motion } from "framer-motion";
import { useAccount } from "wagmi";
import { CaseList } from "@/components/CaseList";
import { NewDisputeForm } from "@/components/NewDisputeForm";
import { StatusBadge } from "@/components/StatusBadge";
import { useCases } from "@/lib/hooks";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

export default function DisputesPage() {
  const { cases } = useCases();
  const total = cases.length;
  const active = cases.filter((c) => c.status === 1 || c.status === 3 || c.status === 4 || c.status === 5).length;
  const resolved = cases.filter((c) => c.status === 6).length;
  const timedOut = cases.filter((c) => c.status === 7).length;

  return (
    <main className="min-h-screen pb-24 overflow-x-hidden">
      {/* ===================== PAGE HEADER ===================== */}
      <section className="relative w-full pt-24 sm:pt-28 lg:pt-32 pb-10">
        <div aria-hidden className="absolute inset-0 bg-grid-fade -z-10" />
        <div
          aria-hidden
          className="absolute -top-20 left-1/2 -translate-x-1/2 h-[360px] w-[720px] rounded-full -z-10 opacity-60"
          style={{ background: "radial-gradient(closest-side, rgba(76,201,255,0.16), transparent)" }}
        />

        <div className="container-edge">
          <motion.div variants={fadeUp} initial="hidden" animate="show">
            <p className="eyebrow">Dispute desk</p>
            <h1 className="mt-4 font-display text-[40px] sm:text-[56px] lg:text-[68px] leading-[0.95] tracking-cinematic font-semibold text-fg">
              Active cases &{" "}
              <span className="headline-gradient">new filings</span>.
            </h1>
            <p className="mt-5 max-w-2xl text-base sm:text-lg text-muted leading-relaxed">
              Every dispute is a contract instance. Bonds locked in escrow, jurors briefed in parallel,
              verdicts streamed on Somnia validators — settle in under 90 seconds.
            </p>
          </motion.div>

          {/* Stat strip */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.1 }}
            className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
          >
            <DeskStat label="Total cases" value={total} accent="electric" />
            <DeskStat label="In flight" value={active} accent="violet" />
            <DeskStat label="Resolved" value={resolved} accent="mint" />
            <DeskStat label="Timed out" value={timedOut} accent="rose" />
          </motion.div>
        </div>
      </section>

      {/* ===================== MAIN SECTION: FORM & INFO SIDE-BY-SIDE + FULL-WIDTH LIST ===================== */}
      <section className="relative w-full">
        <div className="container-edge">
          <div className="grid grid-cols-12 gap-6 items-stretch">
            
            {/* NEW DISPUTE FORM */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              transition={{ delay: 0.15 }}
              className="col-span-12 lg:col-span-7"
            >
              <NewDisputeForm />
            </motion.div>

            {/* LIVE CASES CARD */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              transition={{ delay: 0.25 }}
              className="col-span-12 lg:col-span-5"
            >
              <LiveCasesCard />
            </motion.div>

          </div>

          <div className="grid grid-cols-12 gap-6 items-stretch mt-6">
            
            {/* MEET THE AI JURY SPECS */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              transition={{ delay: 0.3 }}
              className="col-span-12 lg:col-span-7"
            >
              <JurySpecsCard />
            </motion.div>

            {/* HOW ESCROW WORKS */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              transition={{ delay: 0.35 }}
              className="col-span-12 lg:col-span-5"
            >
              <InfoCard />
            </motion.div>

          </div>

          {/* ALL DISPUTES LEDGER (FULL WIDTH) */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.35 }}
            className="mt-16 w-full"
          >
            <div className="flex items-end justify-between mb-6 flex-wrap gap-2 border-b border-line pb-4">
              <div>
                <p className="eyebrow">Live ledger</p>
                <h2 className="mt-2 font-display text-2xl sm:text-3xl font-semibold tracking-tight text-fg">
                  All disputes
                </h2>
              </div>
              <span className="mono-label text-faint">{total} ON RECORD</span>
            </div>
            <CaseList />
          </motion.div>

        </div>
      </section>
    </main>
  );
}

// ============================ Sub-components ============================

function short(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function DeskStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent: "electric" | "violet" | "mint" | "rose";
}) {
  const colorMap = {
    electric: { text: "#4CC9FF", grad: "linear-gradient(135deg, rgba(76,201,255,0.12) 0%, rgba(76,201,255,0.02) 100%)" },
    violet: { text: "#A78BFA", grad: "linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(139,92,246,0.02) 100%)" },
    mint: { text: "#34D399", grad: "linear-gradient(135deg, rgba(52,211,153,0.10) 0%, rgba(52,211,153,0.02) 100%)" },
    rose: { text: "#FB7185", grad: "linear-gradient(135deg, rgba(251,113,133,0.10) 0%, rgba(251,113,133,0.02) 100%)" },
  };
  const c = colorMap[accent];
  return (
    <div className="relative glass p-5 sm:p-6 overflow-hidden tile-hover" style={{ backgroundImage: c.grad }}>
      <div className="mono-label text-muted">{label}</div>
      <div className="mt-2 font-display text-3xl sm:text-4xl font-semibold tabular-nums tracking-tight" style={{ color: c.text }}>
        {value}
      </div>
    </div>
  );
}

function InfoCard() {
  const items = [
    { k: "Claimant bond", v: "Locked at filing — released by verdict split" },
    { k: "Respondent bond", v: "10% anti-spam, paid on dispute" },
    { k: "Verdict cost", v: "~1.2 STT for five LLM Inference calls" },
    { k: "Receipts", v: "Signed by Somnia validators — onchain forever" },
  ];
  return (
    <div className="glass p-5 sm:p-6 relative overflow-hidden h-full">
      <div
        aria-hidden
        className="absolute -top-20 -right-20 h-44 w-44 rounded-full pointer-events-none opacity-30"
        style={{ background: "radial-gradient(closest-side, #4CC9FF, transparent)" }}
      />
      <div className="relative">
        <p className="eyebrow">Protocol mechanics</p>
        <h3 className="text-lg font-semibold tracking-tight text-fg">How escrow works</h3>
        <ul className="mt-5 space-y-4">
          {items.map((it) => (
            <li key={it.k} className="flex items-start gap-3">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-electric" style={{ boxShadow: "0 0 12px #4CC9FF" }} />
              <div className="flex-1">
                <div className="text-[13px] font-semibold text-fg">{it.k}</div>
                <div className="text-[12px] text-muted leading-relaxed mt-0.5">{it.v}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function JurySpecsCard() {
  const judges = [
    {
      id: "J1",
      name: "Factual",
      icon: "🔍",
      color: "#4CC9FF",
      role: "Verifies facts and timeline.",
      style: "Reconstructs chronological timelines from raw evidence, chat logs, and receipt timestamps.",
    },
    {
      id: "J2",
      name: "Technical",
      icon: "⚙️",
      color: "#8B5CF6",
      role: "Evaluates work deliverables.",
      style: "Deep-dives into code correctness, technical specs, and system outputs.",
    },
    {
      id: "J3",
      name: "Contextual",
      icon: "🌐",
      color: "#34D399",
      role: "Weighs intent & reasonableness.",
      style: "Assesses industry patterns, contractual expectations, and norms of both sides.",
    },
    {
      id: "J4",
      name: "Devil’s Advocate",
      icon: "😈",
      color: "#F472B6",
      role: "Stress-tests claims & opinions.",
      style: "Defends the unpopular side, flags logic fallacies, and exposes weak assumptions.",
    },
    {
      id: "J5",
      name: "Arbiter",
      icon: "⚖️",
      color: "#F5B544",
      role: "Synthesis & final tie-breaker.",
      style: "Synthesizes the panel, enforces structural fairness, and has double voting weight.",
      weight: true
    }
  ];

  return (
    <div className="glass p-5 sm:p-6 relative overflow-hidden h-full">
      <div
        aria-hidden
        className="absolute -top-20 -left-20 h-44 w-44 rounded-full pointer-events-none opacity-20 blur-3xl"
        style={{ background: "radial-gradient(closest-side, #8B5CF6, transparent)" }}
      />
      <div className="relative">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <p className="eyebrow">Parallel construct</p>
            <h3 className="text-lg font-semibold tracking-tight text-fg">AI Jury Panel</h3>
          </div>
          <span className="mono-label text-[10px] text-muted">5 SPECIALIZED AGENTS</span>
        </div>
        <p className="text-xs text-muted leading-relaxed mb-5">
          Disputes are evaluated in parallel by five specialized LLM personas, culminating in a weighted-median consensus.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {judges.map((j) => (
            <div
              key={j.id}
              className="relative flex items-start gap-3 border border-line bg-elev/15 rounded-verdict-sm p-3 hover:border-fg/10 transition-all duration-200 group"
            >
              {/* Icon */}
              <div
                className="relative shrink-0 flex h-9 w-9 items-center justify-center rounded-lg text-sm"
                style={{
                  background: `linear-gradient(135deg, ${j.color}22 0%, ${j.color}0A 100%)`,
                  border: `1px solid ${j.color}33`,
                }}
              >
                {j.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-[9px] font-bold text-muted">{j.id}</span>
                  <h4 className="text-[13px] font-semibold text-fg tracking-tight">{j.name}</h4>
                  {j.weight && (
                    <span className="font-mono text-[8px] uppercase font-bold tracking-wider text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded">Weight ×2</span>
                  )}
                </div>
                <p className="mt-0.5 text-[11px] text-fg/80 font-medium leading-snug">{j.role}</p>
                <p className="mt-1 text-[10px] text-muted leading-relaxed group-hover:text-fg/70 transition-colors duration-200">{j.style}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LiveCasesCard() {
  const { address, isConnected } = useAccount();
  const { cases, isLoading } = useCases();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  // Filter for cases that are currently live/in-progress:
  // Open (1), Disputed (3), EvidenceReady (4), JuryActive (5)
  // and where the logged-in user is claimant or respondent
  const liveCases = cases.filter(
    (c) =>
      (c.status === 1 || c.status === 3 || c.status === 4 || c.status === 5) &&
      address &&
      (c.claimant.toLowerCase() === address.toLowerCase() ||
        c.respondent.toLowerCase() === address.toLowerCase())
  );

  const totalPages = Math.ceil(liveCases.length / itemsPerPage);
  const activePage = Math.min(Math.max(1, currentPage), totalPages || 1);
  const paginatedLive = liveCases.slice((activePage - 1) * itemsPerPage, activePage * itemsPerPage);

  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | string)[] = [];
    pages.push(1);
    
    const leftBound = activePage - 1;
    const rightBound = activePage + 1;
    
    if (leftBound > 2) {
      pages.push("...");
    }
    
    for (let i = Math.max(2, leftBound); i <= Math.min(totalPages - 1, rightBound); i++) {
      pages.push(i);
    }
    
    if (rightBound < totalPages - 1) {
      pages.push("...");
    }
    
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="glass p-5 sm:p-6 relative overflow-hidden h-full flex flex-col justify-between">
      <div
        aria-hidden
        className="absolute -top-20 -right-20 h-44 w-44 rounded-full pointer-events-none opacity-30"
        style={{ background: "radial-gradient(closest-side, #8B5CF6, transparent)" }}
      />
      
      <div className="relative flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <p className="eyebrow">Parallel resolution</p>
              <h2 className="text-lg font-semibold tracking-tight text-fg">Live cases</h2>
            </div>
            {isConnected && liveCases.length > 0 && (
              <span className="mono-label px-2 py-0.5 rounded-full border border-line bg-elev/50 text-[10px] text-electric">
                {liveCases.length} active
              </span>
            )}
          </div>

          {isConnected && isLoading && liveCases.length === 0 && (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="border border-line bg-elev/20 p-3.5 rounded-verdict-sm animate-pulse space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="h-3 w-16 rounded bg-faint/10" />
                    <div className="h-4.5 w-12 rounded bg-faint/10" />
                  </div>
                  <div className="h-3 w-full rounded bg-faint/10" />
                  <div className="h-2 w-3/4 rounded bg-faint/5" />
                </div>
              ))}
            </div>
          )}

          {!isConnected && (
            <div className="h-full min-h-[250px] flex flex-col items-center justify-center text-center p-6 border border-line border-dashed rounded-verdict bg-elev/10">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-brand-violet/10 border border-brand-violet/20 text-brand-violet">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <h3 className="mt-4 font-semibold text-sm text-fg">Wallet not connected</h3>
              <p className="mt-2 text-xs text-muted max-w-[280px] leading-relaxed">
                Connect your active wallet in the navigation header to monitor your dynamic disputes.
              </p>
            </div>
          )}

          {isConnected && !isLoading && liveCases.length === 0 && (
            <div className="h-full min-h-[250px] flex flex-col items-center justify-center text-center p-6 border border-line border-dashed rounded-verdict bg-elev/10">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/30 opacity-60" />
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <path d="m22 4-10 10.01-3-3" />
                </svg>
              </div>
              <h3 className="mt-4 font-semibold text-sm text-fg">No live cases</h3>
              <p className="mt-2 text-xs text-muted max-w-[280px] leading-relaxed">
                You have no active disputes on Somnia. File a new dispute on the left to spin up LLM jury pools instantly.
              </p>
            </div>
          )}

          {isConnected && liveCases.length > 0 && (
            <div className="space-y-3">
              {paginatedLive.map((c) => (
                <Link
                  href={`/case/${c.id.toString()}`}
                  key={c.id.toString()}
                  className="block relative border border-line bg-elev/20 hover:bg-elev/30 p-3.5 rounded-verdict-sm hover:border-brand-violet/30 transition-all duration-200 group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] tracking-wider text-faint">
                      CASE #{c.id.toString().padStart(4, "0")}
                    </span>
                    <StatusBadge status={c.status} />
                  </div>
                  <p className="mt-2 text-[13px] text-fg line-clamp-1 leading-relaxed">
                    {c.description}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-[10px] text-muted">
                    <div className="flex gap-2">
                      <span>Claimant: <span className="font-mono text-fg">{short(c.claimant)}</span></span>
                      <span className="opacity-40">|</span>
                      <span>Respondent: <span className="font-mono text-fg">{short(c.respondent)}</span></span>
                    </div>
                    <span className="font-semibold text-electric">{formatEther(c.expectedAmount)} STT</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1.5 mt-5">
            {/* Prev */}
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={activePage === 1}
              className="h-8 w-8 rounded-verdict-sm border border-line bg-elev/30 flex items-center justify-center text-muted hover:text-fg hover:border-fg/30 disabled:opacity-30 disabled:hover:text-muted disabled:hover:border-line transition-all duration-200"
              title="Previous Page"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            
            {/* Numbers */}
            {getPageNumbers().map((p, idx) => {
              if (p === "...") {
                return (
                  <span key={`ell-live-${idx}`} className="px-1 text-faint select-none font-mono text-[11px]">
                    ...
                  </span>
                );
              }
              const isActive = p === activePage;
              return (
                <button
                  key={`live-p-${p}`}
                  onClick={() => setCurrentPage(Number(p))}
                  className={`h-8 w-8 rounded-verdict-sm border text-[11px] font-mono transition-all duration-200 ${
                    isActive
                      ? "border-brand-violet/50 bg-brand-violet/10 text-brand-violet font-semibold shadow-[0_0_10px_rgba(139,92,246,0.15)]"
                      : "border-line bg-elev/30 text-muted hover:text-fg hover:border-fg/30"
                  }`}
                >
                  {p}
                </button>
              );
            })}

            {/* Next */}
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={activePage === totalPages}
              className="h-8 w-8 rounded-verdict-sm border border-line bg-elev/30 flex items-center justify-center text-muted hover:text-fg hover:border-fg/30 disabled:opacity-30 disabled:hover:text-muted disabled:hover:border-line transition-all duration-200"
              title="Next Page"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
