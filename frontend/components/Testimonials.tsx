"use client";

import { motion } from "framer-motion";

type Testimonial = {
  quote: string;
  name: string;
  role: string;
  color: string;
  initials: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    quote: "Settled a 5-figure freelance dispute in under 90 seconds. No lawyers, no arbitrators, just clean onchain math.",
    name: "Maya Okafor",
    role: "Founder · Lumen Studio",
    color: "#4CC9FF",
    initials: "MO",
  },
  {
    quote: "Judicore's weighted median is genius — outliers can't sway the result. This is what onchain justice should look like.",
    name: "Daniel Reyes",
    role: "DAO Steward · Forge",
    color: "#8B5CF6",
    initials: "DR",
  },
  {
    quote: "Validator-signed receipts mean every verdict is independently verifiable. Compliance team approved on first review.",
    name: "Hiroko Tanaka",
    role: "Legal · Kaiseki Labs",
    color: "#34D399",
    initials: "HT",
  },
  {
    quote: "Five specialized AI jurors deliberating in parallel — the throughput is unreal. Replaced three weeks of mediation.",
    name: "Aman Chowdhury",
    role: "PM · Settle.fi",
    color: "#F5B544",
    initials: "AC",
  },
  {
    quote: "The Devil's Advocate juror caught nuances our internal team missed. Genuinely impressive deliberation quality.",
    name: "Sofia Almeida",
    role: "Ops Lead · Helix",
    color: "#F472B6",
    initials: "SA",
  },
  {
    quote: "Sub-second autonomous arbitration changed how we structure agent-to-agent contracts. Game over for traditional courts.",
    name: "Lukas Brenner",
    role: "Eng · Autonoma",
    color: "#4CC9FF",
    initials: "LB",
  },
  {
    quote: "EscrowVault auto-splits felt like magic. Both parties paid out the instant the verdict finalized. Zero friction.",
    name: "Priya Venkatesan",
    role: "CTO · Mosaic Pay",
    color: "#8B5CF6",
    initials: "PV",
  },
  {
    quote: "We integrated Judicore into our marketplace as a default dispute layer. Chargebacks down 78% in the first month.",
    name: "Jonas Eklund",
    role: "Marketplace · NORDA",
    color: "#34D399",
    initials: "JE",
  },
  {
    quote: "Arbiter's ×2 weight is the perfect tie-breaker design. Outcomes feel principled, not arbitrary.",
    name: "Renée Lacroix",
    role: "Researcher · Cipher Inst.",
    color: "#F5B544",
    initials: "RL",
  },
  {
    quote: "I've never seen a system this transparent. Every juror's reasoning is signed and queryable forever. This is the future.",
    name: "Marcus Whitfield",
    role: "Investor · North Vector",
    color: "#F472B6",
    initials: "MW",
  },
];

export function Testimonials() {
  // Duplicate the list so the marquee scrolls seamlessly (translateX -50% loops back to start).
  const loop = [...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <section className="relative w-full pt-16 sm:pt-20">
      <div className="container-edge">
        <div className="text-center">
          <p className="eyebrow">Trusted by builders</p>
          <h2 className="mt-4 font-display text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-cinematic text-fg">
            What teams say after their first verdict
          </h2>
        </div>
      </div>

      <div
        className="relative mt-10 sm:mt-12 w-full overflow-hidden"
        style={{
          WebkitMaskImage:
            "linear-gradient(90deg, transparent 0, black 8%, black 92%, transparent 100%)",
          maskImage:
            "linear-gradient(90deg, transparent 0, black 8%, black 92%, transparent 100%)",
        }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex w-max gap-4 sm:gap-5 animate-marquee hover:[animation-play-state:paused]"
        >
          {loop.map((t, i) => (
            <TestimonialCard key={i} t={t} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <div
      className="glass shrink-0 w-[300px] sm:w-[360px] p-5 sm:p-6 rounded-verdict relative overflow-hidden"
      style={{
        boxShadow: `0 0 0 1px rgba(255,255,255,0.04), 0 20px 40px -20px ${t.color}33`,
      }}
    >
      <span
        aria-hidden
        className="absolute -top-12 -right-12 h-32 w-32 rounded-full opacity-25 pointer-events-none"
        style={{ background: `radial-gradient(closest-side, ${t.color}, transparent)` }}
      />
      <Quote color={t.color} />
      <p className="relative mt-3 text-sm sm:text-[15px] leading-relaxed text-fg/90">
        &ldquo;{t.quote}&rdquo;
      </p>
      <div className="relative mt-5 flex items-center gap-3">
        <div
          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[12px] font-semibold"
          style={{
            background: `linear-gradient(135deg, ${t.color}44 0%, ${t.color}11 100%)`,
            border: `1px solid ${t.color}55`,
            color: t.color,
          }}
        >
          {t.initials}
        </div>
        <div className="leading-tight">
          <div className="text-[13px] font-semibold text-fg">{t.name}</div>
          <div className="mono-label text-faint text-[10px] mt-0.5">{t.role}</div>
        </div>
      </div>
    </div>
  );
}

function Quote({ color }: { color: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M6 17h3l2-4V7H5v6h3zM14 17h3l2-4V7h-6v6h3z" />
    </svg>
  );
}
