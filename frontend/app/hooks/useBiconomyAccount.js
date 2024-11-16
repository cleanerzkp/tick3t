// hooks/useBiconomyAccount.js
import { useState, useEffect, useCallback } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { createSmartAccount } from '@/lib/biconomy';
import { baseSepolia } from "viem/chains";
import { createWalletClient, custom } from 'viem';

export function useBiconomyAccount() {
  const { primaryWallet, isAuthenticated, user } = useDynamicContext();
  const [smartAccount, setSmartAccount] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const createAndSetSmartAccount = useCallback(async () => {
    // Wait for both authentication and wallet to be ready
    if (!isAuthenticated || !user || !primaryWallet) {
      console.log("Waiting for authentication and wallet...", {
        isAuthenticated,
        hasUser: !!user,
        hasPrimaryWallet: !!primaryWallet
      });
      return;
    }

    try {
      setIsLoading(true);
      console.log("Starting smart account creation process...");

      // Ensure we have provider
      if (!primaryWallet.connector?.provider) {
        console.log("Waiting for provider...");
        return;
      }

      console.log("Got provider, creating wallet client...");
      
      // Wait for provider to be ready
      await new Promise(resolve => setTimeout(resolve, 2000));

      const provider = await primaryWallet.connector.provider;
      
      const walletClient = createWalletClient({
        account: primaryWallet.address,
        chain: baseSepolia,
        transport: custom(provider)
      });

      if (!walletClient) {
        throw new Error("Failed to create wallet client");
      }

      console.log("Created wallet client, creating smart account...");
      const newSmartAccount = await createSmartAccount(walletClient);
      console.log("Smart account created successfully:", newSmartAccount);
      setSmartAccount(newSmartAccount);

    } catch (error) {
      console.error('Error creating smart account:', error);
    } finally {
      setIsLoading(false);
    }
  }, [primaryWallet, isAuthenticated, user]);

  useEffect(() => {
    if (isAuthenticated && user && primaryWallet && !smartAccount) {
      // Add a slight delay to ensure everything is properly initialized
      setTimeout(() => {
        createAndSetSmartAccount();
      }, 2000);
    }
  }, [isAuthenticated, user, primaryWallet, smartAccount, createAndSetSmartAccount]);

  // Debug logging
  useEffect(() => {
    console.log("Auth status:", {
      isAuthenticated,
      hasUser: !!user,
      hasPrimaryWallet: !!primaryWallet,
      primaryWalletAddress: primaryWallet?.address,
      hasSmartAccount: !!smartAccount
    });
  }, [isAuthenticated, user, primaryWallet, smartAccount]);

  return { smartAccount, isLoading };
}