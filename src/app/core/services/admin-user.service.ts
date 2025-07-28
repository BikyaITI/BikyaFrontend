import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { IUser } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AdminUserService {
  private baseUrl = `${environment.apiUrl}/api/Identity/AdminUsers`;

  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    
    console.log('AdminUserService - handleError called with:', error);
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      errorMessage = error.error?.message || error.message || `Error Code: ${error.status}`;
    }
    
    console.error('API Error:', error);
    return throwError(() => new Error(errorMessage));
  }

  getAll(search?: string, status?: string, page: number = 1, pageSize: number = 10): Observable<ApiResponse<IUser[]>> {
    let params = `?page=${page}&pageSize=${pageSize}`;
    if (search) params += `&search=${encodeURIComponent(search)}`;
    if (status) params += `&status=${encodeURIComponent(status)}`;
    return this.http.get<ApiResponse<IUser[]>>(`${this.baseUrl}${params}`).pipe(
      catchError(this.handleError)
    );
  }

  getActive(page: number = 1, pageSize: number = 10): Observable<ApiResponse<IUser[]>> {
    return this.http.get<ApiResponse<IUser[]>>(`${this.baseUrl}/active?page=${page}&pageSize=${pageSize}`).pipe(
      catchError(this.handleError)
    );
  }

  getInactive(page: number = 1, pageSize: number = 10): Observable<ApiResponse<IUser[]>> {
    return this.http.get<ApiResponse<IUser[]>>(`${this.baseUrl}/inactive?page=${page}&pageSize=${pageSize}`).pipe(
      catchError(this.handleError)
    );
  }

  getCount(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/count`).pipe(
      catchError(this.handleError)
    );
  }

  getStatistics(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/statistics`).pipe(
      catchError(this.handleError)
    );
  }

  getById(id: number): Observable<ApiResponse<IUser>> {
    return this.http.get<ApiResponse<IUser>>(`${this.baseUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  update(id: number, data: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/${id}`, data).pipe(
      catchError(this.handleError)
    );
  }

  delete(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  permanentDelete(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/${id}/permanent`).pipe(
      catchError(this.handleError)
    );
  }

  reactivate(email: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/reactivate?email=${encodeURIComponent(email)}`, {}).pipe(
      catchError(this.handleError)
    );
  }

  lock(id: number, reason?: string): Observable<ApiResponse<any>> {
    let url = `${this.baseUrl}/${id}/lock`;
    if (reason) url += `?reason=${encodeURIComponent(reason)}`;
    return this.http.post<ApiResponse<any>>(url, {}).pipe(
      catchError(this.handleError)
    );
  }

  unlock(id: number): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/${id}/unlock`, {}).pipe(
      catchError(this.handleError)
    );
  }

  // Reset a user's password (admin action)
  resetUserPassword(id: number, newPassword: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/${id}/reset-password`, newPassword).pipe(
      catchError(this.handleError)
    );
  }

  // Assign a role to a user (admin action) - Updated to use the correct endpoint
  assignRole(id: number, role: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/${id}/assign-role`, `"${role}"`, {
      headers: { 'Content-Type': 'application/json' }
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Remove a role from a user (admin action)
  removeRole(id: number, role: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/${id}/remove-role?role=${encodeURIComponent(role)}`).pipe(
      catchError(this.handleError)
    );
  }

  getUserActivity(id: number, page: number = 1, pageSize: number = 10): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/${id}/activity?page=${page}&pageSize=${pageSize}`).pipe(
      catchError(this.handleError)
    );
  }

  // Improved method to check if user is locked
  isUserLocked(user: IUser): boolean {
    if (!user) return false;
    
    // Check if user has lockoutEnd and it's in the future
    if (user.lockoutEnd) {
      const lockoutDate = new Date(user.lockoutEnd);
      return lockoutDate > new Date();
    }
    
    // Check if user is deleted
    if (user.isDeleted) {
      return true;
    }
    
    // Check if user is not active
    if (!user.isActive) {
      return true;
    }
    
    // Check if lockout is enabled
    if (user.lockoutEnabled) {
      return true;
    }
    
    return false;
  }

  // Improved method to get user status text
  getUserStatusText(user: IUser): string {
    if (!user) return 'Unknown';
    
    if (this.isUserLocked(user)) {
      if (user.lockoutEnd) {
        return 'Locked';
      }
      if (user.isDeleted) {
        return 'Deleted';
      }
      if (user.lockoutEnabled) {
        return 'Locked';
      }
      return 'Inactive';
    }
    
    return user.isActive ? 'Active' : 'Inactive';
  }

  // Method to get user status badge class
  getUserStatusBadgeClass(user: IUser): string {
    const status = this.getUserStatusText(user);
    switch (status.toLowerCase()) {
      case 'active':
        return 'badge bg-success';
      case 'inactive':
        return 'badge bg-secondary';
      case 'locked':
        return 'badge bg-warning';
      case 'deleted':
        return 'badge bg-danger';
      default:
        return 'badge bg-secondary';
    }
  }
} 