import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { 
  PaymentRequestDto, 
  PaymentResponseDto, 
  PaymentStatusDto, 
  PaymentSummaryDto, 
  PaymentDto 
} from '../models/payment.model';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private baseUrl = 'https://localhost:65162/api/Wallet/Payment';

  constructor(private http: HttpClient) {}

  createPayment(payment: PaymentRequestDto): Observable<ApiResponse<PaymentResponseDto>> {
    return this.http.post<ApiResponse<PaymentResponseDto>>(this.baseUrl, payment);
  }

  getPaymentStatus(paymentId: number): Observable<ApiResponse<PaymentStatusDto>> {
    return this.http.get<ApiResponse<PaymentStatusDto>>(`${this.baseUrl}/${paymentId}`);
  }

  getPaymentSummary(paymentId: number): Observable<ApiResponse<PaymentSummaryDto>> {
    return this.http.get<ApiResponse<PaymentSummaryDto>>(`${this.baseUrl}/summary/${paymentId}`);
  }

  getPaymentsByOrderId(orderId: number): Observable<PaymentDto[]> {
    return this.http.get<PaymentDto[]>(`${this.baseUrl}/order/${orderId}`);
  }

  getPaymentsByUserId(userId: number): Observable<PaymentDto[]> {
    return this.http.get<PaymentDto[]>(`${this.baseUrl}/user/${userId}`);
  }

  // New methods for payment status management
  checkPaymentStatus(paymentId: number): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/check-status/${paymentId}`, {});
  }

  checkPendingPayments(userId: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/check-pending/${userId}`);
  }

  // Method to refresh all pending payments for a user
  refreshAllPendingPayments(userId: number): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/refresh-pending/${userId}`, {});
  }
} 