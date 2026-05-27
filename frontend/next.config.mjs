/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { dev }) => {
    if (dev) {
      // Disable Webpack cache during development to prevent chunk desync and HMR 404 errors
      config.cache = false;
    }
    config.externals.push("pino-pretty", "lokijs", "encoding");
    // wagmi v3 connectors optionally try to import these; mark as null to skip.
    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
      "porto/internal": false,
      "porto/wagmi": false,
      "accounts": false,
      "@base-org/account": false,
      "@coinbase/wallet-sdk": false,
      "@metamask/connect-evm": false,
      "porto": false,
      "@safe-global/safe-apps-sdk": false,
      "@safe-global/safe-apps-provider": false,
      "@walletconnect/ethereum-provider": false,
    };
    return config;
  },
};

export default nextConfig;
