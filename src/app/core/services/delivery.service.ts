import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { tap } from 'rxjs/operators';

export interface DeliveryOrderDto {
  id: number;
  productName: string;
  productImage: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  paidAt: string;
  recipientName: string;
  address: string;
  city: string;
  postalCode: string;
  phoneNumber: string;
  shippingStatus: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
}

export interface UpdateOrderStatusDto {
  status: string;
  notes?: string;
}

export interface UpdateDeliveryShippingStatusDto {
  status: string;
  notes?: string;
}

export interface OrderStatusSummary {
  orderId: number;
  orderStatus: string;
  shippingStatus: string;
  isSynchronized: boolean;
  lastUpdated: string;
  nextAllowedTransitions: {
    orderStatus: string[];
    shippingStatus: string[];
  };
}

export interface AvailableTransitions {
  orderId: number;
  currentOrderStatus: string;
  currentShippingStatus: string;
  orderStatusTransitions: string[];
  shippingStatusTransitions: string[];
  recommendations: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  statusCode: number;
}

@Injectable({
  providedIn: 'root'
})
export class DeliveryService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getOrdersForDelivery(): Observable<ApiResponse<DeliveryOrderDto[]>> {
    const headers = this.getAuthHeaders();
    console.log('DeliveryService: Fetching orders for delivery from:', `${this.baseUrl}/api/delivery/orders`);
    return this.http.get<ApiResponse<DeliveryOrderDto[]>>(`${this.baseUrl}/api/delivery/orders`, { headers });
  }

  getOrderById(orderId: number): Observable<ApiResponse<DeliveryOrderDto>> {
    const headers = this.getAuthHeaders();
    console.log(`DeliveryService: Fetching order ${orderId} from ${this.baseUrl}/api/delivery/orders/${orderId}`);
    return this.http.get<ApiResponse<DeliveryOrderDto>>(`${this.baseUrl}/api/delivery/orders/${orderId}`, { headers });
  }

  getOrderStatusSummary(orderId: number): Observable<ApiResponse<OrderStatusSummary>> {
    const headers = this.getAuthHeaders();
    console.log(`DeliveryService: Fetching status summary for order ${orderId}`);
    return this.http.get<ApiResponse<OrderStatusSummary>>(`${this.baseUrl}/api/delivery/orders/${orderId}/status-summary`, { headers });
  }

  getAvailableTransitions(orderId: number): Observable<ApiResponse<AvailableTransitions>> {
    const headers = this.getAuthHeaders();
    console.log(`DeliveryService: Fetching available transitions for order ${orderId}`);
    return this.http.get<ApiResponse<AvailableTransitions>>(`${this.baseUrl}/api/delivery/orders/${orderId}/available-transitions`, { headers });
  }

  updateOrderStatus(orderId: number, updateDto: UpdateOrderStatusDto): Observable<ApiResponse<boolean>> {
    const headers = this.getAuthHeaders();
    console.log('=== DeliveryService: Update Order Status ===');
    console.log('Order ID:', orderId);
    console.log('Update DTO:', updateDto);
    console.log('Headers:', headers);
    console.log('URL:', `${this.baseUrl}/api/delivery/orders/${orderId}/status`);
    
    return this.http.put<ApiResponse<boolean>>(`${this.baseUrl}/api/delivery/orders/${orderId}/status`, updateDto, { headers }).pipe(
      tap({
        next: (response) => {
          console.log('✅ Update successful:', response);
        },
        error: (error) => {
          console.error('❌ Update failed:', error);
          console.error('Error status:', error.status);
          console.error('Error message:', error.message);
          if (error.error) {
            console.error('Error details:', error.error);
          }
        }
      })
    );
  }

  updateShippingStatus(orderId: number, updateDto: UpdateDeliveryShippingStatusDto): Observable<ApiResponse<boolean>> {
    const headers = this.getAuthHeaders();
    console.log(`DeliveryService: Updating shipping status for order ${orderId} to ${updateDto.status}`);
    console.log('DeliveryService: Shipping update data:', updateDto);
    return this.http.put<ApiResponse<boolean>>(`${this.baseUrl}/api/delivery/orders/${orderId}/shipping-status`, updateDto, { headers });
  }

  synchronizeOrderStatus(orderId: number): Observable<ApiResponse<boolean>> {
    const headers = this.getAuthHeaders();
    console.log(`DeliveryService: Synchronizing order status for order ${orderId}`);
    return this.http.post<ApiResponse<boolean>>(`${this.baseUrl}/api/delivery/orders/${orderId}/synchronize`, {}, { headers });
  }

  setupDeliverySystem(): Observable<ApiResponse<boolean>> {
    const headers = this.getAuthHeaders();
    console.log('DeliveryService: Setting up delivery system');
    return this.http.post<ApiResponse<boolean>>(`${this.baseUrl}/api/delivery/setup`, {}, { headers });
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('DeliveryService: No authentication token found in localStorage');
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    console.log('DeliveryService: Auth headers created with token:', token ? 'Present' : 'Missing');
    return headers;
  }
}
