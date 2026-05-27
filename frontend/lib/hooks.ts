"use client";

import { useChainId, useReadContract, useReadContracts } from "wagmi";
import { disputeRegistryAbi, juryManagerAbi } from "@/lib/abis";
import { ADDRESSES } from "@/lib/addresses";

export type Evidence = {
  statement: string;
  ipfsCids: readonly string[];
  submittedAt: bigint;
  submitted: boolean;
};

export type CaseData = {
  id: bigint;
  claimant: `0x${string}`;
  respondent: `0x${string}`;
  expectedAmount: bigint;
  description: string;
  status: number;
  verdictId: bigint;
  claimantSharePercent: number;
  createdAt: bigint;
  resolvedAt: bigint;
  claimantEvidence?: Evidence;
  respondentEvidence?: Evidence;
};

export type JurorState = {
  verdict: bigint;
  receiptId: bigint;
  received: boolean;
  success: boolean;
};

export type VerdictData = {
  caseId: bigint;
  responsesReceived: number;
  successfulResponses: number;
  finalized: boolean;
  jurors: readonly JurorState[];
  requestIds: readonly bigint[];
};

type RawCase = {
  claimant: `0x${string}`;
  respondent: `0x${string}`;
  expectedAmount: bigint;
  description: string;
  status: number;
  verdictId: bigint;
  claimantSharePercent: number;
  createdAt: bigint;
  resolvedAt: bigint;
  claimantEvidence: Evidence;
  respondentEvidence: Evidence;
};

export function useNextCaseId() {
  const chainId = useChainId();
  const reg = ADDRESSES[chainId]?.disputeRegistry;
  return useReadContract({
    abi: disputeRegistryAbi,
    address: reg,
    functionName: "nextCaseId",
    query: { enabled: !!reg },
  });
}

export function useCases(): { cases: CaseData[]; isLoading: boolean } {
  const chainId = useChainId();
  const reg = ADDRESSES[chainId]?.disputeRegistry;
  const { data: nextId } = useNextCaseId();

  const ids: bigint[] = [];
  if (nextId && nextId > 0n) {
    for (let i = nextId; i > 0n && ids.length < 30; i--) ids.push(i);
  }

  const contracts = ids.map((id) => ({
    abi: disputeRegistryAbi,
    address: reg,
    functionName: "getCase" as const,
    args: [id] as const,
  }));

  const { data, isLoading } = useReadContracts({
    contracts,
    query: { enabled: !!reg && contracts.length > 0 },
  });

  const cases: CaseData[] = (data ?? [])
    .map((r, i) => {
      if (r.status !== "success" || !r.result) return null;
      const c = r.result as unknown as RawCase;
      return {
        id: ids[i],
        claimant: c.claimant,
        respondent: c.respondent,
        expectedAmount: c.expectedAmount,
        description: c.description,
        status: Number(c.status),
        verdictId: c.verdictId,
        claimantSharePercent: Number(c.claimantSharePercent),
        createdAt: c.createdAt,
        resolvedAt: c.resolvedAt,
      } as CaseData;
    })
    .filter((c): c is CaseData => c !== null);

  return { cases, isLoading };
}

export function useCase(caseId: bigint | undefined): { data: CaseData | null; isLoading: boolean; refetch: () => void } {
  const chainId = useChainId();
  const reg = ADDRESSES[chainId]?.disputeRegistry;

  const { data, isLoading, refetch } = useReadContract({
    abi: disputeRegistryAbi,
    address: reg,
    functionName: "getCase",
    args: caseId !== undefined ? [caseId] : undefined,
    query: { enabled: !!reg && caseId !== undefined, refetchInterval: 2000 },
  });

  if (!data || caseId === undefined) return { data: null, isLoading, refetch };
  const c = data as unknown as RawCase;
  return {
    data: {
      id: caseId,
      claimant: c.claimant,
      respondent: c.respondent,
      expectedAmount: c.expectedAmount,
      description: c.description,
      status: Number(c.status),
      verdictId: c.verdictId,
      claimantSharePercent: Number(c.claimantSharePercent),
      createdAt: c.createdAt,
      resolvedAt: c.resolvedAt,
      claimantEvidence: c.claimantEvidence,
      respondentEvidence: c.respondentEvidence,
    },
    isLoading,
    refetch,
  };
}

export function useVerdict(verdictId: bigint | undefined): { data: VerdictData | null; isLoading: boolean } {
  const chainId = useChainId();
  const jury = ADDRESSES[chainId]?.juryManager;
  const enabled = !!jury && verdictId !== undefined && verdictId > 0n;

  const { data, isLoading } = useReadContract({
    abi: juryManagerAbi,
    address: jury,
    functionName: "getVerdict",
    args: verdictId !== undefined ? [verdictId] : undefined,
    query: { enabled, refetchInterval: 1500 },
  });

  if (!data) return { data: null, isLoading };
  const tuple = data as unknown as readonly [bigint, number, number, boolean, readonly JurorState[], readonly bigint[]];
  const [caseId, responsesReceived, successfulResponses, finalized, jurors, requestIds] = tuple;
  return {
    data: {
      caseId,
      responsesReceived: Number(responsesReceived),
      successfulResponses: Number(successfulResponses),
      finalized,
      jurors,
      requestIds,
    },
    isLoading,
  };
}

export function useDepositEstimate(): bigint {
  const chainId = useChainId();
  const jury = ADDRESSES[chainId]?.juryManager;
  const { data } = useReadContract({
    abi: juryManagerAbi,
    address: jury,
    functionName: "estimateDepositWei",
    query: { enabled: !!jury },
  });
  return (data as bigint | undefined) ?? 0n;
}
