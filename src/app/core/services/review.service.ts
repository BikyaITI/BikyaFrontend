import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IReview, ICreateReview, IUpdateReview } from '../../models/ireview';
import { ApiResponse } from '../../shared/api-response';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
 private baseUrl = 'https://localhost:65162/api/Reviews'; 

  constructor(private http: HttpClient) {}
// Get all reviews for a seller
getReviewsBySellerId(sellerId: number): Observable<ApiResponse<IReview[]>> {
  return this.http.get<ApiResponse<IReview[]>>(`${this.baseUrl}/Seller/${sellerId}`);
}

// Create a review
createReview(review: ICreateReview): Observable<ApiResponse<IReview>> {
  return this.http.post<ApiResponse<IReview>>(this.baseUrl, review);
}

// Update a review
updateReview(review: IUpdateReview): Observable<ApiResponse<IReview>> {
  return this.http.put<ApiResponse<IReview>>(`${this.baseUrl}/${review.id}`, review);
}

// Delete review
deleteReview(reviewId: number): Observable<ApiResponse<null>> {
  return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${reviewId}`);
}

// Get single review
getReviewById(id: number): Observable<ApiResponse<IReview>> {
  return this.http.get<ApiResponse<IReview>>(`${this.baseUrl}/${id}`);
}

}
