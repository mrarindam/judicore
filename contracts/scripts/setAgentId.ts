import { ethers, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * Wires the agent ID into the deployed JuryManager.
 * Reads LLM_INFERENCE_AGENT_ID from .env and the JuryManager address from deployments/<network>.json.
 */

async function main() {
  const llmAgentId = process.env.LLM_INFERENCE_AGENT_ID;
  if (!llmAgentId || llmAgentId === "0" || llmAgentId === "") {
    throw new Error("LLM_INFERENCE_AGENT_ID not set in .env");
  }

  const file = path.join(__dirname, "..", "deployments", `${network.name}.json`);
  if (!fs.existsSync(file)) throw new Error(`No deployment file at ${file}`);
  const deployment = JSON.parse(fs.readFileSync(file, "utf8"));
  const juryAddress = deployment.addresses.juryManager;

  console.log("");
  console.log(`Network:       ${network.name}`);
  console.log(`JuryManager:   ${juryAddress}`);
  console.log(`Setting LLM agent ID: ${llmAgentId}`);

  const jury = await ethers.getContractAt("JuryManager", juryAddress);
  const currentId = await jury.llmInferenceAgentId();
  if (currentId.toString() === llmAgentId) {
    console.log("✓ Already set, nothing to do.");
    return;
  }

  const tx = await jury.setLlmInferenceAgentId(BigInt(llmAgentId));
  console.log(`tx: ${tx.hash}`);
  await tx.wait();
  console.log("✓ Set.");

  const verified = await jury.llmInferenceAgentId();
  console.log(`Verified on-chain: ${verified}`);

  const deposit = await jury.estimateDepositWei();
  console.log(`Verdict deposit:   ${ethers.formatEther(deposit)} STT`);

  // Update the deployment file with the agent ID for downstream scripts
  deployment.config.llmInferenceAgentId = llmAgentId;
  fs.writeFileSync(file, JSON.stringify(deployment, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
