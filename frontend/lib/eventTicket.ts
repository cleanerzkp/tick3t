import { encodeFunctionData, Address } from "viem";
import { baseSepolia } from "viem/chains";
import { usePublicClient } from "wagmi";
import { EventTicketingTestAbi } from "../../contracts/abis/EventTicketingTest2";
import { NexusClient } from "@biconomy/sdk";

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
  transactionHash?: string;
  userOpHash?: string;
  error?: string;
}

const CONTRACT_ADDRESS = "0x7133CF0D4597F39FFA0E5Dd19144800FD49EC47B" as Address;

export function useEventTicketContract(nexusClient: NexusClient | null) {
  const publicClient = usePublicClient({
    chainId: baseSepolia.id,
  });

  const getEventInfo = async (): Promise<EventInfo> => {
    try {
      if (!CONTRACT_ADDRESS) throw new Error("Contract address not configured");
      if (!publicClient) throw new Error("Public client not configured");

      const data = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: EventTicketingTestAbi.abi,
        functionName: "getEventInfo",
      }) as unknown as EventInfo;

      return data;
    } catch (error) {
      console.error("Error fetching event info:", error);
      throw error;
    }
  };

  const buyTicket = async (): Promise<TransactionResult> => {
    if (!nexusClient) {
      return {
        success: false,
        error: "Smart account not initialized",
      };
    }

    try {
      // Encode the function call
      const data = encodeFunctionData({
        abi: EventTicketingTestAbi.abi,
        functionName: "buy",
      });

      // Create transaction exactly as Nexus expects it
      const userOpHash = await nexusClient.sendTransaction({
        calls: [{
          to: CONTRACT_ADDRESS,
          data,
          value: BigInt("10000000000000000"), // 0.01 ETH
        }]
      });

      console.log("UserOp Hash:", userOpHash);

      // Wait for receipt
      const receipt = await nexusClient.waitForUserOperationReceipt({ 
        hash: userOpHash 
      });

      console.log("Receipt:", receipt);

      return {
        success: true,
        transactionHash: receipt?.receipt?.transactionHash || undefined,
        userOpHash
      };
    } catch (error) {
      console.error("Error buying ticket:", {
        error,
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  };

  return {
    getEventInfo,
    buyTicket,
  };
}