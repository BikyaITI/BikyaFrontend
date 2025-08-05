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
  categoryName: string
  userId: number
  userName: string
  status:string
  isApproved: boolean
  createdAt: Date
  isInWishlist:boolean
  images: IProductImage[]

}

export interface IProductImage {
  id: number
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
export interface CreateProductImageRequest {
  image: File
  isMain: boolean
}