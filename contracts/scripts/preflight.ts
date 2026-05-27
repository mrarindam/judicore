import { ethers, network } from "hardhat";

async function main() {
  const [s] = await ethers.getSigners();
  const bal = await ethers.provider.getBalance(s.address);
  const net = await ethers.provider.getNetwork();
  const block = await ethers.provider.getBlockNumber();
  console.log("");
  console.log("Network:    ", network.name, "(chainId", net.chainId.toString() + ")");
  console.log("RPC works:  ✓  (current block:", block + ")");
  console.log("Address:    ", s.address);
  console.log("Balance:    ", ethers.formatEther(bal), "STT");
  if (bal === 0n) {
    console.log("");
    console.log("⚠ Balance is 0 — get STT from a faucet first.");
  } else if (bal < ethers.parseEther("2")) {
    console.log("");
    console.log("⚠ Low balance. Deploy needs ~0.1 STT for gas. Each verdict costs ~1.2 STT.");
  } else {
    console.log("");
    console.log("✓ Ready to deploy. Run: npm run deploy:testnet");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
