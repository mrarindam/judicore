# Judicore — Architecture

Judicore is a 3-contract dispute system + a 5-juror AI panel running on the Somnia Agents L1.
This doc describes the components, the end-to-end flow, and what each on-chain transition does.

---

## 1. Components

```
                     ┌──────────────────────┐         ┌────────────────────────────┐
                     │     User wallet      │         │   SomniaAgents Platform    │
                     │  (claimant / resp.)  │         │   (chain-native contract)  │
                     └──────────┬───────────┘         └──────────────┬─────────────┘
                                │                                    │
                                │ tx                                 │ callback
                                ▼                                    │
                    ┌───────────────────────────┐                    │
                    │     DisputeRegistry       │                    │
                    │  ─ case state machine     │                    │
                    │  ─ evidence collection    │                    │
                    │  ─ applyVerdict()         │◀──┐                │
                    │  ─ applyTimeout()         │   │ apply          │
                    └─────┬─────────────┬───────┘   │                │
                          │ openCase    │ request   │                │
                          │ settle      │ Verdict   │                │
                          ▼             ▼           │                │
              ┌──────────────────┐   ┌───────────────────────┐       │
              │   EscrowVault    │   │     JuryManager       │───────┘
              │  ─ funded by     │   │  ─ 5× createAdvanced  │
              │    claimant      │   │      Request          │
              │  ─ locked        │   │  ─ handleResponse     │
              │  ─ settle(c%, r%)│   │  ─ weighted median    │
              └──────────────────┘   └───────────────────────┘
```

### DisputeRegistry — state owner
Keeps `Case` records. Drives the lifecycle and owns the verdict-application callbacks.
The only contract a normal user interacts with directly.

### EscrowVault — money owner
Generic native-STT escrow keyed by `escrowCaseId`. Funded by the claimant.
`settle(caseId, claimantShareWei, respondentShareWei)` is callable only by the registry,
and requires the two shares to sum exactly to the locked amount.

### JuryManager — agent orchestrator
Owns the platform integration. For each `requestVerdict`, it fires **5** `createAdvancedRequest` calls
to the SomniaAgents platform, one per juror, each with the same `casePrompt` but a different
`systemPrompt`. Responses callback via `handleResponse`; the final aggregation is a weighted median
where the Arbiter (J5) has weight 2 and the other four have weight 1.

### SomniaAgents platform
Chain-native multi-validator inference. `getAdvancedRequestDeposit(subSize)` returns the required
operations reserve; we add `llmRewardPerAgent × subSize` on top. Default subcommittee size is 3,
threshold 2, consensus type Majority, timeout 5 minutes.

---

## 2. Lifecycle

The case enum lives in [DisputeRegistry.sol](../contracts/contracts/core/DisputeRegistry.sol):

```
None → Open → (Completed | Disputed → EvidenceReady → JuryActive → (Resolved | TimedOut))
```

| State            | Set by                          | Notes |
|------------------|---------------------------------|-------|
| None             | initial                         | caseId not allocated |
| Open             | `createCase`                    | accepting funds |
| Completed        | `complete` (claimant only)      | non-disputed, 100% to respondent |
| Disputed         | `dispute` (either party)        | evidence collection open |
| EvidenceReady    | second `submitEvidence`         | both sides on record |
| JuryActive       | `requestVerdict`                | 5 platform requests in flight |
| Resolved         | `applyVerdict` (from jury)      | settled per `claimantSharePercent` |
| TimedOut         | `applyTimeout` (from jury)      | settled 50/50 |

---

## 3. End-to-end sequence

```
 Claimant      Respondent       DisputeRegistry        EscrowVault        JuryManager       SomniaAgents
   │               │                  │                    │                    │                 │
   ├─ createCase ─▶│                  │  openCase(...) ───▶│                    │                 │
   │               │                  │                    │                    │                 │
   ├─ fund (msg.value) ────────────────────────────────────▶                    │                 │
   │               │                  │                    │ Funded             │                 │
   │               │                  │                    │                    │                 │
   ├─ dispute ─────▶                  │                    │                    │                 │
   │               │  Disputed        │                    │                    │                 │
   ├─ submitEvidence ────────────────▶│                    │                    │                 │
   │               ├─ submitEvidence ─▶ EvidenceReady      │                    │                 │
   │               │                  │                    │                    │                 │
   ├─ requestVerdict (1.2 STT) ──────▶│  requestVerdict ──────────────────────▶│                  │
   │               │                  │                    │                    ├─ createAdvanced │
   │               │                  │                    │                    │   Request × 5 ─▶│
   │               │                  │                    │                    │                 │
   │               │  JuryActive      │                    │                    │                 │
   │                                                                            │                 │
   │                                                                            ◀── handleResp. ──┤
   │                                                                            ◀── handleResp. ──┤ (5×)
   │                                                                            │                 │
   │                                                       _aggregateWeightedMedian()             │
   │                                                                            │                 │
   │                                applyVerdict(...) ◀────────────────────────┤                  │
   │               │  Resolved        │                    │                    │                 │
   │               │                  │  settle(c%, r%) ──▶│                    │                 │
   │               │                  │                    │ pay claimant       │                 │
   │               │                  │                    │ pay respondent     │                 │
```

