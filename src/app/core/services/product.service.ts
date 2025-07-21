import { Injectable } from "@angular/core"
import  { HttpClient } from "@angular/common/http"
import  { Observable } from "rxjs"
import  { ApiResponse } from "../models/api-response.model"
import  { Product, CreateProductRequest } from "../models/product.model"
import { environment } from "../../../environments/environment"

@Injectable({
  providedIn: "root",
})
export class ProductService {
  private readonly API_URL = `${environment.apiUrl}/api/Products/Product`

  constructor(private http: HttpClient) {}

  getApprovedProducts(): Observable<ApiResponse<Product[]>> {
    return this.http.get<ApiResponse<Product[]>>(`${this.API_URL}/ApprovedProducts`)
  }

  getProductById(id: number): Observable<ApiResponse<Product>> {
    return this.http.get<ApiResponse<Product>>(`${this.API_URL}/ApprovedProducts/${id}`)
  }

  getProductsByUser(userId: number): Observable<ApiResponse<Product[]>> {
    return this.http.get<ApiResponse<Product[]>>(`${this.API_URL}/UserProduct/${userId}`)
  }

  getProductsByCategory(categoryId: number): Observable<ApiResponse<Product[]>> {
    return this.http.get<ApiResponse<Product[]>>(`${this.API_URL}/CategoryProducts/${categoryId}`)
  }

  createProduct(product: CreateProductRequest): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.API_URL}/Add`, product)
  }

  createProductWithImages(formData: FormData): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.API_URL}/AddWithImages`, formData)
  }

  updateProduct(id: number, product: CreateProductRequest): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(`${this.API_URL}/Update/${id}`, product)
  }

  deleteProduct(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.API_URL}/Delete/${id}`)
  }

  // Admin methods
  getAllProducts(): Observable<ApiResponse<Product[]>> {
    return this.http.get<ApiResponse<Product[]>>(`${this.API_URL}/AllProduct`)
  }

  getNotApprovedProducts(): Observable<ApiResponse<Product[]>> {
    return this.http.get<ApiResponse<Product[]>>(`${this.API_URL}/NotApprovedProducts`)
  }

  approveProduct(id: number): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.API_URL}/ApproveProduct/${id}`, {})
  }

  rejectProduct(id: number): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.API_URL}/RejectProduct/${id}`, {})
  }
}
