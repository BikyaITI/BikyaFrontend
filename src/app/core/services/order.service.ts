import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { ApiResponse } from "../models/api-response.model";
import { Order, CreateOrderRequest, UpdateOrderStatusRequest } from "../models/order.model";
import { environment } from "../../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class OrderService {
  private readonly API_URL = `${environment.apiUrl}/api/Order`;

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem("token");
    return new HttpHeaders({
      "Authorization": token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    });
  }

  createOrder(order: CreateOrderRequest): Observable<ApiResponse<Order>> {
    return this.http.post<ApiResponse<Order>>(`${this.API_URL}`, order, { headers: this.getHeaders() });
  }

  getOrderById(orderId: number): Observable<ApiResponse<Order>> {
    return this.http.get<ApiResponse<Order>>(`${this.API_URL}/${orderId}`, { headers: this.getHeaders() });
  }

  getMyOrders(userId: number): Observable<ApiResponse<Order[]>> {
    return this.http.get<ApiResponse<Order[]>>(`${this.API_URL}/my-orders/${userId}`, { headers: this.getHeaders() });
  }

  getOrdersByBuyer(buyerId: number): Observable<ApiResponse<Order[]>> {
    return this.http.get<ApiResponse<Order[]>>(`${this.API_URL}/buyer/${buyerId}`, { headers: this.getHeaders() });
  }

  getOrdersBySeller(sellerId: number): Observable<ApiResponse<Order[]>> {
    return this.http.get<ApiResponse<Order[]>>(`${this.API_URL}/seller/${sellerId}`, { headers: this.getHeaders() });
  }

  updateOrderStatus(request: UpdateOrderStatusRequest): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(`${this.API_URL}/status`, request, { headers: this.getHeaders() });
  }

  cancelOrder(orderId: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.API_URL}/${orderId}/cancel`, { headers: this.getHeaders() });
  }

  getAllOrders(): Observable<ApiResponse<Order[]>> {
    return this.http.get<ApiResponse<Order[]>>(`${this.API_URL}/all`, { headers: this.getHeaders() });
  }
}