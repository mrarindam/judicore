import { ethers } from "hardhat";

const AGENT_REGISTRY = "0x08D1Fc808f1983d2Ea7B63a28ECD4d8C885Cd02A";

const REGISTRY_ABI = [
  "function getAllAgents() view returns (uint256[])",
  "function getAgent(uint256) view returns (tuple(uint256 agentId, string metadataUri, string containerImageUri))",
  "function agentCount() view returns (uint256)",
];

function ipfsToHttp(uri: string): string {
  if (uri.startsWith("ipfs://")) {
    return "https://ipfs.io/ipfs/" + uri.slice(7);
  }
  return uri;
}

async function fetchMetadata(uri: string): Promise<any> {
  const url = ipfsToHttp(uri);
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return { _error: `HTTP ${res.status}` };
    return await res.json();
  } catch (e: any) {
    return { _error: e.message };
  }
}

async function main() {
  const reg = new ethers.Contract(AGENT_REGISTRY, REGISTRY_ABI, ethers.provider);
  const ids = (await reg.getAllAgents()) as bigint[];
  const count = await reg.agentCount();

  console.log("");
  console.log(`AgentRegistry @ ${AGENT_REGISTRY}`);
  console.log(`Total agents: ${count}`);
  console.log("");

  for (const id of ids) {
    const a = await reg.getAgent(id);
    const meta = await fetchMetadata(a.metadataUri);
    const name = meta?.name ?? meta?.title ?? meta?.displayName ?? "?";
    const desc = meta?.description ?? "";
    const price = meta?.pricePerCall ?? meta?.price ?? meta?.rewardPerAgent ?? "?";
    const fns = meta?.functions ?? meta?.api ?? meta?.methods ?? [];
    const fnList = Array.isArray(fns)
      ? fns.map((f: any) => (typeof f === "string" ? f : f.name ?? "?")).join(", ")
      : "";
    console.log(`ID:           ${id}`);
    console.log(`  name:       ${name}`);
    if (desc) console.log(`  desc:       ${desc.slice(0, 120)}`);
    console.log(`  metaURI:    ${a.metadataUri}`);
    if (price !== "?") console.log(`  price:      ${price}`);
    if (fnList) console.log(`  functions:  ${fnList}`);
    if (meta._error) console.log(`  (metadata fetch failed: ${meta._error})`);
    console.log("");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
