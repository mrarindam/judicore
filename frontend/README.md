# Judicore Frontend

Next.js + wagmi dApp for filing disputes and watching the 5-juror panel settle them in real time on Somnia Testnet.

## Stack

- **Next.js 14** App Router (`app/`), React 18
- **wagmi 3 + viem 2** for on-chain reads/writes
- **RainbowKit** wallet connector
- **@tanstack/react-query** for polling (`refetchInterval: 2_000`)
- **Tailwind CSS** for styling, **framer-motion** for animation
- **next-themes** for dark/light toggling

## Pages

| Route | Component | Purpose |
|---|---|---|
| `/`            | `app/page.tsx`             | Landing — pitch, panel overview, file-a-dispute CTA |
| `/disputes`    | `app/disputes/page.tsx`    | All open and recent cases |
| `/case/[id]`   | `app/case/[id]/page.tsx`   | Single-case dashboard with live juror cards |
| `/docs`        | `app/docs/page.tsx`        | In-app docs / contract reference |

## Core lib (`lib/`)

| File | Role |
|---|---|
| `chains.ts`    | `somniaTestnet` viem chain, platform addresses, receipt + explorer URL builders |
| `wagmi.ts`     | `wagmiConfig` (RainbowKit `getDefaultConfig`) |
| `addresses.ts` | Per-chain deployed contract addresses (paste in after `npm run deploy:testnet`) |
| `abis.ts`      | Hand-written ABIs for `DisputeRegistry`, `JuryManager`, `EscrowVault` |
| `hooks.ts`     | `useCase`, `useVerdict`, `useCases` — react-query backed live polling |

## Network

Testnet-only. Chain ID `50312`, RPC `https://dream-rpc.somnia.network`, explorer `https://shannon-explorer.somnia.network`.

## Setup

```bash
npm install
npm run dev          # http://localhost:3000
```

You need:

1. A Somnia Testnet wallet with STT (faucet via Somnia network docs).
2. The four contract addresses from your `contracts/deployments/somniaTestnet.json` (or use the defaults already in `lib/addresses.ts`).

To point at a fresh deployment, copy the addresses from `../contracts/deployments/somniaTestnet.json` into `lib/addresses.ts`.

## Build

```bash
npm run build        # type-checks, builds, no dynamic export needed
npm start            # serves the build on :3000
```

## How the live case page works

`app/case/[id]/page.tsx` uses `useCase(id)` + `useVerdict(verdictId)`, which polls every 2 s. Each of the 5 `JurorCard` components shows live status:

- `·` pending — no response yet from the platform
- `✗` failed — platform returned `Failure` for that juror's request
- `✓` succeeded — juror returned `0..100`, with the receipt id linkable to `receipts.testnet.agents.somnia.host`

Once 3 of 5 jurors succeed and the contract finalises, the page flips to the resolved view with the claimant share % and the per-juror receipt URLs.

## Design system

Tailwind tokens live in `tailwind.config.ts`. The "Judicore Design System" comment marks the colour scale, font pairing (`Space_Grotesk` + `IBM Plex Mono` via `next/font/google`, with Geist as fallback), aurora backgrounds, and neon shadow tokens used across the orbital panel and juror cards.

## Linting

```bash
npm run lint
```
