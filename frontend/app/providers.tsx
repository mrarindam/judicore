"use client";

import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider, useTheme } from "next-themes";
import { ReactNode, useState, useEffect } from "react";
import { wagmiConfig } from "@/lib/wagmi";
import { RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { refetchInterval: 2_000, staleTime: 1_000 } },
  }));

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      storageKey="judicore-theme"
      themes={["dark", "light"]}
    >
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <RainbowWrapper>{children}</RainbowWrapper>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
}

function RainbowWrapper({ children }: { children: ReactNode }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeTheme = resolvedTheme === "light"
    ? lightTheme({
        accentColor: "#1696D6",
        accentColorForeground: "white",
        borderRadius: "medium",
        fontStack: "system",
      })
    : darkTheme({
        accentColor: "#8B5CF6",
        accentColorForeground: "white",
        borderRadius: "medium",
        fontStack: "system",
      });

  return (
    <RainbowKitProvider theme={mounted ? activeTheme : undefined}>
      {children}
    </RainbowKitProvider>
  );
}
