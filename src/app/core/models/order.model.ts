import  { IProduct } from "./product.model"
import  { IUser} from "./user.model"

export interface Order {
  id: number
  buyerId: number
  sellerId: number
  productId: number
  quantity: number
  totalAmount: number
  status: OrderStatus
  createdAt: Date
  product: IProduct
  buyer: IUser
  seller: IUser
  shippingInfo?: ShippingInfo
}

export enum OrderStatus {
  Pending = "Pending",
  Confirmed = "Confirmed",
  Shipped = "Shipped",
  Delivered = "Delivered",
  Cancelled = "Cancelled",
}

export interface CreateOrderRequest {
  productId: number
  quantity: number
  shippingAddress: string
}

export interface UpdateOrderStatusRequest {
  orderId: number
  status: OrderStatus
}

export interface ShippingInfo {
  address: string
  city: string
  postalCode: string
  trackingNumber?: string
}
