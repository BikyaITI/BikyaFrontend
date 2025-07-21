import { Injectable } from "@angular/core"
import  { HttpClient } from "@angular/common/http"
import  { Observable } from "rxjs"
import  { ApiResponse } from "../models/api-response.model"
import  { Category } from "../models/product.model"
import { environment } from "../../../environments/environment"

@Injectable({
  providedIn: "root",
})
export class CategoryService {
  private readonly API_URL = `${environment.apiUrl}/api/Category`

  constructor(private http: HttpClient) {}

  getAll(page = 1, pageSize = 10, search?: string): Observable<ApiResponse<Category[]>> {
    let params = `?page=${page}&pageSize=${pageSize}`
    if (search) {
      params += `&search=${search}`
    }
    return this.http.get<ApiResponse<Category[]>>(`${this.API_URL}${params}`)
  }

  getById(id: number): Observable<ApiResponse<Category>> {
    return this.http.get<ApiResponse<Category>>(`${this.API_URL}/${id}`)
  }

  create(category: { name: string; description: string }): Observable<ApiResponse<Category>> {
    return this.http.post<ApiResponse<Category>>(`${this.API_URL}`, category)
  }

  update(id: number, category: { name: string; description: string }): Observable<ApiResponse<Category>> {
    return this.http.put<ApiResponse<Category>>(`${this.API_URL}/${id}`, category)
  }

  delete(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.API_URL}/${id}`)
  }
}
