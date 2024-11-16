"use client";

import { useEffect, useState, useCallback } from "react";
import { createPublicClient, http } from "viem";
import { baseSepolia } from "viem/chains";
import { EventTicketingTestAbi } from "../../../contracts/abis/EventTicketingTest2";
import Navbar from "@/components/ui/Navbar";
import { useBiconomyAccount } from "../hooks/useBiconomyAccount";

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

const CONTRACT_ADDRESS = "0x7133CF0D4597F39FFA0E5Dd19144800FD49EC47B";

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(process.env._NEXT_PUBLIC_ALCHEMY_BASE_SEPOLIA_URL || ""),
});

export default function EventViewer() {
  const [eventData, setEventData] = useState<EventInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { smartAccount, error: biconomyError } = useBiconomyAccount();

  const fetchEventData = useCallback(async () => {
    if (!smartAccount) {
      console.log("Waiting for smart account...");
      return;
    }

    try {
      setIsLoading(true);

      const data = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: EventTicketingTestAbi.abi,
        functionName: "getEventInfo",
      });

      setEventData(data as EventInfo);
      setError(null);
    } catch (err) {
      console.error("Error fetching event data:", err);
      setError("Failed to fetch on-chain event data.");
    } finally {
      setIsLoading(false);
    }
  }, [smartAccount]);

  useEffect(() => {
    fetchEventData();
  }, [fetchEventData]);

  return (
    <div className="min-h-screen bg-neutral-950 pt-20">
      <Navbar />
      <div className="flex flex-col px-4 text-center w-full">
        <h2 className="text-4xl mb-4 font-sans font-bold text-[#ffffff90]">
          View Events
        </h2>

        {isLoading ? (
          <p className="text-gray-400">Loading on-chain data...</p>
        ) : error || biconomyError ? (
          <div className="text-red-500">{error || biconomyError}</div>
        ) : eventData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="backdrop-blur-lg shadow-2xl bg-neutral-900 rounded-[8px] p-4">
              <img
                src={eventData.photo}
                alt="Event"
                className="rounded-lg object-cover w-full h-48 mb-4"
              />
              <h3 className="text-2xl font-bold mb-2">{eventData.name}</h3>
              <p className="text-gray-300">
                <a href={eventData.url} target="_blank" rel="noopener noreferrer">
                  {eventData.url}
                </a>
              </p>
              <p className="text-gray-400 mb-2">
                Location: {eventData.location}
              </p>
              <p className="text-gray-400 mb-4">
                Time:{" "}
                {new Date(Number(eventData.time) * 1000).toLocaleString()}
              </p>
              <p className="text-gray-400 mb-2">
                Tickets Sold: {eventData.n_tickets_sold.toString()} /{" "}
                {eventData.n_tickets.toString()}
              </p>
              <p className="text-gray-400">
                Price: {Number(eventData.price) / 1e18} ETH
              </p>
            </div>
          </div>
        ) : (
          <p className="text-gray-400">No event data available.</p>
        )}
      </div>
    </div>
  );
}