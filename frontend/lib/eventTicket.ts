// lib/contracts/eventTicket.ts
import { encodeFunctionData, createPublicClient, http, Address } from "viem";
import { baseSepolia } from "viem/chains";
import type { EventInfo, TransactionResult } from "@/app/types/eventTicket";
import type { BiconomySmartAccountV2 } from "@biconomy/account";
import { IHybridPaymaster, SponsorUserOperationDto, PaymasterMode } from '@biconomy/paymaster';
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
      if (!smartAccount) throw new Error("Smart account not initialized");

      // Prepare the transaction
      const data = encodeFunctionData({
        abi: eventticketingtest2,
        functionName: 'buy',
      });

      const tx = {
        to: CONTRACT_ADDRESS as Address,
        data,
        value: BigInt("10000000000000000"),
      };

      // Build user operation
      const userOp = await smartAccount.buildUserOp([tx]);

      // Get the paymaster
      const biconomyPaymaster = smartAccount.paymaster as IHybridPaymaster<SponsorUserOperationDto>;

      // Get paymaster data
      const paymasterAndDataResponse = await biconomyPaymaster.getPaymasterAndData(userOp, {
        mode: PaymasterMode.SPONSORED,
        calculateGasLimits: true,
        smartAccountInfo: {
          name: 'BICONOMY',
          version: '2.0.0'
        }
      });

      userOp.paymasterAndData = paymasterAndDataResponse.paymasterAndData;

      // Send transaction
      const userOpResponse = await smartAccount.sendUserOp(userOp);
      const transactionDetails = await userOpResponse.wait();

      return {
        success: true,
        userOpHash: userOpResponse.userOpHash,
        transactionHash: transactionDetails.receipt.transactionHash,
      };

    } catch (error) {
      console.error("Error in buyTicket:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Transaction failed"
      };
    }
  }
}

export const eventTicketContract = EventTicketContract.getInstance();