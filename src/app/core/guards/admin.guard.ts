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
    console.log('AdminGuard: Checking access to', state.url); // Debug
    const token = this.authService.getToken()
    
    if (!token) {
      console.log('AdminGuard: No token found, redirecting to login'); // Debug
      this.router.navigate(["/login"], { queryParams: { returnUrl: state.url } })
      return false
    }

    // Check if user is authenticated and has admin role
    try {
      const decoded: any = jwtDecode(token)
      console.log('AdminGuard: Decoded token:', decoded); // Debug
      const currentTime = Date.now() / 1000
      
      if (decoded.exp < currentTime) {
        console.log('AdminGuard: Token expired, trying to refresh'); // Debug
        // Token expired, try to refresh
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          return this.authService.refreshToken(refreshToken).pipe(
            map(response => {
              console.log('AdminGuard: Token refresh response:', response); // Debug
              if (response.success) {
                return this.checkAdminRole(response.data.token)
              } else {
                console.log('AdminGuard: Token refresh failed, logging out'); // Debug
                this.authService.logout()
                this.router.navigate(["/login"], { queryParams: { returnUrl: state.url } })
                return false
              }
            }),
            catchError((error) => {
              console.log('AdminGuard: Token refresh error:', error); // Debug
              this.authService.logout()
              this.router.navigate(["/login"], { queryParams: { returnUrl: state.url } })
              return of(false)
            })
          )
        } else {
          console.log('AdminGuard: No refresh token, logging out'); // Debug
          this.authService.logout()
          this.router.navigate(["/login"], { queryParams: { returnUrl: state.url } })
          return false
        }
      }

      // Token is valid, check admin role
      console.log('AdminGuard: Token is valid, checking admin role'); // Debug
      return this.checkAdminRole(token)
    } catch (error) {
      console.log('AdminGuard: Invalid token error:', error); // Debug
      // Invalid token
      this.authService.logout()
      this.router.navigate(["/login"], { queryParams: { returnUrl: state.url } })
      return false
    }
  }

  private checkAdminRole(token: string): boolean {
    try {
      const decoded: any = jwtDecode(token)
      console.log('AdminGuard: Checking roles from token:', decoded); // Debug
      const roles = decoded.role || decoded.roles || []
      const userRoles = Array.isArray(roles) ? roles : [roles]
      console.log('AdminGuard: User roles:', userRoles); // Debug
      
      if (userRoles.includes('Admin')) {
        console.log('AdminGuard: User is admin, access granted'); // Debug
        return true
      } else if (userRoles.includes('Delivery')) {
        console.log('AdminGuard: User is delivery, redirecting to delivery dashboard'); // Debug
        // User is delivery, redirect to delivery dashboard
        this.router.navigate(["/delivery/dashboard"], { 
          queryParams: { error: 'Access denied. Admin privileges required.' } 
        })
        return false
      } else {
        console.log('AdminGuard: User is not admin, access denied'); // Debug
        // User is authenticated but not admin
        this.router.navigate(["/dashboard"], { 
          queryParams: { error: 'Access denied. Admin privileges required.' } 
        })
        return false
      }
    } catch (error) {
      console.log('AdminGuard: Error checking admin role:', error); // Debug
      this.router.navigate(["/login"])
      return false
    }
  }
}
