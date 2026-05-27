# Judicore — Running it

Three modes: **local hardhat** (instant, free), **Somnia Testnet** (real agents, ~1.2 STT/verdict), and **dApp** (Next.js frontend against either of the above).

---

## Prerequisites

- Node.js ≥ 20
- A Somnia Testnet wallet with some STT (faucet via [Somnia docs](https://docs.somnia.network/))
- An `LLM_INFERENCE_AGENT_ID` from the SomniaAgents discovery flow

There is no mainnet target — the SomniaAgents platform that Judicore depends on lives on Somnia Testnet.

---

## 1. Local hardhat (zero cost, simulated jurors)

### Tests

```bash
cd contracts
npm install
npm test
```

6/6 passing covers: deposit estimate, full happy-path, partial juror failure, all-fail timeout, under-funded request rejection, non-disputed completion.

### Benchmark (20 labelled cases)

```bash
cd contracts
npm run benchmark
```

Deploys mocks, runs 20 disputes from [`benchmark/cases.json`](../contracts/benchmark/cases.json), synthesises juror responses (Gaussian noise σ=6 around the ground-truth share by default), and reports MAE + per-category breakdown. Tunables:

```bash
BENCH_CASE=freelance-no-delivery npm run benchmark   # single case
BENCH_NOISE=8 npm run benchmark                      # change juror noise stddev
```

### Demo: freelance dispute (local)

```bash
# Terminal 1
cd contracts && npx hardhat node

# Terminal 2
cd contracts
USE_MOCK_PLATFORM=true LLM_INFERENCE_AGENT_ID=1234567890 \
  npx hardhat run scripts/deploy.ts --network localhost
npx hardhat run scripts/demos/freelance.ts --network localhost
```

What you'll see: `createCase` → `fund` → `dispute` → `submitEvidence` (Alice, Bob) → `requestVerdict`, then the script fires 5 mock juror responses `[80, 75, 70, 30, 78]` and prints the final share + per-juror "receipt" pointers.

---

## 2. Somnia Testnet (real agents, real STT)

### Configure `.env`

```bash
cd contracts
cp .env.example .env
```

Edit `.env`:

```
PRIVATE_KEY=0x...                          # deployer + demo signer
SOMNIA_TESTNET_RPC=https://dream-rpc.somnia.network   # default in hardhat.config.ts
LLM_INFERENCE_AGENT_ID=<your-agent-id>     # numeric id from the platform
SOMNIA_DEPOSIT_BUFFER=1.5                  # optional safety multiplier
```

### Preflight check

```bash
npx hardhat run scripts/preflight.ts --network somniaTestnet
```

Confirms RPC reachability, deployer balance, gas headroom (~2 STT is comfortable).

### Deploy

```bash
npm run deploy:testnet
```

Writes [`deployments/somniaTestnet.json`](../contracts/deployments/somniaTestnet.json) with all four addresses + `verdictDepositWei`.

If you've redeployed and need to (re)wire the agent id:

```bash
npx hardhat run scripts/setAgentId.ts --network somniaTestnet
```

### Run the live freelance demo

```bash
npm run demo:freelance
```

This creates a real dispute and polls every 5 s until the panel returns. Expected wall-clock: a few seconds to a minute depending on validator load. The script prints juror-by-juror receipts pointing at `https://receipts.testnet.agents.somnia.host`.

---

## 3. The dApp (Next.js frontend)

```bash
cd frontend
npm install
npm run dev
# http://localhost:3000
```

`frontend/lib/addresses.ts` already points at the canonical testnet deployment. If you've redeployed your own copy, paste the four addresses from `contracts/deployments/somniaTestnet.json` into the `50312` entry.

In the dApp:

1. Connect a wallet on Somnia Testnet (chainId 50312, RPC baked into `frontend/lib/chains.ts`).
2. **/** — file a new dispute with the form. You pay the bond on submit.
3. **/disputes** — browse open/recent cases.
4. **/case/[id]** — live view: status badge, evidence panel, 5 juror cards refreshing every 2 s. When jurors return, their card flips to ✓ + a receipt link.

### Build & serve a production build

```bash
npm run build
npm start
```

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `AgentIdNotSet` revert on `requestVerdict` | `jury.llmInferenceAgentId` is 0 | `setAgentId.ts` or set in `.env` and redeploy |
| `InsufficientDeposit(required, provided)` | `msg.value` < `estimateDepositWei()` | check `jury.estimateDepositWei()` before sending |
| Stuck in `JuryActive` for >10 min | All 5 platform requests timed out | the contract will fall back to `applyTimeout` (50/50) once `handleResponse` arrives for the last juror |
| Frontend shows zero cases | wrong `chainId` in wallet, or `addresses.ts` not updated for your deploy | switch wallet to Somnia Testnet, repaste addresses |
| `npm run benchmark` errors with low ETH | running on testnet by mistake | benchmark only supports `hardhat` / `localhost` |

---

## Cost cheatsheet

| Action | Approx cost (testnet STT) |
|---|---|
| Deploy 3 contracts (one-shot) | ~0.1 |
| `createCase` + `fund` | gas only (~0.001) |
| `dispute` + 2× `submitEvidence` | gas only |
| `requestVerdict` | **~1.2** (5 juror agents × subcommittee=3) |
| `applyVerdict` (jury callback) | gas only — paid by callback path |

`jury.estimateDepositWei()` is the source of truth — it polls the platform's `getAdvancedRequestDeposit` at call time.
