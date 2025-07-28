export interface IUser {
  id: number
  userName: string
  email: string
  FullName: string
  fullName: string
  phone : string
  isActive: boolean
  createdAt: Date
  roles?: string[]
  lockoutEnd?: Date
  isDeleted?: boolean
  lockoutEnabled?: boolean
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
  FullName: string
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
  FullName?: string;
  phone?: string;
  userName?: string;
  user?: IUser;
}
export interface IUpdateProfileRequest {
  fullName: string
  FullName: string
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
