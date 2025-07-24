import { IProduct } from "./product.model"
import { User } from "./user.model"

export interface ExchangeRequest {
  id: number
  requesterId: number
  ownerId: number
  requestedProductId: number
  offeredProductId: number
  status: ExchangeStatus
  message: string
  createdAt: Date
  requestedProduct: IProduct
  offeredProduct: IProduct
  requester: User
  owner: User
}

export enum ExchangeStatus {
  Pending = "Pending",
  Approved = "Approved",
  Rejected = "Rejected",
}

export interface CreateExchangeRequest {
  requestedProductId: number
  offeredProductId: number
  message: string
}
