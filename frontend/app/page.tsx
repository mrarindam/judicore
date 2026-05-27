"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useCases } from "@/lib/hooks";
import { NeuralBackground } from "@/components/NeuralBackground";
import { OrbitalPanel } from "@/components/OrbitalPanel";
import { Testimonials } from "@/components/Testimonials";
import { RecentCases } from "@/components/RecentCases";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

export default function HomePage() {
  const { cases } = useCases();
  const active = cases.filter((c) => c.status === 3 || c.status === 4 || c.status === 5).length;
  const resolved = cases.filter((c) => c.status === 6 || c.status === 7).length;

  return (
    <main className="min-h-screen pb-24 overflow-x-hidden">
      {/* ===================== HERO ===================== */}
      <section className="relative w-full overflow-hidden pt-24 sm:pt-28 lg:pt-32 pb-20 lg:pb-28">
        {/* Backgrounds */}
        <div aria-hidden className="absolute inset-0 bg-grid-fade -z-10" />
        <div aria-hidden className="absolute inset-0 -z-10">
          <NeuralBackground density={42} />
        </div>
        {/* big halos */}
        <div aria-hidden className="absolute -top-40 -left-40 h-[420px] w-[420px] rounded-full -z-10"
          style={{ background: "radial-gradient(closest-side, rgba(76,201,255,0.18), transparent)" }} />
        <div aria-hidden className="absolute -top-20 -right-40 h-[480px] w-[480px] rounded-full -z-10"
          style={{ background: "radial-gradient(closest-side, rgba(139,92,246,0.16), transparent)" }} />

        <div className="container-edge">
          {/* Two-column hero: copy on left, orbital visual on right (on mobile: orbital first, copy after) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left column — copy */}
            <div className="order-2 lg:order-1 lg:col-span-6 xl:col-span-6 text-center lg:text-left">
              {/* Headline */}
              <motion.h1
                variants={fadeUp}
                initial="hidden"
                animate="show"
                className="font-display font-semibold tracking-cinematic
                           text-[44px] sm:text-[64px] md:text-[76px] lg:text-[72px] xl:text-[84px] leading-[0.92] text-fg"
              >
                Five AI jurors.<br />
                <span className="headline-gradient">One verdict in seconds.</span>
              </motion.h1>

              {/* Subtext */}
              <motion.p
                variants={fadeUp}
                initial="hidden"
                animate="show"
                transition={{ delay: 0.18 }}
                className="mt-6 sm:mt-7 max-w-xl mx-auto lg:mx-0 text-base sm:text-lg lg:text-xl leading-relaxed text-muted"
              >
                AI agents evaluate evidence, compute consensus, and execute autonomous settlement
                <span className="text-fg"> onchain</span> — without a human in the loop.
              </motion.p>

              {/* CTAs */}
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="show"
                transition={{ delay: 0.28 }}
                className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-3"
              >
                <Link href="/disputes" className="btn-primary text-base px-6 py-3">
                  Open Dispute
                  <ArrowRight />
                </Link>
                <Link href="/docs" className="btn-ghost text-base px-6 py-3">
                  Read Docs
                </Link>
              </motion.div>
            </div>

            {/* Right column — orbital visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="order-1 lg:order-2 lg:col-span-6 xl:col-span-6 w-full"
            >
              <OrbitalPanel />
            </motion.div>
          </div>

          {/* Live stats row */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.6 }}
            className="mt-20 sm:mt-28 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
          >
            <StatTile label="Active cases" value={active} unit="" accent="electric" />
            <StatTile label="Resolved" value={resolved} unit="" accent="mint" />
            <StatTile label="Avg verdict cost" value="1.2" unit="STT" accent="violet" />
            <StatTile label="Avg time" value="<90" unit="sec" accent="gold" />
          </motion.div>
        </div>
      </section>

      {/* ===================== PROTOCOL FLOW ===================== */}
      <section id="dispute" className="relative w-full pt-12 sm:pt-20">
        <div className="container-edge">
          <SectionHeader
            eyebrow="Protocol"
            title="Dispute → Settlement, in six onchain steps."
            sub="Each phase is a contract function. No backend. No admin keys. Receipts signed by Somnia validators."
          />
          <FlowTimeline />
        </div>
      </section>

      {/* ===================== RECENT CASES ===================== */}
      <section className="relative w-full pt-16 sm:pt-24">
        <div className="container-edge">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <SectionHeader
              eyebrow="Live activity"
              title="Recent cases on the panel."
              sub="The latest five disputes — open, deliberating, or resolved. All onchain, all verifiable."
            />
            <Link href="/disputes" className="btn-ghost text-sm self-start sm:self-end shrink-0">
              View all
              <ArrowRight />
            </Link>
          </div>
          <RecentCases />
        </div>
      </section>

      {/* ===================== HOW IT WORKS ===================== */}
      <section className="relative w-full pt-16 sm:pt-24">
        <div className="container-edge">
          <SectionHeader
            eyebrow="The panel"
            title="Five specialized agents. One weighted median."
            sub="Each juror is an independent LLM Inference subcommittee on Somnia Agentic L1, executing in parallel."
          />

          <div className="mt-10 grid grid-cols-12 gap-4">
            <FeatureTile
              className="col-span-12 md:col-span-8 lg:col-span-7 row-span-2"
              accent="electric"
              title="Parallel deliberation"
              body="The JuryManager spawns five LLM Inference requests on the SomniaAgents platform — Factual, Technical, Contextual, Devil's Advocate, and Arbiter — each backed by a 3-of-3 validator subcommittee."
              monoTag="JURY MANAGER"
              big
            />
            <FeatureTile
              className="col-span-12 md:col-span-4 lg:col-span-5"
              accent="violet"
              title="Weighted median"
              body="Outliers can't sway the result. Arbiter's vote counts ×2. The aggregator finds the median weighted across all five jurors."
              monoTag="JUDICORE.SOL"
            />
            <FeatureTile
              className="col-span-12 md:col-span-4 lg:col-span-5"
              accent="gold"
              title="Receipts forever"
              body="Every inference returns a Somnia-validator-signed receipt. Verifiable by anyone, immutable, off-chain proofs onchain-anchored."
              monoTag="RECEIPT URI"
            />
          </div>
        </div>
      </section>

      {/* Testimonials marquee */}
      <Testimonials />

    </main>
  );
}

