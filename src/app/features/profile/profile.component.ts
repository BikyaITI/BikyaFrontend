import { Component,  OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ReactiveFormsModule,  FormBuilder,  FormGroup, Validators } from "@angular/forms"
import  { AuthService } from "../../core/services/auth.service"
import  { User, UpdateProfileRequest, ChangePasswordRequest } from "../../core/models/user.model"

@Component({
  selector: "app-profile",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container mt-4">
      <div class="row">
        <!-- Profile Sidebar -->
        <div class="col-md-4">
          <div class="card shadow-sm">
            <div class="card-body text-center">
              <div class="profile-avatar mb-3">
                <div class="bg-primary rounded-circle d-flex align-items-center justify-content-center mx-auto"
                     style="width: 120px; height: 120px;">
                  <i class="bi bi-person-fill text-white" style="font-size: 4rem;"></i>
                </div>
              </div>
              <h4 class="mb-1">{{currentUser?.fullName}}</h4>
              <p class="text-muted mb-3">{{currentUser?.email}}</p>
              <div class="d-grid gap-2">
                <button class="btn btn-outline-primary" (click)="setActiveTab('profile')">
                  <i class="bi bi-person"></i> Edit Profile
                </button>
                <button class="btn btn-outline-warning" (click)="setActiveTab('password')">
                  <i class="bi bi-lock"></i> Change Password
                </button>
                <button class="btn btn-outline-danger" (click)="setActiveTab('account')">
                  <i class="bi bi-gear"></i> Account Settings
                </button>
              </div>
            </div>
          </div>

          <!-- Quick Stats -->
          <div class="card shadow-sm mt-3">
            <div class="card-header">
              <h6 class="mb-0"><i class="bi bi-graph-up"></i> Account Stats</h6>
            </div>
            <div class="card-body">
              <div class="row text-center">
                <div class="col-6">
                  <h4 class="text-primary mb-0">{{userStats.totalProducts}}</h4>
                  <small class="text-muted">Products</small>
                </div>
                <div class="col-6">
                  <h4 class="text-success mb-0">{{userStats.totalOrders}}</h4>
                  <small class="text-muted">Orders</small>
                </div>
              </div>
              <hr>
              <div class="row text-center">
                <div class="col-6">
                  <h4 class="text-info mb-0">{{userStats.totalSales}}</h4>
                  <small class="text-muted">Sales</small>
                </div>
                <div class="col-6">
                  <h4 class="text-warning mb-0">4.8</h4>
                  <small class="text-muted">Rating</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content -->
        <div class="col-md-8">
          <!-- Profile Edit Tab -->
          <div class="card shadow-sm" *ngIf="activeTab === 'profile'">
            <div class="card-header">
              <h5 class="mb-0"><i class="bi bi-person"></i> Edit Profile</h5>
            </div>
            <div class="card-body">
              <form [formGroup]="profileForm" (ngSubmit)="updateProfile()">
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="fullName" class="form-label">Full Name *</label>
                    <input
                      type="text"
                      class="form-control"
                      id="fullName"
                      formControlName="fullName"
                      [class.is-invalid]="profileForm.get('fullName')?.invalid && profileForm.get('fullName')?.touched">
                    <div class="invalid-feedback">
                      Full name is required
                    </div>
                  </div>

                  <div class="col-md-6 mb-3">
                    <label for="email" class="form-label">Email *</label>
                    <input
                      type="email"
                      class="form-control"
                      id="email"
                      formControlName="email"
                      [class.is-invalid]="profileForm.get('email')?.invalid && profileForm.get('email')?.touched">
                    <div class="invalid-feedback">
                      Valid email is required
                    </div>
                  </div>
                </div>

                <div class="mb-3">
                  <label for="phone" class="form-label">Phone Number</label>
                  <input
                    type="tel"
                    class="form-control"
                    id="phone"
                    formControlName="phone"
                    placeholder="Enter your phone number">
                </div>

                <div class="mb-3">
                  <label for="address" class="form-label">Address</label>
                  <textarea
                    class="form-control"
                    id="address"
                    formControlName="address"
                    rows="3"
                    placeholder="Enter your address"></textarea>
                </div>

                <div class="mb-3">
                  <label for="bio" class="form-label">Bio</label>
                  <textarea
                    class="form-control"
                    id="bio"
                    formControlName="bio"
                    rows="4"
                    placeholder="Tell us about yourself..."
                    maxlength="500"></textarea>
                  <div class="form-text">
                    {{profileForm.get('bio')?.value?.length || 0}}/500 characters
                  </div>
                </div>

                <div class="alert alert-success" *ngIf="profileSuccessMessage">
                  <i class="bi bi-check-circle"></i> {{profileSuccessMessage}}
                </div>

                <div class="alert alert-danger" *ngIf="profileErrorMessage">
                  <i class="bi bi-exclamation-triangle"></i> {{profileErrorMessage}}
                </div>

                <button
                  type="submit"
                  class="btn btn-primary"
                  [disabled]="profileForm.invalid || isUpdatingProfile">
                  <span *ngIf="isUpdatingProfile" class="spinner-border spinner-border-sm me-2"></span>
                  {{isUpdatingProfile ? 'Updating...' : 'Update Profile'}}
                </button>
              </form>
            </div>
          </div>

          <!-- Change Password Tab -->
          <div class="card shadow-sm" *ngIf="activeTab === 'password'">
            <div class="card-header">
              <h5 class="mb-0"><i class="bi bi-lock"></i> Change Password</h5>
            </div>
            <div class="card-body">
              <form [formGroup]="passwordForm" (ngSubmit)="changePassword()">
                <div class="mb-3">
                  <label for="currentPassword" class="form-label">Current Password *</label>
                  <input
                    type="password"
                    class="form-control"
                    id="currentPassword"
                    formControlName="currentPassword"
                    [class.is-invalid]="passwordForm.get('currentPassword')?.invalid && passwordForm.get('currentPassword')?.touched">
                  <div class="invalid-feedback">
                    Current password is required
                  </div>
                </div>

                <div class="mb-3">
                  <label for="newPassword" class="form-label">New Password *</label>
                  <input
                    type="password"
                    class="form-control"
                    id="newPassword"
                    formControlName="newPassword"
                    [class.is-invalid]="passwordForm.get('newPassword')?.invalid && passwordForm.get('newPassword')?.touched">
                  <div class="invalid-feedback">
                    Password must be at least 6 characters long
                  </div>
                </div>

                <div class="mb-3">
                  <label for="confirmPassword" class="form-label">Confirm New Password *</label>
                  <input
                    type="password"
                    class="form-control"
                    id="confirmPassword"
                    formControlName="confirmPassword"
                    [class.is-invalid]="passwordForm.get('confirmPassword')?.invalid && passwordForm.get('confirmPassword')?.touched">
                  <div class="invalid-feedback">
                    Passwords do not match
                  </div>
                </div>

                <div class="alert alert-success" *ngIf="passwordSuccessMessage">
                  <i class="bi bi-check-circle"></i> {{passwordSuccessMessage}}
                </div>

                <div class="alert alert-danger" *ngIf="passwordErrorMessage">
                  <i class="bi bi-exclamation-triangle"></i> {{passwordErrorMessage}}
                </div>

                <button
                  type="submit"
                  class="btn btn-warning"
                  [disabled]="passwordForm.invalid || isChangingPassword">
                  <span *ngIf="isChangingPassword" class="spinner-border spinner-border-sm me-2"></span>
                  {{isChangingPassword ? 'Changing...' : 'Change Password'}}
                </button>
              </form>
            </div>
          </div>

          <!-- Account Settings Tab -->
          <div class="card shadow-sm" *ngIf="activeTab === 'account'">
            <div class="card-header">
              <h5 class="mb-0"><i class="bi bi-gear"></i> Account Settings</h5>
            </div>
            <div class="card-body">
              <div class="settings-section mb-4">
                <h6 class="text-primary">Notifications</h6>
                <div class="form-check form-switch mb-2">
                  <input class="form-check-input" type="checkbox" id="emailNotifications" checked>
                  <label class="form-check-label" for="emailNotifications">
                    Email Notifications
                  </label>
                </div>
                <div class="form-check form-switch mb-2">
                  <input class="form-check-input" type="checkbox" id="orderUpdates" checked>
                  <label class="form-check-label" for="orderUpdates">
                    Order Updates
                  </label>
                </div>
                <div class="form-check form-switch mb-2">
                  <input class="form-check-input" type="checkbox" id="marketingEmails">
                  <label class="form-check-label" for="marketingEmails">
                    Marketing Emails
                  </label>
                </div>
              </div>

              <div class="settings-section mb-4">
                <h6 class="text-primary">Privacy</h6>
                <div class="form-check form-switch mb-2">
                  <input class="form-check-input" type="checkbox" id="profileVisibility" checked>
                  <label class="form-check-label" for="profileVisibility">
                    Make Profile Public
                  </label>
                </div>
                <div class="form-check form-switch mb-2">
                  <input class="form-check-input" type="checkbox" id="showOnlineStatus">
                  <label class="form-check-label" for="showOnlineStatus">
                    Show Online Status
                  </label>
                </div>
              </div>

              <div class="settings-section">
                <h6 class="text-danger">Danger Zone</h6>
                <p class="text-muted">These actions cannot be undone</p>
                <button class="btn btn-outline-danger" (click)="deactivateAccount()">
                  <i class="bi bi-exclamation-triangle"></i> Deactivate Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
    .profile-avatar {
      position: relative;
    }

    .settings-section {
      padding: 1rem 0;
      border-bottom: 1px solid #dee2e6;
    }

    .settings-section:last-child {
      border-bottom: none;
    }

    .form-check-label {
      font-weight: 500;
    }

    .card {
      transition: transform 0.2s ease-in-out;
    }

    .card:hover {
      transform: translateY(-2px);
    }
  `,
  ],
})
export class ProfileComponent implements OnInit {
  currentUser: User | null = null
  activeTab = "profile"

  profileForm: FormGroup
  passwordForm: FormGroup

  isUpdatingProfile = false
  isChangingPassword = false

  profileSuccessMessage = ""
  profileErrorMessage = ""
  passwordSuccessMessage = ""
  passwordErrorMessage = ""

  userStats = {
    totalProducts: 0,
    totalOrders: 0,
    totalSales: 0,
  }

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
  ) {
    this.profileForm = this.fb.group({
      fullName: ["", Validators.required],
      email: ["", [Validators.required, Validators.email]],
      phone: [""],
      address: [""],
      bio: ["", Validators.maxLength(500)],
    })

    this.passwordForm = this.fb.group(
      {
        currentPassword: ["", Validators.required],
        newPassword: ["", [Validators.required, Validators.minLength(6)]],
        confirmPassword: ["", Validators.required],
      },
      { validators: this.passwordMatchValidator },
    )
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user
      if (user) {
        this.profileForm.patchValue({
          fullName: user.fullName,
          email: user.email,
        })
        this.loadUserStats()
      }
    })
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get("newPassword")
    const confirmPassword = form.get("confirmPassword")

    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true })
    } else {
      confirmPassword?.setErrors(null)
    }

    return null
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab
    this.clearMessages()
  }

  updateProfile(): void {
    if (this.profileForm.valid) {
      this.isUpdatingProfile = true
      this.clearMessages()

      const updateRequest: UpdateProfileRequest = {
        fullName: this.profileForm.get("fullName")?.value,
        email: this.profileForm.get("email")?.value,
      }

      // Mock API call - replace with actual service call
      setTimeout(() => {
        this.isUpdatingProfile = false
        this.profileSuccessMessage = "Profile updated successfully!"
        setTimeout(() => (this.profileSuccessMessage = ""), 3000)
      }, 1000)
    }
  }

  changePassword(): void {
    if (this.passwordForm.valid) {
      this.isChangingPassword = true
      this.clearMessages()

      const changePasswordRequest: ChangePasswordRequest = {
        currentPassword: this.passwordForm.get("currentPassword")?.value,
        newPassword: this.passwordForm.get("newPassword")?.value,
        confirmPassword: this.passwordForm.get("confirmPassword")?.value,
      }

      // Mock API call - replace with actual service call
      setTimeout(() => {
        this.isChangingPassword = false
        this.passwordSuccessMessage = "Password changed successfully!"
        this.passwordForm.reset()
        setTimeout(() => (this.passwordSuccessMessage = ""), 3000)
      }, 1000)
    }
  }

  deactivateAccount(): void {
    if (confirm("Are you sure you want to deactivate your account? This action cannot be undone.")) {
      // Mock API call - replace with actual service call
      alert("Account deactivation functionality will be implemented")
    }
  }

  loadUserStats(): void {
    // Mock data - replace with actual API calls
    this.userStats = {
      totalProducts: 12,
      totalOrders: 8,
      totalSales: 5,
    }
  }

  clearMessages(): void {
    this.profileSuccessMessage = ""
    this.profileErrorMessage = ""
    this.passwordSuccessMessage = ""
    this.passwordErrorMessage = ""
  }
}
