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
  Confirmed = "Confirmed",
  Shipped = "Shipped",
  Delivered = "Delivered",
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
}

export interface UpdateOrderStatusRequest {
  orderId: number;
  status: OrderStatus;
}