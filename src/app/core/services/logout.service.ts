import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class LogoutService {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  /**
   * تسجيل الخروج مع إرسال طلب للباكند
   */
  logout(): void {
    this.authService.logout().subscribe({
      next: (response) => {
        console.log('Logout successful:', response);
        this.router.navigate(['/logout']);
      },
      error: (error) => {
        console.error('Logout error:', error);
        // حتى لو فشل الباكند، نمسح البيانات المحلية وننتقل للـ logout page
        this.authService.logoutLocal();
        this.router.navigate(['/logout']);
      }
    });
  }

  /**
   * تسجيل الخروج المحلي فقط (بدون إرسال طلب للباكند)
   */
  logoutLocal(): void {
    this.authService.logoutLocal();
    this.router.navigate(['/logout']);
  }

  /**
   * تسجيل الخروج مع إعادة توجيه لصفحة معينة
   */
  logoutAndRedirect(redirectPath: string): void {
    this.authService.logout().subscribe({
      next: (response) => {
        console.log('Logout successful:', response);
        this.router.navigate([redirectPath]);
      },
      error: (error) => {
        console.error('Logout error:', error);
        this.authService.logoutLocal();
        this.router.navigate([redirectPath]);
      }
    });
  }
} 
