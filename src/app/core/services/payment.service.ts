import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { Payment, PaymentGateway } from '../models/wallet.model';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private baseUrl = 'https://localhost:65162/api/Wallet/Payment';

  constructor(private http: HttpClient) {}

  createPayment(payment: Partial<Payment>): Observable<ApiResponse<Payment>> {
    return this.http.post<ApiResponse<Payment>>(this.baseUrl, payment);
  }

  getPaymentsByUser(userId: number): Observable<ApiResponse<Payment[]>> {
    return this.http.get<ApiResponse<Payment[]>>(`${this.baseUrl}/user/${userId}`);
  }

  getPaymentById(id: number): Observable<ApiResponse<Payment>> {
    return this.http.get<ApiResponse<Payment>>(`${this.baseUrl}/${id}`);
  }
} 