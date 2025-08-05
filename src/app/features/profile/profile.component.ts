import { ChangeDetectorRef, Component, inject, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from "@angular/forms"
import { AuthService } from "../../core/services/auth.service"
import { UserService } from "../../core/services/user.service"
import { ProductService } from "../../core/services/product.service"
import { IProduct } from "../../core/models/product.model"
import { ReviewService } from "../../core/services/review.service"
import { Router } from "@angular/router"
import { ReviewComponent } from "../review/review.component"
import { IUser, IUserStats, IUpdateProfileRequest, IChangePasswordRequest } from "../../core/models/user.model"
import { filter, take } from 'rxjs/operators';
import { ToastrService } from "ngx-toastr"

@Component({
  selector: "app-profile",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ReviewComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  currentUser: IUser | null = null
  activeTab: 'overview' | 'editProfile' | 'password' | 'account' = 'overview';
  averageRating: number = 0;
  
  profileForm: FormGroup
  passwordForm: FormGroup
  userService = inject(UserService)
  reviewService= inject (ReviewService)
  cdr = inject(ChangeDetectorRef)
  toast= inject(ToastrService)
  router = inject(Router)
  isUpdatingProfile = false
  isChangingPassword = false
 selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;
  uploading = false;
  message = '';

  profileSuccessMessage = ""
  profileErrorMessage = ""
  passwordSuccessMessage = ""
  passwordErrorMessage = ""
  deactiveSuccessMessage =""
  deactiveErrorMessage =""
  
  userStats: IUserStats = {
  totalProducts: 0,
  totalOrders: 0,
  totalSales: 0
};


  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
  ) {
    this.profileForm = this.fb.group({
      fullName: ["", Validators.required],
      email: ["", [Validators.required, Validators.email]],
      phone: [""],
   
    })

    this.passwordForm = this.fb.group(
      {
        currentPassword: ["", Validators.required],
         newPassword: ['',[Validators.required,Validators.minLength(6)]],
        ConfirmNewPassword: ['', Validators.required]
      },
      { validators: this.passwordMatchValidator }
    )
  }

  ngOnInit(): void {
  this.authService.currentUser$
    .pipe(
      filter((user): user is IUser => user !== null), // ⛔ تجاهل null
      take(1) // ✅ خد أول قيمة حقيقية فقط
    )
    .subscribe((user) => {
      this.currentUser = user;
      this.profileForm.patchValue({
        fullName: user.fullName,
        email: user.email,
        phone:user.phone
        
      });
     this.previewUrl = user?.profileImageUrl || null;
      console.log(`User ID: ${user.id}`);
      this.cdr.detectChanges();
      this.loadUserStats();
      this.loadAverageRating();
    });
  }

 // ✅ التحقق من تطابق كلمة السر
  passwordMatchValidator(form: AbstractControl): ValidationErrors | null {
    const newPassword = form.get('newPassword');
    const confirmNewPassword = form.get('ConfirmNewPassword');

    if (
      newPassword &&
      confirmNewPassword &&
      newPassword.value !== confirmNewPassword.value
    ) {
      confirmNewPassword.setErrors({ passwordMismatch: true });
    } else {
      confirmNewPassword?.setErrors(null);
    }

    return null;
  }


  changePassword(): void {
    if (this.passwordForm.valid && this.currentUser) {
      this.isChangingPassword = true;
      this.clearMessages();

      const formValue = this.passwordForm.value as IChangePasswordRequest;

      const changePasswordRequest: IChangePasswordRequest = {
        currentPassword: formValue.currentPassword,
        newPassword: formValue.newPassword,
        ConfirmNewPassword: formValue.ConfirmNewPassword
      };

      console.log('Sending to API:', changePasswordRequest);

      this.userService.changePassword(changePasswordRequest).subscribe({
        next: () => {
          this.isChangingPassword = false;
          this.passwordSuccessMessage = 'Password changed successfully!';
          this.passwordForm.reset();
          setTimeout(() => (this.passwordSuccessMessage = ''), 3000);
        },
        error: (err) => {
          this.isChangingPassword = false;
          this.passwordErrorMessage = 'Failed to change password.';
          console.error(err);
        }
      });
    }
  }

 setActiveTab(tab: 'overview' | 'editProfile' | 'password' | 'account'): void {
  this.activeTab = tab;
  this.clearMessages();
}


updateProfile(): void {
  if (this.profileForm.valid && this.currentUser) {
    this.isUpdatingProfile = true;
    this.clearMessages();

    const updateRequest: IUpdateProfileRequest = {
      fullName: this.profileForm.get("fullName")?.value,
      email: this.profileForm.get("email")?.value,
    };

    this.userService.updateProfile(updateRequest).subscribe({
      next: (response) => {
        this.isUpdatingProfile = false;
        this.profileSuccessMessage = "Profile updated successfully!";

        // ✅ بناء نسخة جديدة من المستخدم يدويًا
        const updatedUser = {
          ...this.currentUser!,
          fullName: updateRequest.fullName,
          email: updateRequest.email
        };

        // ✅ تحديث localStorage والـ observable
        this.authService.setCurrentUserToLacal(updatedUser);

        setTimeout(() => (this.profileSuccessMessage = ""), 3000);
      },
      error: (err) => {
        this.isUpdatingProfile = false;
        this.profileErrorMessage = "Failed to update profile.";
        console.error(err);
      }
    });
  }
}


confirmDeactivate(): void {
  if (!this.currentUser) return;

  this.userService.deactivateAccount().subscribe({
    next: () => {
      this.deactiveSuccessMessage = "Your account has been deactivated.";
       console.log(` usrerID ${this.currentUser?.id}`)
      setTimeout(() => {
        this.authService.logout(); // ← مسح التوكن محليًا بدون API
        this.router.navigate(['/login']);
      }, 1000);
    },
    error: (err) => {
      this.deactiveErrorMessage = "Failed to deactivate account.";
      console.log(` usrerID ${this.currentUser?.id}`)
      console.error(err);
    }
  });
}




loadUserStats(): void {
  if (!this.currentUser || !this.currentUser.id) {
    console.warn('⛔ currentUser or ID is undefined');
    return;
  }

  console.log("✅ Fetching stats for userId:", this.currentUser.id);

  this.userService.getUserStats(this.currentUser.id).subscribe({
    next: (res) => {
      this.userStats = res.data ?? { totalProducts: 0, totalOrders: 0, totalSales: 0 };
    },
    error: (err) => {
      console.error('Error loading user stats', err);
      this.userStats = { totalProducts: 0, totalOrders: 0, totalSales: 0 };
    }
  });
}


loadAverageRating(): void {
  if (!this.currentUser) {
    console.error('User not loaded');
    return;
  }

  this.reviewService.getAverageRating(this.currentUser.id).subscribe({
    next: (res) => {
      this.averageRating = res.data ?? 0; // لو مفيش داتا، خليه 0
    },
    error: (err) => {
      console.error('Failed to load rating', err);
      this.averageRating = 0;
    }
  });
}
 onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string; // عرض مؤقت للمعاينة

        // بعد المعاينة، نبدأ الرفع
        this.upload();
      };
      reader.readAsDataURL(file);
    }
  }

  upload() {
  if (!this.selectedFile) return;

  this.uploading = true;

  this.userService.uploadProfileImage(this.selectedFile).subscribe({
    next: (res) => {
      if (res.success) {
        // ✅ عرض الصورة بعد الرفع مع كسر الكاش
        this.previewUrl = res.data + '?t=' + new Date().getTime();
        this.message = 'Uploading succeeded';
        
        // ✅ تحديث بيانات المستخدم
        const currentUser = this.authService.getCurrentUser();
        if (currentUser) {
          currentUser.profileImageUrl = res.data;
          this.authService.setCurrentUserToLacal(currentUser);
        }
      } else {
        this.message = res.message || 'Failed to upload';
      }

      // ✅ إخفاء الرسالة بعد 3 ثواني
      setTimeout(() => {
        this.message = '';
      }, 3000);
    },
    error: () => {
      this.message = 'Error while uploading';

      // ✅ إخفاء الرسالة بعد 3 ثواني
      setTimeout(() => {
        this.message = '';
      }, 3000);
    },
    complete: () => {
      this.uploading = false;
    }
  });
}




