import { Injectable } from "@angular/core"
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router"
import { AuthService } from "../services/auth.service"
import { Observable, of } from "rxjs"
import { map, catchError } from "rxjs/operators"
import { jwtDecode } from 'jwt-decode'

@Injectable({
  providedIn: "root",
})
export class AdminGuard implements CanActivate {
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

    // Check if user is authenticated and has admin role
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
                return this.checkAdminRole(response.data.token)
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

      // Token is valid, check admin role
      return this.checkAdminRole(token)
    } catch (error) {
      // Invalid token
      this.authService.logout()
      this.router.navigate(["/login"], { queryParams: { returnUrl: state.url } })
      return false
    }
  }

  private checkAdminRole(token: string): boolean {
    try {
      const decoded: any = jwtDecode(token)
      const roles = decoded.role || decoded.roles || []
      const userRoles = Array.isArray(roles) ? roles : [roles]
      
      if (userRoles.includes('Admin')) {
        return true
      } else {
        // User is authenticated but not admin
        this.router.navigate(["/dashboard"], { 
          queryParams: { error: 'Access denied. Admin privileges required.' } 
        })
        return false
      }
    } catch (error) {
      this.router.navigate(["/login"])
      return false
    }
  }
}
