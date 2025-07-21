export interface Wallet {
  id: number
  userId: number
  balance: number
  isLocked: boolean
  createdAt: Date
}

export interface WalletTransaction {
  id: number
  walletId: number
  type: TransactionType
  amount: number
  description: string
  orderId?: number
  status: TransactionStatus
  createdAt: Date
}

export enum TransactionType {
  Deposit = "Deposit",
  Withdrawal = "Withdrawal",
  Payment = "Payment",
  Refund = "Refund",
}

export enum TransactionStatus {
  Pending = "Pending",
  Completed = "Completed",
  Failed = "Failed",
}

export interface DepositRequest {
  userId: number
  amount: number
  description: string
}

export interface WithdrawRequest {
  userId: number
  amount: number
  description: string
}
