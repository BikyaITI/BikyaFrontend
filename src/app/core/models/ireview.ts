import { IApplicationUser } from './application-user'
// review.model.ts
export interface IReview {
  id: number;
  rating: number;
  comment?: string;
  createdAt: string;
  reviewerId: number;
  sellerId: number;
  orderId: number;
  reviewer: IApplicationUser;
  seller: IApplicationUser;
}

// create-review.dto.ts
export interface ICreateReview {
  rating: number;
  comment?: string;
  reviewerId: number;
  sellerId: number;
  orderId: number;
}

// update-review.dto.ts
export interface IUpdateReview {
  id: number;
  rating: number;
  comment?: string;
  reviewerId: number;
  sellerId: number;
  orderId: number;
}
