import { Injectable } from "@angular/core"
import  { HttpClient } from "@angular/common/http"
import  { Observable } from "rxjs"
import  { ApiResponse } from "../models/api-response.model"
import  { Order, CreateOrderRequest, UpdateOrderStatusRequest } from "../models/order.model"
import { environment } from "../../../environments/environment"

@Injectable({
  providedIn: "root",
})
export class OrderService {
  private readonly API_URL = `${environment.apiUrl}/api/Order`

  constructor(private http: HttpClient) {}

  createOrder(order: CreateOrderRequest): Observable<ApiResponse<Order>> {
    return this.http.post<ApiResponse<Order>>(`${this.API_URL}`, order)
  }

  getOrderById(orderId: number): Observable<ApiResponse<Order>> {
    return this.http.get<ApiResponse<Order>>(`${this.API_URL}/${orderId}`)
  }

  getMyOrders(userId: number): Observable<ApiResponse<Order[]>> {
    return this.http.get<ApiResponse<Order[]>>(`${this.API_URL}/my-orders/${userId}`)
  }

  getOrdersByBuyer(buyerId: number): Observable<ApiResponse<Order[]>> {
    return this.http.get<ApiResponse<Order[]>>(`${this.API_URL}/buyer/${buyerId}`)
  }

  getOrdersBySeller(sellerId: number): Observable<ApiResponse<Order[]>> {
    return this.http.get<ApiResponse<Order[]>>(`${this.API_URL}/seller/${sellerId}`)
  }

  updateOrderStatus(request: UpdateOrderStatusRequest): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(`${this.API_URL}/status`, request)
  }

  cancelOrder(orderId: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.API_URL}/${orderId}/cancel`)
  }

  getAllOrders(): Observable<ApiResponse<Order[]>> {
    return this.http.get<ApiResponse<Order[]>>(`${this.API_URL}/all`)
  }
}
