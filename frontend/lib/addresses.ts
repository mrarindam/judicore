/**
 * Deployed contract addresses keyed by chainId.
 * Update after running `npm run deploy:testnet` in /contracts.
 */

export type Addresses = {
  platform: `0x${string}`;
  escrowVault: `0x${string}`;
  juryManager: `0x${string}`;
  disputeRegistry: `0x${string}`;
};

const ZERO = "0x0000000000000000000000000000000000000000" as const;

export const ADDRESSES: Record<number, Addresses> = {
  50312: {
    platform: "0x037Bb9C718F3f7fe5eCBDB0b600D607b52706776",
    escrowVault: "0xD01d137a876D89B4e917bA44313a10165Bef8F29",
    juryManager: "0xF711E40d5e380048Fb775F0E16f504e4B44bfFB4",
    disputeRegistry: "0x6ac3076DA724791266c42DF59c45aCD0C7e41475",
  },
};

export function isConfigured(chainId: number): boolean {
  const a = ADDRESSES[chainId];
  return !!a && a.disputeRegistry !== ZERO;
}
