import { Bundler } from "@biconomy/bundler";
import {
  Paymaster,
  createSmartAccountClient,
  DEFAULT_ENTRYPOINT_ADDRESS,
  ECDSAOwnershipValidationModule,
  DEFAULT_ECDSA_OWNERSHIP_MODULE,
} from "@biconomy/account";
import { baseSepolia } from "viem/chains";

// Initialize Bundler with explicit entry point
const bundler = new Bundler({
  bundlerUrl: process.env.NEXT_PUBLIC_BICONOMY_BUNDLER_URL,
  chainId: baseSepolia.id,
  entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
});

// Initialize Paymaster
const paymaster = new Paymaster({
  paymasterUrl: process.env.NEXT_PUBLIC_BICONOMY_PAYMASTER_URL,
});

// Create Validation Module
const createValidationModule = async (signer) => {
  try {
    return await ECDSAOwnershipValidationModule.create({
      signer: signer,
      moduleAddress: DEFAULT_ECDSA_OWNERSHIP_MODULE,
    });
  } catch (error) {
    console.error("Error creating validation module:", error);
    throw error;
  }
};

// Create Smart Account
export const createSmartAccount = async (walletClient) => {
  try {
    if (!walletClient) {
      throw new Error("Wallet client is required");
    }

    const validationModule = await createValidationModule(walletClient);
    console.log("Validation module created:", validationModule);

    const smartAccount = await createSmartAccountClient({
      signer: walletClient,
      chainId: baseSepolia.id,
      bundler: bundler,
      paymaster: paymaster,
      entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
      defaultValidationModule: validationModule,
      activeValidationModule: validationModule,
    });

    // Initialize the account if not already deployed
    if (!smartAccount.isDeployed()) {
      console.log("Smart account not deployed, initializing...");
      await smartAccount.init();
    }

    return smartAccount;
  } catch (error) {
    console.error("Error creating smart account:", error);
    throw error;
  }
};