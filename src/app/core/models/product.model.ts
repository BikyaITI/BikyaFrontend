import  { User } from "./user.model" // Assuming User model is in user.model.ts

export interface Product {
  id: number
  title: string
  description: string
  price: number
  isForExchange: boolean
  condition: string
  categoryId: number
  category: Category
  userId: number
  user: User
  isApproved: boolean
  createdAt: Date
  images: ProductImage[]
  viewCount?: number
  likeCount?: number
  inquiryCount?: number
}

export interface ProductImage {
  id: number
  productId: number
  imageUrl: string
  isMain: boolean
}

export interface Category {
  id: number
  name: string
  description: string
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
