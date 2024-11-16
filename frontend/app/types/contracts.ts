// types/contracts.ts

import { Address, Hash } from 'viem'

// Basic Event Info structure matching the contract
export interface EventInfo {
  name: string
  url: string
  time: bigint
  location: string
  photo: string
  n_tickets: bigint
  n_tickets_sold: bigint
  price: bigint
}

// Event Factory Event structures
export interface EventCreatedEvent {
  eventAddress: Address
  owner: Address
  eventTime: bigint
}

export interface EventMovedToPastEvent {
  eventAddress: Address
}

// Ticket Info structure
export interface TicketInfo {
  ticketOwner: Address
  ticketNumber: bigint
  isValid: boolean
}

// Transaction Results
export interface TransactionResult {
  success: boolean
  transactionHash?: Hash
  userOpHash?: Hash
  error?: string
}

// Smart Account Operation types
export interface EventTicketCall {
  to: Address
  data: `0x${string}`
  value?: bigint
}

export interface SmartAccountConfig {
  factoryAddress: Address
  eventAddress?: Address
  chainId: number
}

// Factory Contract Response Types
export interface EventCounts {
  future: bigint
  past: bigint
}

export interface EventsByOwner {
  futureEvents: Address[]
  pastEvents: Address[]
}

// Email Verification Types
export interface EmailProof {
  proof: `0x${string}`
  publicInputs: string[]
}

export interface VerificationResult {
  isValid: boolean
  error?: string
}