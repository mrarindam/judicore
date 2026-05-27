// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { AgentTypes } from "./AgentTypes.sol";

/// @title IAgentRequester - SomniaAgents platform contract interface
/// @notice Use to invoke decentralized agents (LLM Inference, JSON API, Web Parse)
/// @dev Testnet:  0x037Bb9C718F3f7fe5eCBDB0b600D607b52706776 (chainId 50312)
interface IAgentRequester {
    event RequestCreated(
        uint256 indexed requestId,
        uint256 indexed agentId,
        uint256 perAgentBudget,
        bytes payload,
        address[] subcommittee
    );
    event RequestFinalized(uint256 indexed requestId, AgentTypes.ResponseStatus status);
    event SubcommitteePaid(uint256 indexed requestId, uint256 totalPaid, uint256 perMember);
    event CommitteeDepositFailed(uint256 indexed requestId, uint256 attemptedAmount);

    /// @notice Create a default request (subcommittee=3, threshold=2, Majority, 15min timeout)
    function createRequest(
        uint256 agentId,
        address callbackAddress,
        bytes4 callbackSelector,
        bytes calldata payload
    ) external payable returns (uint256 requestId);

    /// @notice Create an advanced request with custom consensus parameters
    function createAdvancedRequest(
        uint256 agentId,
        address callbackAddress,
        bytes4 callbackSelector,
        bytes calldata payload,
        uint256 subcommitteeSize,
        uint256 threshold,
        AgentTypes.ConsensusType consensusType,
        uint256 timeout
    ) external payable returns (uint256 requestId);

    function getRequest(uint256 requestId) external view returns (AgentTypes.Request memory);
    function hasRequest(uint256 requestId) external view returns (bool);

    /// @notice Minimum operations reserve required (default subcommittee=3)
    function getRequestDeposit() external view returns (uint256);

    /// @notice Minimum operations reserve for a custom subcommittee size
    function getAdvancedRequestDeposit(uint256 subcommitteeSize) external view returns (uint256);
}
