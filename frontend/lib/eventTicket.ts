import { encodeFunctionData, Address, parseEther } from "viem";
import { baseSepolia } from "viem/chains";
import { usePublicClient } from "wagmi";
import EventTicketing from "../abi/EventTicketing.json";
import type { NexusClient } from "@biconomy/sdk";

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

const CONTRACT_ADDRESS =
  "0x5f4d8829aD312232ac32dfe79A4DD50D5B47D273" as Address;

export function useEventTicketContract(nexusClient: NexusClient | null) {
  const publicClient = usePublicClient({
    chainId: baseSepolia.id,
  });

  const getEventInfo = async (): Promise<EventInfo> => {
    try {
      if (!publicClient) throw new Error("Public client not configured");

      const data = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: EventTicketing.abi,
        functionName: "getEventInfo",
      });

      return data as unknown as EventInfo;
    } catch (error) {
      console.error("Error fetching event info:", error);
      throw error;
    }
  };

  const buyTicket = async (): Promise<TransactionResult> => {
    if (!nexusClient) {
      return {
        success: false,
        error: "Nexus client not initialized",
      };
    }

    try {
      // Encode the function call data
      const data = encodeFunctionData({
        abi: EventTicketing.abi,
        functionName: "buy",
        args: [],
      });

      // Create the call exactly like in the Nexus SDK example
      const hash = await nexusClient.sendTransaction({
        calls: [
          {
            to: "0x5f4d8829aD312232ac32dfe79A4DD50D5B47D273",
            data,
            // value: parseEther("0.01"), // 0.01 ETH - matches your original value
          },
        ],
      });
      console.log("Transaction hash:", hash);

      // Wait for receipt exactly like in the Nexus SDK example
      const receipt = await nexusClient.waitForTransactionReceipt({
        hash,
      });
      console.log("Transactionss receipt:", receipt);

      return {
        success: true,
        transactionHash: receipt.transactionHash,
        userOpHash: hash,
      };
    } catch (error: any) {
      console.error("Error buying ticket:", {
        error,
        message: error.message || "Unknown error",
        stack: error.stack || undefined,
      });

      return {
        success: false,
        error: error.message || "Unknown error occurred",
      };
    }
  };

  return {
    getEventInfo,
    buyTicket,
  };
}
