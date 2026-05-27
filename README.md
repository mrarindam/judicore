# Judicore

> **Autonomous on-chain arbitration powered by a 5-agent AI jury.**
> Built for the [Somnia Agentathon](https://docs.somnia.network/). Sub-second trustless dispute resolution — no humans in the loop.

[![Tests](https://img.shields.io/badge/tests-6%2F6%20passing-brightgreen)]() [![Benchmark](https://img.shields.io/badge/benchmark-20%2F20%20within%20tolerance-brightgreen)]() [![Accuracy](https://img.shields.io/badge/MAE-3.8pp-blue)]() [![Network](https://img.shields.io/badge/Somnia-Testnet-purple)]()

---

## The pitch

When two parties disagree about an on-chain payment, today they have three bad options: argue in Discord, hire a real arbitrator (slow, expensive, off-chain), or just lose the money. Judicore replaces all three with a **five-juror panel of LLM agents** that:

1. Read both parties' statements + evidence
2. Each form an independent opinion (a number 0–100 — the claimant's fair share)
3. Are aggregated by a **weighted median** on-chain (the Arbiter's vote counts double)
4. Trigger a trustless settlement against the escrow

Total cost: **~1.2 STT** per dispute. Total time: **under 10 seconds** once the verdict is requested. Every juror response is signed by Somnia validators and verifiable via a public receipt.

## The panel

| #  | Juror              | System role                                     | Weight |
| -- | ------------------ | ----------------------------------------------- | ------ |
| J1 | Factual            | Verifies facts and timeline in evidence         | 1      |
| J2 | Technical          | Evaluates technical correctness of deliverables | 1      |
| J3 | Contextual         | Weighs intent, industry norms, reasonableness   | 1      |
| J4 | Devil's Advocate   | Stress-tests the dominant narrative             | 1      |
| J5 | Arbiter            | Synthesizes the panel. Final tie-breaker        | **2**  |

Each juror is a separate Somnia LLM Inference call with a distinct system prompt. The Arbiter's double weight gives the panel a tie-breaker without making it dictatorial — three normal jurors still outvote the Arbiter.

## Architecture

```
                          ┌─────────────────────────┐
   user files dispute ───▶│   DisputeRegistry.sol   │
                          │   case state machine    │
                          └────────────┬────────────┘
                                       │ requestVerdict
                                       ▼
                          ┌─────────────────────────┐
                          │     JuryManager.sol     │──┐
                          │   spawns 5 jurors       │  │  5× createAdvancedRequest()
                          │   weighted median       │  │  to SomniaAgents platform
                          │   handleResponse()      │  │
                          └────────────┬────────────┘  │
                                       │ applyVerdict   ▼
                                       │           ┌────────────────────────┐
                                       │           │  Somnia Agents L1      │
                                       │           │  5 LLM subcommittees   │
                                       │           │  deterministic         │
                                       ▼           │    consensus           │
                          ┌─────────────────────────┐│  signed receipts     │
                          │     EscrowVault.sol     │└────────────────────────┘
                          │   holds the bond        │
                          │   settle(c, a%, r%)     │
                          └─────────────────────────┘
```

**Why this only works on Somnia:** the chain provides deterministic LLM consensus (multiple validators agree on the AI output), native agent-callable contracts (`createAdvancedRequest`), and verifiable signed receipts for every inference call. The whole verdict — including the AI judgment — is auditable on-chain.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for full sequence diagrams and component responsibilities.

## Repo layout

```
contracts/
├── contracts/
│   ├── core/           DisputeRegistry, EscrowVault, JuryManager
│   ├── agents/         AgentEncoder library (Somnia ABI payload helpers)
│   ├── interfaces/     Platform interfaces (IAgentRequester, IAgentRequesterHandler)
│   └── mocks/          MockSomniaAgents for local testing
├── scripts/
│   ├── deploy.ts       One-shot deploy + wiring
│   ├── benchmark.ts    Accuracy harness against 20 labeled cases
│   └── demos/freelance.ts   End-to-end demo
├── test/               Hardhat tests (6 passing)
└── benchmark/cases.json    20 labeled disputes with human-judged ground truth

frontend/
├── app/
│   ├── page.tsx                  Home (filing + case list)
│   └── case/[id]/page.tsx        Live juror dashboard
├── components/
│   ├── JurorCard.tsx             Per-juror live status card
│   ├── NewDisputeForm.tsx, CaseList.tsx, EvidenceForm.tsx, CaseActions.tsx
│   └── Header.tsx, StatusBadge.tsx, ConnectButton.tsx
└── lib/
    ├── chains.ts, wagmi.ts, abis.ts, addresses.ts
    └── hooks.ts                  useCase, useVerdict, useCases — live polling

docs/
├── ARCHITECTURE.md     Sequence + component diagrams, end-to-end data flow
├── CONTRACTS.md        Contract-by-contract reference (storage, events, errors)
└── RUNNING.md          Local dev, testnet deploy, demo walkthrough
```

## Quality bar

### Tests — 6/6 passing

End-to-end coverage from case creation through verdict application:

```bash
cd contracts && npm test
```

### Benchmark — 20/20 cases within tolerance, MAE 3.8 pp

20 labeled disputes across 9 categories (freelance, SaaS SLA, NFT, marketplace, rental, consulting, validator slashing, DAO grants, edge cases). Each case has a human-judged ground-truth share and a tolerance band. With realistic juror noise (σ=6 percentage points), the weighted-median aggregation hits ground truth on every case:

```
Mean absolute error:  3.80 pp
Within tolerance:     20/20  (100.0%)
```

Run it yourself:

```bash
cd contracts && npm run benchmark
```

## Network

| Network         | Chain ID | SomniaAgents Platform                          |
| --------------- | -------- | ---------------------------------------------- |
| Somnia Testnet  | 50312    | `0x037Bb9C718F3f7fe5eCBDB0b600D607b52706776`   |

Judicore is **testnet-only**. The whole system depends on the Somnia Agents platform, which lives on Somnia Testnet at the address above.

## Quick start

### 1. Run tests + benchmark locally

```bash
cd contracts
npm install
npm test                    # 6/6 tests pass
npm run benchmark           # 20/20 cases pass, MAE 3.8pp
```

### 2. Run a local end-to-end demo

```bash
# terminal 1
cd contracts && npx hardhat node

# terminal 2
cd contracts
npx hardhat run scripts/deploy.ts --network localhost
npx hardhat run scripts/demos/freelance.ts --network localhost
```

You'll see a 5-juror verdict with simulated responses, producing a 78%/22% split.

### 3. Deploy to Somnia testnet + run the dApp

```bash
cd contracts
cp .env.example .env        # add your PRIVATE_KEY and LLM_INFERENCE_AGENT_ID
npm run deploy:testnet      # writes deployments/somniaTestnet.json
# copy the addresses into frontend/lib/addresses.ts

cd ../frontend
npm install
npm run dev                 # http://localhost:3000
```

Full walkthrough in [docs/RUNNING.md](docs/RUNNING.md).

## What we built (criteria mapping)

| Criterion                           | What we shipped                                                                                                                                                                                                                                                                                                                                                                                                          |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Functionality                       | Full lifecycle: open → fund → dispute → evidence → 5-juror verdict → trustless settlement. 6 passing tests, 20-case benchmark, working dApp.                                                                                                                                                                                                                                                                             |
| Agent-First Design                  | The system literally has no human in the loop after `requestVerdict`. Five autonomous agents deliberate; the contract applies their verdict directly to escrow. No oracles, no admins, no upgrade keys at runtime.                                                                                                                                                                                                       |
| Innovation & Technical Creativity   | (a) **Weighted-median consensus** on-chain in pure Solidity. (b) **Role-shaped jurors** — same model, five different prompts, intentionally including a Devil's Advocate to avoid groupthink. (c) **Arbiter ×2 weight** — the panel can outvote the Arbiter but it carries the most when jurors disagree. (d) **Benchmark harness** with labeled ground truth — verdict quality is *measured*, not asserted. |
| Autonomous Performance              | Verdicts finalize as soon as 3/5 jurors return success — no full quorum wait. Timeout-safe: if the panel can't reach quorum, escrow returns 50/50. Sub-second settlement once jurors respond.                                                                                                                                                                                                                            |

## Roadmap (post-hackathon)

- Upgrade J1–J3 to `inferToolsChat` — let jurors fetch IPFS evidence, on-chain transaction history, and live web context via MCP tools
- Stake-weighted appeal layer (any party can re-roll for a larger panel by posting more bond)
- Verdict explainer: have J5 emit a brief written reasoning alongside the number
- DAO-governable case categories with category-specific juror prompts

## References

- [Somnia Agents docs](https://metaversal.gitbook.io/agents/) — platform, agent ABI, consensus types
- [Somnia network docs](https://docs.somnia.network/) — RPC, explorer, faucet

---

**Built for the Somnia Agentathon.**
