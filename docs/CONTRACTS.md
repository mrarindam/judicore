# Judicore — Contract Reference

Solidity 0.8.20, optimizer enabled (`runs: 200`, `viaIR: true`). All paths relative to `contracts/`.

---

## DisputeRegistry

[`contracts/core/DisputeRegistry.sol`](../contracts/contracts/core/DisputeRegistry.sol)

Public-facing case lifecycle. Owns the verdict-applying callbacks called from `JuryManager`.

### Immutables

| Name      | Type                | Set in              |
|-----------|---------------------|---------------------|
| `vault`   | `IEscrowVault`      | constructor         |
| `jury`    | `IJuryManager`      | constructor         |

### Storage

| Name             | Type                          | Notes |
|------------------|-------------------------------|-------|
| `nextCaseId`     | `uint256`                     | monotonic case id counter |
| `_cases`         | `mapping(uint256 => Case)`    | full case records |
| `verdictToCase`  | `mapping(uint256 => uint256)` | reverse lookup from verdictId |

### Enum

```solidity
enum CaseStatus {
    None,           // 0
    Open,           // 1
    Completed,      // 2 - non-disputed
    Disputed,       // 3
    EvidenceReady,  // 4
    JuryActive,     // 5
    Resolved,       // 6 - verdict applied
    TimedOut        // 7 - 50/50 fallback
}
```

### External / public functions

| Function | Caller | Effect |
|---|---|---|
| `createCase(claimant, respondent, expectedAmount, description)` | anyone | allocates `caseId`, opens an escrow case via `vault.openCase`, status → `Open` |
| `complete(caseId)` | claimant | non-disputed completion: status → `Completed`, escrow settles 100% to respondent |
| `dispute(caseId)` | either party | status `Open` → `Disputed` |
| `submitEvidence(caseId, statement, ipfsCids[])` | either party | overwrites caller's `Evidence`; once both submitted, status → `EvidenceReady` |
| `requestVerdict(caseId)` payable | anyone | requires status `EvidenceReady` and `msg.value ≥ jury.estimateDepositWei()`. Forwards to `jury.requestVerdict`. Status → `JuryActive` |
| `applyVerdict(caseId, verdictId, claimantSharePercent)` | `onlyJury` | settles escrow per percent, status → `Resolved` |
| `applyTimeout(caseId, verdictId)` | `onlyJury` | settles 50/50, status → `TimedOut` |
| `getCase(caseId)` | view | returns full `Case` struct |
| `caseStatus(caseId)` | view | returns just the status |

### Events

```solidity
event CaseCreated(uint256 indexed caseId, address indexed claimant,
                  address indexed respondent, uint256 expectedAmount, string description);
event CaseCompleted(uint256 indexed caseId, address indexed respondent, uint256 amount);
event Disputed(uint256 indexed caseId, address indexed initiator);
event EvidenceSubmitted(uint256 indexed caseId, address indexed party,
                        string statement, uint256 evidenceCount);
event VerdictRequested(uint256 indexed caseId, uint256 indexed verdictId, uint256 depositWei);
event VerdictApplied(uint256 indexed caseId, uint256 indexed verdictId,
                     uint8 claimantSharePercent, uint256 claimantShareWei, uint256 respondentShareWei);
event TimedOut(uint256 indexed caseId, uint256 indexed verdictId);
```

### Errors

```solidity
error CaseNotFound();
error InvalidStatus(CaseStatus expected, CaseStatus actual);
error NotParticipant();
error AlreadySubmitted();
error NotJury();
error ZeroAddress();
```

---

## JuryManager

[`contracts/core/JuryManager.sol`](../contracts/contracts/core/JuryManager.sol)

Owns the SomniaAgents integration. 5 jurors, weighted median. `Ownable`.

### Constants

| Name | Value | Meaning |
|---|---|---|
| `JUROR_COUNT` | `5` | size of the panel |
| `FINALIZATION_THRESHOLD` | `3` | minimum successful responses to compute a verdict |

### Owner-set config

