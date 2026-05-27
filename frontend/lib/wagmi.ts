import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { somniaTestnet } from "./chains";

export const wagmiConfig = getDefaultConfig({
  appName: "Judicore",
  projectId: "4cc9ff8b5cf634d399fb718534d399c9",
  chains: [somniaTestnet],
  ssr: true,
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
