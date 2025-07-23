import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Shipping {
  shippingId: number;
  recipientName: string;
  address: string;
  city: string;
  postalCode: string;
  phoneNumber: string;
  status: string;
  createAt: string;
  orderId: number;
}

export interface CreateShippingRequest {
  recipientName: string;
  address: string;
  city: string;
  postalCode: string;
  phoneNumber: string;
  orderId: number;
}

export interface ShippingCostRequest {
  weight: number;
  method: string;
}

export interface ShippingCostResult {
  cost: number;
  estimatedDeliveryDate: string;
}

export interface TrackingResult {
  trackingNumber: string;
  status: string;
  lastLocation: string;
  estimatedArrival: string;
}

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class ShippingService {
  private baseUrl = '/api/Shipping/Shipping';

  constructor(private http: HttpClient) {}

  createShipping(data: CreateShippingRequest): Observable<ApiResponse<Shipping>> {
    return this.http.post<ApiResponse<Shipping>>(this.baseUrl, data);
  }

  getShippingById(id: number): Observable<ApiResponse<Shipping>> {
    return this.http.get<ApiResponse<Shipping>>(`${this.baseUrl}/${id}`);
  }

  getAllShippings(): Observable<ApiResponse<Shipping[]>> {
    return this.http.get<ApiResponse<Shipping[]>>(this.baseUrl);
  }

  updateShippingStatus(id: number, status: { status: string }): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(`${this.baseUrl}/${id}/status`, status);
  }

  deleteShipping(id: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.baseUrl}/${id}`);
  }

  trackShipping(trackingNumber: string): Observable<ApiResponse<TrackingResult>> {
    return this.http.get<ApiResponse<TrackingResult>>(`${this.baseUrl}/track/${trackingNumber}`);
  }

  calculateShippingCost(data: ShippingCostRequest): Observable<ApiResponse<ShippingCostResult>> {
    return this.http.post<ApiResponse<ShippingCostResult>>(`${this.baseUrl}/calculate`, data);
  }
} 