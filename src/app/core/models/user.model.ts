export interface User {
  id: number
  userName: string
  email: string
  fullName: string
  isActive: boolean
  createdAt: Date
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
  user: User
}

export interface UpdateProfileRequest {
  fullName: string
  email: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}
