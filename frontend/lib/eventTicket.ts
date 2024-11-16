// lib/contracts/eventTicket.ts
import { encodeFunctionData, createPublicClient, http, Address } from "viem";
import { baseSepolia } from "viem/chains";
import type { EventInfo, TransactionResult } from "@/app/types/eventTicket";
import type { BiconomySmartAccountV2 } from "@biconomy/account";
import eventticketingtest2 from "../../contracts/abis/EventTicketingTest2.json";

// Contract address from environment variable
const CONTRACT_ADDRESS = "0x7133CF0D4597F39FFA0E5Dd19144800FD49EC47B";

// Initialize public client for read operations
const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http()
});

class EventTicketContract {
  private static instance: EventTicketContract;
  private constructor() {}

  public static getInstance(): EventTicketContract {
    if (!EventTicketContract.instance) {
      EventTicketContract.instance = new EventTicketContract();
    }
    return EventTicketContract.instance;
  }

  public async getEventInfo(): Promise<EventInfo> {
    try {
      if (!CONTRACT_ADDRESS) throw new Error("Contract address not configured");

      const data = await publicClient.readContract({
        address: CONTRACT_ADDRESS as Address,
        abi: eventticketingtest2,
        functionName: 'getEventInfo',
      }) as unknown as EventInfo;

      return data;
    } catch (error) {
      console.error('Error fetching event info:', error);
      throw error;
    }
  }

  public async buyTicket(smartAccount: BiconomySmartAccountV2): Promise<TransactionResult> {
    try {
      if (!CONTRACT_ADDRESS) throw new Error("Contract address not configured");
      if (!smartAccount) throw new Error("Smart account not initialized");

      // Add debug logs
      console.log("Starting buyTicket process...");
      console.log("Smart Account:", smartAccount);
      console.log("Contract Address:", CONTRACT_ADDRESS);

      const data = encodeFunctionData({
        abi: eventticketingtest2,
        functionName: 'buy',
      });

      const tx = {
        to: CONTRACT_ADDRESS as Address,
        data: data,
        value: BigInt("10000000000000000"), // 0.01 ETH in wei
      };

      // Debug log for transaction
      console.log("Transaction data:", tx);

      // Build user operation
      const userOp = await smartAccount.buildUserOp([tx]);
      console.log("Built userOp:", userOp);

      // Verify paymaster exists
      if (!smartAccount.paymaster) {
        throw new Error("Paymaster not initialized in smart account");
      }

      // Get paymaster data
      const paymasterAndDataResponse = await smartAccount.paymaster.getPaymasterAndData(userOp);
      console.log("Paymaster response:", paymasterAndDataResponse);

      userOp.paymasterAndData = paymasterAndDataResponse.paymasterAndData;

      // Send the operation
      const userOpResponse = await smartAccount.sendUserOp(userOp);
      console.log("UserOp Response:", userOpResponse);

      // Wait for transaction
      const transactionDetails = await userOpResponse.wait();
      console.log("Transaction Details:", transactionDetails);

      return {
        success: true,
        userOpHash: userOpResponse.userOpHash,
        transactionHash: transactionDetails.receipt.transactionHash,
      };

    } catch (error) {
      // Improved error handling
      console.error('Error buying ticket:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });

      return {
        success: false,
        error: error instanceof Error 
          ? error.message 
          : typeof error === 'object' && error !== null 
            ? JSON.stringify(error) 
            : 'Unknown error occurred',
      };
    }
  }
}

export const eventTicketContract = EventTicketContract.getInstance();