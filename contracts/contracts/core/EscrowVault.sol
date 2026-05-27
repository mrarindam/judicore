// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { IEscrowVault } from "./IEscrowVault.sol";

/// @title EscrowVault
/// @notice Generic native-token escrow vault. Funds are locked per case and
///         released by the DisputeRegistry once a verdict is applied.
contract EscrowVault is IEscrowVault, ReentrancyGuard {
    struct EscrowCase {
        address claimant;
        address respondent;
        uint256 expectedAmount;
        uint256 lockedAmountWei;
        bool settled;
    }

    address public registry;
    address public immutable initializer;
    uint256 public nextCaseId;
    mapping(uint256 => EscrowCase) private _cases;

    error NotRegistry();
    error NotInitializer();
    error AlreadyInitialized();
    error CaseNotFound(uint256 caseId);
    error CaseAlreadySettled(uint256 caseId);
    error ZeroParticipant();
    error PartyMismatch();
    error AllocationMismatch(uint256 expected, uint256 provided);
    error TransferFailed(address to, uint256 amount);

    event RegistrySet(address indexed registry);

    modifier onlyRegistry() {
        if (msg.sender != registry) revert NotRegistry();
        _;
    }

    constructor() {
        initializer = msg.sender;
    }

    /// @notice Wire the DisputeRegistry exactly once.
    function setRegistry(address registry_) external {
        if (msg.sender != initializer) revert NotInitializer();
        if (registry != address(0)) revert AlreadyInitialized();
        if (registry_ == address(0)) revert ZeroParticipant();
        registry = registry_;
        emit RegistrySet(registry_);
    }

    /// @inheritdoc IEscrowVault
    function openCase(
        address claimant,
        address respondent,
        uint256 expectedAmount
    ) external onlyRegistry returns (uint256 caseId) {
        if (claimant == address(0) || respondent == address(0)) revert ZeroParticipant();
        caseId = ++nextCaseId;
        _cases[caseId] = EscrowCase({
            claimant: claimant,
            respondent: respondent,
            expectedAmount: expectedAmount,
            lockedAmountWei: 0,
            settled: false
        });
    }

    /// @inheritdoc IEscrowVault
    function fund(uint256 caseId) external payable {
        EscrowCase storage c = _cases[caseId];
        if (c.claimant == address(0)) revert CaseNotFound(caseId);
        if (c.settled) revert CaseAlreadySettled(caseId);
        if (msg.sender != c.claimant && msg.sender != c.respondent) revert PartyMismatch();
        c.lockedAmountWei += msg.value;
        emit Funded(caseId, msg.sender, msg.value);
    }

    /// @inheritdoc IEscrowVault
    function settle(
        uint256 caseId,
        uint256 claimantShareWei,
        uint256 respondentShareWei
    ) external onlyRegistry nonReentrant {
        EscrowCase storage c = _cases[caseId];
        if (c.claimant == address(0)) revert CaseNotFound(caseId);
        if (c.settled) revert CaseAlreadySettled(caseId);

        uint256 total = c.lockedAmountWei;
        if (claimantShareWei + respondentShareWei != total) {
            revert AllocationMismatch(total, claimantShareWei + respondentShareWei);
        }

        c.settled = true;
        c.lockedAmountWei = 0;

        if (claimantShareWei > 0) {
            (bool ok, ) = c.claimant.call{ value: claimantShareWei }("");
            if (!ok) revert TransferFailed(c.claimant, claimantShareWei);
        }
        if (respondentShareWei > 0) {
            (bool ok, ) = c.respondent.call{ value: respondentShareWei }("");
            if (!ok) revert TransferFailed(c.respondent, respondentShareWei);
        }

        emit Settled(caseId, c.claimant, c.respondent, claimantShareWei, respondentShareWei);
    }

    /// @inheritdoc IEscrowVault
    function lockedAmount(uint256 caseId) external view returns (uint256) {
        return _cases[caseId].lockedAmountWei;
    }

    function getCase(uint256 caseId) external view returns (EscrowCase memory) {
        return _cases[caseId];
    }
}
