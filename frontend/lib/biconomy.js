import { Bundler } from "@biconomy/bundler";
import { Paymaster, createSmartAccountClient, DEFAULT_ENTRYPOINT_ADDRESS, ECDSAOwnershipValidationModule, DEFAULT_ECDSA_OWNERSHIP_MODULE, SupportedSigner } from "@biconomy/account";
import { baseSepolia } from "viem/chains";
import {ChainId} from '@biconomy/core-types'
import { WalletClient } from "@/app/types/biconomy";

const bundler = new Bundler({
  bundlerUrl: process.env.NEXT_PUBLIC_BICONOMY_BUNDLER_URL,
  chainId: 84532, // Replace this with your desired network
  entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS, // This is a Biconomy constant
});

const paymaster = new Paymaster({
  paymasterUrl: process.env.NEXT_PUBLIC_BICONOMY_PAYMASTER_URL,
});

const createValidationModule = async (signer) => {
  return await ECDSAOwnershipValidationModule.create({
    signer: signer,
    moduleAddress: DEFAULT_ECDSA_OWNERSHIP_MODULE, // This is a Biconomy constant
  });
};

export const createSmartAccount = async (walletClient) => {
  const validationModule = await createValidationModule(walletClient);
  console.log('creating')

  return await createSmartAccountClient({
    signer: walletClient,
    chainId: baseSepolia.id, // Replace this with your target network
    bundler: bundler, // Use the `bundler` we initialized above
    paymaster: paymaster, // Use the `paymaster` we initialized above
    entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS, // This is a Biconomy constant
    defaultValidationModule: validationModule, // Use the `validationModule` we initialized above
    activeValidationModule: validationModule, // Use the `validationModule` we initialized above
  });
};