navigateToAddProduct(): void {
  this.router.navigate(['/add-product']); 
}

navigateToOrders(): void {
  this.router.navigate(['/orders']); 
}
navigateToMyProducts(): void {
  this.router.navigate(['/my-products']); 
}


  clearMessages(): void {
    this.profileSuccessMessage = ""
    this.profileErrorMessage = ""
    this.passwordSuccessMessage = ""
    this.passwordErrorMessage = ""
    this.deactiveSuccessMessage = ""
    this.deactiveErrorMessage = ""
  }
}
//   userProfile!: IUser;
//   profileForm!: FormGroup;
//   passwordForm!: FormGroup;

//   activeTab: 'profile' | 'password' | 'account' = 'profile';

//   isUpdatingProfile = false;
//   isChangingPassword = false;
//   loading = true;
//   isSubmitting = false;

//   profileSuccessMessage = '';
//   profileErrorMessage = '';
//   passwordSuccessMessage = '';
//   passwordErrorMessage = '';

//   userId!: number;

//   products: IProduct[] = [];
//   userStats = {
//     totalProducts: 0,
//     totalOrders: 0,
//     totalSales: 0
//   };

//   userService = inject(UserService);
//   productService = inject(ProductService);
//   authService = inject(AuthService);
//   fb = inject(FormBuilder);

