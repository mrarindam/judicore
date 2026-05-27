/**
 * Minimal ABIs for the contracts the frontend interacts with.
 * Pulled from the Hardhat artifacts — only the surface we need.
 */

export const disputeRegistryAbi = [
  // Lifecycle
  {
    type: "function", name: "createCase", stateMutability: "nonpayable",
    inputs: [
      { name: "claimant", type: "address" },
      { name: "respondent", type: "address" },
      { name: "expectedAmount", type: "uint256" },
      { name: "description", type: "string" },
    ],
    outputs: [{ name: "caseId", type: "uint256" }],
  },
  {
    type: "function", name: "dispute", stateMutability: "nonpayable",
    inputs: [{ name: "caseId", type: "uint256" }], outputs: [],
  },
  {
    type: "function", name: "complete", stateMutability: "nonpayable",
    inputs: [{ name: "caseId", type: "uint256" }], outputs: [],
  },
  {
    type: "function", name: "submitEvidence", stateMutability: "nonpayable",
    inputs: [
      { name: "caseId", type: "uint256" },
      { name: "statement", type: "string" },
      { name: "ipfsCids", type: "string[]" },
    ], outputs: [],
  },
  {
    type: "function", name: "requestVerdict", stateMutability: "payable",
    inputs: [{ name: "caseId", type: "uint256" }],
    outputs: [{ name: "verdictId", type: "uint256" }],
  },
  // Views
  {
    type: "function", name: "nextCaseId", stateMutability: "view",
    inputs: [], outputs: [{ type: "uint256" }],
  },
  {
    type: "function", name: "getCase", stateMutability: "view",
    inputs: [{ name: "caseId", type: "uint256" }],
    outputs: [{
      type: "tuple",
      components: [
        { name: "claimant", type: "address" },
        { name: "respondent", type: "address" },
        { name: "expectedAmount", type: "uint256" },
        { name: "description", type: "string" },
        { name: "escrowCaseId", type: "uint256" },
        {
          name: "claimantEvidence", type: "tuple",
          components: [
            { name: "statement", type: "string" },
            { name: "ipfsCids", type: "string[]" },
            { name: "submittedAt", type: "uint256" },
            { name: "submitted", type: "bool" },
          ],
        },
        {
          name: "respondentEvidence", type: "tuple",
          components: [
            { name: "statement", type: "string" },
            { name: "ipfsCids", type: "string[]" },
            { name: "submittedAt", type: "uint256" },
            { name: "submitted", type: "bool" },
          ],
        },
        { name: "status", type: "uint8" },
        { name: "verdictId", type: "uint256" },
        { name: "claimantSharePercent", type: "uint8" },
        { name: "createdAt", type: "uint256" },
        { name: "resolvedAt", type: "uint256" },
      ],
    }],
  },
  // Events
  {
    type: "event", name: "CaseCreated",
    inputs: [
      { name: "caseId", type: "uint256", indexed: true },
      { name: "claimant", type: "address", indexed: true },
      { name: "respondent", type: "address", indexed: true },
      { name: "expectedAmount", type: "uint256" },
      { name: "description", type: "string" },
    ],
  },
  {
    type: "event", name: "VerdictApplied",
    inputs: [
      { name: "caseId", type: "uint256", indexed: true },
      { name: "verdictId", type: "uint256", indexed: true },
      { name: "claimantSharePercent", type: "uint8" },
      { name: "claimantShareWei", type: "uint256" },
      { name: "respondentShareWei", type: "uint256" },
    ],
  },
] as const;

export const escrowVaultAbi = [
  {
    type: "function", name: "fund", stateMutability: "payable",
    inputs: [{ name: "caseId", type: "uint256" }], outputs: [],
  },
  {
    type: "function", name: "lockedAmount", stateMutability: "view",
    inputs: [{ name: "caseId", type: "uint256" }],
    outputs: [{ type: "uint256" }],
  },
] as const;

export const juryManagerAbi = [
  {
    type: "function", name: "estimateDepositWei", stateMutability: "view",
    inputs: [], outputs: [{ type: "uint256" }],
  },
  {
    type: "function", name: "getVerdict", stateMutability: "view",
    inputs: [{ name: "verdictId", type: "uint256" }],
    outputs: [
      { name: "caseId", type: "uint256" },
      { name: "responsesReceived", type: "uint8" },
      { name: "successfulResponses", type: "uint8" },
      { name: "finalized", type: "bool" },
      {
        name: "jurors", type: "tuple[5]",
        components: [
          { name: "verdict", type: "int256" },
          { name: "receiptId", type: "uint256" },
          { name: "received", type: "bool" },
          { name: "success", type: "bool" },
        ],
      },
      { name: "requestIds", type: "uint256[5]" },
    ],
  },
  {
    type: "event", name: "JurorResponded",
    inputs: [
      { name: "verdictId", type: "uint256", indexed: true },
      { name: "jurorIndex", type: "uint8", indexed: true },
      { name: "verdict", type: "int256" },
      { name: "receiptId", type: "uint256" },
    ],
  },
  {
    type: "event", name: "VerdictFinalized",
    inputs: [
      { name: "verdictId", type: "uint256", indexed: true },
      { name: "caseId", type: "uint256", indexed: true },
      { name: "claimantSharePercent", type: "uint8" },
    ],
  },
] as const;

export const CASE_STATUS = [
  "None", "Open", "Completed", "Disputed", "EvidenceReady", "JuryActive", "Resolved", "TimedOut",
] as const;

export const JUROR_ROLES = [
  { short: "J1", name: "Factual", icon: "🔍" },
  { short: "J2", name: "Technical", icon: "⚙️" },
  { short: "J3", name: "Contextual", icon: "🌐" },
  { short: "J4", name: "Devil's Advocate", icon: "😈" },
  { short: "J5", name: "Arbiter", icon: "⚖️" },
] as const;
