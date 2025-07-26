import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule],
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.scss'],
})
export class VerifyEmailComponent implements OnInit {
  isLoading = true;
  success = false;
  successMessage = '';
  errorMessage = '';

  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    const email = this.route.snapshot.queryParamMap.get('email');
    if (token && email) {
      this.authServiceVerifyEmail(token, email);
    } else {
      this.isLoading = false;
      this.errorMessage = 'Invalid verification link.';
    }
  }

  private authServiceVerifyEmail(token: string, email: string): void {
    // You may want to add this method to AuthService for better structure
    this.authService['http'].post<{
      success: boolean;
      message?: string;
    }>(
      `${this.authService['API_URL']}/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`,
      {}
    ).subscribe({
      next: (response: { success: boolean; message?: string }) => {
        this.isLoading = false;
        if (response.success) {
          this.success = true;
          this.successMessage = response.message || 'Your email has been verified successfully!';
        } else {
          this.errorMessage = response.message || 'Email verification failed.';
        }
      },
      error: (error: unknown) => {
        this.isLoading = false;
        if (typeof error === 'object' && error !== null && 'error' in error && typeof (error as any).error?.message === 'string') {
          this.errorMessage = (error as { error: { message: string } }).error.message;
        } else {
          this.errorMessage = 'Email verification failed.';
        }
      }
    });
  }
} 