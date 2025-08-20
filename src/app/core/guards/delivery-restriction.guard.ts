import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class DeliveryRestrictionGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const token = localStorage.getItem('token');
    const userRoles = localStorage.getItem('userRoles');
    const currentPath = route.routeConfig?.path || '';

    // السماح دائماً بصفحات المصادقة (login, register, forgot-password, reset-password, verify-email)
    const publicAuthPaths = ['login', 'register', 'forgot-password', 'reset-password', 'verify-email'];
    if (publicAuthPaths.includes(currentPath)) {
      return true;
    }

    // // إذا لم يكن هناك توكن، توجيه لصفحة تسجيل الدخول
    // if (!token) {
    //   this.router.navigate(['/login']);
    //   return false;
    // }

    // إذا كان المستخدم موظف توصيل، منع الوصول لجميع الصفحات غير التوصيل
    if (userRoles && userRoles.includes('Delivery')) {
      // السماح فقط بصفحات التوصيل
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