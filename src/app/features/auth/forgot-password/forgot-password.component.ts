import { Component, inject } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class ForgotPasswordComponent {
  forgotForm: FormGroup;
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  constructor() {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.forgotForm.valid) {
      this.isLoading = true;
      this.successMessage = '';
      this.errorMessage = '';
      const email = this.forgotForm.value.email;
      this.authService.forgotPassword(email).subscribe({
        next: (res: { success: boolean; message?: string }) => {
          this.isLoading = false;
          if (res.success) {
            this.successMessage = 'Reset link sent! Please check your email.';
            this.forgotForm.reset();
          } else {
            this.errorMessage = res.message || 'Failed to send reset link.';
          }
        },
        error: (err: { error?: { message?: string } } | unknown) => {
          this.isLoading = false;
          if (typeof err === 'object' && err !== null && 'error' in err && typeof (err as any).error?.message === 'string') {
            this.errorMessage = (err as { error: { message: string } }).error.message;
          } else {
            this.errorMessage = 'Failed to send reset link.';
          }
        }
      });
    }
  }
} 