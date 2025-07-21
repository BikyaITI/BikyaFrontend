export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  statusCode: number
  errors?: string[]
}

export interface PaginatedResponse<T> {
  data: T[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}
