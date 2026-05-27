"use client";

import { motion } from "framer-motion";
import { useState } from "react";

type Judge = {
  short: string;
  name: string;
  Icon: React.FC<{ className?: string }>;
  color: string;
  desc: string;
  weight?: number;
};

const JUDGES: Judge[] = [
  { short: "J1", name: "Factual", Icon: SearchIcon, color: "#4CC9FF", desc: "Verifies facts & timeline from raw evidence, logs, and receipts." },
  { short: "J2", name: "Technical", Icon: GearIcon, color: "#8B5CF6", desc: "Evaluates code correctness, specs, and technical deliverables." },
  { short: "J3", name: "Contextual", Icon: GlobeIcon, color: "#34D399", desc: "Weighs context, intent, and reasonableness of both sides." },
  { short: "J4", name: "Devil\u2019s Advocate", Icon: SparkIcon, color: "#F472B6", desc: "Stress-tests claims and argues the unpopular side." },
  { short: "J5", name: "Arbiter", Icon: ScalesIcon, color: "#F5B544", desc: "Synthesizes the panel. Final tie-breaker with double weight.", weight: 2 },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.3 } },
};

const item = {
  hidden: { opacity: 0, y: 16, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

/**
 * Five judges displayed in a clean responsive grid with a central Verdict Core header.
 */
export function OrbitalPanel() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="relative w-full">
      {/* Ambient glow */}
      <div
        aria-hidden
        className="absolute -top-16 left-1/2 -translate-x-1/2 h-[300px] w-[400px] rounded-full pointer-events-none opacity-30 blur-3xl"
        style={{ background: "radial-gradient(closest-side, rgba(76,201,255,0.4), rgba(139,92,246,0.2), transparent)" }}
      />

      {/* Verdict Core */}
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative flex flex-col items-center mb-8"
      >
        <div className="relative">
          {/* Outer pulse */}
          <motion.div
            className="absolute rounded-full"
            animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 3.4, repeat: Infinity, ease: "easeOut" }}
            style={{
              background: "radial-gradient(closest-side, rgba(76,201,255,0.5), transparent)",
              width: 120, height: 120,
              left: "50%", top: "50%", transform: "translate(-50%, -50%)",
            }}
          />
          {/* Core orb */}
          <div
            className="relative inline-flex h-[72px] w-[72px] sm:h-[88px] sm:w-[88px] items-center justify-center rounded-full"
            style={{
              background: "radial-gradient(circle at 30% 30%, rgba(76,201,255,0.95), rgba(139,92,246,0.85) 60%, rgba(76,201,255,0.65) 100%)",
              boxShadow: "0 0 0 1px rgba(255,255,255,0.20) inset, 0 0 50px -10px rgba(76,201,255,0.6), 0 0 100px -20px rgba(139,92,246,0.5)",
            }}
          >
            <div className="absolute inset-2 rounded-full border border-white/20" />
            <div className="absolute inset-4 rounded-full border border-white/10" />
            <svg viewBox="0 0 24 24" className="relative h-7 w-7 sm:h-9 sm:w-9 text-white" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v18" />
              <path d="M5 7h14" />
              <path d="M5 7l-3 7a4 4 0 0 0 8 0L7 7" />
              <path d="M19 7l-3 7a4 4 0 0 0 8 0l-3-7" />
              <path d="M8 21h8" />
            </svg>
          </div>
        </div>
        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.15em] text-muted">Verdict Core</p>
      </motion.div>

      {/* Judge cards grid — responsive: 1 col mobile, 2 cols sm, 3+2 lg */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
      >
        {JUDGES.map((j, i) => (
          <motion.div
            key={j.short}
            variants={item}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            className={`relative glass rounded-verdict tile-hover cursor-default transition-all duration-300 ${
              i === 4 ? "sm:col-span-2 lg:col-span-1" : ""
            }`}
            style={{
              boxShadow: hovered === i
                ? `0 0 0 1px ${j.color}55, 0 0 28px -4px ${j.color}66`
                : undefined,
            }}
          >
            {j.weight && (
              <div
                className="absolute -top-2 right-3 z-10 rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wider"
                style={{
                  background: "linear-gradient(135deg, #F5B544 0%, #F59E0B 100%)",
                  color: "#1A1300",
                  boxShadow: "0 0 14px -4px rgba(245,181,68,0.5)",
                }}
              >
                \u00d72 WEIGHT
              </div>
            )}

            <div className="p-4 sm:p-5">
              <div className="flex items-center gap-3">
                {/* Icon badge */}
                <div
                  className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${j.color}22 0%, ${j.color}0A 100%)`,
                    border: `1px solid ${j.color}44`,
                  }}
                >
                  <j.Icon className="h-4.5 w-4.5" />
                </div>

                {/* Name + ID */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[9px] font-bold tracking-wider text-muted">{j.short}</span>
                    {/* Live pulse */}
                    <span className="relative inline-flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" style={{ background: j.color }} />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ background: j.color }} />
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-fg tracking-tight leading-tight">{j.name}</h4>
                </div>
              </div>

              <p className="mt-3 text-[12px] leading-relaxed text-muted">{j.desc}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

// === ICONS ===
function SearchIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#4CC9FF" }}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
function GearIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#8B5CF6" }}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
function GlobeIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#34D399" }}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </svg>
  );
}
function SparkIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#F472B6" }}>
      <path d="M13 2 4 14h7l-2 8 9-12h-7l2-8z" />
    </svg>
  );
}
function ScalesIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#F5B544" }}>
      <path d="M12 3v18M5 7h14" />
      <path d="M5 7l-3 7a4 4 0 0 0 8 0L7 7zM19 7l-3 7a4 4 0 0 0 8 0l-3-7z" />
      <path d="M8 21h8" />
    </svg>
  );
}
