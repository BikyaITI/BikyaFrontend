export interface IUser {
  id: number
  userName: string
  email: string
  fullName: string
  isActive: boolean
  createdAt: Date
  role: string[]
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
}

export interface AuthResponse {
  token: string
  refreshToken: string
  user: IUser
}

export interface IUpdateProfileRequest {
  fullName: string
  email: string
}

export interface IChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface IUserStats {
  totalProducts: number;
  totalOrders: number;
  totalSales: number;
}
