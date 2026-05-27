import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
import * as dotenv from "dotenv";

dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY ?? "0x" + "00".repeat(32);
const SOMNIA_TESTNET_RPC = process.env.SOMNIA_TESTNET_RPC ?? "https://dream-rpc.somnia.network";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      viaIR: true,
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    somniaTestnet: {
      url: SOMNIA_TESTNET_RPC,
      chainId: 50312,
      accounts: PRIVATE_KEY === "0x" + "00".repeat(32) ? [] : [PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: {
      somniaTestnet: "no-api-key-needed",
    },
    customChains: [
      {
        network: "somniaTestnet",
        chainId: 50312,
        urls: {
          apiURL: "https://shannon-explorer.somnia.network/api",
          browserURL: "https://shannon-explorer.somnia.network",
        },
      },
    ],
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;
