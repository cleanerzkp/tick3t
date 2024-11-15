// app/layout.tsx
"use client";
import "./globals.css";
import { Inter } from "next/font/google";
import {
  DynamicContextProvider,
  DynamicWidget,
} from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { DynamicWagmiConnector } from "@dynamic-labs/wagmi-connector";
import { createConfig, WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http } from "viem";
import { baseSepolia, mainnet, sepolia } from "viem/chains";

const inter = Inter({ subsets: ["latin"] });
const dynamicEnvId = process.env.NEXT_PUBLIC_DYNAMIC_ENV_ID;

// Configure all required chains
const config = createConfig({
  chains: [baseSepolia, mainnet, sepolia], // Add all chains that appear in the errors
  multiInjectedProviderDiscovery: false,
  transports: {
    [baseSepolia.id]: http(),
    [mainnet.id]: http(),
    [sepolia.id]: http()
  },
});

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!dynamicEnvId) {
    throw new Error("Please add your Dynamic Environment to this project's .env file");
  }

  return (
    <html lang="en">
      <body className={inter.className}>
        <DynamicContextProvider
          settings={{
            environmentId: dynamicEnvId,
            walletConnectors: [EthereumWalletConnectors],
          }}
        >
          <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
              <DynamicWagmiConnector>
                {children}
              </DynamicWagmiConnector>
            </QueryClientProvider>
          </WagmiProvider>
        </DynamicContextProvider>
      </body>
    </html>
  );
}