// ===================== Sub-components =====================

function ArrowRight() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}

function SectionHeader({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div className="max-w-4xl">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-cinematic text-fg leading-[1.04]">{title}</h2>
      {sub && <p className="mt-4 text-base sm:text-lg text-muted leading-relaxed">{sub}</p>}
    </div>
  );
}

function StatTile({
  label,
  value,
  unit,
  accent,
}: {
  label: string;
  value: string | number;
  unit?: string;
  accent: "electric" | "violet" | "mint" | "gold";
}) {
  const colorMap = {
    electric: { text: "#4CC9FF", grad: "linear-gradient(135deg, rgba(76,201,255,0.12) 0%, rgba(76,201,255,0.02) 100%)" },
    violet:   { text: "#A78BFA", grad: "linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(139,92,246,0.02) 100%)" },
    mint:     { text: "#34D399", grad: "linear-gradient(135deg, rgba(52,211,153,0.10) 0%, rgba(52,211,153,0.02) 100%)" },
    gold:     { text: "#F5B544", grad: "linear-gradient(135deg, rgba(245,181,68,0.10) 0%, rgba(245,181,68,0.02) 100%)" },
  };
  const c = colorMap[accent];
  return (
    <div className="relative glass p-5 sm:p-6 overflow-hidden tile-hover" style={{ backgroundImage: c.grad }}>
      <div className="mono-label text-muted">{label}</div>
      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold tabular-nums tracking-tight"
          style={{ color: c.text }}>{value}</span>
        {unit && <span className="mono-label text-faint">{unit}</span>}
      </div>
    </div>
  );
}

function FeatureTile({
  className = "",
  accent,
  title,
  body,
  monoTag,
  big,
}: {
  className?: string;
  accent: "electric" | "violet" | "gold";
  title: string;
  body: string;
  monoTag: string;
  big?: boolean;
}) {
  const accentColor = accent === "electric" ? "#4CC9FF" : accent === "violet" ? "#8B5CF6" : "#F5B544";
  return (
    <div className={`glass tile-hover p-6 sm:p-8 relative overflow-hidden ${className}`}>
      <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full pointer-events-none opacity-30"
        style={{ background: `radial-gradient(closest-side, ${accentColor}, transparent)` }} />
      <div className="relative">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: accentColor, boxShadow: `0 0 12px ${accentColor}` }} />
          <span className="mono-label text-faint">{monoTag}</span>
        </div>
        <h3 className={`mt-4 font-display font-semibold tracking-tight text-fg leading-tight ${big ? "text-2xl sm:text-3xl lg:text-4xl" : "text-xl sm:text-2xl"}`}>{title}</h3>
        <p className={`mt-3 leading-relaxed text-muted ${big ? "text-base sm:text-lg" : "text-sm sm:text-base"}`}>{body}</p>
      </div>
    </div>
  );
}

function FlowTimeline() {
  const steps = [
    { tag: "01", title: "Evidence submitted", body: "Both parties commit statements + IPFS evidence to DisputeRegistry." },
    { tag: "02", title: "Escrow locked", body: "EscrowVault holds the disputed amount + respondent's anti-spam bond." },
    { tag: "03", title: "AI evaluation", body: "JuryManager spawns 5 LLM Inference subcommittees on SomniaAgents platform." },
    { tag: "04", title: "Consensus generated", body: "Each juror returns 0–100. Arbiter's vote weighted ×2 in the median." },
    { tag: "05", title: "Verdict finalized", body: "Weighted median computed onchain. Verdict struct sealed in DisputeRegistry." },
    { tag: "06", title: "Settlement executed", body: "EscrowVault auto-splits to both parties. Receipts verifiable forever." },
  ];

  return (
    <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {steps.map((s, i) => (
        <motion.div
          key={s.tag}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="glass tile-hover p-6 relative overflow-hidden group"
        >
          <div className="absolute top-0 left-0 h-full w-0.5"
            style={{ background: i % 2 === 0 ? "linear-gradient(180deg, #4CC9FF 0%, transparent 100%)" : "linear-gradient(180deg, #8B5CF6 0%, transparent 100%)" }} />
          <div className="flex items-start justify-between gap-3">
            <div className="mono-label text-faint">STEP / {s.tag}</div>
            <span className="relative inline-flex h-1.5 w-1.5">
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full"
                style={{ background: i % 2 === 0 ? "#4CC9FF" : "#8B5CF6" }} />
            </span>
          </div>
          <h3 className="mt-4 font-display text-lg sm:text-xl font-semibold tracking-tight text-fg">{s.title}</h3>
          <p className="mt-2 text-sm text-muted leading-relaxed">{s.body}</p>
        </motion.div>
      ))}
    </div>
  );
}
