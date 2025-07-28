import { Injectable } from "@angular/core"
import  { HttpClient } from "@angular/common/http"
import  { Observable } from "rxjs"
import  { ApiResponse } from "../models/api-response.model"
import  { Order, CreateOrderRequest } from "../models/order.model"
import { environment } from "../../../environments/environment"

export interface ShippingInfoDTO {
  address: string;
  city: string;
  postalCode: string;
  country: string;
  trackingNumber?: string;
}

export interface UpdateOrderStatusRequest {
  orderId: number;
  newStatus: string;
}

@Injectable({
  providedIn: "root",
})
export class OrderService {
  private readonly API_URL = `${environment.apiUrl}/api/Order/Order`;

  constructor(private http: HttpClient) {}

  // Create a new order
  createOrder(order: CreateOrderRequest): Observable<ApiResponse<Order>> {
    return this.http.post<ApiResponse<Order>>(`${this.API_URL}`, order)
  }

  // Update order status
  updateOrderStatus(request: UpdateOrderStatusRequest): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(`${this.API_URL}/status`, request)
  }

  // Get orders by user ID
  getOrdersByUser(userId: number): Observable<ApiResponse<Order[]>> {
    return this.http.get<ApiResponse<Order[]>>(`${this.API_URL}/user/${userId}`)
  }

  // Get orders by buyer ID
  getOrdersByBuyer(buyerId: number): Observable<ApiResponse<Order[]>> {
    return this.http.get<ApiResponse<Order[]>>(`${this.API_URL}/buyer/${buyerId}`)
  }

  // Get orders by seller ID
  getOrdersBySeller(sellerId: number): Observable<ApiResponse<Order[]>> {
    return this.http.get<ApiResponse<Order[]>>(`${this.API_URL}/seller/${sellerId}`)
  }

  // Get all orders (Admin only)
  getAllOrders(): Observable<ApiResponse<Order[]>> {
    return this.http.get<ApiResponse<Order[]>>(`${this.API_URL}/all`)
  }

  // Get order by ID
  getOrderById(orderId: number): Observable<ApiResponse<Order>> {
    return this.http.get<ApiResponse<Order>>(`${this.API_URL}/${orderId}`)
  }

  // Cancel an order
  cancelOrder(orderId: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.API_URL}/${orderId}/cancel`)
  }

  // Update shipping information for an order
  updateShippingInfo(orderId: number, shippingInfo: ShippingInfoDTO): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(`${this.API_URL}/${orderId}/shipping`, shippingInfo)
  }

  // Legacy methods for backward compatibility
  getMyOrders(userId: number): Observable<ApiResponse<Order[]>> {
    return this.getOrdersByUser(userId);
  }

  // Find order by payment intent ID (for webhook processing)
  findOrderByPaymentIntent(paymentIntentId: string): Observable<ApiResponse<Order>> {
    return this.http.get<ApiResponse<Order>>(`${this.API_URL}/payment-intent/${paymentIntentId}`);
  }
}