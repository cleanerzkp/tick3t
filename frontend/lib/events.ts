import {
  Address,
  Hash,
  encodeFunctionData,
  parseEther,
  PublicClient,
  WalletClient,
} from "viem";
import type { NexusClient } from "@biconomy/sdk";
import {
  EventInfo,
  TicketInfo,
  TransactionResult,
  EventCounts,
  EventsByOwner,
  EmailProof,
} from "@/app/types/contracts";
import EventFactoryAbi from "../abi/EventFactoryNFTsEmail.json";

export class EventTicketService {
  private client: PublicClient;
  private nexusClient: NexusClient | null;
  private contractAddress: Address;

  constructor(
    contractAddress: Address,
    client: PublicClient,
    nexusClient: NexusClient | null = null
  ) {
    this.contractAddress = contractAddress;
    this.client = client;
    this.nexusClient = nexusClient;
  }

  async getEventInfo(): Promise<EventInfo> {
    try {
      const data = await this.client.readContract({
        address: this.contractAddress,
        abi: EventFactoryAbi.abi,
        functionName: "getEventInfo",
      });
      return data as EventInfo;
    } catch (error) {
      console.error("Error fetching event info:", error);
      throw error;
    }
  }

  async buyTicket(emailProof?: EmailProof): Promise<TransactionResult> {
    if (!this.nexusClient) {
      return {
        success: false,
        error: "Smart account not initialized",
      };
    }

    try {
      const data = encodeFunctionData({
        abi: EventFactoryAbi.abi,
        functionName: "buy",
        args: emailProof ? [emailProof] : [],
      });

      const hash = await this.nexusClient.sendTransaction({
        calls: [
          {
            to: this.contractAddress,
            data,
            value: parseEther("0.01"),
          },
        ],
      });

      const receipt = await this.nexusClient.waitForTransactionReceipt({
        hash,
      });

      return {
        success: true,
        transactionHash: receipt.transactionHash,
        userOpHash: hash,
      };
    } catch (error: any) {
      console.error("Error buying ticket:", error);
      return {
        success: false,
        error: error.message || "Unknown error occurred",
      };
    }
  }

  async getTicketInfo(tokenId: bigint): Promise<TicketInfo> {
    try {
      const data = await this.client.readContract({
        address: this.contractAddress,
        abi: EventFactoryAbi.abi,
        functionName: "getTicketInfo",
        args: [tokenId],
      });
      return data as TicketInfo;
    } catch (error) {
      console.error("Error fetching ticket info:", error);
      throw error;
    }
  }

  async hasTicket(address: Address): Promise<boolean> {
    try {
      return (await this.client.readContract({
        address: this.contractAddress,
        abi: EventFactoryAbi.abi,
        functionName: "hasTicket",
        args: [address],
      })) as boolean;
    } catch (error) {
      console.error("Error checking ticket ownership:", error);
      throw error;
    }
  }

  async verifyTicket(tokenId: bigint): Promise<boolean> {
    try {
      return (await this.client.readContract({
        address: this.contractAddress,
        abi: EventFactoryAbi.abi,
        functionName: "verifyTicket",
        args: [tokenId],
      })) as boolean;
    } catch (error) {
      console.error("Error verifying ticket:", error);
      throw error;
    }
  }
}

// Factory service for managing multiple events
export class EventFactoryService {
  private client: PublicClient;
  private nexusClient: NexusClient | null;
  private factoryAddress: Address;

  constructor(
    factoryAddress: Address,
    client: PublicClient,
    nexusClient: NexusClient | null = null
  ) {
    this.factoryAddress = factoryAddress;
    this.client = client;
    this.nexusClient = nexusClient;
  }

  async createEvent(
    name: string,
    url: string,
    time: bigint,
    location: string,
    photo: string,
    nTickets: bigint,
    price: bigint,
    uri: string
  ): Promise<TransactionResult> {
    if (!this.nexusClient) {
      return {
        success: false,
        error: "Smart account not initialized",
      };
    }

    try {
      const data = encodeFunctionData({
        abi: EventFactoryAbi.abi,
        functionName: "createEvent",
        args: [name, url, time, location, photo, nTickets, price, uri],
      });

      const hash = await this.nexusClient.sendTransaction({
        calls: [
          {
            to: this.factoryAddress,
            data,
          },
        ],
      });

      const receipt = await this.nexusClient.waitForTransactionReceipt({
        hash,
      });

      return {
        success: true,
        transactionHash: receipt.transactionHash,
        userOpHash: hash,
      };
    } catch (error: any) {
      console.error("Error creating event:", error);
      return {
        success: false,
        error: error.message || "Unknown error occurred",
      };
    }
  }

  async getFutureEvents(): Promise<Address[]> {
    try {
      return (await this.client.readContract({
        address: this.factoryAddress,
        abi: EventFactoryAbi.abi,
        functionName: "getFutureEvents",
      })) as Address[];
    } catch (error) {
      console.error("Error fetching future events:", error);
      throw error;
    }
  }

  async getPastEvents(): Promise<Address[]> {
    try {
      return (await this.client.readContract({
        address: this.factoryAddress,
        abi: EventFactoryAbi.abi,
        functionName: "getPastEvents",
      })) as Address[];
    } catch (error) {
      console.error("Error fetching past events:", error);
      throw error;
    }
  }

  async getEventsByOwner(owner: Address): Promise<Address[]> {
    try {
      return (await this.client.readContract({
        address: this.factoryAddress,
        abi: EventFactoryAbi.abi,
        functionName: "getEventsByOwner",
        args: [owner],
      })) as Address[];
    } catch (error) {
      console.error("Error fetching events by owner:", error);
      throw error;
    }
  }

  async getEventCounts(): Promise<EventCounts> {
    try {
      const [future, past] = (await this.client.readContract({
        address: this.factoryAddress,
        abi: EventFactoryAbi.abi,
        functionName: "getEventCounts",
      })) as [bigint, bigint];

      return { future, past };
    } catch (error) {
      console.error("Error fetching event counts:", error);
      throw error;
    }
  }
}
