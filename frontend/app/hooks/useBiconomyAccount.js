// hooks/useBiconomyAccount.js
import { useState, useEffect, useCallback } from "react";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { createSmartAccount } from "../../lib/biconomy";

export function useBiconomyAccount() {
  const { primaryWallet } = useDynamicContext();
  const [smartAccount, setSmartAccount] = useState(null);
  const [error, setError] = useState(null); // Track errors

  const createAndSetSmartAccount = useCallback(async () => {
    if (!primaryWallet) {
      console.log("No primary wallet available");
      setSmartAccount(null);
      return;
    }

    try {
      console.log("Creating smart account with wallet client");
      const walletClient = await primaryWallet.getWalletClient();
      console.log("Wallet Client:", walletClient);

      if (walletClient) {
        let nexusClient;

        // Check if a smart account already exists
        if (smartAccount) {
          console.log("Smart account already exists, reusing it:", smartAccount);
          nexusClient = smartAccount;
        } else {
          console.log("Creating a new smart account");
          nexusClient = await createSmartAccount(walletClient);
          console.log("NexusClient after creation:", nexusClient);
        }

        // Validate NexusClient structure
        if (!nexusClient) {
          throw new Error("NexusClient is undefined after creation.");
        }

        console.log("NexusClient methods and properties:");
        console.log(Object.keys(nexusClient));

        // Check for essential methods and properties
        if (typeof nexusClient.getAddress !== 'function') {
          console.error("NexusClient does not have a getAddress method.");
          throw new Error("Invalid NexusClient instance: Missing getAddress method.");
        }

        if (!nexusClient.accountAddress) {
          console.warn("NexusClient accountAddress is undefined. Attempting to deploy account.");

          // Attempt to trigger deployment by calling getAddress()
          console.log("Attempting to retrieve address to trigger deployment.");
          const address = await nexusClient.getAddress();
          console.log("Address after getAddress call:", address);

          if (!address) {
            throw new Error("Smart account address could not be retrieved.");
          }

          console.log("Smart account deployed at:", address);
        }

        // Retrieve smart account address
        const smartAccountAddress = await nexusClient.getAddress();
        console.log("Smart Account Address:", smartAccountAddress);

        if (!/^0x[a-fA-F0-9]{40}$/.test(smartAccountAddress)) {
          throw new Error("Smart account address is invalid.");
        }

        setSmartAccount(nexusClient);
        console.log("Smart account successfully set:", nexusClient);
      }
    } catch (error) {
      console.error("Error creating or reusing smart account:", error);
      setError(error.message || "Unknown error");
    }
  }, [primaryWallet, smartAccount]);

  useEffect(() => {
    createAndSetSmartAccount();
  }, [createAndSetSmartAccount]);

  return { smartAccount, error };
}