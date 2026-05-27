"use client";

import { useAccount, useChainId, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, isAddress } from "viem";
import { useState, useEffect } from "react";
import { disputeRegistryAbi } from "@/lib/abis";
import { ADDRESSES, isConfigured } from "@/lib/addresses";

export function NewDisputeForm({ onCreated }: { onCreated?: (caseId: bigint) => void }) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const reg = ADDRESSES[chainId]?.disputeRegistry;

  const [respondent, setRespondent] = useState("");
  const [bondStt, setBondStt] = useState("0.05");
  const [description, setDescription] = useState("");

  const { writeContract, data: txHash, isPending, error } = useWriteContract();
  const { isLoading: isMining, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  const configured = isConfigured(chainId);
  const valid = isConnected && configured && isAddress(respondent) && description.length > 5 && Number(bondStt) > 0;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || !address || !reg) return;
    writeContract({
      abi: disputeRegistryAbi,
      address: reg,
      functionName: "createCase",
      args: [address, respondent as `0x${string}`, parseEther(bondStt), description],
    });
  }

  const [successNotif, setSuccessNotif] = useState(false);

  useEffect(() => {
    if (isSuccess) {
      setRespondent("");
      setBondStt("0.05");
      setDescription("");
      onCreated?.(0n);
      setSuccessNotif(true);

      const timer = setTimeout(() => {
        setSuccessNotif(false);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, onCreated]);

  return (
    <form onSubmit={submit} className="tile tile-pad-lg tile-tint-violet space-y-5 relative overflow-hidden">
      <div aria-hidden className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-brand-violet/20 blur-3xl" />
      <header className="relative">
        <p className="eyebrow">File a dispute</p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-fg">Open a new case</h2>
        <p className="mt-1 text-sm text-muted">
          You will be recorded as the <span className="text-fg font-semibold">claimant</span>. Bond is locked in escrow until verdict.
        </p>
      </header>

      {successNotif && (
        <div className="relative flex gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3.5 py-3 text-sm text-emerald-600 dark:text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
          <svg viewBox="0 0 24 24" className="h-5 w-5 flex-none" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <path d="m22 4-10 10.01-3-3" />
          </svg>
          <div className="flex-1 flex items-center justify-between">
            <span>Your case has been created successfully!</span>
            <button type="button" onClick={() => setSuccessNotif(false)} className="text-emerald-500 hover:text-emerald-400 text-xs font-semibold uppercase tracking-wider">Dismiss</button>
          </div>
        </div>
      )}

      {!configured && (
        <div className="relative flex gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 px-3.5 py-3 text-sm text-amber-600 dark:text-amber-300">
          <svg viewBox="0 0 24 24" className="h-5 w-5 flex-none" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 9v4M12 17h.01" />
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          </svg>
          <span>Contracts not deployed on this network yet. Update <code className="font-mono text-amber-700 dark:text-amber-200 bg-amber-500/10 px-1 py-0.5 rounded">lib/addresses.ts</code>.</span>
        </div>
      )}

      <div className="relative space-y-4">
        <div>
          <label className="label">Respondent address</label>
          <input
            className="input font-mono"
            placeholder="0x…"
            value={respondent}
            onChange={(e) => setRespondent(e.target.value)}
          />
        </div>

        <div>
          <label className="label">Bond amount (STT)</label>
          <div className="relative">
            <input
              className="input pr-14"
               type="number" min="0.001" step="0.001"
              value={bondStt}
              onChange={(e) => setBondStt(e.target.value)}
            />
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[11px] font-mono uppercase tracking-wider text-faint">STT</span>
          </div>
        </div>

        <div>
          <label className="label">Dispute description</label>
          <textarea
            className="input min-h-28 leading-relaxed"
            placeholder="What is being disputed and what outcome do you seek?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </div>

      <div className="relative flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="text-[11px] text-muted">
          Verdict cost <span className="ml-1 rounded-md border border-line bg-elev px-1.5 py-0.5 font-mono text-fg">~1.2 STT</span> · charged on request
        </div>
        <button type="submit" className="btn-primary" disabled={!valid || isPending || isMining}>
          {isPending ? "Confirm in wallet…" : isMining ? "Mining…" : (
            <>
              Create case
              <ArrowRight />
            </>
          )}
        </button>
      </div>

      {error && (
        <p className="relative text-xs text-rose-600 dark:text-rose-300 break-all rounded-lg border border-rose-500/20 bg-rose-500/5 px-3 py-2">
          {(error as Error).message}
        </p>
      )}
    </form>
  );
}

function ArrowRight() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}
