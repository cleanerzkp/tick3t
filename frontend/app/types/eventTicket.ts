import type { Hash } from "viem";

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
  transactionHash?: Hash;
  userOpHash?: string;
  error?: string;
}