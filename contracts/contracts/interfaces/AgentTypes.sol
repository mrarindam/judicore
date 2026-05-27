// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title Somnia Agent platform shared types
/// @notice Enums and structs used by the SomniaAgents platform contract.
///         Mirrors the on-chain types documented at
///         https://metaversal.gitbook.io/agents
library AgentTypes {
    enum ConsensusType {
        Majority,  // 0 - all `threshold` validators must return identical result
        Threshold  // 1 - any `threshold` successful results (voting, median, randomness)
    }

    enum ResponseStatus {
        None,     // 0 - uninitialized
        Pending,  // 1 - awaiting responses
        Success,  // 2 - consensus reached
        Failed,   // 3 - validators reported failure
        TimedOut  // 4 - request timed out
    }

    struct Response {
        address validator;
        bytes result;
        ResponseStatus status;
        uint256 receipt;
        uint256 timestamp;
        uint256 executionCost;
    }

    struct Request {
        uint256 id;
        address requester;
        address callbackAddress;
        bytes4 callbackSelector;
        address[] subcommittee;
        Response[] responses;
        uint256 responseCount;
        uint256 failureCount;
        uint256 threshold;
        uint256 createdAt;
        uint256 deadline;
        ResponseStatus status;
        ConsensusType consensusType;
        uint256 remainingBudget;
        uint256 perAgentBudget;
    }
}
