# Judicore Contracts

Solidity contracts powering the Judicore autonomous arbitration system on **Somnia Testnet**.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│   DisputeRegistry                                           │
│   - case lifecycle state machine                            │
│   - evidence collection                                     │
│   - applyVerdict / applyTimeout callbacks                   │
└───────────────────────┬─────────────────────────────────────┘
        │              │
        │ openCase /   │ requestVerdict
        │ settle       │ (1.2 STT msg.value)
        ▼              ▼
┌──────────────┐   ┌──────────────────────────────────────────┐
│ EscrowVault  │   │ JuryManager                              │
│ - locks bond │   │ - 5x createAdvancedRequest               │
│ - settles    │   │ - handleResponse callbacks               │
└──────────────┘   │ - weighted-median aggregation            │
                   └─────────────┬────────────────────────────┘
                                 │ createAdvancedRequest
                                 ▼
                   ┌──────────────────────────────────────────┐
                   │ SomniaAgents platform (Testnet)          │
                   │ - 5 × LLM Inference subcommittees        │
                   └──────────────────────────────────────────┘
```

## Contracts

| Contract | Purpose |
|---|---|
| [`interfaces/AgentTypes.sol`](contracts/interfaces/AgentTypes.sol) | Enums and structs mirroring the Somnia agent platform |
| [`interfaces/IAgentRequester.sol`](contracts/interfaces/IAgentRequester.sol) | Platform interface (createRequest / createAdvancedRequest) |
| [`interfaces/IAgentRequesterHandler.sol`](contracts/interfaces/IAgentRequesterHandler.sol) | Callback receiver interface |
| [`agents/AgentEncoder.sol`](contracts/agents/AgentEncoder.sol) | ABI payload helpers for LLM Inference, JSON API, Web Parse |
| [`core/EscrowVault.sol`](contracts/core/EscrowVault.sol) | Native-token escrow with per-case settlement |
| [`core/DisputeRegistry.sol`](contracts/core/DisputeRegistry.sol) | Case state machine and verdict application |
| [`core/JuryManager.sol`](contracts/core/JuryManager.sol) | 5-juror panel with weighted-median consensus |
| [`mocks/MockSomniaAgents.sol`](contracts/mocks/MockSomniaAgents.sol) | Test double for the platform |

See [../docs/CONTRACTS.md](../docs/CONTRACTS.md) for per-contract storage, events, errors and call sequences.

## The 5 jurors

Each juror is its own subcommittee invocation of the LLM Inference agent. System prompts differentiate the roles:

| Juror | System prompt focus | Weight |
|---|---|---|
| J1 Factual | weighs literal facts | 1 |
| J2 Technical | evaluates code/tx/deliverables | 1 |
| J3 Contextual | considers intent and norms | 1 |
| J4 Devil's Advocate | steelman the underdog | 1 |
| J5 Arbiter | synthesises the panel | **2** |

All output an `int256` in `[0, 100]` (claimant's share of the bond). Aggregation is a weighted median; J5's double weight reflects its role as the synthesiser.

Finalisation rule: wait until all 5 jurors have either responded or timed out. If ≥ 1 succeeded, apply the weighted median. Otherwise, apply the 50/50 timeout fallback.

## Network

| Network         | Chain ID | SomniaAgents Platform                          |
| --------------- | -------- | ---------------------------------------------- |
| Somnia Testnet  | 50312    | `0x037Bb9C718F3f7fe5eCBDB0b600D607b52706776`   |

Local hardhat (chainId 31337) uses `MockSomniaAgents`. There is no mainnet target — Judicore depends on the Somnia Agents platform, which runs on testnet.

## Setup

```bash
npm install
cp .env.example .env   # fill PRIVATE_KEY and LLM_INFERENCE_AGENT_ID
npm run compile
npm test               # runs the 6-case E2E suite against MockSomniaAgents
```

## Deploy

### Local (hardhat node)

```bash
# Terminal 1
npx hardhat node

# Terminal 2
USE_MOCK_PLATFORM=true LLM_INFERENCE_AGENT_ID=1234567890 \
  npx hardhat run scripts/deploy.ts --network localhost

npx hardhat run scripts/demos/freelance.ts --network localhost
```

### Somnia testnet

```bash
# .env must contain PRIVATE_KEY and LLM_INFERENCE_AGENT_ID
npm run deploy:testnet
npm run demo:freelance
```

The demo script will create a real dispute, fund it, file evidence, request a verdict, and poll until the 5 Somnia agent subcommittees finalise. Receipt URLs are printed at the end.

## Cost

Per dispute (default settings, 5 jurors × subcommittee=3):

| Component | Cost |
|---|---|
| Operations reserve | 5 × (0.01 × 3) = 0.15 STT |
| Reward pot         | 5 × (0.07 × 3) = 1.05 STT |
| **Total verdict**  | **1.20 STT** |

`jury.estimateDepositWei()` returns this value at runtime.

## Test coverage

```
Judicore end-to-end
  ✔ computes the right deposit estimate for 5 jurors
  ✔ runs the full happy path: create -> fund -> dispute -> evidence -> verdict -> settle
  ✔ handles partial juror failure (3 successful, 2 failed)
  ✔ falls back to 50/50 timeout if all jurors fail
  ✔ rejects under-funded verdict requests
  ✔ completes non-disputed cases immediately
```

## Notes for the live demo

- `setLlmInferenceAgentId` must be called by the deployer once the agent id is known on Somnia. The deploy script picks it up from `LLM_INFERENCE_AGENT_ID`.
- The JuryManager receives platform refunds via `receive()` and emits `RefundReceived(amount)`. Excess deposit is returned to the JuryManager (not the original requester); a future iteration can sweep it back.
- `inferToolsChat` upgrade (jurors using MCP / on-chain tools) is queued for the Phase-2 jurors and will replace `inferNumber` for J1-J3 once stable.
