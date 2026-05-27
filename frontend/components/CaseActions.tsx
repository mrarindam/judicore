"use client";

import { useAccount, useChainId, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { formatEther } from "viem";
import { disputeRegistryAbi, escrowVaultAbi } from "@/lib/abis";
import { ADDRESSES } from "@/lib/addresses";
import { useDepositEstimate, type CaseData } from "@/lib/hooks";

type Variant = "primary" | "ghost" | "danger" | "gold";

function Btn({ label, onClick, disabled, busy, variant = "primary" }: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  busy?: boolean;
  variant?: Variant;
}) {
  const cls =
    variant === "danger" ? "btn-danger" :
    variant === "ghost" ? "btn-ghost" :
    variant === "gold" ? "btn-gold" :
    "btn-primary";
  return (
    <button type="button" onClick={onClick} disabled={disabled || busy} className={cls}>
      {busy ? "Working…" : label}
    </button>
  );
}

export function CaseActions({ c }: { c: CaseData }) {
  const { address } = useAccount();
  const chainId = useChainId();
  const reg = ADDRESSES[chainId]?.disputeRegistry;
  const vault = ADDRESSES[chainId]?.escrowVault;
  const deposit = useDepositEstimate();

  const isClaimant = address?.toLowerCase() === c.claimant.toLowerCase();
  const isRespondent = address?.toLowerCase() === c.respondent.toLowerCase();
  const isParty = isClaimant || isRespondent;

  const { data: locked } = useReadContract({
    abi: escrowVaultAbi,
    address: vault,
    functionName: "lockedAmount",
    args: [c.id],
    query: { enabled: !!vault, refetchInterval: 3000 },
  });
  const lockedWei = (locked as bigint | undefined) ?? 0n;
  const funded = lockedWei >= c.expectedAmount;

  const { writeContract, data: txHash, isPending, error } = useWriteContract();
  const { isLoading: isMining } = useWaitForTransactionReceipt({ hash: txHash });
  const busy = isPending || isMining;

  function fundEscrow() {
    if (!vault) return;
    writeContract({
      abi: escrowVaultAbi,
      address: vault,
      functionName: "fund",
      args: [c.id],
      value: c.expectedAmount,
    });
  }
  function dispute() {
    if (!reg) return;
    writeContract({ abi: disputeRegistryAbi, address: reg, functionName: "dispute", args: [c.id] });
  }
  function requestVerdict() {
    if (!reg) return;
    writeContract({
      abi: disputeRegistryAbi,
      address: reg,
      functionName: "requestVerdict",
      args: [c.id],
      value: deposit,
    });
  }

  const fundedPct = c.expectedAmount > 0n
    ? Math.min(100, Number((lockedWei * 100n) / c.expectedAmount))
    : 0;

  return (
    <div className="tile tile-pad tile-tint-violet space-y-5 relative overflow-hidden">
      <div aria-hidden className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-brand-indigo/15 blur-3xl" />

      <header className="relative">
        <p className="eyebrow">Case actions</p>
        <h3 className="mt-2 text-base font-semibold text-fg">
          {isParty ? `You are the ${isClaimant ? "claimant" : "respondent"}` : "You are a spectator"}
        </h3>
        <p className="mt-1 text-xs text-muted">Only the case parties can fund and escalate. Anyone can request a verdict.</p>
      </header>

      <div className="relative space-y-2">
        <div className="flex items-baseline justify-between gap-2 text-xs">
          <span className="text-muted">Escrow funded</span>
          <span className="font-mono text-fg font-semibold">
            {formatEther(lockedWei)} / {formatEther(c.expectedAmount)} STT
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-faint/10">
          <div
            className={`h-full rounded-full transition-all duration-700 ${funded ? "bg-gradient-to-r from-emerald-400 to-teal-400" : "bg-gradient-to-r from-amber-400 to-orange-400"}`}
            style={{ width: `${fundedPct}%` }}
          />
        </div>
      </div>

      <div className="relative flex flex-wrap gap-2 pt-1">
        {c.status === 1 /* Open */ && (
          <>
            {!funded && isParty && (
              <Btn label={`Fund ${formatEther(c.expectedAmount)} STT`} onClick={fundEscrow} busy={busy} />
            )}
            {funded && isParty && (
              <Btn label="Raise dispute" onClick={dispute} busy={busy} variant="danger" />
            )}
          </>
        )}

        {c.status === 4 /* EvidenceReady */ && (
          <Btn
            label={`Request verdict (${formatEther(deposit)} STT)`}
            onClick={requestVerdict}
            busy={busy}
            disabled={deposit === 0n}
            variant="gold"
          />
        )}

        {c.status === 5 && (
          <div className="flex items-center gap-2 text-xs text-violet-600 dark:text-violet-300">
            <span className="flex gap-1">
              <span className="size-1.5 rounded-full bg-violet-500 animate-pulse" />
              <span className="size-1.5 rounded-full bg-violet-500 animate-pulse" style={{ animationDelay: "0.2s" }} />
              <span className="size-1.5 rounded-full bg-violet-500 animate-pulse" style={{ animationDelay: "0.4s" }} />
            </span>
            Verdict in flight. Jurors deliberating on-chain.
          </div>
        )}

        {c.status === 6 && (
          <p className="text-xs text-emerald-600 dark:text-emerald-300">Resolved. Escrow has been settled automatically.</p>
        )}
        {c.status === 7 && (
          <p className="text-xs text-rose-600 dark:text-rose-400">Verdict timed out. Funds returned to claimant.</p>
        )}
      </div>

      {error && (
        <p className="relative text-xs text-rose-600 dark:text-rose-300 break-all rounded-lg border border-rose-500/20 bg-rose-500/5 px-3 py-2">{(error as Error).message}</p>
      )}
    </div>
  );
}
