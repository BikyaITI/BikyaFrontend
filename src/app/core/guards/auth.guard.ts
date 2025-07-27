import { Injectable } from "@angular/core"
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router"
import { AuthService } from "../services/auth.service"
import { Observable, of } from "rxjs"
import { map, catchError } from "rxjs/operators"
import { jwtDecode } from 'jwt-decode'

@Injectable({
  providedIn: "root",
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    const token = this.authService.getToken()
    
    if (!token) {
      this.router.navigate(["/login"], { queryParams: { returnUrl: state.url } })
      return false
    }

    // Check if token is expired
    try {
      const decoded: any = jwtDecode(token)
      const currentTime = Date.now() / 1000
      
      if (decoded.exp < currentTime) {
        // Token expired, try to refresh
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          return this.authService.refreshToken(refreshToken).pipe(
            map(response => {
              if (response.success) {
                return true
              } else {
                this.authService.logout()
                this.router.navigate(["/login"], { queryParams: { returnUrl: state.url } })
                return false
              }
            }),
            catchError(() => {
              this.authService.logout()
              this.router.navigate(["/login"], { queryParams: { returnUrl: state.url } })
              return of(false)
            })
          )
        } else {
          this.authService.logout()
          this.router.navigate(["/login"], { queryParams: { returnUrl: state.url } })
          return false
        }
      }
    } catch (error) {
      // Invalid token
      this.authService.logout()
      this.router.navigate(["/login"], { queryParams: { returnUrl: state.url } })
      return false
    }

    return true
  }
}
