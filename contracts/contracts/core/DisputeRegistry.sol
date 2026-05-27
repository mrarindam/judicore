// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { IEscrowVault } from "./IEscrowVault.sol";
import { IJuryManager } from "./IJuryManager.sol";
import { IDisputeRegistry } from "./IDisputeRegistry.sol";

/// @title DisputeRegistry
/// @notice State machine for Judicore cases. Coordinates funding (via EscrowVault),
///         evidence collection, jury invocation (via JuryManager), and settlement.
contract DisputeRegistry is IDisputeRegistry {
    enum CaseStatus {
        None,            // 0 - not created
        Open,            // 1 - created, accepting funds
        Completed,       // 2 - non-disputed completion (100% to respondent)
        Disputed,        // 3 - dispute raised, evidence collection open
        EvidenceReady,   // 4 - both evidences submitted, verdict requestable
        JuryActive,      // 5 - verdict pending from JuryManager
        Resolved,        // 6 - jury verdict applied, escrow settled
        TimedOut         // 7 - jury timed out, default split applied
    }

    struct Evidence {
        string statement;
        string[] ipfsCids;
        uint256 submittedAt;
        bool submitted;
    }

    struct Case {
        address claimant;
        address respondent;
        uint256 expectedAmount;
        string description;
        uint256 escrowCaseId;
        Evidence claimantEvidence;
        Evidence respondentEvidence;
        CaseStatus status;
        uint256 verdictId;
        uint8 claimantSharePercent; // 0-100, set on resolution
        uint256 createdAt;
        uint256 resolvedAt;
    }

    IEscrowVault public immutable vault;
    IJuryManager public immutable jury;

    uint256 public nextCaseId;
    mapping(uint256 => Case) private _cases;
    mapping(uint256 => uint256) public verdictToCase; // verdictId -> caseId

    // --- Events ---
    event CaseCreated(
        uint256 indexed caseId,
        address indexed claimant,
        address indexed respondent,
        uint256 expectedAmount,
        string description
    );
    event CaseCompleted(uint256 indexed caseId, address indexed respondent, uint256 amount);
    event Disputed(uint256 indexed caseId, address indexed initiator);
    event EvidenceSubmitted(uint256 indexed caseId, address indexed party, string statement, uint256 evidenceCount);
    event VerdictRequested(uint256 indexed caseId, uint256 indexed verdictId, uint256 depositWei);
    event VerdictApplied(
        uint256 indexed caseId,
        uint256 indexed verdictId,
        uint8 claimantSharePercent,
        uint256 claimantShareWei,
        uint256 respondentShareWei
    );
    event TimedOut(uint256 indexed caseId, uint256 indexed verdictId);

    // --- Errors ---
    error CaseNotFound();
    error InvalidStatus(CaseStatus expected, CaseStatus actual);
    error NotParticipant();
    error AlreadySubmitted();
    error NotJury();
    error ZeroAddress();

    modifier onlyJury() {
        if (msg.sender != address(jury)) revert NotJury();
        _;
    }

    modifier onlyParty(uint256 caseId) {
        Case storage c = _cases[caseId];
        if (msg.sender != c.claimant && msg.sender != c.respondent) revert NotParticipant();
        _;
    }

    constructor(IEscrowVault vault_, IJuryManager jury_) {
        if (address(vault_) == address(0) || address(jury_) == address(0)) revert ZeroAddress();
        vault = vault_;
        jury = jury_;
    }

    // ---------- Lifecycle ----------

    /// @notice Create a new dispute case. The claimant is typically the party paying.
    function createCase(
        address claimant,
        address respondent,
        uint256 expectedAmount,
        string calldata description
    ) external returns (uint256 caseId) {
        if (claimant == address(0) || respondent == address(0)) revert ZeroAddress();
        caseId = ++nextCaseId;
        uint256 escrowCaseId = vault.openCase(claimant, respondent, expectedAmount);

        Case storage c = _cases[caseId];
        c.claimant = claimant;
        c.respondent = respondent;
        c.expectedAmount = expectedAmount;
        c.description = description;
        c.escrowCaseId = escrowCaseId;
        c.status = CaseStatus.Open;
        c.createdAt = block.timestamp;

        emit CaseCreated(caseId, claimant, respondent, expectedAmount, description);
    }

    /// @notice Mark case as completed (non-disputed). Pays full bond to respondent.
    /// @dev Only the claimant (paying party) can complete.
    function complete(uint256 caseId) external {
        Case storage c = _cases[caseId];
        if (c.status != CaseStatus.Open) revert InvalidStatus(CaseStatus.Open, c.status);
        if (msg.sender != c.claimant) revert NotParticipant();
        c.status = CaseStatus.Completed;
        c.resolvedAt = block.timestamp;
        uint256 locked = vault.lockedAmount(c.escrowCaseId);
        vault.settle(c.escrowCaseId, 0, locked);
        emit CaseCompleted(caseId, c.respondent, locked);
    }

    /// @notice Either party can raise a dispute. Transitions to evidence-collection.
    function dispute(uint256 caseId) external onlyParty(caseId) {
        Case storage c = _cases[caseId];
        if (c.status != CaseStatus.Open) revert InvalidStatus(CaseStatus.Open, c.status);
        c.status = CaseStatus.Disputed;
        emit Disputed(caseId, msg.sender);
    }

    /// @notice Submit evidence for your side. Re-submission allowed until verdict request.
    function submitEvidence(
        uint256 caseId,
        string calldata statement,
        string[] calldata ipfsCids
    ) external onlyParty(caseId) {
        Case storage c = _cases[caseId];
        if (c.status != CaseStatus.Disputed && c.status != CaseStatus.EvidenceReady) {
            revert InvalidStatus(CaseStatus.Disputed, c.status);
        }

        Evidence storage e = msg.sender == c.claimant ? c.claimantEvidence : c.respondentEvidence;
        e.statement = statement;
        e.ipfsCids = ipfsCids;
        e.submittedAt = block.timestamp;
        e.submitted = true;

        emit EvidenceSubmitted(caseId, msg.sender, statement, ipfsCids.length);

        if (c.claimantEvidence.submitted && c.respondentEvidence.submitted) {
            c.status = CaseStatus.EvidenceReady;
        }
    }

    /// @notice Trigger jury deliberation. Caller funds the agent deposit via msg.value.
    /// @dev Anyone may call this once both evidences are in. The msg.value must
    ///      cover JuryManager.estimateDepositWei() (which fronts 5 LLM agent runs).
    function requestVerdict(uint256 caseId) external payable returns (uint256 verdictId) {
        Case storage c = _cases[caseId];
        if (c.status != CaseStatus.EvidenceReady) {
            revert InvalidStatus(CaseStatus.EvidenceReady, c.status);
        }

        string memory prompt = _buildJuryPrompt(caseId);
        verdictId = jury.requestVerdict{ value: msg.value }(caseId, prompt);

        c.verdictId = verdictId;
        c.status = CaseStatus.JuryActive;
        verdictToCase[verdictId] = caseId;

        emit VerdictRequested(caseId, verdictId, msg.value);
    }

    // ---------- Callbacks (from JuryManager) ----------

    /// @inheritdoc IDisputeRegistry
    function applyVerdict(
        uint256 caseId,
        uint256 verdictId,
        uint8 claimantSharePercent
    ) external onlyJury {
        Case storage c = _cases[caseId];
        if (c.status != CaseStatus.JuryActive) revert InvalidStatus(CaseStatus.JuryActive, c.status);
        if (c.verdictId != verdictId) revert CaseNotFound();
        if (claimantSharePercent > 100) claimantSharePercent = 100;

        uint256 locked = vault.lockedAmount(c.escrowCaseId);
        uint256 claimantShareWei = (locked * claimantSharePercent) / 100;
        uint256 respondentShareWei = locked - claimantShareWei;

        c.claimantSharePercent = claimantSharePercent;
        c.status = CaseStatus.Resolved;
        c.resolvedAt = block.timestamp;

        vault.settle(c.escrowCaseId, claimantShareWei, respondentShareWei);
        emit VerdictApplied(caseId, verdictId, claimantSharePercent, claimantShareWei, respondentShareWei);
    }

    /// @inheritdoc IDisputeRegistry
    /// @dev Default fallback policy: 50/50 split.
    function applyTimeout(uint256 caseId, uint256 verdictId) external onlyJury {
        Case storage c = _cases[caseId];
        if (c.status != CaseStatus.JuryActive) revert InvalidStatus(CaseStatus.JuryActive, c.status);
        if (c.verdictId != verdictId) revert CaseNotFound();

        uint256 locked = vault.lockedAmount(c.escrowCaseId);
        uint256 half = locked / 2;
        c.claimantSharePercent = 50;
        c.status = CaseStatus.TimedOut;
        c.resolvedAt = block.timestamp;
        vault.settle(c.escrowCaseId, half, locked - half);
        emit TimedOut(caseId, verdictId);
    }

    // ---------- Views ----------

    function getCase(uint256 caseId) external view returns (Case memory) {
        return _cases[caseId];
    }

    function caseStatus(uint256 caseId) external view returns (CaseStatus) {
        return _cases[caseId].status;
    }

    // ---------- Internal ----------

    function _buildJuryPrompt(uint256 caseId) internal view returns (string memory) {
        Case storage c = _cases[caseId];
        return string.concat(
            "DISPUTE CASE\n",
            "============\n",
            "Description: ", c.description, "\n",
            "Bond amount (expected): ", _u2s(c.expectedAmount), " wei\n",
            "\n",
            "CLAIMANT'S STATEMENT:\n",
            c.claimantEvidence.statement, "\n",
            "Claimant evidence count: ", _u2s(c.claimantEvidence.ipfsCids.length), "\n",
            "\n",
            "RESPONDENT'S STATEMENT:\n",
            c.respondentEvidence.statement, "\n",
            "Respondent evidence count: ", _u2s(c.respondentEvidence.ipfsCids.length), "\n",
            "\n",
            "TASK: Decide what percentage of the bond should go to the CLAIMANT. ",
            "Output a single integer 0-100. 0 = respondent keeps everything. ",
            "100 = claimant gets everything. 50 = split equally."
        );
    }

    function _u2s(uint256 v) internal pure returns (string memory) {
        if (v == 0) return "0";
        uint256 n = v;
        uint256 len;
        while (n != 0) { len++; n /= 10; }
        bytes memory b = new bytes(len);
        while (v != 0) {
            len--;
            b[len] = bytes1(uint8(48 + v % 10));
            v /= 10;
        }
        return string(b);
    }
}
