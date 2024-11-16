"use client";

import { useState, useEffect } from 'react';
import { formatEther } from 'viem';
import type { NexusClient } from '@biconomy/sdk';
import { useEventTicketContract } from '@/lib/eventTicket';
import type { EventInfo } from '@/lib/eventTicket';

interface EventTicketingProps {
  smartAccount: NexusClient | null;
}

export default function EventTicketing({ smartAccount }: EventTicketingProps) {
  const [eventInfo, setEventInfo] = useState<EventInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBuying, setIsBuying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [userOpHash, setUserOpHash] = useState<string | null>(null);

  const { getEventInfo, buyTicket } = useEventTicketContract(smartAccount);

  useEffect(() => {
    const fetchEventInfo = async () => {
      try {
        const info = await getEventInfo();
        setEventInfo(info);
        setError(null);
      } catch (err) {
        setError("Failed to load event information");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventInfo();
    const interval = setInterval(fetchEventInfo, 30000);
    return () => clearInterval(interval);
  }, [getEventInfo]);

  const handleBuyTicket = async () => {
    if (!smartAccount) {
      setError("Smart account not initialized");
      return;
    }

    setIsBuying(true);
    setError(null);
    setTransactionHash(null);
    setUserOpHash(null);

    try {
      console.log("Starting gasless ticket purchase...");
      const result = await buyTicket();

      if (result.success) {
        setTransactionHash(result.transactionHash || null);
        setUserOpHash(result.userOpHash || null);
        
        setTimeout(async () => {
          try {
            const updatedInfo = await getEventInfo();
            setEventInfo(updatedInfo);
          } catch (err) {
            console.error("Error updating event info:", err);
          }
        }, 5000);

        setError(null);
      } else {
        setError(result.error || "Transaction failed. Please try again.");
        console.error("Purchase failed:", result.error);
      }
    } catch (err) {
      console.error("Transaction error:", err);
      setError(
        err instanceof Error 
          ? `Transaction failed: ${err.message}` 
          : "Failed to process transaction. Please try again."
      );
    } finally {
      setIsBuying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-gray-800 rounded-xl shadow-xl">
        <div className="animate-pulse flex flex-col items-center justify-center">
          <div className="w-full h-64 bg-gray-700 rounded-lg mb-4"></div>
          <div className="w-3/4 h-8 bg-gray-700 rounded mb-4"></div>
          <div className="w-1/2 h-6 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!smartAccount) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-gray-800 rounded-xl shadow-xl">
        <div className="text-center text-red-500">
          Please connect your wallet and initialize smart account to continue.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-800 rounded-xl shadow-xl">
      {eventInfo && (
        <>
          <div className="mb-6">
            <img
              src={eventInfo.photo}
              alt={eventInfo.name}
              className="w-full h-64 object-cover rounded-lg mb-4"
            />
            <h1 className="text-2xl font-bold mb-2">{eventInfo.name}</h1>
            <p className="text-gray-300 mb-2">{eventInfo.location}</p>
            <p className="text-gray-300 mb-4">
              {new Date(Number(eventInfo.time) * 1000).toLocaleString()}
            </p>
  
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-300">Available Tickets</p>
                <p className="text-xl font-bold">
                  {Number(eventInfo.n_tickets - eventInfo.n_tickets_sold)}
                </p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-300">Price</p>
                <p className="text-xl font-bold">
                  {formatEther(eventInfo.price)} ETH
                </p>
              </div>
            </div>
  
            <button
              onClick={handleBuyTicket}
              disabled={isBuying || eventInfo.n_tickets_sold >= eventInfo.n_tickets}
              className={`w-full py-3 px-6 rounded-lg font-semibold ${
                isBuying || eventInfo.n_tickets_sold >= eventInfo.n_tickets
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isBuying ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing Gasless Transaction...
                </span>
              ) : eventInfo.n_tickets_sold >= eventInfo.n_tickets ? (
                'Sold Out'
              ) : (
                'Buy Ticket (Gasless)'
              )}
            </button>
          </div>
  
          {error && (
            <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mt-4">
              {error}
            </div>
          )}
  
          {(transactionHash || userOpHash) && (
            <div className="bg-green-500 bg-opacity-10 border border-green-500 text-green-500 px-4 py-3 rounded-lg mt-4">
              <div className="font-semibold mb-2">Transaction Successful!</div>
              {transactionHash && (
                <div className="text-sm">
                  Transaction Hash:{" "}
                  <a
                    href={`https://base-sepolia.blockscout.com/tx/${transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 underline"
                  >
                    {transactionHash.slice(0, 10)}...{transactionHash.slice(-8)}
                  </a>
                </div>
              )}
              {userOpHash && (
                <div className="text-sm mt-2">
                  User Operation Hash:{" "}
                  <a
                    href={`https://base-sepolia.blockscout.com/userOp/${userOpHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 underline"
                  >
                    {userOpHash.slice(0, 10)}...{userOpHash.slice(-8)}
                  </a>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}