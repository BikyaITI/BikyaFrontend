import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { environment } from '../../../environments/environment';
import { tap, switchMap, map } from 'rxjs/operators';
import { UserService } from './user.service';
import { ApiResponse, IUserAddressInfo } from '../models/user.model';
import { AvailableTransitions, DeliveryOrderDto, OrderStatusSummary, UpdateDeliveryShippingStatusDto, UpdateOrderStatusDto } from '../models/delivery.model';


@Injectable({
  providedIn: 'root'
})
export class DeliveryService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient,private userService:UserService) { }

  getOrdersForDelivery(): Observable<ApiResponse<DeliveryOrderDto[]>> {
    const headers = this.getAuthHeaders();
    console.log('DeliveryService: Fetching orders for delivery from:', `${this.baseUrl}/api/delivery/orders`);
    return this.http.get<ApiResponse<DeliveryOrderDto[]>>(`${this.baseUrl}/api/delivery/orders`, { headers }).pipe(
      switchMap((resp) => {
        if (!resp?.success || !Array.isArray(resp.data) || resp.data.length === 0) {
          return of(resp);
        }

        // For swap orders, fetch both orders' detail to fill party names/products
        const swapItems = resp.data.filter(o => o.isSwapOrder && !!o.relatedOrderId);
        if (swapItems.length === 0) return of(resp);

        const detailCalls = swapItems.map(item =>
          forkJoin({
            a: this.http.get<ApiResponse<DeliveryOrderDto>>(`${this.baseUrl}/api/delivery/orders/${item.id}`, { headers }),
            b: this.http.get<ApiResponse<DeliveryOrderDto>>(`${this.baseUrl}/api/delivery/orders/${item.relatedOrderId}`, { headers })
          }).pipe(
            map(({ a, b }) => ({
              id: item.id,
              a: a?.data, b: b?.data
            }))
          )
        );

        return forkJoin(detailCalls).pipe(
          map(details => {
            for (const d of details) {
              const idx = resp.data!.findIndex(x => x.id === d.id);
              if (idx >= 0) {
                const a = d.a, b = d.b;
                if (a) {
                  resp.data![idx].party1Name = a.buyerInfo.fullName ;
                  resp.data![idx].party1Product = a.productName;
                }
                if (b) {
                  resp.data![idx].party2Name = b.buyerInfo.fullName ;
                  resp.data![idx].party2Product = b.productName;
                }
              }
            }
            return resp;
          })
        );
      })
    );
  }

  getOrderById(orderId: number): Observable<ApiResponse<DeliveryOrderDto>> {
    const headers = this.getAuthHeaders();
    console.log(`DeliveryService: Fetching order ${orderId} from ${this.baseUrl}/api/delivery/orders/${orderId}`);
    return this.http.get<ApiResponse<DeliveryOrderDto>>(`${this.baseUrl}/api/delivery/orders/${orderId}`, { headers })
        
        }

//if not swap
       
        // return this.userService.getById(primary.data.sellerId).pipe(
        //   map((sellerResp) => {
        //     if (sellerResp?.success && sellerResp.data) {
        //       const merged: DeliveryOrderDto = {
        //         ...primary.data,
        //         otherBuyerName: sellerResp.data.fullName,
        //         otherBuyerEmail: sellerResp.data.email,
        //         otherBuyerPhone: sellerResp.data.phoneNumber,
        //         otherAddress: sellerResp.data.address,
        //         otherPostalCode: sellerResp.data.postalCode,
        //         otherPhoneNumber: sellerResp.data.phoneNumber,
        //         otherCity: sellerResp.data.city,
        //       };
        //       return { ...primary, data: merged } as ApiResponse<DeliveryOrderDto>;
        //     };
        //     return primary;
        //   })
        // );

        
      

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
