import { IProduct } from "./product.model";
import { IUser } from "./user.model";

export interface Order {
  id: number;
  buyerId: number;
  sellerId: number;
  productId: number;
  quantity: number;
  totalAmount: number;
  platformFee: number;
  sellerAmount: number;
  status: OrderStatus | string; // Changed
  createdAt: Date;
  product: IProduct;
  buyer: IUser;
  seller: IUser;
  shippingInfo?: ShippingInfo;
  isSwapOrder?: boolean;
  needReview: boolean; // Indicates if the order needs a review
  productTitle?: string; // Optional field for product title
}

export enum OrderStatus {
  Pending = "Pending",
  Paid = "Paid",
  Shipped = "Shipped",
  Completed = "Completed",
  Cancelled = "Cancelled",
}

export interface ShippingInfo {
  recipientName: string;
  address: string;
  city: string;
  postalCode: string;
  phoneNumber: string;
  trackingNumber?: string;
}

export interface CreateOrderRequest {
  productId: number;
  buyerId: number;
  quantity: number;
  shippingInfo: ShippingInfo;
  isSwapOrder?: boolean;
  paymentMethod?: string;
  idempotencyKey?: string;
}

export interface UpdateOrderStatusRequest {
  orderId: number;
  status: OrderStatus;
}

export interface OrederReview{
id: number;
productId: number;
  productTitle: string;
  buyerId: number;
  buyerName: string;
  sellerId: number;
  sellerName: string;
  status: OrderStatus;
  createdAt: Date;
  isSwapOrder?: boolean;
}