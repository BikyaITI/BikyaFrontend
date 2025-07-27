import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable, tap } from "rxjs";
import { ApiResponse } from "../models/api-response.model";
import { LoginRequest, RegisterRequest, AuthResponse, IUser } from "../models/user.model";
import { environment } from "../../../environments/environment";
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/api/Identity/Auth`;
  private currentUserSubject = new BehaviorSubject<IUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as IUser;
        this.currentUserSubject.next(user);
      } catch {
        // إذا فشل في parse الـ user، جرب استخراجه من التوكن
        try {
          const decoded: any = jwtDecode(token);
          const user: IUser = {
            id: Number(decoded?.nameid || decoded?.sub || decoded?.id),
            userName: decoded?.unique_name || decoded?.username || '',
            email: decoded?.email || '',
            fullName: decoded?.fullName || decoded?.name || '',
            phone : decoded?.phone || '',
            isActive: true,
            createdAt: new Date(decoded?.iat * 1000),
            roles: decoded?.role ? [decoded.role] : decoded?.roles || []
          };
          this.currentUserSubject.next(user);
        } catch {
          this.clearAuthData();
        }
      }
    }
  }

  login(request: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.API_URL}/login`, request).pipe(
      tap((response: ApiResponse<AuthResponse>) => {
        if (response.success) {
          this.setCurrentUser(response.data);
        }
      })
    );
  }

  register(request: RegisterRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.API_URL}/register`, request).pipe(
      tap((response: ApiResponse<AuthResponse>) => {
        if (response.success) {
          this.setCurrentUser(response.data);
        }
      })
    );
  }

  registerAdmin(request: any): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.API_URL}/register-admin`, request);
  }

  verifyEmail(token: string, email: string): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.API_URL}/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`, {});
  }


  forgotPassword(email: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.API_URL}/forgot-password`, { email });
  }

  resetPassword(data: { email: string, token: string, newPassword: string }): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.API_URL}/reset-password`, data);
  }

  refreshToken(token: string): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.API_URL}/refresh`, { token });
  }

  sendVerificationEmail(email: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.API_URL}/send-verification`, { email });
  }

  changePassword(data: { currentPassword: string, newPassword: string, confirmNewPassword: string }): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.API_URL}/change-password`, data);
  }

  getProfile(): Observable<ApiResponse<IUser>> {
    return this.http.get<ApiResponse<IUser>>(`${this.API_URL}/profile`);
  }

  // إضافة logout method يرسل طلب للباكند
  logout(): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.API_URL}/logout`, {}).pipe(
      tap(() => {
        this.clearAuthData();
      })
    );
  }

  // طريقة محسنة للـ logout بدون انتظار الباكند
  logoutLocal(): void {
    this.clearAuthData();
  }

  private clearAuthData(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem("token");
    if (!token) return false;

    try {
      const decoded: any = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch {
      return false;
    }
  }

  getToken(): string | null {
    return localStorage.getItem("token");
  }

  getCurrentUser(): IUser | null {
    return this.currentUserSubject.value;
  }

 setCurrentUserToLacal(user: IUser): void {
  localStorage.setItem('user', JSON.stringify(user));
  this.currentUserSubject.next(user);
}
   setCurrentUser(authResponse: AuthResponse): void {
    if (!authResponse || !authResponse.token) {
      return;
    }

    localStorage.setItem("token", authResponse.token);
    localStorage.setItem("refreshToken", authResponse.refreshToken);

    // حفظ معلومات المستخدم
    if (authResponse.user) {
      localStorage.setItem("user", JSON.stringify(authResponse.user));
      this.currentUserSubject.next(authResponse.user);
    } else {
      // إذا لم يكن هناك user object، استخرجه من التوكن
      try {
        const decoded: any = jwtDecode(authResponse.token);
        const user: IUser = {
          id: Number(decoded?.nameid || decoded?.sub || decoded?.id),
          userName: decoded?.unique_name || decoded?.username || '',
          email: decoded?.email || authResponse.email || '',
          fullName: decoded?.fullName || decoded?.name || authResponse.fullName || '',
          phone : decoded?.phone || authResponse.phone || '',
          isActive: true,
          createdAt: new Date(decoded?.iat * 1000),
          roles: decoded?.role ? [decoded.role] : decoded?.roles || []
        };
        localStorage.setItem("user", JSON.stringify(user));
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }

  getUserIdFromToken(): number | null {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const decoded: any = jwtDecode(token);
      return Number(decoded?.nameid || decoded?.sub || decoded?.id);
    } catch {
      return null;
    }
  }

  // طريقة جديدة للحصول على userId من المستخدم الحالي
  getCurrentUserId(): number | null {
    const currentUser = this.getCurrentUser();
    if (currentUser?.id) {
      return currentUser.id;
    }

    // إذا لم يكن هناك currentUser، جرب من التوكن
    return this.getUserIdFromToken();
  }
}
