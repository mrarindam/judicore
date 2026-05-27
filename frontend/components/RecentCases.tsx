"use client";

import Link from "next/link";
import { formatEther } from "viem";
import { motion } from "framer-motion";
import { useCases, type CaseData } from "@/lib/hooks";
import { StatusBadge } from "@/components/StatusBadge";

function short(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function RecentCases() {
  const { cases, isLoading } = useCases();
  const recent = cases.slice(0, 5);

  return (
    <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {isLoading && recent.length === 0
        ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
        : recent.length === 0
        ? (
          <EmptyState />
        )
        : recent.map((c, i) => <RecentCaseCard key={c.id.toString()} c={c} index={i} />)}

      {recent.length > 0 && (
        <Link
          href="/disputes"
          className="glass tile-hover p-6 rounded-verdict flex flex-col items-center justify-center text-center min-h-[180px] group relative overflow-hidden"
        >
          <div aria-hidden className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: "radial-gradient(closest-side, rgba(76,201,255,0.10), transparent)",
            }} />
          <span className="relative mono-label text-electric">View all cases</span>
          <span className="relative mt-2 inline-flex items-center gap-2 text-sm text-fg">
            Explore dispute archive
            <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </span>
        </Link>
      )}
    </div>
  );
}

function RecentCaseCard({ c, index }: { c: CaseData; index: number }) {
  const resolved = c.status === 6 || c.status === 7;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        href={`/case/${c.id.toString()}`}
        className="glass tile-hover p-5 sm:p-6 rounded-verdict relative overflow-hidden group block"
      >
        <div aria-hidden className="absolute -top-20 -right-20 h-40 w-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background: "radial-gradient(closest-side, rgba(139,92,246,0.20), transparent)" }} />

        <div className="relative flex items-start justify-between gap-3">
          <span className="mono-label text-faint">CASE #{c.id.toString().padStart(4, "0")}</span>
          <StatusBadge status={c.status} />
        </div>

        <p className="relative mt-3 text-[14px] leading-snug text-fg/90 line-clamp-2 min-h-[2.5rem]">
          {c.description || "—"}
        </p>

        <div className="relative mt-5 grid grid-cols-2 gap-x-3 gap-y-2.5 text-xs">
          <Cell label="Claimant" value={short(c.claimant)} mono />
          <Cell label="Respondent" value={short(c.respondent)} mono />
          <Cell label="Bond" value={`${formatEther(c.expectedAmount)} STT`} accent="electric" />
          {resolved && (
            <Cell label="Verdict" value={`${c.claimantSharePercent}% claimant`} accent="mint" />
          )}
        </div>

        <div className="relative mt-5 flex items-center justify-between text-[11px] text-faint">
          <span>Inspect case</span>
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </div>
      </Link>
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <div className="glass p-5 sm:p-6 rounded-verdict animate-pulse">
      <div className="flex items-start justify-between gap-3">
        <div className="h-3 w-20 rounded bg-faint/10" />
        <div className="h-5 w-16 rounded-full bg-faint/10" />
      </div>
      <div className="mt-4 h-3 w-full rounded bg-faint/10" />
      <div className="mt-2 h-3 w-3/4 rounded bg-faint/10" />
      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="h-2.5 w-20 rounded bg-faint/5" />
        <div className="h-2.5 w-20 rounded bg-faint/5" />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="col-span-full glass rounded-verdict p-8 text-center">
      <div className="mx-auto h-10 w-10 rounded-2xl bg-elev border border-line flex items-center justify-center">
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-faint" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="16" rx="3" />
          <path d="M3 10h18M8 4v6M16 4v6" />
        </svg>
      </div>
      <p className="mt-3 text-sm text-muted">No cases on chain yet.</p>
      <p className="text-xs text-faint">File the first dispute to seed the panel.</p>
      <Link href="/disputes" className="btn-primary text-sm mt-4 inline-flex">
        Open dispute
      </Link>
    </div>
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
  accent?: "electric" | "mint";
}) {
  const color =
    accent === "electric" ? "text-sky-600 dark:text-sky-300" :
    accent === "mint" ? "text-emerald-600 dark:text-emerald-300" :
    "text-fg/85";
  return (
    <div>
      <div className="mono-label text-faint">{label}</div>
      <div className={`mt-0.5 ${mono ? "font-mono" : ""} ${color} font-medium`}>{value}</div>
    </div>
  );
}
