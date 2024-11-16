import { encodeFunctionData, createPublicClient, http, Address, parseGwei } from "viem";
import { baseSepolia } from "viem/chains";
import type { EventInfo, TransactionResult } from "@/app/types/eventTicket";
import type { BiconomySmartAccountV2 } from "@biconomy/account";
import { PaymasterMode } from "@biconomy/account";
import { EventTicketingTestAbi } from "../../contracts/abis/EventTicketingTest2";

const CONTRACT_ADDRESS = "0x7133CF0D4597F39FFA0E5Dd19144800FD49EC47B";

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

  public async getEventInfo(): Promise<EventInfo> {
    try {
      if (!CONTRACT_ADDRESS) throw new Error("Contract address not configured");

      const data = await publicClient.readContract({
        address: CONTRACT_ADDRESS as Address,
        abi: EventTicketingTestAbi.abi,
        functionName: "getEventInfo",
      }) as unknown as EventInfo;

      return data;
    } catch (error) {
      console.error("Error fetching event info:", error);
      throw error;
    }
  }

  public async buyTicket(smartAccount: BiconomySmartAccountV2): Promise<TransactionResult> {
    try {
      if (!CONTRACT_ADDRESS) throw new Error("Contract address not configured");
      if (!smartAccount) throw new Error("Smart account not initialized");

      const address = await smartAccount.getAccountAddress();
      console.log("Smart Account Address:", address);

      // Encode the buy function call
      const data = encodeFunctionData({
        abi: EventTicketingTestAbi.abi,
        functionName: "buy",
      });

      // Set fixed gas values in string format as required by Biconomy
      const maxPriorityFeePerGas = parseGwei("1.5");
      const maxFeePerGas = parseGwei("2");

      // Create transaction object
      const tx = {
        to: CONTRACT_ADDRESS as Address,
        data: data,
        maxFeePerGas: maxFeePerGas.toString(),
        maxPriorityFeePerGas: maxPriorityFeePerGas.toString(),
      };

      console.log("Prepared transaction:", tx);

      // Send transaction with specific gas configuration
      const userOpResponse = await smartAccount.sendTransaction(tx, {
        paymasterServiceData: { 
          mode: PaymasterMode.SPONSORED,
          calculateGasLimits: true,
        }
      });

      console.log("UserOp Response:", userOpResponse);

      const { transactionHash } = await userOpResponse.waitForTxHash();
      console.log("Transaction Hash:", transactionHash);

      const userOpReceipt = await userOpResponse.wait();
      
      if (userOpReceipt.success) {
        console.log("Transaction successful!");
        console.log("Receipt:", userOpReceipt);
        
        return {
          success: true,
          userOpHash: userOpReceipt.userOpHash,
          transactionHash: userOpReceipt.receipt.transactionHash,
        };
      } else {
        throw new Error("Transaction failed");
      }

    } catch (error) {
      console.error("Error buying ticket:", {
        error,
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined
      });

      // Better error handling for common Biconomy errors
      let errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      // Check for specific Biconomy errors
      if (errorMessage.includes('maxFeePerGas')) {
        errorMessage = 'Failed to process transaction: Gas fee calculation error';
      } else if (errorMessage.includes('520')) {
        errorMessage = 'Failed to connect to Biconomy services. Please try again.';
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  }
}

export const eventTicketContract = EventTicketContract.getInstance();