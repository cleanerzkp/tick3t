// app/types/eventTicket.ts
import type { BiconomySmartAccountV2 } from "@biconomy/account";

export interface EventInfo {
  name: string;
  url: string;
  time: bigint;
  location: string;
  photo: string;
  n_tickets: bigint;
  n_tickets_sold: bigint;
  price: bigint;
}

export interface TransactionResult {
  success: boolean;
  userOpHash?: string;
  transactionHash?: string;
  error?: string;
}

// Export BiconomySmartAccount type
export type BiconomySmartAccount = BiconomySmartAccountV2;