| Setter | Field | Default |
|---|---|---|
| `setRegistry(IDisputeRegistry)` | `registry` | — |
| `setLlmInferenceAgentId(uint256)` | `llmInferenceAgentId` | 0 (must set before requesting) |
| `setLlmRewardPerAgent(uint256)` | `llmRewardPerAgent` | `0.07 ether` |
| `setJuryParams(subSize, threshold, timeout)` | `jurorSubcommitteeSize` / `jurorThreshold` / `jurorTimeout` | 3 / 2 / 5 min |

### Storage

| Name | Type | Notes |
|---|---|---|
| `platform` | `IAgentRequester (immutable)` | SomniaAgents platform address |
| `nextVerdictId` | `uint256` | monotonic verdict id |
| `_verdicts` | `mapping(uint256 => VerdictRecord)` | full records |
| `requestToVerdict` | `mapping(uint256 => uint256)` | platform requestId → our verdictId |
| `requestToJurorIndex` | `mapping(uint256 => uint8)` | platform requestId → juror 0..4 |

`VerdictRecord` includes `JurorResult[5]` (verdict, receiptId, received, success) and the
five platform `requestIds` in juror order.

### Functions

| Function | Caller | Effect |
|---|---|---|
| `requestVerdict(caseId, prompt) payable` | `onlyRegistry` | fires 5 `createAdvancedRequest` calls (one per juror), allocates `verdictId`, requires `msg.value ≥ perJuror×5` |
| `handleResponse(requestId, responses, status, request)` | `onlyPlatform` | decodes `int256` verdict if `Success`, clamps to `[0, 100]`, may call `_finalize` |
| `estimateDepositWei()` | view | `_perJurorDepositWei() × 5` |
| `getVerdict(verdictId)` | view | full record |
| `receive() payable` | platform refund | emits `RefundReceived` |

Internal `_finalize` calls `registry.applyVerdict(caseId, verdictId, share)` if ≥1 juror succeeded,
or `registry.applyTimeout(caseId, verdictId)` if all failed.

### Events

```solidity
event VerdictRequested(uint256 indexed caseId, uint256 indexed verdictId, uint8 jurorCount);
event JurorResponded(uint256 indexed verdictId, uint8 indexed jurorIndex,
                     int256 verdict, uint256 receiptId);
event VerdictFinalized(uint256 indexed verdictId, uint256 indexed caseId, uint8 claimantSharePercent);
event VerdictTimedOut(uint256 indexed verdictId, uint256 indexed caseId);
event RegistrySet(address indexed registry);
event LlmAgentIdSet(uint256 agentId);
event LlmRewardPerAgentSet(uint256 rewardWei);
event JuryParamsSet(uint256 subcommitteeSize, uint256 threshold, uint256 timeout);
event RefundReceived(uint256 amount);
```

### Errors

```solidity
error NotPlatform();
error NotRegistry();
error ZeroAddress();
error InsufficientDeposit(uint256 required, uint256 provided);
error AgentIdNotSet();
error UnknownRequest(uint256 requestId);
error AlreadyFinalized();
```

---

## EscrowVault

[`contracts/core/EscrowVault.sol`](../contracts/contracts/core/EscrowVault.sol)

Native-token escrow keyed by `caseId`. `ReentrancyGuard`-protected `settle`.

### Storage

| Name | Type | Notes |
|---|---|---|
| `registry` | `address` | the DisputeRegistry — set exactly once by `initializer` |
| `initializer` | `address (immutable)` | deployer |
| `nextCaseId` | `uint256` | escrow case id counter |
| `_cases` | `mapping(uint256 => EscrowCase)` | claimant, respondent, expectedAmount, lockedAmountWei, settled |

### Functions

| Function | Caller | Effect |
|---|---|---|
| `setRegistry(address)` | `onlyInitializer`, once | wires the registry |
| `openCase(claimant, respondent, expectedAmount)` | `onlyRegistry` | allocates an escrow case |
| `fund(caseId) payable` | claimant or respondent | adds to `lockedAmountWei` |
| `settle(caseId, claimantShareWei, respondentShareWei)` | `onlyRegistry`, `nonReentrant` | shares must sum to `lockedAmount`; pays each side, marks settled |
| `lockedAmount(caseId)` / `getCase(caseId)` | view |

