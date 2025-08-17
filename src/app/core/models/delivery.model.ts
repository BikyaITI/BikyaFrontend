import { IUserAddressInfo } from "./user.model";

export interface DeliveryOrderDto {
  id: number;
  productName: string;
  productId: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  paidAt: string;
  buyerInfo: IUserAddressInfo  //user1 in swap orders
  sellerInfo: IUserAddressInfo; //user2 in swap orders
  shippingStatus: string;


  // Exchange Order Linking

  isSwapOrder: boolean;
  relatedOrderId?: number;
  relatedProductId?: number;
  relatedProductTitle?: string;
  exchangeInfo: string;


  // Compact party info for dashboard swap cards
  party1Name?: string;      // recipient of primary order
  party1Product?: string;   // product shipped in primary order
  party2Name?: string;      // recipient of related order
  party2Product?: string;   // product shipped in related order
}

export interface UpdateOrderStatusDto {
  status: string;
  notes?: string;
}

export interface UpdateDeliveryShippingStatusDto {
  status: string;
  notes?: string;
}

export interface OrderStatusSummary {
  orderId: number;
  orderStatus: string;
  shippingStatus: string;
  isSynchronized: boolean;
  lastUpdated: string;
  nextAllowedTransitions: {
    orderStatus: string[];
    shippingStatus: string[];
  };
}

export interface AvailableTransitions {
  orderId: number;
  currentOrderStatus: string;
  currentShippingStatus: string;
  orderStatusTransitions: string[];
  shippingStatusTransitions: string[];
  recommendations: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  statusCode: number;
}
