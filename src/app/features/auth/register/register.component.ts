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
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  registerForm: FormGroup
  isLoading = false
  errorMessage = ""
  successMessage = ""
  showPassword = false
  userTypes = [
    { label: 'User', value: 'User' },
    { label: 'Admin', value: 'Admin' }
  ]

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.registerForm = this.fb.group(
      {
        fullName: ["", Validators.required],
        email: ["", [Validators.required, Validators.email]],
        phone: ["", Validators.required],
        userType: ["User", Validators.required],
        password: ["", [Validators.required, Validators.minLength(8)]],
        confirmPassword: ["", Validators.required],
        agreeTerms: [false, Validators.requiredTrue],
        adminRegistrationCode: [""] // Only required if userType is Admin
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
      this.successMessage = ""

      const registerRequest: any = {
        fullName: this.registerForm.get("fullName")?.value,
        email: this.registerForm.get("email")?.value,
        phoneNumber: this.registerForm.get("phone")?.value,
        password: this.registerForm.get("password")?.value,
        confirmPassword: this.registerForm.get("confirmPassword")?.value,
        userType: this.registerForm.get("userType")?.value,
      }
      if (registerRequest.userType === 'Admin') {
        registerRequest.adminRegistrationCode = this.registerForm.get("adminRegistrationCode")?.value
      }

      this.authService.register(registerRequest).subscribe({
        next: (response) => {
          this.isLoading = false
          if (response.success && response.data && response.data.user) {
            const user = response.data.user;
            if (user.roles) {
              const roles: string[] = user.roles;
              if (roles.includes('Admin')) {
                this.router.navigate(['/dashboard']);
              } else {
                this.router.navigate(['/home']);
              }
            } else {
              // إذا لم ترجع الأدوار، أبقِ رسالة التفعيل
              this.successMessage = 'Registration successful! Please check your email to verify your account before logging in.';
              this.registerForm.reset({ userType: 'User', agreeTerms: false, fullName: '' });
            }
          } else {
            this.errorMessage = response.message || 'Registration failed. Please try again.'
          }
        },
        error: (error) => {
          this.isLoading = false
          console.log('Register error:', error); // Debug: print backend error for registration
          this.errorMessage = error?.error?.message || 'Registration failed. Please try again.'
        },
      })
    }
  }
}
