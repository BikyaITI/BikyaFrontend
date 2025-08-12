import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ExchangeRequest, CreateExchangeRequest, ExchangeStatus } from '../models/exchange.model';
import { Observable, catchError, throwError } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class ExchangeService {
  private apiUrl = `${environment.apiUrl}/Exchange`;

  constructor(
    private http: HttpClient,
    private toastr: ToastrService
  ) { }

  private handleError(error: HttpErrorResponse) {
    console.error('ExchangeService error:', error);
    let errorMessage = 'حدث خطأ غير متوقع';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `خطأ: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = error.error?.message || error.message || 'فشل الاتصال بالخادم';
    }
    
    this.toastr.error(errorMessage, 'خطأ');
    return throwError(() => new Error(errorMessage));
  }

  // Create new exchange request
  createExchange(request: CreateExchangeRequest): Observable<ApiResponse<ExchangeRequest>> {
    console.log('Sending exchange request:', request);
    const url = `${environment.apiUrl}/api/Exchange/ExchangeRequest`;
    console.log('Sending request to:', url);
    return this.http.post<ApiResponse<ExchangeRequest>>(url, request).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  // Get received exchange requests
  getReceivedRequests(): Observable<ApiResponse<ExchangeRequest[]>> {
    console.log('Fetching received exchange requests');
    const url = `${environment.apiUrl}/api/Exchange/ExchangeRequest/received`;
    console.log('Fetching received requests from:', url);
    return this.http.get<ApiResponse<ExchangeRequest[]>>(url).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  // Get sent exchange requests
  getSentRequests(): Observable<ApiResponse<ExchangeRequest[]>> {
    console.log('Fetching sent exchange requests');
    const url = `${environment.apiUrl}/api/Exchange/ExchangeRequest/sent`;
    console.log('Fetching sent requests from:', url);
    return this.http.get<ApiResponse<ExchangeRequest[]>>(url).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  // Approve exchange request
  approveRequest(requestId: number): Observable<ApiResponse<any>> {
    console.log(`Approving exchange request ${requestId}`);
    const url = `${environment.apiUrl}/api/Exchange/ExchangeRequest/${requestId}/approve`;
    console.log('Sending approve request to:', url);
    return this.http.put<ApiResponse<any>>(url, {}).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  // Reject exchange request with optional reason
  rejectRequest(requestId: number, reason: string = ''): Observable<ApiResponse<any>> {
    console.log(`Rejecting exchange request ${requestId}`, { reason });
    const url = `${environment.apiUrl}/api/Exchange/ExchangeRequest/${requestId}/reject`;
    console.log('Sending reject request to:', url);
    return this.http.put<ApiResponse<any>>(url, { reason }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  // Get exchange request by ID
  getRequestById(id: number): Observable<ApiResponse<ExchangeRequest>> {
    console.log(`Fetching exchange request ${id}`);
    const url = `${environment.apiUrl}/api/Exchange/ExchangeRequest/${id}`;
    console.log('Fetching request from:', url);
    return this.http.get<ApiResponse<ExchangeRequest>>(url).pipe(
      catchError(this.handleError.bind(this))
    );
  }
}
