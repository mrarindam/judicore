// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title IEscrowVault - escrow that holds bond and settles based on a verdict
interface IEscrowVault {
    event Funded(uint256 indexed caseId, address indexed funder, uint256 amount);
    event Settled(
        uint256 indexed caseId,
        address indexed claimant,
        address indexed respondent,
        uint256 claimantShareWei,
        uint256 respondentShareWei
    );

    /// @notice Open a new escrow case (called by DisputeRegistry).
    /// @return caseId Newly created escrow case id
    function openCase(
        address claimant,
        address respondent,
        uint256 expectedAmount
    ) external returns (uint256 caseId);

    /// @notice Fund the escrow case. msg.value contributes to the locked pot.
    function fund(uint256 caseId) external payable;

    /// @notice Settle the case, paying claimantShareWei to claimant and respondentShareWei to respondent.
    /// @dev Caller MUST be the dispute registry. claimantShareWei + respondentShareWei MUST equal the locked pot.
    function settle(
        uint256 caseId,
        uint256 claimantShareWei,
        uint256 respondentShareWei
    ) external;

    function lockedAmount(uint256 caseId) external view returns (uint256);
}
