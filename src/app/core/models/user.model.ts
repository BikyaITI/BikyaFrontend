export interface IUser {
  id: number
  userName: string
  email: string
  fullName: string
  phone : string
  isActive: boolean
  createdAt: Date
  roles?: string[]
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

// export interface AuthResponse {
//   token: string
//   refreshToken: string
//   user: IUser
// }
export interface AuthResponse {
  token: string;
  refreshToken: string;
  userId?: number;
  email?: string;
  fullName?: string;
  phone? : string;
  userName?: string;
  user?: IUser;
}
export interface IUpdateProfileRequest {
  fullName: string
  email: string
}

export interface IChangePasswordRequest {
  currentPassword: string
  newPassword: string
  ConfirmNewPassword: string
}

export interface IUserStats {
  totalProducts: number;
  totalOrders: number;
  totalSales: number;
}
