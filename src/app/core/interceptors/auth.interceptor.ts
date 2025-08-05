import { HttpInterceptorFn, HttpErrorResponse } from "@angular/common/http"
import { inject } from "@angular/core"
import { AuthService } from "../services/auth.service"
import { catchError, switchMap, throwError } from "rxjs"
import { Router } from "@angular/router"

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService)
  const router = inject(Router)
  const token = authService.getToken()

  // Skip auth for login, register, and public endpoints
  const skipAuth = req.url.includes('/login') || 
                   req.url.includes('/register') || 
                   req.url.includes('/forgot-password') ||
                   req.url.includes('/reset-password') ||
                   req.url.includes('/verify-email') 
                  //  req.url.includes('/approved') // Public product endpoints

  if (token && !skipAuth) {
    const authReq = req.clone({
      headers: req.headers.set("Authorization", `Bearer ${token}`),
    })

    return next(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Token expired or invalid, try to refresh
          const refreshToken = localStorage.getItem('refreshToken')
          if (refreshToken) {
            return authService.refreshToken(refreshToken).pipe(
              switchMap((response) => {
                if (response.success) {
                  // Retry the original request with new token
                  const newAuthReq = req.clone({
                    headers: req.headers.set("Authorization", `Bearer ${response.data.token}`),
                  })
                  return next(newAuthReq)
                } else {
                  // Refresh failed, logout and redirect
                  authService.logout()
                  router.navigate(['/login'])
                  return throwError(() => error)
                }
              }),
              catchError(() => {
                // Refresh failed, logout and redirect
                authService.logout()
                router.navigate(['/login'])
                return throwError(() => error)
              })
            )
          } else {
            // No refresh token, logout and redirect
            authService.logout()
            router.navigate(['/login'])
          }
        }
        return throwError(() => error)
      })
    )
  }

  return next(req)
}
