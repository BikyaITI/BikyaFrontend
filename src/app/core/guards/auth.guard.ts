import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const token = localStorage.getItem('token');
    const userRoles = localStorage.getItem('userRoles');

    if (!token) {
      this.router.navigate(['/login']);
      return false;
    }

    // إذا كان المستخدم موظف توصيل، توجيه للوحة تحكم التوصيل
    if (userRoles && userRoles.includes('Delivery')) {
      const currentPath = route.routeConfig?.path || '';
      
      // إذا كان في صفحة توصيل، السماح
      if (currentPath.startsWith('delivery/') || currentPath === 'delivery') {
        return true;
      } else {
        // إذا حاول الوصول لأي صفحة أخرى، توجيه للوحة تحكم التوصيل
        this.router.navigate(['/delivery/dashboard']);
        return false;
      }
    }

    return true;
  }
}
