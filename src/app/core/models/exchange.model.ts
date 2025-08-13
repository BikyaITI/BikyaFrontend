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
  responseMessage?: string
  createdAt: Date
  requestedProduct?: IProduct
  offeredProduct?: IProduct
  requester?: IUser
  owner?: IUser
  // Newly added optional order ids returned after approval
  orderForOfferedProductId?: number
  orderForRequestedProductId?: number
}

export enum ExchangeStatus {
  Pending = "Pending",
  Accepted = "Accepted",
  Rejected = "Rejected",
}

export interface CreateExchangeRequest {
  requestedProductId: number
  offeredProductId: number
  message: string
}
