import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class DeliveryGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const token = localStorage.getItem('token');
    const userRoles = localStorage.getItem('userRoles');

    if (!token) {
      this.router.navigate(['/login']);
      return false;
    }

    if (userRoles && userRoles.includes('Delivery')) {
      // إذا كان المستخدم موظف توصيل، تأكد من أنه في صفحات التوصيل فقط
      const currentPath = route.routeConfig?.path || '';
      
      // السماح فقط بصفحات التوصيل
      if (currentPath.startsWith('delivery/') || currentPath === 'delivery') {
        return true;
      } else {
        // إذا حاول الوصول لأي صفحة أخرى، توجيه للوحة تحكم التوصيل
        this.router.navigate(['/delivery/dashboard']);
        return false;
      }
    }

    this.router.navigate(['/login']);
    return false;
  }
} 