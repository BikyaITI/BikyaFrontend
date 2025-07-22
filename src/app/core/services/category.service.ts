import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { ICategory, PaginatedCategoryResponse } from '../models/icategory';
import { IProduct } from '../models/product.model';
import { environment } from '../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  private baseUrl = `${environment.apiUrl}/api/Category`; // ✅ غيّرها حسب API بتاعتك

  constructor(private http: HttpClient) {}

getAll(): Observable<ApiResponse<ICategory[]>> {
  return this.http.get<ApiResponse<ICategory[]>>(`${this.baseUrl}/all`);
}

getPaginated(page: number, pageSize: number): Observable<ApiResponse<PaginatedCategoryResponse>> {
  return this.http.get<ApiResponse<PaginatedCategoryResponse>>(`${this.baseUrl}/paged?page=${page}&pageSize=${pageSize}`);
}

getById(id: number): Observable<ApiResponse<ICategory>> {
  return this.http.get<ApiResponse<ICategory>>(`${this.baseUrl}/${id}`);
}

getByIdWithProducts(id: number): Observable<ApiResponse<{ category: ICategory, products: IProduct[] }>> {
  return this.http.get<ApiResponse<{ category: ICategory, products: IProduct[] }>>(`${this.baseUrl}/${id}/with-products`);
}

create(category: ICategory): Observable<ApiResponse<ICategory>> {
  return this.http.post<ApiResponse<ICategory>>(this.baseUrl, category);
}

update(id: number, category: ICategory): Observable<ApiResponse<ICategory>> {
  return this.http.put<ApiResponse<ICategory>>(`${this.baseUrl}/${id}`, category);
}

delete(id: number): Observable<ApiResponse<null>> {
  return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${id}`);
}

bulkCreate(categories: ICategory[]): Observable<ApiResponse<ICategory[]>> {
  return this.http.post<ApiResponse<ICategory[]>>(`${this.baseUrl}/bulk`, { categories });
}

//   get userRole(): string | null {
//   const token = localStorage.getItem('token');
//   if (!token) return null;

//   const payload = JSON.parse(atob(token.split('.')[1]));
//   return payload['role'] || null;
// }

// get isAdmin(): boolean {
//   return this.userRole === 'Admin';
// }

}
