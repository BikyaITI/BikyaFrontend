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
  template: `
    <div class="container-fluid vh-100">
      <div class="row h-100">
        <!-- Left Side - Image/Branding -->
        <div class="col-lg-6 d-none d-lg-flex align-items-center justify-content-center"
             style="background: var(--gradient-primary);">
          <div class="text-center text-white">
            <div class="logo-container-large mb-4" style="width: 120px; height: 120px; margin: 0 auto;">
              <i class="fas fa-baby-carriage" style="font-size: 3rem;"></i>
            </div>
            <h1 class="display-4 fw-bold mb-3">Bikya</h1>
            <p class="lead mb-4">Your trusted marketplace for quality used children's products</p>
            <div class="features-list">
              <div class="feature-item mb-3 d-flex align-items-center justify-content-center">
                <i class="fas fa-shield-alt me-3"></i>
                <span>Safe & Secure Shopping</span>
              </div>
              <div class="feature-item mb-3 d-flex align-items-center justify-content-center">
                <i class="fas fa-heart me-3"></i>
                <span>Quality Guaranteed</span>
              </div>
              <div class="feature-item d-flex align-items-center justify-content-center">
                <i class="fas fa-users me-3"></i>
                <span>Trusted Community</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Side - Login Form -->
        <div class="col-lg-6 d-flex align-items-center justify-content-center">
          <div class="w-100" style="max-width: 400px;">
            <div class="text-center mb-4 d-lg-none">
              <div class="logo-container mb-3 mx-auto">
                <i class="fas fa-baby-carriage"></i>
              </div>
              <h2 class="brand-name">Bikya</h2>
            </div>

            <div class="card shadow-lg border-0 rounded-4">
              <div class="card-body p-5">
                <h3 class="text-center mb-4">Welcome Back!</h3>

                <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
                  <div class="mb-3">
                    <label for="email" class="form-label">Email Address</label>
                    <div class="input-group">
                      <span class="input-group-text bg-light border-end-0">
                        <i class="fas fa-envelope text-muted"></i>
                      </span>
                      <input
                        type="email"
                        class="form-control border-start-0"
                        id="email"
                        formControlName="email"
                        [class.is-invalid]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched">
                      <div class="invalid-feedback">
                        Please enter a valid email address.
                      </div>
                    </div>
                  </div>

                  <div class="mb-3">
                    <label for="password" class="form-label">Password</label>
                    <div class="input-group">
                      <span class="input-group-text bg-light border-end-0">
                        <i class="fas fa-lock text-muted"></i>
                      </span>
                      <input
                        [type]="showPassword ? 'text' : 'password'"
                        class="form-control border-start-0"
                        id="password"
                        formControlName="password"
                        [class.is-invalid]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
                      <button
                        class="btn btn-outline-secondary border-start-0"
                        type="button"
                        (click)="togglePassword()">
                        <i [class]="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                      </button>
                      <div class="invalid-feedback">
                        Password is required.
                      </div>
                    </div>
                  </div>

                  <div class="mb-3 form-check">
                    <input type="checkbox" class="form-check-input" id="rememberMe">
                    <label class="form-check-label" for="rememberMe">
                      Remember me
                    </label>
                  </div>

                  <div class="error-message mb-3" *ngIf="errorMessage">
                    {{errorMessage}}
                  </div>

                  <div class="d-grid mb-3">
                    <button
                      type="submit"
                      class="btn btn-primary btn-lg rounded-pill"
                      [disabled]="loginForm.invalid || isLoading">
                      <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                      <i class="fas fa-sign-in-alt me-2" *ngIf="!isLoading"></i>
                      {{isLoading ? 'Signing In...' : 'Sign In'}}
                    </button>
                  </div>

                  <div class="text-center">
                    <a href="#" class="text-decoration-none">Forgot your password?</a>
                  </div>
                </form>

                <hr class="my-4">

                <div class="text-center">
                  <p class="mb-2">Don't have an account?</p>
                  <a routerLink="/register" class="btn btn-outline-primary rounded-pill">
                    <i class="fas fa-user-plus me-2"></i>Create Account
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
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
        this.isLoading = false;
        if (response.success) {
          const userId = response.data?.user.id; // تأكد إن ده المسار الصحيح للـ ID
          if (userId) {
            this.router.navigate(['/profile', userId]);
          } else {
            this.errorMessage = "User ID not found in response.";
          }
        } else {
          this.errorMessage = response.message;
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = "Login failed. Please try again.";
      },
    });
  }
}

}
