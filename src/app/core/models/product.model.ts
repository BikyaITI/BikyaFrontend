import { ICategory } from "./icategory" 
import  { IUser } from "./user.model" // Assuming User model is in user.model.ts

export interface IProduct {
  id: number
  title: string
  description: string
  price: number
  isForExchange: boolean
  condition: string
  categoryId: number
  category: ICategory
  userId: number
  user: IUser
  isApproved: boolean
  createdAt: Date
  images: IProductImage[]
  viewCount?: number
  likeCount?: number
  inquiryCount?: number
}

export interface IProductImage {
  id: number
  productId: number
  imageUrl: string
  isMain: boolean
}

export interface CreateProductRequest {
  title: string
  description: string
  price: number
  isForExchange: boolean
  condition: string
  categoryId: number
}

export interface CreateProductWithImagesRequest extends CreateProductRequest {
  mainImage: File
  additionalImages: File[]
}
