import { ethers, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * Deploys Judicore contracts and wires them together.
 *
 * Defaults to the Somnia Testnet SomniaAgents platform unless USE_MOCK_PLATFORM=true.
 *
 * Required env (.env):
 *   PRIVATE_KEY              - deployer key
 *   LLM_INFERENCE_AGENT_ID   - numeric agent id for LLM Inference on Somnia
 *
 * Optional env:
 *   SOMNIA_AGENTS_PLATFORM   - override platform address
 *   LLM_REWARD_PER_AGENT_WEI - override LLM Inference per-agent reward
 *   USE_MOCK_PLATFORM=true   - deploy a MockSomniaAgents instead (local testing)
 */

const KNOWN_PLATFORMS: Record<number, string> = {
  50312: "0x037Bb9C718F3f7fe5eCBDB0b600D607b52706776", // Somnia Testnet
};

async function main() {
  const [deployer] = await ethers.getSigners();
  const net = await ethers.provider.getNetwork();
  const chainId = Number(net.chainId);

  console.log("");
  console.log("=".repeat(60));
  console.log("  Judicore deploy");
  console.log("=".repeat(60));
  console.log(`  Network:       ${network.name} (chainId ${chainId})`);
  console.log(`  Deployer:      ${deployer.address}`);
  console.log(`  Balance:       ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} STT`);

  // ----- Platform -----
  let platformAddress: string;
  const useMock = process.env.USE_MOCK_PLATFORM === "true";
  if (useMock || chainId === 31337) {
    console.log("  Platform:      deploying MockSomniaAgents (local)");
    const Mock = await ethers.getContractFactory("MockSomniaAgents");
    const mock = await Mock.deploy();
    await mock.waitForDeployment();
    platformAddress = await mock.getAddress();
  } else {
    platformAddress =
      process.env.SOMNIA_AGENTS_PLATFORM ?? KNOWN_PLATFORMS[chainId] ?? "";
    if (!ethers.isAddress(platformAddress) || platformAddress === ethers.ZeroAddress) {
      throw new Error(
        `Unknown SomniaAgents platform for chainId ${chainId}. Set SOMNIA_AGENTS_PLATFORM in .env`
      );
    }
    console.log(`  Platform:      ${platformAddress} (SomniaAgents)`);
  }

  // ----- JuryManager -----
  console.log("");
  console.log("  → Deploying JuryManager...");
  const Jury = await ethers.getContractFactory("JuryManager");
  const jury = await Jury.deploy(platformAddress);
  await jury.waitForDeployment();
  const juryAddress = await jury.getAddress();
  console.log(`     JuryManager:  ${juryAddress}`);

  // ----- EscrowVault -----
  console.log("  → Deploying EscrowVault...");
  const Vault = await ethers.getContractFactory("EscrowVault");
  const vault = await Vault.deploy();
  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();
  console.log(`     EscrowVault:  ${vaultAddress}`);

  // ----- DisputeRegistry -----
  console.log("  → Deploying DisputeRegistry...");
  const Registry = await ethers.getContractFactory("DisputeRegistry");
  const registry = await Registry.deploy(vaultAddress, juryAddress);
  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();
  console.log(`     Registry:     ${registryAddress}`);

  // ----- Wiring -----
  console.log("");
  console.log("  → Wiring vault.setRegistry...");
  await (await vault.setRegistry(registryAddress)).wait();
  console.log("  → Wiring jury.setRegistry...");
  await (await jury.setRegistry(registryAddress)).wait();

  // ----- Agent config -----
  const llmAgentId = process.env.LLM_INFERENCE_AGENT_ID;
  if (llmAgentId && llmAgentId !== "0" && llmAgentId !== "") {
    console.log(`  → Setting LLM Inference agent id: ${llmAgentId}`);
    await (await jury.setLlmInferenceAgentId(BigInt(llmAgentId))).wait();
  } else {
    console.log("  ⚠ LLM_INFERENCE_AGENT_ID not set in .env — run jury.setLlmInferenceAgentId(...) manually");
  }

  const rewardOverride = process.env.LLM_REWARD_PER_AGENT_WEI;
  if (rewardOverride) {
    console.log(`  → Setting LLM reward per agent: ${rewardOverride} wei`);
    await (await jury.setLlmRewardPerAgent(BigInt(rewardOverride))).wait();
  }

  // ----- Summary -----
  console.log("");
  console.log("=".repeat(60));
  console.log("  DEPLOYED");
  console.log("=".repeat(60));
  console.log(`  Platform:      ${platformAddress}`);
  console.log(`  EscrowVault:   ${vaultAddress}`);
  console.log(`  JuryManager:   ${juryAddress}`);
  console.log(`  Registry:      ${registryAddress}`);
  console.log(`  Verdict cost:  ${ethers.formatEther(await jury.estimateDepositWei())} STT per dispute`);
  console.log("=".repeat(60));

  // Persist for downstream scripts and the frontend
  const out = {
    chainId,
    network: network.name,
    deployedAt: new Date().toISOString(),
    addresses: {
      platform: platformAddress,
      escrowVault: vaultAddress,
      juryManager: juryAddress,
      disputeRegistry: registryAddress,
    },
    config: {
      llmInferenceAgentId: llmAgentId ?? null,
      verdictDepositWei: (await jury.estimateDepositWei()).toString(),
    },
  };

  const outDir = path.join(__dirname, "..", "deployments");
  fs.mkdirSync(outDir, { recursive: true });
  const file = path.join(outDir, `${network.name}.json`);
  fs.writeFileSync(file, JSON.stringify(out, null, 2));
  console.log(`  Saved to ${file}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