//   ngOnInit(): void {
//     this.initUserAndLoadData();
//   }

//   private initUserAndLoadData(): void {
//     const user = this.authService.getCurrentUser();

//     if (user?.id !== undefined) {
//       this.userId = user.id;
//       this.loadProfile();
//       this.loadUserProducts();
//     } else {
//       console.error("User is not registered");
//     }
//   }

//   loadProfile(): void {
//     this.userService.getProfile(this.userId).subscribe({
//       next: (res) => {
//         this.userProfile = res.data!;
//         this.profileForm = this.fb.group({
//           fullName: [this.userProfile.fullName, Validators.required],
//           email: [this.userProfile.email, [Validators.required, Validators.email]],

//         });

//         this.passwordForm = this.fb.group({
//           currentPassword: ['', Validators.required],
//           newPassword: ['', [Validators.required, Validators.minLength(6)]],
//           confirmPassword: ['', Validators.required]
//         }, {
//           validators: this.passwordMatchValidator
//         });

//         this.loading = false;
//       },
//       error: () => {
//         this.loading = false;
//         this.profileErrorMessage = 'Failed to load profile';
//       }
//     });
//   }

//   loadUserProducts(): void {
//     this.productService.getProductsByUser(this.userId).subscribe({
//       next: (res) => {
//         this.products = res.data!;
//         this.userStats.totalProducts = res.data?.length || 0;

//         // لو عندك طريقة تجيب بيها الطلبات أو المبيعات، ضيفها هنا
//         // مؤقتًا حطيت 0
//         this.userStats.totalOrders = 0;
//         this.userStats.totalSales = 0;
//       },
//       error: (err) => {
//         console.error('Failed to load products', err);
//       }
//     });
//   }

//   updateProfile(): void {
//     if (this.profileForm.invalid) return;
//     this.isUpdatingProfile = true;
//     this.profileSuccessMessage = '';
//     this.profileErrorMessage = '';

//     this.userService.updateProfile(this.userId, this.profileForm.value).subscribe({
//       next: () => {
//         this.profileSuccessMessage = 'Profile updated successfully';
//         this.loadProfile();
//         this.isUpdatingProfile = false;
//       },
//       error: () => {
//         this.profileErrorMessage = 'Failed to update profile';
//         this.isUpdatingProfile = false;
//       }
//     });
//   }

//   changePassword(): void {
//     if (this.passwordForm.invalid) return;

//     this.isChangingPassword = true;
//     this.passwordSuccessMessage = '';
//     this.passwordErrorMessage = '';

//     const { currentPassword, newPassword, confirmPassword } = this.passwordForm.value;

