// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { AgentTypes } from "./AgentTypes.sol";

/// @title IAgentRequesterHandler - callback handler for SomniaAgents responses
/// @notice Any contract that receives an agent response must implement this.
interface IAgentRequesterHandler {
    function handleResponse(
        uint256 requestId,
        AgentTypes.Response[] memory responses,
        AgentTypes.ResponseStatus status,
        AgentTypes.Request memory details
    ) external;
}
