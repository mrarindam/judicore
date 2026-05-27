"use client";

import { useState } from "react";
import { useChainId, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { disputeRegistryAbi } from "@/lib/abis";
import { ADDRESSES } from "@/lib/addresses";

export function EvidenceForm({ caseId, role }: { caseId: bigint; role: "claimant" | "respondent" }) {
  const chainId = useChainId();
  const reg = ADDRESSES[chainId]?.disputeRegistry;
  const [statement, setStatement] = useState("");
  const [ipfsText, setIpfsText] = useState("");

  const { writeContract, data: txHash, isPending, error } = useWriteContract();
  const { isLoading: isMining, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!reg) return;
    const cids = ipfsText.split(/[\s,]+/).map((s) => s.trim()).filter(Boolean);
    writeContract({
      abi: disputeRegistryAbi,
      address: reg,
      functionName: "submitEvidence",
      args: [caseId, statement, cids],
    });
  }

  if (isSuccess) {
    return (
      <div className="tile tile-pad tile-tint-mint flex items-start gap-3">
        <svg viewBox="0 0 24 24" className="h-5 w-5 flex-none text-emerald-600 dark:text-emerald-400 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6 9 17l-5-5" />
        </svg>
        <p className="text-sm text-emerald-600 dark:text-emerald-300">Evidence submitted on-chain. The juror panel can be summoned once both parties have submitted.</p>
      </div>
    );
  }

  const roleTint = role === "claimant" ? "tile-tint-mint" : "tile-tint-rose";
  const roleAccent = role === "claimant" ? "text-sky-600 dark:text-sky-300" : "text-rose-600 dark:text-rose-400";

  return (
    <form onSubmit={submit} className={`tile tile-pad ${roleTint} space-y-4`}>
      <header>
        <p className="eyebrow">Evidence submission</p>
        <h3 className="mt-2 text-base font-semibold text-fg">
          Speak as <span className={roleAccent}>{role}</span>
        </h3>
        <p className="mt-1 text-xs text-muted">
          Your statement is shown verbatim to all five jurors. Be concise. Cite IPFS CIDs where possible.
        </p>
      </header>

      <div>
        <label className="label">Statement</label>
        <textarea
          className="input min-h-32 leading-relaxed text-sm"
          placeholder="Explain your side. Reference any IPFS CIDs you attach below."
          value={statement}
          onChange={(e) => setStatement(e.target.value)}
        />
      </div>

      <div>
        <label className="label">IPFS CIDs <span className="text-faint normal-case tracking-normal">(optional, comma- or space-separated)</span></label>
        <input
          className="input font-mono text-sm"
          placeholder="bafy… bafy…"
          value={ipfsText}
          onChange={(e) => setIpfsText(e.target.value)}
        />
      </div>

      <button
        type="submit"
        className="btn-primary w-full"
        disabled={isPending || isMining || statement.length < 10}
      >
        {isPending ? "Confirm in wallet…" : isMining ? "Mining…" : "Submit evidence"}
      </button>

      {error && (
        <p className="text-xs text-rose-600 dark:text-rose-300 break-all rounded-lg border border-rose-500/20 bg-rose-500/5 px-3 py-2">
          {(error as Error).message}
        </p>
      )}
    </form>
  );
}
