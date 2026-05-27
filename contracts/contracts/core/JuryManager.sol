// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { AgentTypes } from "../interfaces/AgentTypes.sol";
import { IAgentRequester } from "../interfaces/IAgentRequester.sol";
import { IAgentRequesterHandler } from "../interfaces/IAgentRequesterHandler.sol";
import { AgentEncoder } from "../agents/AgentEncoder.sol";
import { IJuryManager } from "./IJuryManager.sol";
import { IDisputeRegistry } from "./IDisputeRegistry.sol";

/// @title JuryManager
/// @notice Spawns a 5-juror panel via the Somnia Agents platform. Each juror has a
///         distinct role (Factual, Technical, Contextual, Devil's Advocate, Arbiter)
///         and outputs an integer in [0, 100] representing the claimant's share.
///         Verdicts are aggregated via a weighted median once a threshold of jurors
///         has responded successfully.
contract JuryManager is IJuryManager, IAgentRequesterHandler, Ownable {
    // ---------- Configuration ----------

    uint8 public constant JUROR_COUNT = 5;
    uint8 public constant FINALIZATION_THRESHOLD = 3; // 3 successful responses required to finalize

    /// @notice Subcommittee size used per juror call (default 3 = doc recommendation)
    uint256 public jurorSubcommitteeSize = 3;
    /// @notice Within a juror's subcommittee, how many validators must agree
    uint256 public jurorThreshold = 2;
    /// @notice Timeout for each juror call
    uint256 public jurorTimeout = 5 minutes;

    /// @notice LLM Inference agent id (set by owner after platform discovery)
    uint256 public llmInferenceAgentId;
    /// @notice Per-agent reward portion for LLM Inference (default 0.07 STT)
    uint256 public llmRewardPerAgent = 0.07 ether;

    IAgentRequester public immutable platform;
    IDisputeRegistry public registry;

    // ---------- State ----------

    struct JurorResult {
        int256 verdict;          // 0-100
        uint256 receiptId;
        bool received;
        bool success;
    }

    struct VerdictRecord {
        uint256 caseId;
        uint8 responsesReceived;
        uint8 successfulResponses;
        bool finalized;
        JurorResult[5] jurors;
        uint256[5] requestIds; // somnia platform requestIds, in order [J1..J5]
    }

    uint256 public nextVerdictId;
    mapping(uint256 => VerdictRecord) private _verdicts;
    mapping(uint256 => uint256) public requestToVerdict;   // somnia requestId -> our verdictId
    mapping(uint256 => uint8) public requestToJurorIndex;  // somnia requestId -> juror index (0-4)

    // ---------- Errors / events ----------

    error NotPlatform();
    error NotRegistry();
    error ZeroAddress();
    error InsufficientDeposit(uint256 required, uint256 provided);
    error AgentIdNotSet();
    error UnknownRequest(uint256 requestId);
    error AlreadyFinalized();

    event RegistrySet(address indexed registry);
    event LlmAgentIdSet(uint256 agentId);
    event LlmRewardPerAgentSet(uint256 rewardWei);
    event JuryParamsSet(uint256 subcommitteeSize, uint256 threshold, uint256 timeout);
    event RefundReceived(uint256 amount);

    modifier onlyPlatform() {
        if (msg.sender != address(platform)) revert NotPlatform();
        _;
    }

    constructor(IAgentRequester platform_) Ownable(msg.sender) {
        if (address(platform_) == address(0)) revert ZeroAddress();
        platform = platform_;
    }

    // ---------- Admin ----------

    function setRegistry(IDisputeRegistry registry_) external onlyOwner {
        if (address(registry_) == address(0)) revert ZeroAddress();
        registry = registry_;
        emit RegistrySet(address(registry_));
    }

    function setLlmInferenceAgentId(uint256 agentId) external onlyOwner {
        llmInferenceAgentId = agentId;
        emit LlmAgentIdSet(agentId);
    }

    function setLlmRewardPerAgent(uint256 rewardWei) external onlyOwner {
        llmRewardPerAgent = rewardWei;
        emit LlmRewardPerAgentSet(rewardWei);
    }

    function setJuryParams(uint256 subSize, uint256 threshold, uint256 timeout) external onlyOwner {
        require(subSize >= 1 && subSize <= 10, "subSize out of range");
        require(threshold >= 1 && threshold <= subSize, "threshold out of range");
        jurorSubcommitteeSize = subSize;
        jurorThreshold = threshold;
        jurorTimeout = timeout;
        emit JuryParamsSet(subSize, threshold, timeout);
    }

    // ---------- Verdict request ----------

    /// @inheritdoc IJuryManager
    function requestVerdict(uint256 caseId, string calldata prompt)
        external
        payable
        returns (uint256 verdictId)
    {
        if (msg.sender != address(registry)) revert NotRegistry();
        if (llmInferenceAgentId == 0) revert AgentIdNotSet();

        uint256 perJurorDeposit = _perJurorDepositWei();
        uint256 required = perJurorDeposit * JUROR_COUNT;
        if (msg.value < required) revert InsufficientDeposit(required, msg.value);

        verdictId = ++nextVerdictId;
        VerdictRecord storage v = _verdicts[verdictId];
        v.caseId = caseId;

        for (uint8 i = 0; i < JUROR_COUNT; i++) {
            bytes memory payload = _encodeJurorPayload(i, prompt);
            uint256 reqId = platform.createAdvancedRequest{ value: perJurorDeposit }(
                llmInferenceAgentId,
                address(this),
                this.handleResponse.selector,
                payload,
                jurorSubcommitteeSize,
                jurorThreshold,
                AgentTypes.ConsensusType.Majority,
                jurorTimeout
            );
            v.requestIds[i] = reqId;
            requestToVerdict[reqId] = verdictId;
            requestToJurorIndex[reqId] = i;
        }

        emit VerdictRequested(caseId, verdictId, JUROR_COUNT);
    }

    /// @inheritdoc IJuryManager
    function estimateDepositWei() external view returns (uint256) {
        return _perJurorDepositWei() * JUROR_COUNT;
    }

    function _perJurorDepositWei() internal view returns (uint256) {
        // reserve = minPerAgentDeposit × subcommitteeSize, fetched from platform
        // reward  = llmRewardPerAgent × subcommitteeSize, our configured cost
        uint256 reserve = platform.getAdvancedRequestDeposit(jurorSubcommitteeSize);
        uint256 reward = llmRewardPerAgent * jurorSubcommitteeSize;
        return reserve + reward;
    }

    // ---------- Platform callback ----------

    function handleResponse(
        uint256 requestId,
        AgentTypes.Response[] memory responses,
        AgentTypes.ResponseStatus status,
        AgentTypes.Request memory /* details */
    ) external onlyPlatform {
        uint256 verdictId = requestToVerdict[requestId];
        if (verdictId == 0) revert UnknownRequest(requestId);

        VerdictRecord storage v = _verdicts[verdictId];
        if (v.finalized) return; // ignore late stragglers

        uint8 jurorIndex = requestToJurorIndex[requestId];
        JurorResult storage jr = v.jurors[jurorIndex];
        if (jr.received) return; // dedupe
        jr.received = true;
        v.responsesReceived += 1;

        if (status == AgentTypes.ResponseStatus.Success && responses.length > 0) {
            int256 value = abi.decode(responses[0].result, (int256));
            if (value < 0) value = 0;
            if (value > 100) value = 100;
            jr.verdict = value;
            jr.success = true;
            jr.receiptId = responses[0].receipt;
            v.successfulResponses += 1;
            emit JurorResponded(verdictId, jurorIndex, value, responses[0].receipt);
        }

        _maybeFinalize(verdictId);
    }

    function _maybeFinalize(uint256 verdictId) internal {
        VerdictRecord storage v = _verdicts[verdictId];
        if (v.finalized) return;

        bool allReceived = v.responsesReceived == JUROR_COUNT;
        bool thresholdMet = v.successfulResponses >= FINALIZATION_THRESHOLD;

        // Finalize when we have enough successful responses AND no outstanding can change outcome,
        // OR when everyone has reported.
        if (allReceived || (thresholdMet && _outstandingCannotChange(v))) {
            _finalize(verdictId);
        }
    }

    /// @dev With weighted-median aggregation it's hard to short-circuit safely.
    ///      Conservative rule: finalize early only if we have ALL 5 OR the remaining jurors
    ///      cannot affect the simple median (i.e., 3 successful + 2 outstanding with bounded range).
    ///      For V1, simply require allReceived. Outstanding short-circuit reserved for future.
    function _outstandingCannotChange(VerdictRecord storage /* v */) internal pure returns (bool) {
        return false;
    }

    function _finalize(uint256 verdictId) internal {
        VerdictRecord storage v = _verdicts[verdictId];
        if (v.finalized) revert AlreadyFinalized();
        v.finalized = true;

        if (v.successfulResponses == 0) {
            emit VerdictTimedOut(verdictId, v.caseId);
            registry.applyTimeout(v.caseId, verdictId);
            return;
        }

        uint8 share = _aggregateWeightedMedian(v);
        emit VerdictFinalized(verdictId, v.caseId, share);
        registry.applyVerdict(v.caseId, verdictId, share);
    }

    /// @dev Weighted median: J5 (Arbiter, index 4) carries weight 2, others weight 1.
    ///      Total weight = 6. Median value is the smallest value whose cumulative
    ///      weight crosses 3 (half).
    function _aggregateWeightedMedian(VerdictRecord storage v) internal view returns (uint8) {
        // Collect (value, weight) for successful responses
        int256[5] memory values;
        uint8[5] memory weights;
        uint8 n = 0;
        for (uint8 i = 0; i < JUROR_COUNT; i++) {
            if (!v.jurors[i].success) continue;
            values[n] = v.jurors[i].verdict;
            weights[n] = (i == 4) ? 2 : 1; // arbiter weight
            n++;
        }

        // Sort by value (insertion sort, n <= 5)
        for (uint8 i = 1; i < n; i++) {
            int256 cv = values[i];
            uint8 cw = weights[i];
            uint8 j = i;
            while (j > 0 && values[j - 1] > cv) {
                values[j] = values[j - 1];
                weights[j] = weights[j - 1];
                j--;
            }
            values[j] = cv;
            weights[j] = cw;
        }

        uint256 totalWeight = 0;
        for (uint8 i = 0; i < n; i++) totalWeight += weights[i];
        uint256 halfWeight = totalWeight / 2;

        uint256 acc = 0;
        for (uint8 i = 0; i < n; i++) {
            acc += weights[i];
            if (acc > halfWeight) {
                int256 val = values[i];
                if (val < 0) val = 0;
                if (val > 100) val = 100;
                return uint8(uint256(val));
            }
        }
        // Defensive default (unreachable when n > 0)
        return 50;
    }

    // ---------- Views ----------

    function getVerdict(uint256 verdictId)
        external
        view
        returns (
            uint256 caseId,
            uint8 responsesReceived,
            uint8 successfulResponses,
            bool finalized,
            JurorResult[5] memory jurors,
            uint256[5] memory requestIds
        )
    {
        VerdictRecord storage v = _verdicts[verdictId];
        return (v.caseId, v.responsesReceived, v.successfulResponses, v.finalized, v.jurors, v.requestIds);
    }

    // ---------- Juror prompt composition ----------

    /// @dev Each juror sees the same case prompt but a different system prompt,
    ///      shaping its role within the panel. All output a single integer 0-100.
    function _encodeJurorPayload(uint8 jurorIndex, string memory casePrompt)
        internal
        pure
        returns (bytes memory)
    {
        return AgentEncoder.encodeInferNumber(
            casePrompt,
            _systemPromptFor(jurorIndex),
            int256(0),
            int256(100),
            true // chain-of-thought
        );
    }

    function _systemPromptFor(uint8 jurorIndex) internal pure returns (string memory) {
        if (jurorIndex == 0) {
            return string.concat(
                "You are the FACTUAL JUROR. Your role: weigh the literal facts each party asserts. ",
                "Trust verifiable statements; discount unsupported claims. ",
                "Output a single integer 0-100 representing the claimant's fair share of the bond. ",
                "0 means respondent keeps everything, 100 means claimant gets everything."
            );
        } else if (jurorIndex == 1) {
            return string.concat(
                "You are the TECHNICAL JUROR. Your role: evaluate technical evidence (code, ",
                "transactions, deliverables, proofs). Judge whether the work meets the technical bar. ",
                "Output a single integer 0-100 representing the claimant's fair share of the bond."
            );
        } else if (jurorIndex == 2) {
            return string.concat(
                "You are the CONTEXTUAL JUROR. Your role: consider broader context, intent, ",
                "industry norms, and customary practice. Be fair to both parties' reasonable expectations. ",
                "Output a single integer 0-100 representing the claimant's fair share of the bond."
            );
        } else if (jurorIndex == 3) {
            return string.concat(
                "You are the DEVIL'S ADVOCATE. Your role: find weaknesses in the dominant narrative ",
                "and steelman the underdog position. Resist groupthink. ",
                "Output a single integer 0-100 representing the claimant's fair share of the bond."
            );
        } else {
            return string.concat(
                "You are the FINAL ARBITER. Your role: synthesize all perspectives - factual, ",
                "technical, contextual, and dissenting. Make the decision a wise judge would. ",
                "Output a single integer 0-100 representing the claimant's fair share of the bond."
            );
        }
    }

    // ---------- Refund handling ----------

    /// @notice Platform refunds unused deposit via plain transfer.
    receive() external payable {
        emit RefundReceived(msg.value);
    }
}
