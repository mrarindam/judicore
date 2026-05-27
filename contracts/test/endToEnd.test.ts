import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("Judicore end-to-end", () => {
  const LLM_AGENT_ID = 1234567890n;
  const DEFAULT_LLM_REWARD = ethers.parseEther("0.07");
  const SUBCOMMITTEE = 3n;

  async function deployFixture() {
    const [deployer, alice, bob, third] = await ethers.getSigners();

    const Platform = await ethers.getContractFactory("MockSomniaAgents");
    const platform = await Platform.deploy();

    const Jury = await ethers.getContractFactory("JuryManager");
    const jury = await Jury.deploy(await platform.getAddress());
    await (await jury.setLlmInferenceAgentId(LLM_AGENT_ID)).wait();
    await (await jury.setLlmRewardPerAgent(DEFAULT_LLM_REWARD)).wait();

    const Vault = await ethers.getContractFactory("EscrowVault");
    const vault = await Vault.deploy();

    const Registry = await ethers.getContractFactory("DisputeRegistry");
    const registry = await Registry.deploy(
      await vault.getAddress(),
      await jury.getAddress()
    );

    await (await vault.setRegistry(await registry.getAddress())).wait();
    await (await jury.setRegistry(await registry.getAddress())).wait();

    return { deployer, alice, bob, third, platform, jury, vault, registry };
  }

  it("computes the right deposit estimate for 5 jurors", async () => {
    const { jury } = await loadFixture(deployFixture);
    // per juror: reserve (0.01 * 3) + reward (0.07 * 3) = 0.24 STT, × 5 = 1.20 STT
    expect(await jury.estimateDepositWei()).to.equal(ethers.parseEther("1.20"));
  });

  it("runs the full happy path: create -> fund -> dispute -> evidence -> verdict -> settle", async () => {
    const { alice, bob, platform, jury, vault, registry } = await loadFixture(deployFixture);

    const bondAmount = ethers.parseEther("10");
    const aliceStart = await ethers.provider.getBalance(alice.address);
    const bobStart = await ethers.provider.getBalance(bob.address);

    // 1. Alice creates the case (she will be claimant, Bob respondent)
    const createTx = await registry.connect(alice).createCase(
      alice.address,
      bob.address,
      bondAmount,
      "Freelance landing page delivery dispute"
    );
    const createRcpt = await createTx.wait();
    const caseId = 1n;

    // 2. Alice funds the bond
    await (await vault.connect(alice).fund(1, { value: bondAmount })).wait();
    expect(await vault.lockedAmount(1)).to.equal(bondAmount);

    // 3. Alice files a dispute
    await (await registry.connect(alice).dispute(caseId)).wait();

    // 4. Both parties submit evidence
    await (await registry.connect(alice).submitEvidence(
      caseId,
      "Bob's repo is empty. Only a Figma wireframe exists. Site is not deployed.",
      ["ipfs://QmAliceProof1", "ipfs://QmAliceProof2"]
    )).wait();
    await (await registry.connect(bob).submitEvidence(
      caseId,
      "I delivered the Figma design and partial implementation. Payment expected per milestone.",
      ["ipfs://QmBobProof1"]
    )).wait();

    // 5. Trigger the jury
    const depositWei = await jury.estimateDepositWei();
    const requestVerdictTx = await registry.connect(alice).requestVerdict(caseId, {
      value: depositWei,
    });
    await requestVerdictTx.wait();

    const caseAfter = await registry.getCase(caseId);
    expect(caseAfter.status).to.equal(5n); // CaseStatus.JuryActive

    // 6. Simulate juror responses via the mock platform
    //    Verdicts (claimant share %): J1=80, J2=85, J3=70, J4=20, J5=75 (arbiter, weight 2)
    //    Sorted ascending: [20(J4,w1), 70(J3,w1), 75(J5,w2), 80(J1,w1), 85(J2,w1)] — total weight 6, halfWeight = 3
    //    Cumulative: 1, 2, 4 → first crosses 3 at value 75 → median = 75
    const bobBalanceBeforeSettle = await ethers.provider.getBalance(bob.address);
    const verdicts = [80n, 85n, 70n, 20n, 75n];
    for (let i = 1n; i <= 5n; i++) {
      await (await platform.fireIntSuccess(i, verdicts[Number(i) - 1])).wait();
    }

    // 7. Verify settlement
    const verdictId = (await registry.getCase(caseId)).verdictId;
    const verdictRecord = await jury.getVerdict(verdictId);
    expect(verdictRecord.finalized).to.equal(true);
    expect(verdictRecord.successfulResponses).to.equal(5);

    const settled = await registry.getCase(caseId);
    expect(settled.status).to.equal(6n); // Resolved
    expect(settled.claimantSharePercent).to.equal(75n);

    // Bob received 25% of 10 STT = 2.5 STT (no gas costs between snapshot and now)
    const bobAfterSettle = await ethers.provider.getBalance(bob.address);
    expect(bobAfterSettle - bobBalanceBeforeSettle).to.equal(ethers.parseEther("2.5"));
    expect(await vault.lockedAmount(1)).to.equal(0n);
  });

  it("handles partial juror failure (3 successful, 2 failed)", async () => {
    const { alice, bob, platform, jury, registry, vault } = await loadFixture(deployFixture);
    const bondAmount = ethers.parseEther("10");

    await (await registry.connect(alice).createCase(
      alice.address, bob.address, bondAmount, "Partial failure test"
    )).wait();
    await (await vault.connect(alice).fund(1, { value: bondAmount })).wait();
    await (await registry.connect(alice).dispute(1)).wait();
    await (await registry.connect(alice).submitEvidence(1, "claim", [])).wait();
    await (await registry.connect(bob).submitEvidence(1, "counterclaim", [])).wait();
    await (await registry.connect(alice).requestVerdict(1, { value: await jury.estimateDepositWei() })).wait();

    // 3 success (60, 50, 70), 2 fail
    await (await platform.fireIntSuccess(1, 60n)).wait();
    await (await platform.fireIntSuccess(2, 50n)).wait();
    await (await platform.fireIntSuccess(3, 70n)).wait();
    await (await platform.fireFailure(4)).wait();
    await (await platform.fireFailure(5)).wait();

    const settled = await registry.getCase(1);
    expect(settled.status).to.equal(6n); // Resolved
    // 3 votes [50, 60, 70] all weight 1 (none from arbiter J5 since it failed)
    // total weight = 3, half = 1, cumulative: 1, 2, 3 → first crosses 1 at value 60
    expect(settled.claimantSharePercent).to.equal(60n);
  });

  it("falls back to 50/50 timeout if all jurors fail", async () => {
    const { alice, bob, platform, jury, registry, vault } = await loadFixture(deployFixture);
    const bondAmount = ethers.parseEther("10");

    await (await registry.connect(alice).createCase(
      alice.address, bob.address, bondAmount, "All-fail test"
    )).wait();
    await (await vault.connect(alice).fund(1, { value: bondAmount })).wait();
    await (await registry.connect(alice).dispute(1)).wait();
    await (await registry.connect(alice).submitEvidence(1, "x", [])).wait();
    await (await registry.connect(bob).submitEvidence(1, "y", [])).wait();
    await (await registry.connect(alice).requestVerdict(1, { value: await jury.estimateDepositWei() })).wait();

    for (let i = 1n; i <= 5n; i++) {
      await (await platform.fireTimeout(i)).wait();
    }

    const settled = await registry.getCase(1);
    expect(settled.status).to.equal(7n); // TimedOut
    expect(settled.claimantSharePercent).to.equal(50n);
  });

  it("rejects under-funded verdict requests", async () => {
    const { alice, bob, registry, vault, jury } = await loadFixture(deployFixture);
    const bondAmount = ethers.parseEther("10");
    await (await registry.connect(alice).createCase(alice.address, bob.address, bondAmount, "x")).wait();
    await (await vault.connect(alice).fund(1, { value: bondAmount })).wait();
    await (await registry.connect(alice).dispute(1)).wait();
    await (await registry.connect(alice).submitEvidence(1, "a", [])).wait();
    await (await registry.connect(bob).submitEvidence(1, "b", [])).wait();

    const too_low = (await jury.estimateDepositWei()) - 1n;
    await expect(
      registry.connect(alice).requestVerdict(1, { value: too_low })
    ).to.be.revertedWithCustomError(jury, "InsufficientDeposit");
  });

  it("completes non-disputed cases immediately", async () => {
    const { alice, bob, registry, vault } = await loadFixture(deployFixture);
    const bondAmount = ethers.parseEther("5");

    await (await registry.connect(alice).createCase(alice.address, bob.address, bondAmount, "happy path")).wait();
    await (await vault.connect(alice).fund(1, { value: bondAmount })).wait();

    const bobStart = await ethers.provider.getBalance(bob.address);
    await (await registry.connect(alice).complete(1)).wait();
    const bobEnd = await ethers.provider.getBalance(bob.address);

    expect(bobEnd - bobStart).to.equal(bondAmount);
    const c = await registry.getCase(1);
    expect(c.status).to.equal(2n); // Completed
  });
});
