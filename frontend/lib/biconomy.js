const { createNexusClient, createBicoPaymasterClient } = require("@biconomy/sdk");
const { baseSepolia } = require("viem/chains");
const { http } = require("viem");

export const createSmartAccount = async (walletClient) => {
  try {
    console.log('Creating Nexus client with wallet:', walletClient);
    if (!process.env.NEXT_PUBLIC_BICONOMY_BUNDLER_URL || !process.env.NEXT_PUBLIC_BICONOMY_PAYMASTER_URL) {
      throw new Error("Missing bundler or paymaster URL in environment variables");
    }

    const nexusClient = await createNexusClient({
      signer: walletClient,
      chain: baseSepolia,
      transport: http(),
      bundlerTransport: http(process.env.NEXT_PUBLIC_BICONOMY_BUNDLER_URL),
      paymaster: createBicoPaymasterClient({
        paymasterUrl: process.env.NEXT_PUBLIC_BICONOMY_PAYMASTER_URL
      })
    });

    // Validate the client
    if (!nexusClient.account?.address) {
      throw new Error("Invalid Nexus client: No account address");
    }

    console.log('Smart Account Address:', nexusClient.account.address);
    console.log('Nexus client created:', nexusClient);
    return nexusClient;
  } catch (error) {
    console.error("Error creating Nexus client:", error);
    throw error;
  }
};