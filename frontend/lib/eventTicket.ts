import { encodeFunctionData, createPublicClient, http, Address } from "viem";
import { baseSepolia } from "viem/chains";
import type { EventInfo, TransactionResult } from "@/app/types/eventTicket";
import { createNexusClient, createBicoPaymasterClient } from "@biconomy/sdk";
import eventticketingtest2 from "../../contracts/abis/EventTicketingTest2.json";

const CONTRACT_ADDRESS = "0x7133CF0D4597F39FFA0E5Dd19144800FD49EC47B";

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

  public async buyTicket(walletClient: any): Promise<TransactionResult> {
    try {
      if (!CONTRACT_ADDRESS) throw new Error("Contract address not configured");
      if (!walletClient) throw new Error("Wallet client not initialized");

      console.log("Starting buyTicket process with wallet client:", walletClient);

      // Create Nexus client
      const nexusClient = await createNexusClient({
        signer: walletClient,
        chain: baseSepolia,
        transport: http(),
        bundlerTransport: http(process.env.NEXT_PUBLIC_BICONOMY_BUNDLER_URL || ""),
        paymaster: createBicoPaymasterClient({
          paymasterUrl: process.env.NEXT_PUBLIC_BICONOMY_PAYMASTER_URL || ""
        })
      });

      console.log("Nexus client created");

      // Estimate gas first
      const gasEstimates = await nexusClient.estimateUserOperationGas({
        calls: [{
          to: CONTRACT_ADDRESS,
          data: encodeFunctionData({
            abi: eventticketingtest2,
            functionName: 'buy',
          }),
          value: BigInt("10000000000000000"), // 0.01 ETH in wei
        }]
      });

      console.log("Gas estimates:", gasEstimates);

      // Send the transaction
      const hash = await nexusClient.sendTransaction({
        calls: [{
          to: CONTRACT_ADDRESS,
          data: encodeFunctionData({
            abi: eventticketingtest2,
            functionName: 'buy',
          }),
          value: BigInt("10000000000000000"), // 0.01 ETH in wei
        }]
      });

      console.log("Transaction hash:", hash);

      // Wait for the transaction receipt
      const receipt = await nexusClient.waitForUserOperationReceipt({ 
        hash,
        timeout: 30000, // 30 seconds
        pollingInterval: 2000, // Poll every 2 seconds
      });

      console.log("Transaction receipt:", receipt);

      // Get user operation details
      const userOpDetails = await nexusClient.getUserOperation({
        hash: receipt.userOpHash
      });

      console.log("User operation details:", userOpDetails);

      return {
        success: true,
        transactionHash: receipt.receipt.transactionHash,
        userOpHash: receipt.userOpHash
      };

    } catch (error) {
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