//     this.userService.changePassword(this.userId, {
//       currentPassword,
//       newPassword,
//       confirmPassword
//     }).subscribe({
//       next: () => {
//         this.passwordSuccessMessage = 'Password changed successfully';
//         this.passwordForm.reset();
//         this.isChangingPassword = false;
//       },
//       error: () => {
//         this.passwordErrorMessage = 'Failed to change password';
//         this.isChangingPassword = false;
//       }
//     });

//   }

//   deactivateAccount(): void {
//     if (!confirm('Are you sure you want to deactivate your account?')) return;

//     this.userService.deactivateAccount(this.userId).subscribe({
//       next: () => {
//         alert('Account deactivated');
//         // Logout or redirect here
//       },
//       error: () => {
//         alert('Failed to deactivate account');
//       }
//     });
//   }

//   setActiveTab(tab: 'profile' | 'password' | 'account'): void {
//     this.activeTab = tab;
//     // Reset messages when switching tab
//     this.profileSuccessMessage = '';
//     this.profileErrorMessage = '';
//     this.passwordSuccessMessage = '';
//     this.passwordErrorMessage = '';
//   }

//   private passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
//     const newPassword = group.get('newPassword')?.value;
//     const confirmPassword = group.get('confirmPassword')?.value;
//     return newPassword === confirmPassword ? null : { notMatching: true };
//   }
// }

// export class ProfileComponent implements OnInit {
//   profile!: IUser;
//   profileForm!: FormGroup;
//   passwordForm!: FormGroup;
//   loading = true;
//   isSubmitting = false;
//   activeTab = "profile"
//   isUpdatingProfile = false
//   isChangingPassword = false
//   userId!: number;

//   userService = inject(UserService);
//   productService = inject(ProductService);
//   authService = inject(AuthService);
//   fb = inject(FormBuilder);

//   products: IProduct[] = [];

//   ngOnInit(): void {
//     this.initUserAndLoadData();
//   }

//   private initUserAndLoadData(): void {
//     const user = this.authService.getCurrentUser();

//     if (user?.id !== undefined) {
//       this.userId = user.id;
//       this.loadProfile();
//       this.loadUserProducts();
//     } else {
//       console.error("User is not registered");
//       // redirect if needed
//     }
//   }

//   loadProfile(): void {
//     this.userService.getProfile(this.userId).subscribe({
//       next: (res) => {
//         this.profile = res.data!;
//         this.profileForm = this.fb.group({
//           fullName: [this.profile.fullName, Validators.required]
//         });
//         this.passwordForm = this.fb.group({
//           currentPassword: ['', Validators.required],
//           newPassword: ['', [Validators.required, Validators.minLength(6)]]
//         });
//         this.loading = false;
//       },
//       error: () => {
//         this.loading = false;
//       }
//     });
//   }

//   loadUserProducts(): void {
//     this.productService.getProductsByUser(this.userId).subscribe({
//       next: (res) => {
//         this.products = res.data!;
//       },
//       error: (err) => {
//         console.error('Failed to load products', err);
//       }
//     });
//   }

//   updateProfile(): void {
//     if (this.profileForm.invalid) return;
//     this.isSubmitting = true;

//     this.userService.updateProfile(this.userId, this.profileForm.value).subscribe({
//       next: () => {
//         alert('Profile updated');
//         this.loadProfile();
//         this.isSubmitting = false;
//       },
//       error: () => {
//         alert('Update failed');
//         this.isSubmitting = false;
//       }
//     });
//   }

//   changePassword(): void {
//     if (this.passwordForm.invalid) return;

//     this.userService.changePassword(this.userId, this.passwordForm.value).subscribe({
//       next: () => {
//         alert('Password changed successfully');
//         this.passwordForm.reset();
//       },
//       error: () => {
//         alert('Password change failed');
//       }
//     });
//   }

//   deactivateAccount(): void {
//     if (!confirm('Are you sure you want to deactivate your account?')) return;

