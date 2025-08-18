import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';

export interface DashboardStats {
  totalSales: number;
  totalPlatformProfit: number;
  totalSellerProfit: number;
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  averageOrderValue: number;
  lastUpdated: Date;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly baseUrl = `${environment.apiUrl}/api/Dashboard`;

  constructor(private http: HttpClient) { }

  /**
   * Get overall dashboard statistics including platform profit
   */
  getDashboardStats(): Observable<ApiResponse<DashboardStats>> {
    return this.http.get<ApiResponse<DashboardStats>>(`${this.baseUrl}/stats`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get dashboard statistics for a specific date range
   */
  getDashboardStatsByDateRange(startDate: Date, endDate: Date): Observable<ApiResponse<DashboardStats>> {
    const params = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    };
    
    return this.http.get<ApiResponse<DashboardStats>>(`${this.baseUrl}/stats/range`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Calculate platform profit percentage (15%)
   */
  calculatePlatformProfitPercentage(totalSales: number): number {
    return totalSales * 0.15;
  }

  /**
   * Calculate seller profit percentage (85%)
   */
  calculateSellerProfitPercentage(totalSales: number): number {
    return totalSales * 0.85;
  }

  /**
   * Format currency for display
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  private handleError(error: any): Observable<never> {
    console.error('Dashboard service error:', error);
    throw new Error('Failed to fetch dashboard data');
  }
}
