import { IProduct } from "./product.model";
import { IUser } from "./user.model";

export interface Order {
  id: number;
  buyerId: number;
  sellerId: number;
  productId: number;
  quantity: number;
  totalAmount: number;
  status: OrderStatus;
  createdAt: Date;
  product: IProduct;
  buyer: IUser;
  seller: IUser;
  shippingInfo?: ShippingInfo;
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
  // When true, backend will treat order as swap (shipping fee only)
  isSwapOrder?: boolean;
  // Explicit payment method for backend compatibility
  paymentMethod?: string;
  // Optional idempotency key so backend can de-duplicate
  idempotencyKey?: string;
}

export interface UpdateOrderStatusRequest {
  orderId: number;
  status: OrderStatus;
}