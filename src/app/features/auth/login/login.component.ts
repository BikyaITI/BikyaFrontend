import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from "@angular/forms"
import { Router, RouterModule } from "@angular/router"
import { AuthService } from "../../../core/services/auth.service"
import { LoginRequest } from "../../../core/models/user.model"

@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  loginForm: FormGroup
  isLoading = false
  errorMessage = ""
  successMessage = ''
  showPassword = false
  isDeactivated: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.loginForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", Validators.required],
    })
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = "";

      const loginRequest: LoginRequest = this.loginForm.value;

      this.authService.login(loginRequest).subscribe({
        next: (response) => {
          console.log('Login response:', response); // Debug: print the backend response
          this.isLoading = false;
          const data: any = response.data;
          if (response.success && data && data.userId) {
            // Redirect based on role
            const roles: string[] = data.roles || [];
            if (roles.includes('Admin')) {
              this.router.navigate(['/dashboard']);
            } else {
              this.router.navigate(['/home']);
            }
          } else if (!response.success) {
            // Check for unverified email error
            if (
              response.message?.toLowerCase().includes('verify your email') ||
              response.message?.toLowerCase().includes('email not verified')
            ) {
              this.errorMessage =
                'Please verify your email address before logging in. Check your inbox for the verification email.';
            } else {
              this.errorMessage = response.message || 'Login failed. Please try again.';
            }
          } else {
            this.errorMessage = "User ID not found in response. Please contact support.";
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.successMessage = ''; // ✅ امسحي أي رسالة نجاح فورا

          const backendMsg = error?.error?.message?.toLowerCase();

          if (error.status === 403) {
            this.errorMessage = 'Your account is deactivated.';
            this.isDeactivated = true;
          } else if (backendMsg?.includes('verify your email')) {
            this.errorMessage = 'Please verify your email.';
          } else {
            this.errorMessage = backendMsg || 'Login failed. Please try again.';
          }
        }




      });
    }

  }


  reactivateAccount(): void {
    const email = this.loginForm.get('email')?.value;

    if (email) {
      this.authService.reactivateAccount(email).subscribe({
        next: (res) => {
          this.errorMessage = '';
          this.successMessage = 'Your account has been reactivated. Please login.';
          this.isDeactivated = false;
        },
        error: (err) => {
          this.successMessage = '';  // ✅ امسحي رسالة النجاح
          this.errorMessage = 'Failed to reactivate account.';
        }
      });
    }
  }


}
