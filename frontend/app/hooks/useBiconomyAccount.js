import { useState, useEffect, useCallback } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { createSmartAccount } from "../../lib/biconomy";

export function useBiconomyAccount() {
  const { primaryWallet } = useDynamicContext();
  const [smartAccount, setSmartAccount] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const createAndSetSmartAccount = useCallback(async () => {
    if (!primaryWallet) {
      setSmartAccount(null);
      return;
    }

    try {
      setIsLoading(true);
      const walletClient = await primaryWallet.getWalletClient();
      
      if (walletClient) {
        console.log("Creating smart account for:", primaryWallet.address);
        const newSmartAccount = await createSmartAccount(walletClient);
        setSmartAccount(newSmartAccount);
      }
    } catch (error) {
      console.error('Error creating smart account:', error);
    } finally {
      setIsLoading(false);
    }
  }, [primaryWallet]);

  useEffect(() => {
    if (primaryWallet) {
      createAndSetSmartAccount();
    }
  }, [primaryWallet, createAndSetSmartAccount]);

  return { smartAccount, isLoading };
}