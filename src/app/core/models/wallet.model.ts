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
  Deposit = 1,
  Withdraw = 2,
  Payment = 3,
  Refund = 4,
}

export enum TransactionStatus {
  Pending = 0,
  Completed = 1,
  Failed = 2,
  Cancelled = 3,
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

export interface Payment {
  id: number;
  amount: number;
  userId: number;
  orderId?: number;
  gateway: PaymentGateway;
  gatewayReference?: string;
  description?: string;
  createdAt: Date;
  status: PaymentStatus;
  clientSecret?: string;
  paymentUrl?: string;
}

export enum PaymentStatus {
  Pending = 0,
  Completed = 1,
  Failed = 2,
  Cancelled = 3,
}

export enum PaymentGateway {
  Mock = 'Mock',
  PayPal = 'PayPal',
  Stripe = 'Stripe',
}

export interface WalletStats {
  deposits: number;
  withdrawals: number;
  payments: number;
  refunds: number;
  pendingAmount: number;
  rewardPoints: number;
}

export interface PayRequest {
  userId: number;
  amount: number;
  orderId: number;
  description?: string;
}

export interface RefundRequest {
  userId: number;
  transactionId: number;
  reason?: string;
}

export interface LinkPaymentRequest {
  userId: number;
  methodName: string;
}
