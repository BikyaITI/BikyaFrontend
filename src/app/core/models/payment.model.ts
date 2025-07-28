export interface PaymentRequestDto {
  amount: number;
  orderId: number;
  userId: number;
  description?: string;
}

export interface PaymentResponseDto {
  paymentId: number;
  amount: number;
  orderId: number;
  status: string;
  stripeUrl: string;
  stripeSessionId: string;
  createdAt: Date;
  message: string;
}

export interface PaymentStatusDto {
  paymentId: number;
  amount: number;
  orderId: number;
  status: string;
  stripeSessionId: string;
  createdAt: Date;
  message: string;
}

export interface PaymentSummaryDto {
  paymentId: number;
  amount: number;
  status: string;
  createdAt: Date;
  description: string;
}

export interface PaymentDto {
  id: number;
  amount: number;
  orderId?: number;
  status: string;
  stripeUrl?: string;
  createdAt: Date;
}

export enum PaymentStatus {
  Pending = 'Pending',
  Paid = 'Paid',
  Failed = 'Failed'
}

export enum PaymentGateway {
  Stripe = 'Stripe'
} 