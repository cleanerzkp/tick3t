// lib/contracts/eventTicket.ts
import { encodeFunctionData, createPublicClient, http, Address } from "viem";
import { baseSepolia } from "viem/chains";
import type { EventInfo, TransactionResult } from "@/app/types/eventTicket";
import type { BiconomySmartAccountV2 } from "@biconomy/account";
import eventticketingtest2 from "../../contracts/abis/EventTicketingTest2.json";

// Contract address
const CONTRACT_ADDRESS = "0x7133CF0D4597F39FFA0E5Dd19144800FD49EC47B";

// Public client for read operations
const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(),
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

  // Fetch event info
  public async getEventInfo(): Promise<EventInfo> {
    try {
      if (!CONTRACT_ADDRESS) throw new Error("Contract address not configured");

      const data = await publicClient.readContract({
        address: CONTRACT_ADDRESS as Address,
        abi: eventticketingtest2,
        functionName: "getEventInfo",
      }) as unknown as EventInfo;

      return data;
    } catch (error) {
      console.error("Error fetching event info:", error);
      throw error;
    }
  }

  // Buy ticket
  public async buyTicket(smartAccount: BiconomySmartAccountV2): Promise<TransactionResult> {
    try {
      if (!CONTRACT_ADDRESS) throw new Error("Contract address not configured");
      if (!smartAccount) throw new Error("Smart account not initialized");

      const senderAddress = await smartAccount.getAccountAddress();
      console.log("Sender Address:", senderAddress);

      const data = encodeFunctionData({
        abi: eventticketingtest2,
        functionName: "buy",
      });

      const tx = {
        to: CONTRACT_ADDRESS as Address,
        data: data,
        value: BigInt("10000000000000000"), // 0.01 ETH in wei
        // Removed 'sender' as it's managed by the SDK
      };

      console.log("Transaction data:", tx);

      // Build user operation
      const userOp = await smartAccount.buildUserOp([tx]);
      console.log("Built userOp:", userOp);

      // Ensure paymaster is initialized
      if (!smartAccount.paymaster) {
        throw new Error("Paymaster not initialized in smart account");
      }

      // Fetch paymaster and data
      const paymasterAndDataResponse = await smartAccount.paymaster.getPaymasterAndData(userOp);
      console.log("Paymaster response:", paymasterAndDataResponse);

      if (!paymasterAndDataResponse || !paymasterAndDataResponse.paymasterAndData) {
        throw new Error("Paymaster failed to return valid data");
      }

      userOp.paymasterAndData = paymasterAndDataResponse.paymasterAndData;

      // Send the user operation
      const userOpResponse = await smartAccount.sendUserOp(userOp);
      console.log("UserOp Response:", userOpResponse);

      // Wait for the transaction to complete
      const transactionDetails = await userOpResponse.wait();
      console.log("Transaction Details:", transactionDetails);

      return {
        success: true,
        userOpHash: userOpResponse.userOpHash,
        transactionHash: transactionDetails.receipt.transactionHash,
      };
    } catch (error) {
      console.error("Error buying ticket:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

export const eventTicketContract = EventTicketContract.getInstance();