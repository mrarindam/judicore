import { ethers, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * End-to-end demo: Freelance landing-page dispute.
 *
 * Flow:
 *   1. Open a case (Alice = client, Bob = freelancer)
 *   2. Fund the bond
 *   3. File dispute
 *   4. Submit evidence from both sides
 *   5. Request a verdict
 *   6. Wait for the jury to settle (real on testnet; simulated locally)
 *
 * On local hardhat networks the script will simulate juror responses via the
 * MockSomniaAgents fixture. On Somnia testnet it polls until finalization.
 *
 * Both roles use the deployer wallet to keep the testnet script self-contained.
 * For the live demo we'll use the frontend with two real wallets.
 */

const DEMO_BOND_STT = "0.05"; // small bond for testnet thrift
const HARDHAT_BOND_STT = "10";

async function loadDeployments(networkName: string) {
  const file = path.join(__dirname, "..", "..", "deployments", `${networkName}.json`);
  if (!fs.existsSync(file)) throw new Error(`No deployment found for ${networkName}. Run deploy.ts first.`);
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

async function main() {
  const [deployer] = await ethers.getSigners();
  const net = await ethers.provider.getNetwork();
  const chainId = Number(net.chainId);
  const isLocal = chainId === 31337;

  const deployment = await loadDeployments(network.name);
  const { escrowVault, juryManager, disputeRegistry, platform } = deployment.addresses;

  console.log("");
  console.log("=".repeat(60));
  console.log("  Judicore demo - Freelance dispute");
  console.log("=".repeat(60));
  console.log(`  Network:     ${network.name} (chainId ${chainId})`);
  console.log(`  Actor:       ${deployer.address} (playing both Alice and Bob)`);

  const vault = await ethers.getContractAt("EscrowVault", escrowVault);
  const jury = await ethers.getContractAt("JuryManager", juryManager);
  const registry = await ethers.getContractAt("DisputeRegistry", disputeRegistry);

  // Two distinct addresses to give the demo realistic semantics. We're using the
  // same private key as deployer, but the contracts only require that claimant
  // and respondent are non-zero distinct addresses; for live testnet the funding
  // and gas all come from deployer.
  const alice = deployer.address;
  const bobWallet = ethers.Wallet.createRandom().connect(ethers.provider);
  const bob = bobWallet.address;
  console.log(`  Claimant:    ${alice} (Alice)`);
  console.log(`  Respondent:  ${bob} (Bob)`);

  const bondStt = isLocal ? HARDHAT_BOND_STT : DEMO_BOND_STT;
  const bond = ethers.parseEther(bondStt);

  // Fund Bob's wallet so he can submit evidence (gas only)
  console.log("");
  console.log(`  → Funding Bob with 0.05 STT for gas...`);
  await (await deployer.sendTransaction({ to: bob, value: ethers.parseEther("0.05") })).wait();

  // 1. Open case
  console.log(`  → createCase (bond ${bondStt} STT)`);
  const createTx = await registry.createCase(
    alice,
    bob,
    bond,
    "Freelance landing page delivery dispute"
  );
  const createRcpt = await createTx.wait();
  const caseId = await registry.nextCaseId();
  console.log(`     caseId = ${caseId}`);

  // 2. Fund the bond (Alice puts up the full amount)
  console.log(`  → fund(${caseId})`);
  await (await vault.fund(caseId, { value: bond })).wait();
  console.log(`     locked = ${ethers.formatEther(await vault.lockedAmount(caseId))} STT`);

  // 3. File dispute
  console.log(`  → dispute(${caseId})`);
  await (await registry.dispute(caseId)).wait();

  // 4. Evidence from both sides
  console.log(`  → submitEvidence (Alice)`);
  await (await registry.submitEvidence(
    caseId,
    "Bob did not deliver. The GitHub repo has zero commits and the site is not live. " +
      "He only produced a Figma wireframe which was not the agreed deliverable.",
    ["ipfs://QmExampleAliceProof"]
  )).wait();

  console.log(`  → submitEvidence (Bob)`);
  await (await registry.connect(bobWallet).submitEvidence(
    caseId,
    "I delivered the design and partial implementation as agreed for milestone 1. " +
      "Full implementation was scheduled for milestone 2, which was not yet funded.",
    ["ipfs://QmExampleBobProof"]
  )).wait();

  // 5. Request verdict
  const deposit = await jury.estimateDepositWei();
  console.log(`  → requestVerdict (deposit ${ethers.formatEther(deposit)} STT)`);
  const verdictTx = await registry.requestVerdict(caseId, { value: deposit });
  const verdictRcpt = await verdictTx.wait();
  const verdictId = (await registry.getCase(caseId)).verdictId;
  console.log(`     verdictId = ${verdictId}`);
  console.log(`     verdictTxHash = ${verdictRcpt!.hash}`);

  // 6. Either simulate jurors locally, or wait for real ones
  if (isLocal) {
    console.log("");
    console.log(`  ⤴ Local network → simulating jurors...`);
    const mock = await ethers.getContractAt("MockSomniaAgents", platform);
    // Verdicts: realistic distribution — most jurors lean toward Alice
    const verdicts: bigint[] = [80n, 75n, 70n, 30n, 78n];
    // Find the 5 most recent platform requestIds (they were created in the requestVerdict tx)
    const totalRequests = await mock.nextRequestId();
    const firstId = totalRequests - 5n;
    for (let i = 0n; i < 5n; i++) {
      const reqId = firstId + i + 1n;
      console.log(`     juror ${i} (reqId ${reqId}) → verdict ${verdicts[Number(i)]}`);
      await (await mock.fireIntSuccess(reqId, verdicts[Number(i)])).wait();
    }
  } else {
    console.log("");
    console.log(`  ⤴ Live network → waiting for Somnia agents (timeout = 10 min)...`);
    await waitForFinalization(registry, caseId, 10 * 60 * 1000);
  }

  // 7. Show result
  const finalCase = await registry.getCase(caseId);
  console.log("");
  console.log("=".repeat(60));
  console.log("  JUDICORE VERDICT");
  console.log("=".repeat(60));
  console.log(`  Status:                ${statusName(Number(finalCase.status))}`);
  console.log(`  Claimant share:        ${finalCase.claimantSharePercent}%`);
  console.log(`  Alice receives:        ${ethers.formatEther((bond * BigInt(finalCase.claimantSharePercent)) / 100n)} STT`);
  console.log(`  Bob receives:          ${ethers.formatEther(bond - (bond * BigInt(finalCase.claimantSharePercent)) / 100n)} STT`);

  // Receipts
  const vr = await jury.getVerdict(verdictId);
  console.log("");
  console.log("  Juror receipts:");
  const baseUrl = "https://receipts.testnet.agents.somnia.host";
  for (let i = 0; i < 5; i++) {
    const j = vr.jurors[i];
    const tag = j.success ? "✓" : (j.received ? "✗" : "·");
    const role = ["Factual", "Technical", "Contextual", "Devil's Advocate", "Arbiter"][i];
    if (j.success) {
      console.log(`    ${tag} J${i + 1} (${role.padEnd(16)}) verdict=${j.verdict.toString().padStart(3)}  receipt=${baseUrl}?requestId=${vr.requestIds[i]}`);
    } else {
      console.log(`    ${tag} J${i + 1} (${role.padEnd(16)}) failed/timed-out`);
    }
  }
  console.log("=".repeat(60));
}

function statusName(s: number): string {
  return ["None", "Open", "Completed", "Disputed", "EvidenceReady", "JuryActive", "Resolved", "TimedOut"][s] ?? `unknown(${s})`;
}

async function waitForFinalization(registry: any, caseId: bigint, timeoutMs: number) {
  const start = Date.now();
  let lastStatus = -1;
  while (Date.now() - start < timeoutMs) {
    const c = await registry.getCase(caseId);
    const status = Number(c.status);
    if (status !== lastStatus) {
      console.log(`     [${((Date.now() - start) / 1000).toFixed(0)}s] status=${statusName(status)}`);
      lastStatus = status;
    }
    if (status === 6 || status === 7) return; // Resolved or TimedOut
    await new Promise((r) => setTimeout(r, 5000));
  }
  throw new Error("Verdict did not finalize within timeout");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
