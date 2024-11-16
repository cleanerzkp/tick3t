// lib/biconomy.js
import { Bundler } from "@biconomy/bundler";
import { 
  Paymaster, 
  createSmartAccountClient, 
  DEFAULT_ENTRYPOINT_ADDRESS, 
  ECDSAOwnershipValidationModule, 
  DEFAULT_ECDSA_OWNERSHIP_MODULE 
} from "@biconomy/account";
import { baseSepolia } from "viem/chains";

// Initialize bundler with logging
export const initializeBundler = () => {
  const bundler = new Bundler({
    bundlerUrl: process.env.NEXT_PUBLIC_BICONOMY_BUNDLER_URL,
    chainId: baseSepolia.id,
    entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
  });

  console.log("Bundler initialized with:", bundler);
  return bundler;
};

// Initialize paymaster with logging
export const initializePaymaster = () => {
  const paymaster = new Paymaster({
    paymasterUrl: process.env.NEXT_PUBLIC_BICONOMY_PAYMASTER_URL,
  });

  console.log("Paymaster initialized with:", paymaster);
  return paymaster;
};

// Create validation module with logging
export const createValidationModule = async (signer) => {
  try {
    const validationModule = await ECDSAOwnershipValidationModule.create({
      signer: signer,
      moduleAddress: DEFAULT_ECDSA_OWNERSHIP_MODULE,
    });
    console.log("Validation Module created:", validationModule);
    return validationModule;
  } catch (error) {
    console.error("Error creating Validation Module:", error);
    throw error;
  }
};

// Create smart account with detailed logging
export const createSmartAccount = async (walletClient) => {
  try {
    const validationModule = await createValidationModule(walletClient);
    console.log('Creating smart account...');
    
    const bundler = initializeBundler();
    const paymaster = initializePaymaster();

    const nexusClient = await createSmartAccountClient({
      signer: walletClient,
      chainId: baseSepolia.id,
      bundler: bundler,
      paymaster: paymaster,
      entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
      defaultValidationModule: validationModule,
      activeValidationModule: validationModule,
    });

    console.log('NexusClient initialized:', nexusClient);

    // Log entire NexusClient structure
    console.log("NexusClient structure:", {
      factoryAddress: nexusClient.factoryAddress,
      deploymentState: nexusClient.deploymentState,
      accountAddress: nexusClient.accountAddress,
      accountInitCode: nexusClient.accountInitCode,
      methods: Object.keys(nexusClient),
    });

    return nexusClient;
  } catch (error) {
    console.error("Error in createSmartAccount:", error);
    throw error;
  }
};