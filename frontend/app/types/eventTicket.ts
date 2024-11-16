import type { Address, Hash } from 'viem';

export interface EventInfo {
  name: string;
  photo: string;
  time: bigint;
  location: string;
  n_tickets: bigint;
  n_tickets_sold: bigint;
  price: bigint;
}

export interface TransactionResult {
  success: boolean;
  transactionHash?: string;
  userOpHash?: string;
  error?: string;
}

export interface EventTicketCall {
  to: Address;
  data: `0x${string}`;
  value?: bigint;
}