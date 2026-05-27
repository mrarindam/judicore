"use client";

import Link from "next/link";
import { useState } from "react";
import { formatEther } from "viem";
import { useCases } from "@/lib/hooks";
import { StatusBadge } from "@/components/StatusBadge";

function short(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function CaseList() {
  const { cases, isLoading } = useCases();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const totalPages = Math.ceil(cases.length / itemsPerPage);
  const activePage = Math.min(Math.max(1, currentPage), totalPages || 1);
  const paginatedCases = cases.slice((activePage - 1) * itemsPerPage, activePage * itemsPerPage);

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

  if (isLoading && cases.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="tile tile-pad animate-pulse">
            <div className="h-3 w-24 rounded bg-faint/10" />
            <div className="mt-4 h-3 w-full rounded bg-faint/10" />
            <div className="mt-2 h-3 w-3/4 rounded bg-faint/10" />
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="h-2.5 w-20 rounded bg-faint/5" />
              <div className="h-2.5 w-20 rounded bg-faint/5" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (cases.length === 0) {
    return (
      <div className="tile tile-pad-lg text-center">
        <div className="mx-auto h-10 w-10 rounded-2xl bg-elev border border-line flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-muted" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="16" rx="3" />
            <path d="M3 10h18M8 4v6M16 4v6" />
          </svg>
        </div>
        <p className="mt-3 text-sm text-fg">No cases yet.</p>
        <p className="text-xs text-muted">File the first dispute to seed the panel.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedCases.map((c) => (
          <Link
            key={c.id.toString()}
            href={`/case/${c.id.toString()}`}
            className="tile tile-pad tile-hover group relative overflow-hidden"
          >
            <div aria-hidden className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-brand-violet/0 group-hover:bg-brand-violet/15 blur-3xl transition-colors duration-500" />
            <div className="relative flex items-start justify-between gap-3 mb-3">
              <span className="font-mono text-[11px] tracking-wider text-faint">CASE #{c.id.toString().padStart(4, "0")}</span>
              <StatusBadge status={c.status} />
            </div>
            <p className="relative text-[14px] leading-snug text-fg line-clamp-2 min-h-[2.5rem]">{c.description}</p>

            <div className="relative mt-5 grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
              <Cell label="Claimant" value={short(c.claimant)} mono accent="sky" />
              <Cell label="Respondent" value={short(c.respondent)} mono accent="fuchsia" />
              <Cell label="Bond" value={`${formatEther(c.expectedAmount)} STT`} />
              {(c.status === 6 || c.status === 7) && (
                <Cell
                  label="Verdict"
                  value={`${c.claimantSharePercent}% to claimant`}
                  accent="mint"
                />
              )}
            </div>

            <div className="relative mt-5 flex items-center justify-between text-[11px] text-muted">
              <span>Open case</span>
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
          {/* Prev arrow */}
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={activePage === 1}
            className="h-9 w-9 rounded-verdict-sm border border-line bg-elev/30 flex items-center justify-center text-muted hover:text-fg hover:border-fg/30 disabled:opacity-30 disabled:hover:text-muted disabled:hover:border-line transition-all duration-200"
            title="Previous Page"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>

          {/* Pages */}
          {getPageNumbers().map((p, idx) => {
            if (p === "...") {
              return (
                <span key={`ell-${idx}`} className="px-2 text-faint select-none font-mono">
                  ...
                </span>
              );
            }
            const isActive = p === activePage;
            return (
              <button
                key={`page-${p}`}
                onClick={() => setCurrentPage(Number(p))}
                className={`h-9 min-w-9 px-3 rounded-verdict-sm border text-xs font-mono transition-all duration-200 ${
                  isActive
                    ? "border-brand-violet/50 bg-brand-violet/10 text-brand-violet font-semibold shadow-[0_0_12px_rgba(139,92,246,0.15)]"
                    : "border-line bg-elev/30 text-muted hover:text-fg hover:border-fg/30"
                }`}
              >
                {p}
              </button>
            );
          })}

          {/* Next arrow */}
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={activePage === totalPages}
            className="h-9 w-9 rounded-verdict-sm border border-line bg-elev/30 flex items-center justify-center text-muted hover:text-fg hover:border-fg/30 disabled:opacity-30 disabled:hover:text-muted disabled:hover:border-line transition-all duration-200"
            title="Next Page"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
      )}
    </>
  );
}

function Cell({
  label,
  value,
  mono,
  accent,
}: {
  label: string;
  value: string;
  mono?: boolean;
  accent?: "sky" | "fuchsia" | "mint";
}) {
  const color =
    accent === "sky" ? "text-sky-600 dark:text-sky-300" :
    accent === "fuchsia" ? "text-rose-600 dark:text-rose-300" :
    accent === "mint" ? "text-emerald-600 dark:text-emerald-300" :
    "text-fg/85";
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.12em] text-faint">{label}</div>
      <div className={`mt-0.5 ${mono ? "font-mono" : ""} ${color} font-medium`}>{value}</div>
    </div>
  );
}
