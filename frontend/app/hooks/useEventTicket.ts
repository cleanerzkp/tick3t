// hooks/useEventTicket.ts

import { useState, useCallback, useEffect } from 'react'
import { usePublicClient } from 'wagmi'
import type { NexusClient } from '@biconomy/sdk'
import { 
  type Address, 
  encodeFunctionData 
} from 'viem'
import { baseSepolia } from 'viem/chains'
import { EventTicketingTestAbi } from '../../../contracts/abis/EventTicketingTest2'
import { EventInfo, TransactionResult } from '@/lib/eventTicket'


export function useEventTicket(
  contractAddress: Address,
  smartAccount: NexusClient | null
) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [eventInfo, setEventInfo] = useState<EventInfo | null>(null)

  const publicClient = usePublicClient({
    chainId: baseSepolia.id,
  })

  const getEventInfo = useCallback(async () => {
    if (!publicClient) {
      setError("Public client not configured")
      return
    }

    try {
      setIsLoading(true)
      const data = await publicClient.readContract({
        address: contractAddress,
        abi: EventTicketingTestAbi.abi,
        functionName: 'getEventInfo',
      })
      
      setEventInfo(data as unknown as EventInfo)
      setError(null)
    } catch (err) {
      console.error('Error fetching event info:', err)
      setError(err instanceof Error ? err.message : 'Error fetching event info')
    } finally {
      setIsLoading(false)
    }
  }, [publicClient, contractAddress])

  const buyTicket = useCallback(async (): Promise<TransactionResult> => {
    if (!smartAccount) {
      return {
        success: false,
        error: 'Smart account not initialized'
      }
    }

    if (!eventInfo) {
      return {
        success: false,
        error: 'Event info not loaded'
      }
    }

    try {
      setIsLoading(true)
      const data = encodeFunctionData({
        abi: EventTicketingTestAbi.abi,
        functionName: 'buy',
        args: []
      })

      // Use the actual price from eventInfo
      const hash = await smartAccount.sendTransaction({
        calls: [{
          to: contractAddress,
          data,
          value: eventInfo.price // Use the actual price from the contract
        }]
      })

      console.log('Transaction hash:', hash)

      const receipt = await smartAccount.waitForTransactionReceipt({
        hash
      })

      console.log('Transaction receipt:', receipt)

      return {
        success: true,
        transactionHash: receipt.transactionHash,
        userOpHash: hash
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Unknown error occurred'
      console.error('Error buying ticket:', err)
      setError(error)
      return { success: false, error }
    } finally {
      setIsLoading(false)
    }
  }, [smartAccount, contractAddress, eventInfo])

  // Initial fetch of event info
  useEffect(() => {
    getEventInfo()
  }, [getEventInfo])

  // Refresh event info after successful purchase
  useEffect(() => {
    const refreshInterval = setInterval(getEventInfo, 30000) // Refresh every 30 seconds
    return () => clearInterval(refreshInterval)
  }, [getEventInfo])

  return {
    eventInfo,
    isLoading,
    error,
    buyTicket,
    refreshEventInfo: getEventInfo
  }
}