### Events

```solidity
event Funded(uint256 indexed caseId, address indexed funder, uint256 amount);
event Settled(uint256 indexed caseId, address indexed claimant, address indexed respondent,
              uint256 claimantShareWei, uint256 respondentShareWei);
event RegistrySet(address indexed registry);
```

### Errors

```solidity
error NotRegistry();
error NotInitializer();
error AlreadyInitialized();
error CaseNotFound(uint256 caseId);
error CaseAlreadySettled(uint256 caseId);
error ZeroParticipant();
error PartyMismatch();
error AllocationMismatch(uint256 expected, uint256 provided);
error TransferFailed(address to, uint256 amount);
```

---

## AgentEncoder (library)

[`contracts/agents/AgentEncoder.sol`](../contracts/contracts/agents/AgentEncoder.sol)

Helpers that ABI-encode payloads for the SomniaAgents `inferNumber`, `inferText`, etc. variants.
`JuryManager` calls `encodeInferNumber(prompt, systemPrompt, minVal, maxVal, useCoT)` per juror.

---

## Interfaces

| File | What it specifies |
|---|---|
| [`interfaces/AgentTypes.sol`](../contracts/contracts/interfaces/AgentTypes.sol) | Shared enums and structs that mirror the platform: `ConsensusType`, `ResponseStatus`, `Request`, `Response`. |
| [`interfaces/IAgentRequester.sol`](../contracts/contracts/interfaces/IAgentRequester.sol) | Platform-side: `createRequest`, `createAdvancedRequest`, `getAdvancedRequestDeposit`, etc. Testnet address `0x037Bb9C718F3f7fe5eCBDB0b600D607b52706776` (chainId 50312). |
| [`interfaces/IAgentRequesterHandler.sol`](../contracts/contracts/interfaces/IAgentRequesterHandler.sol) | Callback shape (`handleResponse`) implemented by `JuryManager`. |
| [`core/IDisputeRegistry.sol`](../contracts/contracts/core/IDisputeRegistry.sol) | `applyVerdict` + `applyTimeout` — what jury calls back into. |
| [`core/IJuryManager.sol`](../contracts/contracts/core/IJuryManager.sol) | `requestVerdict` + `estimateDepositWei` — what registry calls. |
| [`core/IEscrowVault.sol`](../contracts/contracts/core/IEscrowVault.sol) | `openCase`, `fund`, `settle`, `lockedAmount`. |

---

## MockSomniaAgents

[`contracts/mocks/MockSomniaAgents.sol`](../contracts/contracts/mocks/MockSomniaAgents.sol)

Local test double of the platform. Test/demo helpers:

- `setMinPerAgentDeposit(uint256)` — drop deposits to 0 in the benchmark
- `fireIntSuccess(requestId, value)` — synthesises a `Success` callback with an int verdict
- `fireFailure(requestId)` — synthesises a `Failure` callback
- `fireTimeout(requestId)` — synthesises a `Timeout` callback

Used everywhere `network.name === "hardhat" || "localhost"`, and in `endToEnd.test.ts`.

---

## Deployment wiring (one-shot, see `scripts/deploy.ts`)

```
1. (local only) deploy MockSomniaAgents → platform
   (testnet) read KNOWN_PLATFORMS[chainId]
2. deploy JuryManager(platform)
3. deploy EscrowVault()
4. deploy DisputeRegistry(vault, jury)
5. vault.setRegistry(registry)
6. jury.setRegistry(registry)
7. jury.setLlmInferenceAgentId(LLM_INFERENCE_AGENT_ID)
8. (optional) jury.setLlmRewardPerAgent(LLM_REWARD_PER_AGENT_WEI)
9. write deployments/<network>.json with addresses + config
```
