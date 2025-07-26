import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ReactiveFormsModule,  FormBuilder,  FormGroup, Validators } from "@angular/forms"
import {  Router, RouterModule } from "@angular/router"
import  { AuthService } from "../../../core/services/auth.service"
import  { LoginRequest } from "../../../core/models/user.model"

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
  showPassword = false

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
          // Try to extract backend error message
          const backendMsg = error?.error?.message;
          if (
            backendMsg?.toLowerCase().includes('verify your email') ||
            backendMsg?.toLowerCase().includes('email not verified')
          ) {
            this.errorMessage =
              'Please verify your email address before logging in. Check your inbox for the verification email.';
          } else {
            this.errorMessage = backendMsg || 'Login failed. Please try again.';
          }
        },
      });
    }
  }
}
