// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title IJuryManager - decentralized jury that issues a percentage verdict
/// @notice The verdict is a single uint8 in [0, 100] representing the claimant's share.
interface IJuryManager {
    event VerdictRequested(
        uint256 indexed caseId,
        uint256 indexed verdictId,
        uint8 jurorCount
    );
    event JurorResponded(
        uint256 indexed verdictId,
        uint8 indexed jurorIndex,
        int256 verdict,
        uint256 receiptId
    );
    event VerdictFinalized(
        uint256 indexed verdictId,
        uint256 indexed caseId,
        uint8 claimantSharePercent
    );
    event VerdictTimedOut(uint256 indexed verdictId, uint256 indexed caseId);

    /// @notice Request a verdict for a case. msg.value funds 5 LLM agent invocations.
    /// @param caseId The dispute case id (from DisputeRegistry)
    /// @param prompt Full case prompt: description + both parties' evidence
    /// @return verdictId Newly created verdict id
    function requestVerdict(
        uint256 caseId,
        string calldata prompt
    ) external payable returns (uint256 verdictId);

    /// @notice Estimate the msg.value required for a default 5-juror verdict.
    function estimateDepositWei() external view returns (uint256);
}