If **all** 5 jurors fail or timeout, `_finalize` emits `VerdictTimedOut` and calls
`applyTimeout(caseId, verdictId)` instead — registry settles 50/50.

---

## 4. The juror panel

| # | Juror              | System prompt focus                          | Weight |
|---|--------------------|----------------------------------------------|--------|
| 0 | Factual            | Literal facts, timeline, verifiable claims   | 1 |
| 1 | Technical          | Code/transactions/deliverables on technical merit | 1 |
| 2 | Contextual         | Intent, norms, customary practice            | 1 |
| 3 | Devil's Advocate   | Steelman the underdog; resist groupthink     | 1 |
| 4 | Arbiter            | Synthesize all perspectives                  | **2** |

Each juror is an `inferNumber` call (range `[0, 100]`, chain-of-thought on) against the same prompt
built by `_buildJuryPrompt` in DisputeRegistry. The aggregation in [JuryManager.sol](../contracts/contracts/core/JuryManager.sol):

```
1. Collect successful (verdict, weight) pairs.
2. Insertion-sort by verdict ascending.
3. totalWeight = Σweights; halfWeight = totalWeight / 2.
4. Walk sorted list, accumulate weight. First value whose cumulative weight
   strictly exceeds halfWeight is the median.
```

Why weighted median instead of mean? Robust to one outlier juror (e.g. Devil's Advocate sitting at 10
while everyone else clusters around 75 doesn't yank the result down).

---

## 5. Finalisation rules

- `FINALIZATION_THRESHOLD = 3` — at least 3 of 5 jurors must succeed to compute a verdict.
- Current rule: wait for **all 5** responses (success/failure) before finalising. Future short-circuit:
  if 3 succeed and remaining 2 cannot move the median, finalise early (`_outstandingCannotChange`
  returns false for V1 — conservative).
- If only 0 succeed once all 5 are in, `_finalize` calls `applyTimeout` and the registry splits 50/50.

---

## 6. Deposit math

Per juror:
```
reserve = platform.getAdvancedRequestDeposit(subSize)   // platform-set minimum
reward  = llmRewardPerAgent × subSize                   // our reward pot
perJuror = reserve + reward
```

Default values (`subSize = 3`, `llmRewardPerAgent = 0.07 STT`):
```
reserve = 0.01 × 3 = 0.03 STT
reward  = 0.07 × 3 = 0.21 STT
perJuror = 0.24 STT
totalDeposit = 0.24 × 5 = 1.20 STT
```

`JuryManager.estimateDepositWei()` returns this live from the platform.

---

## 7. What lives where on-chain

```
contracts/contracts/
├── core/
│   ├── DisputeRegistry.sol       case state machine, public-facing API
│   ├── EscrowVault.sol           STT custody, per-case settle
│   ├── JuryManager.sol           platform-side: 5 jurors, weighted median
│   ├── IDisputeRegistry.sol      verdict-applying interface
│   ├── IJuryManager.sol          jury request/events interface
│   └── IEscrowVault.sol          fund + settle interface
├── interfaces/
│   ├── AgentTypes.sol            shared enums/structs (ResponseStatus, ConsensusType, …)
│   ├── IAgentRequester.sol       platform: createRequest, createAdvancedRequest, deposit helpers
│   └── IAgentRequesterHandler.sol  callback signature for handleResponse
├── agents/
│   └── AgentEncoder.sol          ABI payload helpers (encodeInferNumber et al)
└── mocks/
    └── MockSomniaAgents.sol      local-only test double of the platform
```

See [CONTRACTS.md](CONTRACTS.md) for storage/events/errors per contract.
