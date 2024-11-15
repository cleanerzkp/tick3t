import { useState, useEffect, useCallback } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { createSmartAccount } from "../../lib/biconomy.js";

export function useBiconomyAccount() {
  const { primaryWallet } = useDynamicContext();
  const [smartAccount, setSmartAccount] = useState(null);

  const createAndSetSmartAccount = useCallback(async () => {
    if (!primaryWallet) {
      setSmartAccount(null);
      return;
    }

    if(!primaryWallet.connector.isEmbeddedWallet) {
      alert('No embedded wallet selected');
      return;
    }

    try {
      const walletClient = await primaryWallet.getWalletClient();
      if (walletClient && !smartAccount) {
        const newSmartAccount = await createSmartAccount(walletClient);
        setSmartAccount(newSmartAccount);
      }
    } catch (error) {
      console.error('Error fetching wallet clients or creating smart account:', error);
    }
  }, [primaryWallet, smartAccount]);

  useEffect(() => {
    createAndSetSmartAccount();
  }, [createAndSetSmartAccount]);

  return { smartAccount };
}
