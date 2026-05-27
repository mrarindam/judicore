// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title IDisputeRegistry - the verdict-applying side of the dispute lifecycle
/// @notice Called by JuryManager when a verdict is finalized or times out.
interface IDisputeRegistry {
    function applyVerdict(
        uint256 caseId,
        uint256 verdictId,
        uint8 claimantSharePercent
    ) external;

    function applyTimeout(uint256 caseId, uint256 verdictId) external;
}
