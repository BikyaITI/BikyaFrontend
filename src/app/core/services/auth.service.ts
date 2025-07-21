import { Injectable } from "@angular/core"
import  { HttpClient } from "@angular/common/http"
import { BehaviorSubject,  Observable, tap } from "rxjs"
import  { ApiResponse } from "../models/api-response.model"
import  { User, LoginRequest, RegisterRequest, AuthResponse } from "../models/user.model"
import { environment } from "../../../environments/environment"

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/api/Identity/Auth`
  private currentUserSubject = new BehaviorSubject<User | null>(null)
  public currentUser$ = this.currentUserSubject.asObservable()

  constructor(private http: HttpClient) {
    this.loadUserFromStorage()
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

  getProfile(): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.API_URL}/profile`)
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

  getCurrentUser(): User | null {
    return this.currentUserSubject.value
  }

  private setCurrentUser(authResponse: AuthResponse): void {
    localStorage.setItem("token", authResponse.token)
    localStorage.setItem("refreshToken", authResponse.refreshToken)
    localStorage.setItem("user", JSON.stringify(authResponse.user))
    this.currentUserSubject.next(authResponse.user)
  }

  private loadUserFromStorage(): void {
    const userStr = localStorage.getItem("user")
    let user = null
    if (userStr && userStr !== "undefined" && userStr !== "null") {
      try {
        user = JSON.parse(userStr)
      } catch (e) {
        user = null
      }
    }
    this.currentUserSubject.next(user)
  }
}
