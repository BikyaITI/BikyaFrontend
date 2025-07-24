import { inject, Injectable } from "@angular/core"
import  { HttpClient } from "@angular/common/http"
import { BehaviorSubject,  Observable, tap } from "rxjs"
import  { ApiResponse } from "../models/api-response.model"
import  {  LoginRequest, RegisterRequest, AuthResponse, IUser } from "../models/user.model"
import { environment } from "../../../environments/environment"
import { jwtDecode } from 'jwt-decode'; 

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/api/Identity/Auth`
  private currentUserSubject = new BehaviorSubject<IUser | null>(null)
  public currentUser$ = this.currentUserSubject.asObservable()
  public http =inject(HttpClient)

 constructor() {
    const token = localStorage.getItem('token');
    if (token) {
      const user = jwtDecode<IUser>(token);
      this.currentUserSubject.next(user);
    }
  }
  login(request: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.API_URL}/login`, request).pipe(
      tap((response) => {
        if (response.success) {
          this.setCurrentUser(response.data)
        }
      }),
    )
  }

  register(request: RegisterRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.API_URL}/register`, request).pipe(
      tap((response) => {
        if (response.success) {
          this.setCurrentUser(response.data)
        }
      }),
    )
  }

  getProfile(): Observable<ApiResponse<IUser>> {
    return this.http.get<ApiResponse<IUser>>(`${this.API_URL}/profile`)
  }

  logout(): void {
    localStorage.removeItem("token")
    localStorage.removeItem("refreshToken")
    localStorage.removeItem("user")
    this.currentUserSubject.next(null)
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem("token")
  }

  getToken(): string | null {
    return localStorage.getItem("token")
  }

  getCurrentUser(): IUser | null {
    return this.currentUserSubject.value
  }

  private setCurrentUser(authResponse: AuthResponse): void {
    localStorage.setItem("token", authResponse.token)
    localStorage.setItem("refreshToken", authResponse.refreshToken)
    localStorage.setItem("user", JSON.stringify(authResponse.user))
    this.currentUserSubject.next(authResponse.user)
  }


  getUserIdFromToken(): number | null {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const decoded: any = jwtDecode(token);
      return Number(decoded?.nameid); // أو sub أو id حسب التوكن بتاعك
    } catch {
      return null;
    }
  }
  // private loadUserFromStorage(): void {
  //   const userStr = localStorage.getItem("user")
  //   let user = null
  //   if (userStr && userStr !== "undefined" && userStr !== "null") {
  //     try {
  //       user = JSON.parse(userStr)
  //     } catch (e) {
  //       user = null
  //     }
  //   }
  //   this.currentUserSubject.next(user)
  // }

}
