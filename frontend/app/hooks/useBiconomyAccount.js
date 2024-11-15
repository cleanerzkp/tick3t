import { useState, useEffect, useCallback } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { createSmartAccount } from "../../lib/biconomy.js";
import { baseSepolia } from "viem/chains";

export function useBiconomyAccount() {
  const { primaryWallet } = useDynamicContext();
  const [smartAccount, setSmartAccount] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const createAndSetSmartAccount = useCallback(async () => {
    if (!primaryWallet) {
      setSmartAccount(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const walletClient = await primaryWallet.getWalletClient({
        chainId: baseSepolia.id,
      });

      if (walletClient && !smartAccount) {
        console.log("Creating smart account");
        console.log("Wallet client:", walletClient);
        const newSmartAccount = await createSmartAccount(walletClient);
        setSmartAccount(newSmartAccount);
      }
    } catch (error) {
      console.error('Error fetching wallet clients or creating smart account:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        wallet: primaryWallet?.connector?.name
      });
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [primaryWallet, smartAccount]);

  useEffect(() => {
    createAndSetSmartAccount();
  }, [createAndSetSmartAccount]);

  useEffect(() => {
    if (primaryWallet) {
      console.log("Primary wallet changed:", {
        name: primaryWallet.connector?.name,
        address: primaryWallet.address,
      });
    }
  }, [primaryWallet]);

  return { smartAccount, isLoading, error };
}