// types/eventTicket.ts
export interface TransactionResult {
    success: boolean;
    userOpHash?: string;
    transactionHash?: string;
    error?: string;
  }
  
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