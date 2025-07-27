import { Injectable } from "@angular/core"
import  { HttpClient } from "@angular/common/http"
import  { Observable } from "rxjs"
import  { ApiResponse } from "../models/api-response.model"
import  {  CreateProductRequest, IProduct } from "../models/product.model"
import { environment } from "../../../environments/environment"

@Injectable({
  providedIn: "root",
})
export class ProductService {
  private readonly API_URL = `${environment.apiUrl}/api/Products/Product`

  constructor(private http: HttpClient) {}

  // Public endpoints - approved products
  getApprovedProducts(): Observable<ApiResponse<IProduct[]>> {
    return this.http.get<ApiResponse<IProduct[]>>(`${this.API_URL}/approved`)
  }

  getProductById(id: number): Observable<ApiResponse<IProduct>> {
    return this.http.get<ApiResponse<IProduct>>(`${this.API_URL}/approved/${id}`)
  }

  getProductsByUser(userId: number): Observable<ApiResponse<IProduct[]>> {
    return this.http.get<ApiResponse<IProduct[]>>(`${this.API_URL}/user/${userId}`)
  }

  getProductsByCategory(categoryId: number): Observable<ApiResponse<IProduct[]>> {
    return this.http.get<ApiResponse<IProduct[]>>(`${this.API_URL}/category/${categoryId}`)
  }

  // CRUD operations (require authentication)
  createProduct(product: CreateProductRequest): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.API_URL}/add`, product)
  }

  createProductWithImages(formData: FormData): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.API_URL}/with-images`, formData)
  }

  updateProduct(id: number, formData: FormData): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(`${this.API_URL}/Update/${id}`, formData)
  }

  deleteProduct(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.API_URL}/${id}`)
  }
  deleteImage(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.API_URL}/images/${id}`)
  }
 

  // Admin methods
  getAllProducts(): Observable<ApiResponse<IProduct[]>> {
    return this.http.get<ApiResponse<IProduct[]>>(`${this.API_URL}/all`)
    return this.http.get<ApiResponse<IProduct[]>>(`${this.API_URL}/all`)
  }

  getNotApprovedProducts(): Observable<ApiResponse<IProduct[]>> {
    return this.http.get<ApiResponse<IProduct[]>>(`${this.API_URL}/not-approved`)
  }

  approveProduct(id: number): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.API_URL}/approve/${id}`, {})
    return this.http.post<ApiResponse<boolean>>(`${this.API_URL}/approve/${id}`, {})
  }

  rejectProduct(id: number): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.API_URL}/reject/${id}`, {})
  }
}
