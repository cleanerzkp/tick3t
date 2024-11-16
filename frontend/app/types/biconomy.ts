// types/biconomy.ts
import type { WalletClient as ViemWalletClient } from "viem";
import type { BiconomySmartAccountV2, IValidationModule } from "@biconomy/account";

// Just extend the base WalletClient
export type WalletClient = ViemWalletClient;

// Simple config type
export interface SmartAccountConfig {
  chainId: number;
  bundlerUrl: string;
  paymasterUrl: string;
  entryPointAddress: string;
}

// Use the Biconomy type directly
export type BiconomySmartAccount = BiconomySmartAccountV2;

// Use Biconomy's validation module interface
export type ValidationModule = IValidationModule;