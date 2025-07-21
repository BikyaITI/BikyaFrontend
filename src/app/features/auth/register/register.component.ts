import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ReactiveFormsModule,  FormBuilder,  FormGroup, Validators } from "@angular/forms"
import {  Router, RouterModule } from "@angular/router"
import  { AuthService } from "../../../core/services/auth.service"
import  { RegisterRequest } from "../../../core/models/user.model"

@Component({
  selector: "app-register",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="container-fluid vh-100">
      <div class="row h-100">
        <!-- Left Side - Registration Form -->
        <div class="col-lg-6 d-flex align-items-center justify-content-center">
          <div class="w-100" style="max-width: 450px;">
            <div class="text-center mb-4 d-lg-none">
              <div class="logo-container mb-3 mx-auto">
                <i class="fas fa-baby-carriage"></i>
              </div>
              <h2 class="brand-name">Bikya</h2>
            </div>

            <div class="card shadow-lg border-0 rounded-4">
              <div class="card-body p-5">
                <h3 class="text-center mb-4">Create Your Account</h3>

                <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label for="firstName" class="form-label">First Name</label>
                      <div class="input-group">
                        <span class="input-group-text bg-light border-end-0">
                          <i class="fas fa-user text-muted"></i>
                        </span>
                        <input
                          type="text"
                          class="form-control border-start-0"
                          id="firstName"
                          formControlName="firstName"
                          [class.is-invalid]="registerForm.get('firstName')?.invalid && registerForm.get('firstName')?.touched">
                        <div class="invalid-feedback">
                          First name is required.
                        </div>
                      </div>
                    </div>
                    <div class="col-md-6 mb-3">
                      <label for="lastName" class="form-label">Last Name</label>
                      <div class="input-group">
                        <span class="input-group-text bg-light border-end-0">
                          <i class="fas fa-user text-muted"></i>
                        </span>
                        <input
                          type="text"
                          class="form-control border-start-0"
                          id="lastName"
                          formControlName="lastName"
                          [class.is-invalid]="registerForm.get('lastName')?.invalid && registerForm.get('lastName')?.touched">
                        <div class="invalid-feedback">
                          Last name is required.
                        </div>
                      </div>
                    </div>
                  </div>

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
                        [class.is-invalid]="registerForm.get('email')?.invalid && registerForm.get('email')?.touched">
                      <div class="invalid-feedback">
                        Please enter a valid email address.
                      </div>
                    </div>
                  </div>

                  <div class="mb-3">
                    <label for="phone" class="form-label">Phone Number</label>
                    <div class="input-group">
                      <span class="input-group-text bg-light border-end-0">
                        <i class="fas fa-phone text-muted"></i>
                      </span>
                      <input
                        type="tel"
                        class="form-control border-start-0"
                        id="phone"
                        formControlName="phone"
                        [class.is-invalid]="registerForm.get('phone')?.invalid && registerForm.get('phone')?.touched">
                      <div class="invalid-feedback">
                        Phone number is required.
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
                        [class.is-invalid]="registerForm.get('password')?.invalid && registerForm.get('password')?.touched">
                      <button
                        class="btn btn-outline-secondary border-start-0"
                        type="button"
                        (click)="togglePassword()">
                        <i [class]="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                      </button>
                      <div class="invalid-feedback">
                        Password must be at least 8 characters long.
                      </div>
                    </div>
                    <div class="form-text">
                      Password must be at least 8 characters long.
                    </div>
                  </div>

                  <div class="mb-3">
                    <label for="confirmPassword" class="form-label">Confirm Password</label>
                    <div class="input-group">
                      <span class="input-group-text bg-light border-end-0">
                        <i class="fas fa-lock text-muted"></i>
                      </span>
                      <input
                        type="password"
                        class="form-control border-start-0"
                        id="confirmPassword"
                        formControlName="confirmPassword"
                        [class.is-invalid]="registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched">
                      <div class="invalid-feedback">
                        Passwords do not match.
                      </div>
                    </div>
                  </div>

                  <div class="mb-3 form-check">
                    <input
                      type="checkbox"
                      class="form-check-input"
                      id="agreeTerms"
                      formControlName="agreeTerms"
                      [class.is-invalid]="registerForm.get('agreeTerms')?.invalid && registerForm.get('agreeTerms')?.touched">
                    <label class="form-check-label" for="agreeTerms">
                      I agree to the <a href="#" class="text-decoration-none">Terms of Service</a> and <a href="#" class="text-decoration-none">Privacy Policy</a>
                    </label>
                    <div class="invalid-feedback">
                      You must agree to the terms and conditions.
                    </div>
                  </div>

                  <div class="error-message mb-3" *ngIf="errorMessage">
                    {{errorMessage}}
                  </div>

                  <div class="d-grid mb-3">
                    <button
                      type="submit"
                      class="btn btn-primary btn-lg rounded-pill"
                      [disabled]="registerForm.invalid || isLoading">
                      <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                      <i class="fas fa-user-plus me-2" *ngIf="!isLoading"></i>
                      {{isLoading ? 'Creating Account...' : 'Create Account'}}
                    </button>
                  </div>
                </form>

                <hr class="my-4">

                <div class="text-center">
                  <p class="mb-2">Already have an account?</p>
                  <a routerLink="/login" class="btn btn-outline-primary rounded-pill">
                    <i class="fas fa-sign-in-alt me-2"></i>Sign In
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Side - Image/Branding -->
        <div class="col-lg-6 d-none d-lg-flex align-items-center justify-content-center"
             style="background: var(--gradient-secondary);">
          <div class="text-center text-white">
            <div class="logo-container-large mb-4" style="width: 120px; height: 120px; margin: 0 auto;">
              <i class="fas fa-baby-carriage" style="font-size: 3rem;"></i>
            </div>
            <h1 class="display-4 fw-bold mb-3">Join Bikya Today</h1>
            <p class="lead mb-4">Start buying and selling quality used children's products in our trusted community</p>
            <div class="features-list">
              <div class="feature-item mb-3 d-flex align-items-center justify-content-center">
                <i class="fas fa-shopping-cart me-3"></i>
                <span>Easy Buying & Selling</span>
              </div>
              <div class="feature-item mb-3 d-flex align-items-center justify-content-center">
                <i class="fas fa-star me-3"></i>
                <span>Quality Products</span>
              </div>
              <div class="feature-item d-flex align-items-center justify-content-center">
                <i class="fas fa-handshake me-3"></i>
                <span>Trusted Transactions</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  registerForm: FormGroup
  isLoading = false
  errorMessage = ""
  showPassword = false

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.registerForm = this.fb.group(
      {
        firstName: ["", Validators.required],
        lastName: ["", Validators.required],
        email: ["", [Validators.required, Validators.email]],
        phone: ["", Validators.required],
        password: ["", [Validators.required, Validators.minLength(8)]],
        confirmPassword: ["", Validators.required],
        agreeTerms: [false, Validators.requiredTrue],
      },
      { validators: this.passwordMatchValidator },
    )
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get("password")
    const confirmPassword = form.get("confirmPassword")

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true })
    } else if (confirmPassword?.errors?.["passwordMismatch"]) {
      confirmPassword.setErrors(null)
    }

    return null
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true
      this.errorMessage = ""

      const registerRequest: RegisterRequest = {
        fullName: `${this.registerForm.get("firstName")?.value} ${this.registerForm.get("lastName")?.value}`,
        email: this.registerForm.get("email")?.value,
        password: this.registerForm.get("password")?.value,
        confirmPassword: this.registerForm.get("confirmPassword")?.value,
      }

      this.authService.register(registerRequest).subscribe({
        next: (response) => {
          this.isLoading = false
          if (response.success) {
            this.router.navigate(["/dashboard"])
          } else {
            this.errorMessage = response.message
          }
        },
        error: (error) => {
          this.isLoading = false
          this.errorMessage = "Registration failed. Please try again."
        },
      })
    }
  }
}
