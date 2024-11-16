// lib/biconomy.js
import { Bundler } from "@biconomy/bundler";
import {
  BiconomyPaymaster,
  createSmartAccountClient,
  DEFAULT_ENTRYPOINT_ADDRESS,
  ECDSAOwnershipValidationModule,
  DEFAULT_ECDSA_OWNERSHIP_MODULE,
} from "@biconomy/account";
import { baseSepolia } from "viem/chains";

// Initialize Bundler
const bundler = new Bundler({
  bundlerUrl: process.env.NEXT_PUBLIC_BICONOMY_BUNDLER_URL,
  chainId: baseSepolia.id,
  entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
});

// Initialize Paymaster with default mode as SPONSORED
const paymaster = new BiconomyPaymaster({
  paymasterUrl: process.env.NEXT_PUBLIC_BICONOMY_PAYMASTER_URL,
  // Always use sponsored mode by default
  preferredPaymasterMode: 'SPONSORED',
});

const createValidationModule = async (signer) => {
  return await ECDSAOwnershipValidationModule.create({
    signer,
    moduleAddress: DEFAULT_ECDSA_OWNERSHIP_MODULE,
  });
};

export const createSmartAccount = async (walletClient) => {
  try {
    console.log("Creating validation module...");
    const validationModule = await createValidationModule(walletClient);

    console.log("Creating smart account client with sponsored paymaster...");
    const smartAccount = await createSmartAccountClient({
      signer: walletClient,
      chainId: baseSepolia.id,
      bundler,
      paymaster, // This paymaster is configured to always use sponsored mode
      entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
      defaultValidationModule: validationModule,
      activeValidationModule: validationModule,
      // Force sponsored transactions
      paymasterConfig: {
        onlySponsorFirstTransaction: false, // Sponsor all transactions
        mode: 'SPONSORED',
      },
    });

    return smartAccount;
  } catch (error) {
    console.error("Error in createSmartAccount:", error);
    throw error;
  }
};
