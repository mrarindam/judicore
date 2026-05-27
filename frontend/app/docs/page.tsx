"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

export default function DocsPage() {
  return (
    <main className="min-h-screen pb-24 overflow-x-hidden">
      {/* ===================== HEADER ===================== */}
      <section className="relative w-full pt-24 sm:pt-28 lg:pt-32 pb-10">
        <div aria-hidden className="absolute inset-0 bg-grid-fade -z-10" />
        <div
          aria-hidden
          className="absolute -top-20 right-0 h-[360px] w-[520px] rounded-full -z-10 opacity-60"
          style={{ background: "radial-gradient(closest-side, rgba(139,92,246,0.18), transparent)" }}
        />

        <div className="container-edge">
          <motion.div variants={fadeUp} initial="hidden" animate="show">
            <p className="eyebrow">Architecture · Protocol</p>
            <h1 className="mt-4 font-display text-[40px] sm:text-[56px] lg:text-[68px] leading-[0.95] tracking-cinematic font-semibold text-fg">
              Justice infrastructure,{" "}
              <span className="headline-gradient">documented</span>.
            </h1>
            <p className="mt-5 max-w-2xl text-base sm:text-lg text-muted leading-relaxed">
              Judicore is three Solidity contracts, a parallel juror panel of five LLM Inference subcommittees on Somnia, and an onchain weighted median consensus engine. Everything is autonomous, trustless, and mathematically verifiable.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ===================== PROBLEM & SOLUTION ===================== */}
      <section className="relative w-full pt-6 pb-12">
        <div className="container-edge">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            
            {/* THE DISPUTE CRISIS */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="glass p-8 relative overflow-hidden border border-rose-500/10 bg-rose-500/[0.02] dark:bg-rose-950/[0.02] flex flex-col justify-between"
            >
              <div aria-hidden className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />
              <div className="relative">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500" style={{ boxShadow: "0 0 12px rgba(244,63,94,0.4)" }} />
                  <span className="mono-label text-rose-600 dark:text-rose-400">The Problem Space</span>
                </div>
                <h3 className="mt-4 font-display text-2xl sm:text-3xl font-semibold tracking-tight text-fg">
                  Web3&apos;s Dispute Resolution Crisis
                </h3>
                <p className="mt-4 text-sm sm:text-base text-muted leading-relaxed">
                  Decentralized coordination, trustless escrows, and service level agreements (SLAs) execute at lightspeed. However, when conflicts arise, conflicts are either ignored or resolved through traditional localized courts which take months, require manual legal intervention, and cost thousands in upfront fees—ruling out micro-transactions entirely.
                </p>
                <p className="mt-3 text-sm sm:text-base text-muted leading-relaxed">
                  Web3 alternatives like DAO voting or manual multisig committees suffer from low voter turnout, high administrative overhead, voter apathy, sybil vulnerabilities, and long voting windows. These delays are unacceptable for autonomous agent economies and automated smart contracts that require instant, deterministic resolution.
                </p>
              </div>
              <div className="mt-6 pt-5 border-t border-line">
                <span className="mono-label text-faint uppercase text-[10.5px]">Bottlenecks / Months of delay · Extreme legal fees · Human fatigue</span>
              </div>
            </motion.div>

            {/* AUTONOMOUS JUSTICE */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="glass p-8 relative overflow-hidden border border-emerald-500/10 bg-emerald-500/[0.02] dark:bg-emerald-950/[0.02] flex flex-col justify-between"
            >
              <div aria-hidden className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
              <div className="relative">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" style={{ boxShadow: "0 0 12px rgba(16,185,129,0.4)" }} />
                  <span className="mono-label text-emerald-600 dark:text-emerald-400">Our Solution</span>
                </div>
                <h3 className="mt-4 font-display text-2xl sm:text-3xl font-semibold tracking-tight text-fg">
                  Autonomous Agentic Justice
                </h3>
                <p className="mt-4 text-sm sm:text-base text-muted leading-relaxed">
                  Judicore provides instant, decentralized, and algorithmic dispute resolution for the AI civilization. Disputes are processed, evaluated, and settled automatically onchain in under 90 seconds, with zero human intermediaries, bias, or administrative backdoors.
                </p>
                <p className="mt-3 text-sm sm:text-base text-muted leading-relaxed">
                  By executing parallel LLM Inference requests on Somnia&apos;s ultra-fast Agentic L1, Judicore leverages specialized agent perspectives (Factual, Technical, Contextual, Devil&apos;s Advocate, and Arbiter) to achieve an objective consensus. Outliers are mathematically excluded, allowing protocols, developers, and agents to transact with absolute peace of mind.
                </p>
              </div>
              <div className="mt-6 pt-5 border-t border-line">
                <span className="mono-label text-faint uppercase text-[10.5px]">Metrics / &lt;90s settlement · ~1.2 STT price · Validator signed</span>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ===================== ARCHITECTURE DIAGRAM ===================== */}
      <section className="relative w-full pt-8">
        <div className="container-edge">
          <SectionHead eyebrow="System map" title="Three contracts. One agent platform. Five jurors." />
          <ArchitectureDiagram />
        </div>
      </section>

      {/* ===================== CONTRACT REFERENCE ===================== */}
      <section className="relative w-full pt-16 sm:pt-24">
        <div className="container-edge">
          <SectionHead
            eyebrow="Contracts"
            title="The protocol surface."
            sub="Three Solidity files. Each one a deterministic state machine. None of them upgradable, none of them owned."
          />

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ContractCard
              tag="01"
              name="DisputeRegistry"
              role="State machine"
              desc="Tracks every case lifecycle phase from Open to Settled. Holds evidence URIs, party addresses, expected amounts, and verdict bindings."
              accent="electric"
              fns={["createCase", "raiseDispute", "submitEvidence", "requestVerdict", "settle"]}
            />
            <ContractCard
              tag="02"
              name="EscrowVault"
              role="Funds custodian"
              desc="Holds claimant bond + respondent anti-spam bond. Auto-splits funds onchain after verdict is sealed. PartyMismatch reverts unauthorized funding."
              accent="violet"
              fns={["fund", "lockForJury", "releaseSplit"]}
            />
            <ContractCard
              tag="03"
              name="JuryManager"
              role="Agent orchestrator"
              desc="Spawns five parallel LLM Inference subcommittees on SomniaAgents. Differentiated system prompts per juror, weighted median aggregator."
              accent="gold"
              fns={["requestJury", "onAgentResponse", "finalizeVerdict"]}
            />
          </div>
        </div>
      </section>

      {/* ===================== CODE SNIPPETS ===================== */}
      <section className="relative w-full pt-16 sm:pt-24">
        <div className="container-edge">
          <SectionHead
            eyebrow="Onchain calls"
            title="What it looks like from the client."
            sub="wagmi + viem. Type-safe ABI bindings. No RPC patching, no proxy. Just contract calls."
          />

          <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <CodeCard
              title="Open a dispute"
              lang="TypeScript · wagmi"
              code={`writeContract({
  abi: disputeRegistryAbi,
  address: ADDRESSES[chainId].disputeRegistry,
  functionName: "createCase",
  args: [
    claimant,
    respondent,
    parseEther("0.05"),   // expected amount
    "Bot underperformed agreed SLA",
  ],
});`}
            />
            <CodeCard
              title="Request the jury"
              lang="Solidity · onchain"
              code={`function requestJury(uint256 caseId)
  external
  payable
  returns (uint256 verdictId)
{
  uint256 cost = jurorPrice * 5;
  require(msg.value >= cost, "underpaid");

  for (uint8 i = 0; i < 5; i++) {
    bytes memory call = AgentEncoder
      .encodeInferNumber(
        casePrompt, _systemPromptFor(i),
        0, 100, /* sealed */ true
      );
    requestIds[i] = platform.request{
      value: jurorPrice
    }(LLM_AGENT_ID, call);
  }
}`}
            />
            <CodeCard
              title="Read a verdict"
              lang="TypeScript · viem"
              code={`const verdict = await client.readContract({
  abi: juryManagerAbi,
  address: ADDRESSES[chainId].juryManager,
  functionName: "verdicts",
  args: [verdictId],
});

// jurors[5] returns weighted scores 0–100
// Arbiter (index 4) counts ×2 in median
const median = weightedMedian(verdict.jurors);`}
            />
            <CodeCard
              title="Verify the receipt"
              lang="Solidity · receipt"
              code={`struct AgentResponse {
  uint256 requestId;
  uint256 agentId;
  bytes   payload;          // sealed
  bytes   validatorSig;     // 3-of-3
  string  receiptURI;       // IPFS
  bool    success;
}`}
            />
          </div>
        </div>
      </section>

      {/* ===================== JUROR PROMPTS ===================== */}
      <section className="relative w-full pt-16 sm:pt-24">
        <div className="container-edge">
          <SectionHead
            eyebrow="The panel"
            title="Five system prompts. Five worldviews."
            sub="Each juror receives the same evidence with a different lens. The Arbiter reads the others and casts a double-weighted vote."
          />
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <JurorPrompt n="J1" name="Factual" accent="electric"
              prompt="You weigh only verifiable facts. Ignore tone, intent, future promises. Score based on what is on the record." />
            <JurorPrompt n="J2" name="Technical" accent="violet"
              prompt="You evaluate whether the deliverable meets the technical spec. Code quality, performance, correctness." />
            <JurorPrompt n="J3" name="Contextual" accent="mint"
              prompt="You weigh context, intent, and the trajectory of the relationship. Was good faith on display?" />
            <JurorPrompt n="J4" name="Devil's Advocate" accent="rose"
              prompt="Argue for whichever side has weaker evidence. Find the strongest counter-narrative possible." />
            <JurorPrompt n="J5" name="Arbiter" accent="gold" weight
              prompt="You read the four other jurors. Reconcile. Your vote counts ×2 in the weighted median." />
            <FlowPromptCard />
          </div>
        </div>
      </section>

      {/* ===================== CTA ===================== */}
      <section className="relative w-full pt-20 sm:pt-28">
        <div className="container-edge">
          <div
            className="relative glass overflow-hidden p-8 sm:p-12"
            style={{
              background:
                "radial-gradient(60% 80% at 20% 30%, rgba(76,201,255,0.10), transparent 60%), radial-gradient(60% 80% at 80% 70%, rgba(139,92,246,0.10), transparent 60%), var(--bg-elev)",
            }}
          >
            <div className="absolute inset-0 bg-grid pointer-events-none opacity-40" aria-hidden />
            <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div>
                <p className="eyebrow">Ready to settle</p>
                <h3 className="mt-3 font-display text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-fg">
                  Open the first dispute.
                </h3>
              </div>
              <Link href="/disputes" className="btn-primary text-base px-6 py-3">
                Go to disputes
                <ArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

// ============================ Sub-components ============================

function SectionHead({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div className="max-w-4xl">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-cinematic text-fg leading-[1.05]">
        {title}
      </h2>
      {sub && <p className="mt-4 text-base sm:text-lg text-muted leading-relaxed">{sub}</p>}
    </div>
  );
}

function ArrowRight() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}

function ArchitectureDiagram() {
  const layers = [
    {
      tag: "L1",
      title: "Somnia Agentic L1",
      body: "Validator subcommittees execute LLM Inference. 3-of-3 quorum signs the receipt.",
      glow: "#4CC9FF",
      dot: "bg-sky-500",
    },
    {
      tag: "L2",
      title: "SomniaAgents platform",
      body: "Agent ID registry. Routes inference requests to the right model + validator set.",
      glow: "#8B5CF6",
      dot: "bg-violet-500",
    },
    {
      tag: "L3",
      title: "Judicore contracts",
      body: "DisputeRegistry · EscrowVault · JuryManager. No backend, no admin keys, no upgrades.",
      glow: "#34D399",
      dot: "bg-emerald-500",
    },
    {
      tag: "L4",
      title: "Client (Next.js + wagmi)",
      body: "Type-safe ABI calls. Reactive case state. Direct RPC, no proxy.",
      glow: "#F5B544",
      dot: "bg-amber-500",
    },
  ];

  return (
    <div className="mt-10 grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-4 relative">
      {layers.map((l, i) => (
        <motion.div
          key={l.tag}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="glass tile-hover p-5 sm:p-6 relative overflow-hidden"
        >
          <div
            className="absolute -top-20 -right-20 h-40 w-40 rounded-full pointer-events-none opacity-25"
            style={{ background: `radial-gradient(closest-side, ${l.glow}, transparent)` }}
          />
          <div className="relative">
            <div className="flex items-center gap-2">
              <span className={`h-1.5 w-1.5 rounded-full ${l.dot}`} style={{ boxShadow: `0 0 12px ${l.glow}` }} />
              <span className="mono-label text-faint">LAYER / {l.tag}</span>
            </div>
            <h3 className="mt-3 font-display text-lg sm:text-xl font-semibold text-fg">{l.title}</h3>
            <p className="mt-2 text-sm text-muted leading-relaxed">{l.body}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function ContractCard({
  tag,
  name,
  role,
  desc,
  accent,
  fns,
}: {
  tag: string;
  name: string;
  role: string;
  desc: string;
  accent: "electric" | "violet" | "gold";
  fns: string[];
}) {
  const colorMap = {
    electric: { text: "text-sky-600 dark:text-sky-300", border: "border-sky-500/20 dark:border-sky-500/30", bg: "bg-sky-500/10", glow: "#4CC9FF" },
    violet: { text: "text-violet-600 dark:text-violet-300", border: "border-violet-500/20 dark:border-violet-500/30", bg: "bg-violet-500/10", glow: "#8B5CF6" },
    gold: { text: "text-amber-600 dark:text-amber-400", border: "border-amber-500/20 dark:border-amber-500/30", bg: "bg-amber-500/10", glow: "#F5B544" },
  };
  const c = colorMap[accent];
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="glass tile-hover p-6 relative overflow-hidden"
    >
      <div
        className="absolute -top-24 -right-24 h-48 w-48 rounded-full pointer-events-none opacity-25"
        style={{ background: `radial-gradient(closest-side, ${c.glow}, transparent)` }}
      />
      <div className="relative">
        <div className="flex items-center justify-between">
          <span className="mono-label text-faint">CONTRACT / {tag}</span>
          <span className={`mono-label font-semibold ${c.text}`}>{role.toUpperCase()}</span>
        </div>
        <h3 className="mt-3 font-display text-xl sm:text-2xl font-semibold tracking-tight text-fg">{name}.sol</h3>
        <p className="mt-2 text-sm text-muted leading-relaxed">{desc}</p>

        <div className="mt-5 flex flex-wrap gap-1.5">
          {fns.map((fn) => (
            <span
              key={fn}
              className={`font-mono text-[11px] rounded-md px-2 py-1 border ${c.border} ${c.bg} ${c.text}`}
            >
              {fn}()
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function CodeCard({ title, lang, code }: { title: string; lang: string; code: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="glass overflow-hidden"
    >
      {/* terminal header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-line bg-elev">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#FF5F57" }} />
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#FEBC2E" }} />
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#28C840" }} />
          <span className="ml-3 text-[12px] font-semibold text-fg">{title}</span>
        </div>
        <span className="mono-label text-faint">{lang}</span>
      </div>
      <pre className="px-5 py-4 overflow-x-auto text-[12.5px] leading-relaxed font-mono text-fg/90 whitespace-pre">
{code}
      </pre>
    </motion.div>
  );
}

function JurorPrompt({
  n,
  name,
  accent,
  prompt,
  weight,
}: {
  n: string;
  name: string;
  accent: "electric" | "violet" | "mint" | "rose" | "gold";
  prompt: string;
  weight?: boolean;
}) {
  const colorMap = {
    electric: { text: "text-sky-600 dark:text-sky-300", bg: "#4CC9FF", dot: "bg-sky-500" },
    violet: { text: "text-violet-600 dark:text-violet-300", bg: "#8B5CF6", dot: "bg-violet-500" },
    mint: { text: "text-emerald-600 dark:text-emerald-300", bg: "#34D399", dot: "bg-emerald-500" },
    rose: { text: "text-rose-600 dark:text-rose-400", bg: "#F472B6", dot: "bg-rose-500" },
    gold: { text: "text-amber-600 dark:text-amber-400", bg: "#F5B544", dot: "bg-amber-500" },
  };
  const c = colorMap[accent];
  return (
    <div className="glass tile-hover p-5 sm:p-6 relative overflow-hidden">
      <div
        className="absolute -top-16 -right-16 h-32 w-32 rounded-full pointer-events-none opacity-25"
        style={{ background: `radial-gradient(closest-side, ${c.bg}, transparent)` }}
      />
      <div className="relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} style={{ boxShadow: `0 0 12px ${c.bg}` }} />
            <span className={`mono-label ${c.text}`}>{n}</span>
          </div>
          {weight && (
            <span
              className="rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wider bg-amber-500/10 border border-amber-500/20 dark:border-amber-500/30 text-amber-700 dark:text-amber-300"
            >
              ×2 WEIGHT
            </span>
          )}
        </div>
        <h3 className="mt-3 font-display text-lg font-semibold text-fg">{name}</h3>
        <p className="mt-2 text-[13px] text-muted leading-relaxed italic">&ldquo;{prompt}&rdquo;</p>
      </div>
    </div>
  );
}

function FlowPromptCard() {
  return (
    <div className="glass p-5 sm:p-6 relative overflow-hidden">
      <div
        className="absolute -top-16 -right-16 h-32 w-32 rounded-full pointer-events-none opacity-25"
        style={{ background: "radial-gradient(closest-side, #4CC9FF, transparent)" }}
      />
      <div className="relative">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-sky-500" style={{ boxShadow: "0 0 12px #4CC9FF" }} />
          <span className="mono-label text-faint">AGGREGATOR</span>
        </div>
        <h3 className="mt-3 font-display text-lg font-semibold text-fg">Weighted median</h3>
        <p className="mt-2 text-[13px] text-muted leading-relaxed">
          Sort jurors by score with Arbiter counted twice. The 50th-percentile value is the verdict.
          Outliers cannot shift the result.
        </p>
        <pre className="mt-3 px-3 py-2.5 rounded-lg border border-line bg-elev text-[11.5px] font-mono text-fg/85 overflow-x-auto">
{`scores = [J1, J2, J3, J4, J5, J5]
return median(sort(scores))`}
        </pre>
      </div>
    </div>
  );
}
