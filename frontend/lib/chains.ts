import { defineChain } from "viem";

export const somniaTestnet = defineChain({
  id: 50312,
  name: "Somnia Testnet",
  nativeCurrency: { name: "Somnia Testnet Token", symbol: "STT", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://dream-rpc.somnia.network"] },
  },
  blockExplorers: {
    default: { name: "Shannon Explorer", url: "https://shannon-explorer.somnia.network" },
  },
  testnet: true,
});

export const PLATFORM_ADDRESSES: Record<number, `0x${string}`> = {
  50312: "0x037Bb9C718F3f7fe5eCBDB0b600D607b52706776",
};

export function receiptUrl(_chainId: number, requestId: bigint): string {
  return `https://receipts.testnet.agents.somnia.host?requestId=${requestId}`;
}

export function explorerUrl(_chainId: number, hash: string, type: "tx" | "address" = "tx"): string {
  return `https://shannon-explorer.somnia.network/${type}/${hash}`;
}