//     this.userService.deactivateAccount(this.userId).subscribe({
//       next: () => {
//         alert('Account deactivated');
//         // logout or redirect to home
//       },
//       error: () => {
//         alert('Failed to deactivate account');
//       }
//     });
//   }
//   setActiveTab(tab: 'profile' | 'password' | 'account'): void {
//   this.activeTab = tab;
// }

// }

//   currentUser: User | null = null
//   activeTab = "profile"

//   profileForm: FormGroup
//   passwordForm: FormGroup

//   isUpdatingProfile = false
//   isChangingPassword = false

//   profileSuccessMessage = ""
//   profileErrorMessage = ""
//   passwordSuccessMessage = ""
//   passwordErrorMessage = ""

//   userStats = {
//     totalProducts: 0,
//     totalOrders: 0,
//     totalSales: 0,
//   }

//   constructor(
//     private fb: FormBuilder,
//     private authService: AuthService,
//   ) {
//     this.profileForm = this.fb.group({
//       fullName: ["", Validators.required],
//       email: ["", [Validators.required, Validators.email]],
//       phone: [""],
//       address: [""],
//       bio: ["", Validators.maxLength(500)],
//     })

//     this.passwordForm = this.fb.group(
//       {
//         currentPassword: ["", Validators.required],
//         newPassword: ["", [Validators.required, Validators.minLength(6)]],
//         confirmPassword: ["", Validators.required],
//       },
//       { validators: this.passwordMatchValidator },
//     )
//   }

//   ngOnInit(): void {
//     this.authService.currentUser$.subscribe((user) => {
//       this.currentUser = user
//       if (user) {
//         this.profileForm.patchValue({
//           fullName: user.fullName,
//           email: user.email,
//         })
//         this.loadUserStats()
//       }
//     })
//   }

//   passwordMatchValidator(form: FormGroup) {
//     const newPassword = form.get("newPassword")
//     const confirmPassword = form.get("confirmPassword")

//     if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
//       confirmPassword.setErrors({ passwordMismatch: true })
//     } else {
//       confirmPassword?.setErrors(null)
//     }

//     return null
//   }

//   setActiveTab(tab: string): void {
//     this.activeTab = tab
//     this.clearMessages()
//   }

//   updateProfile(): void {
//     if (this.profileForm.valid) {
//       this.isUpdatingProfile = true
//       this.clearMessages()

//       const updateRequest: IUpdateProfileRequest = {
//         fullName: this.profileForm.get("fullName")?.value,
//         email: this.profileForm.get("email")?.value,
//       }

//       // Mock API call - replace with actual service call
//       setTimeout(() => {
//         this.isUpdatingProfile = false
//         this.profileSuccessMessage = "Profile updated successfully!"
//         setTimeout(() => (this.profileSuccessMessage = ""), 3000)
//       }, 1000)
//     }
//   }

//   changePassword(): void {
//     if (this.passwordForm.valid) {
//       this.isChangingPassword = true
//       this.clearMessages()

//       const changePasswordRequest: ChangePasswordRequest = {
//         currentPassword: this.passwordForm.get("currentPassword")?.value,
//         newPassword: this.passwordForm.get("newPassword")?.value,
//         confirmPassword: this.passwordForm.get("confirmPassword")?.value,
//       }

//       // Mock API call - replace with actual service call
//       setTimeout(() => {
//         this.isChangingPassword = false
//         this.passwordSuccessMessage = "Password changed successfully!"
//         this.passwordForm.reset()
//         setTimeout(() => (this.passwordSuccessMessage = ""), 3000)
//       }, 1000)
//     }
//   }

//   deactivateAccount(): void {
//     if (confirm("Are you sure you want to deactivate your account? This action cannot be undone.")) {
//       // Mock API call - replace with actual service call
//       alert("Account deactivation functionality will be implemented")
//     }
//   }

//   loadUserStats(): void {
//     // Mock data - replace with actual API calls
//     this.userStats = {
//       totalProducts: 12,
//       totalOrders: 8,
//       totalSales: 5,
//     }
//   }

//   clearMessages(): void {
//     this.profileSuccessMessage = ""
//     this.profileErrorMessage = ""
//     this.passwordSuccessMessage = ""
//     this.passwordErrorMessage = ""
//   }
// }
