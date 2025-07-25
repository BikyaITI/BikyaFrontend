import { IProduct } from "./product.model"
import { IUser } from "./user.model"

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
  requester: IUser
  owner: IUser
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
