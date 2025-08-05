import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { ApiResponse } from '../models/api-response.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { IProduct } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class WishListService {
  private readonly API_URL = `${environment.apiUrl}/api/Products/Wishlist`
  private wishlistCountSource = new BehaviorSubject<number>(0);
  wishlistCount$ = this.wishlistCountSource.asObservable();
  constructor(private http: HttpClient) { }


  updateCount(count: number) {
    this.wishlistCountSource.next(count);
  }
  getWishlistProducts(): Observable<ApiResponse<IProduct[]>> {
    return this.http.get<ApiResponse<IProduct[]>>(`${this.API_URL}/getProduct`)
  }
  addToWishlist(id: number): Observable<ApiResponse< number >> {
    return this.http.post<ApiResponse< number >>(`${this.API_URL}/add/${id}`,{})
    }
  removefromWishlist(id: number): Observable<ApiResponse< number >> {
    return this.http.delete<ApiResponse<number>>(`${this.API_URL}/remove/${id}`)
  }
 
  getCountOfProducts(): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(`${this.API_URL}/count`)
  }
   
}
