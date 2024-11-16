import { useState, useEffect, useCallback } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { createSmartAccount } from "../../lib/biconomy";

export function useBiconomyAccount() {
  const { primaryWallet } = useDynamicContext();
  const [smartAccount, setSmartAccount] = useState(null);
  const [error, setError] = useState(null);

  const createAndSetSmartAccount = useCallback(async () => {
    if (!primaryWallet) {
      setSmartAccount(null);
      setError("No primary wallet available");
      return;
    }

    try {
      const walletClient = await primaryWallet.getWalletClient();
      if (walletClient && !smartAccount) {
        console.log("Creating smart account");
        const newSmartAccount = await createSmartAccount(walletClient);
        setSmartAccount(newSmartAccount);
        setError(null);
      }
    } catch (error) {
      console.error('Error fetching wallet clients or creating smart account:', error);
      setError(error.message || "Unknown error occurred while creating smart account");
      setSmartAccount(null);
    }
  }, [primaryWallet, smartAccount]);

  useEffect(() => {
    createAndSetSmartAccount();
  }, [createAndSetSmartAccount]);

  return { smartAccount, error };
}