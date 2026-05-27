// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { AgentTypes } from "../interfaces/AgentTypes.sol";
import { IAgentRequester } from "../interfaces/IAgentRequester.sol";
import { IAgentRequesterHandler } from "../interfaces/IAgentRequesterHandler.sol";

/// @title MockSomniaAgents
/// @notice Local test double for the SomniaAgents platform. Lets tests record
///         createRequest calls and synthesize callbacks at will.
contract MockSomniaAgents is IAgentRequester {
    uint256 public minPerAgentDeposit = 0.01 ether;
    uint256 public defaultSubcommitteeSize = 3;
    uint256 public nextRequestId;

    struct StoredRequest {
        uint256 agentId;
        address callbackAddress;
        bytes4 callbackSelector;
        bytes payload;
        uint256 deposit;
        uint256 subcommitteeSize;
        uint256 threshold;
        AgentTypes.ConsensusType consensusType;
        uint256 timeout;
        AgentTypes.ResponseStatus status;
    }

    mapping(uint256 => StoredRequest) public requests;

    event MockRequestCreated(uint256 indexed requestId, uint256 agentId, uint256 deposit);
    event MockCallbackFired(uint256 indexed requestId, AgentTypes.ResponseStatus status);

    function setMinPerAgentDeposit(uint256 v) external { minPerAgentDeposit = v; }
    function setDefaultSubcommitteeSize(uint256 v) external { defaultSubcommitteeSize = v; }

    function createRequest(
        uint256 agentId,
        address callbackAddress,
        bytes4 callbackSelector,
        bytes calldata payload
    ) external payable returns (uint256 requestId) {
        return _create(
            agentId, callbackAddress, callbackSelector, payload,
            defaultSubcommitteeSize, 2, AgentTypes.ConsensusType.Majority, 15 minutes
        );
    }

    function createAdvancedRequest(
        uint256 agentId,
        address callbackAddress,
        bytes4 callbackSelector,
        bytes calldata payload,
        uint256 subcommitteeSize,
        uint256 threshold,
        AgentTypes.ConsensusType consensusType,
        uint256 timeout
    ) external payable returns (uint256 requestId) {
        return _create(
            agentId, callbackAddress, callbackSelector, payload,
            subcommitteeSize, threshold, consensusType, timeout
        );
    }

    function _create(
        uint256 agentId,
        address callbackAddress,
        bytes4 callbackSelector,
        bytes calldata payload,
        uint256 subcommitteeSize,
        uint256 threshold,
        AgentTypes.ConsensusType consensusType,
        uint256 timeout
    ) internal returns (uint256 requestId) {
        requestId = ++nextRequestId;
        requests[requestId] = StoredRequest({
            agentId: agentId,
            callbackAddress: callbackAddress,
            callbackSelector: callbackSelector,
            payload: payload,
            deposit: msg.value,
            subcommitteeSize: subcommitteeSize,
            threshold: threshold,
            consensusType: consensusType,
            timeout: timeout,
            status: AgentTypes.ResponseStatus.Pending
        });
        emit MockRequestCreated(requestId, agentId, msg.value);
    }

    function getRequest(uint256 requestId) external view returns (AgentTypes.Request memory r) {
        StoredRequest storage s = requests[requestId];
        r.id = requestId;
        r.callbackAddress = s.callbackAddress;
        r.callbackSelector = s.callbackSelector;
        r.threshold = s.threshold;
        r.deadline = s.timeout;
        r.status = s.status;
        r.consensusType = s.consensusType;
        r.perAgentBudget = s.deposit / (s.subcommitteeSize == 0 ? 1 : s.subcommitteeSize);
    }

    function hasRequest(uint256 requestId) external view returns (bool) {
        return requestId != 0 && requestId <= nextRequestId;
    }

    function getRequestDeposit() external view returns (uint256) {
        return minPerAgentDeposit * defaultSubcommitteeSize;
    }

    function getAdvancedRequestDeposit(uint256 subcommitteeSize) external view returns (uint256) {
        return minPerAgentDeposit * subcommitteeSize;
    }

    // ---------- Test helpers ----------

    /// @notice Fire a synthetic SUCCESS callback for `requestId` with the given int256 verdict.
    function fireIntSuccess(uint256 requestId, int256 value) external {
        bytes memory encoded = abi.encode(value);
        _fire(requestId, encoded, AgentTypes.ResponseStatus.Success);
    }

    /// @notice Fire a synthetic failure callback.
    function fireFailure(uint256 requestId) external {
        _fire(requestId, "", AgentTypes.ResponseStatus.Failed);
    }

    /// @notice Fire a synthetic timeout callback.
    function fireTimeout(uint256 requestId) external {
        _fire(requestId, "", AgentTypes.ResponseStatus.TimedOut);
    }

    function _fire(uint256 requestId, bytes memory result, AgentTypes.ResponseStatus status) internal {
        StoredRequest storage s = requests[requestId];
        require(s.callbackAddress != address(0), "MockSomniaAgents: unknown request");
        s.status = status;

        AgentTypes.Response[] memory responses;
        if (status == AgentTypes.ResponseStatus.Success) {
            responses = new AgentTypes.Response[](1);
            responses[0] = AgentTypes.Response({
                validator: msg.sender,
                result: result,
                status: status,
                receipt: uint256(keccak256(abi.encode(requestId, "receipt"))),
                timestamp: block.timestamp,
                executionCost: 0
            });
        } else {
            responses = new AgentTypes.Response[](0);
        }

        AgentTypes.Request memory details;
        details.id = requestId;
        details.callbackAddress = s.callbackAddress;
        details.threshold = s.threshold;
        details.status = status;

        IAgentRequesterHandler(s.callbackAddress).handleResponse(requestId, responses, status, details);
        emit MockCallbackFired(requestId, status);
    }
}
