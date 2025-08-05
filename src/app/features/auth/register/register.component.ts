import { Component, OnInit } from "@angular/core"
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
export class RegisterComponent implements OnInit {
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
    console.log('RegisterComponent constructor called');
    
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

    console.log('Form created:', {
      valid: this.registerForm.valid,
      dirty: this.registerForm.dirty,
      touched: this.registerForm.touched,
      errors: this.registerForm.errors,
      values: this.registerForm.value
    });

    // مراقب لتغيير نوع المستخدم
    this.registerForm.get('userType')?.valueChanges.subscribe(userType => {
      console.log('User type changed to:', userType);
      const adminCodeControl = this.registerForm.get('adminRegistrationCode');
      if (userType === 'Admin') {
        adminCodeControl?.setValidators([Validators.required]);
      } else {
        adminCodeControl?.clearValidators();
      }
      adminCodeControl?.updateValueAndValidity();
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get("password")
    const confirmPassword = form.get("confirmPassword")

    console.log('Password validator called:', {
      password: password?.value,
      confirmPassword: confirmPassword?.value,
      match: password?.value === confirmPassword?.value
    });

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true })
      return { passwordMismatch: true }
    } else if (confirmPassword?.errors?.["passwordMismatch"]) {
      confirmPassword.setErrors(null)
    }

    return null
  }

  ngOnInit(): void {
    console.log('RegisterComponent initialized');
    console.log('Initial form state:', {
      valid: this.registerForm.valid,
      dirty: this.registerForm.dirty,
      touched: this.registerForm.touched,
      errors: this.registerForm.errors,
      values: this.registerForm.value
    });
    
    // مراقب لحالة النموذج للتشخيص
    this.registerForm.statusChanges.subscribe(status => {
      console.log('Form status changed:', status);
      console.log('Form valid:', this.registerForm.valid);
      console.log('Form errors:', this.registerForm.errors);
    });

    // مراقب لقيم النموذج للتشخيص
    this.registerForm.valueChanges.subscribe(values => {
      console.log('Form values changed:', values);
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword
  }

  debugForm(): void {
    console.log('=== FORM DEBUG ===');
    console.log('Form valid:', this.registerForm.valid);
    console.log('Form dirty:', this.registerForm.dirty);
    console.log('Form touched:', this.registerForm.touched);
    console.log('Form errors:', this.registerForm.errors);
    console.log('Form values:', this.registerForm.value);
    
    // Check each field
    const fields = ['fullName', 'email', 'phone', 'userType', 'password', 'confirmPassword', 'agreeTerms', 'adminRegistrationCode'];
    fields.forEach(field => {
      const control = this.registerForm.get(field);
      console.log(`${field}:`, {
        value: control?.value,
        valid: control?.valid,
        dirty: control?.dirty,
        touched: control?.touched,
        errors: control?.errors
      });
    });
  }

  onSubmit(): void {
    console.log('Register form submitted'); // Debug
    console.log('Form valid:', this.registerForm.valid); // Debug
    console.log('Form errors:', this.registerForm.errors); // Debug
    
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
      
      console.log('Register request:', registerRequest); // Debug

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
