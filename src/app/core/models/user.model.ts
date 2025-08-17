import { IReview } from "./ireview"
import { IProduct } from "./product.model"

export interface IUser {
  id: number
  userName: string
  email: string
  fullName: string
 FullName: string
  phoneNumber: string
  address: string
  city: string
  postalCode: string
  isActive: boolean
  createdAt: Date
  roles?: string[]
  lockoutEnd?: Date
  isDeleted?: boolean
  lockoutEnabled?: boolean
  profileImageUrl? :string | ArrayBuffer ;
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  confirmPassword: string
  fullName: string
  phoneNumber: string
  userType: string
  adminRegistrationCode?: string
}


export interface AuthResponse {
  token: string;
  refreshToken: string;
  userId?: number;
  email?: string;
  fullName?: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  userName?: string;
  user?: IUser;
}
export interface IUpdateProfileRequest {
  fullName: string;
  email: string;
  address: string;
  city: string
  postalCode: string
  phoneNumber: string


}

export interface IChangePasswordRequest {
  currentPassword: string
  newPassword: string
  ConfirmNewPassword: string
}

export interface UserStats {
  totalProducts: number;
  totalOrders: number;
  totalSales: number;
  avrageReating: number;  
}

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T | null;
  errors: string[] | null;
  timestamp?: string;
  path?: string | null;
}

export interface PublicUserProfile {
  fullName: string | "Bikya User";
  profileImageUrl?: string;
  productCount?: number;
  salesCount?: number;
  averageRating?: number;
  reviews?: IReview[];
  productsForSale?: IProduct[];
}

export interface IUserAddressInfo {
  id: number; // Required integer
  fullName: string; // Required string
  email: string; // Required string
  phoneNumber: string; // Required string
  address: string; // Required string
  city: string; // Required string
  postalCode: string; // Required string
}
