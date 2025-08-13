import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ReviewService } from '../../core/services/review.service';
import { ToastrService } from 'ngx-toastr';
import { ICreateReview } from '../../core/models/ireview';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-review-form',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './review-form.component.html',
  styleUrl: './review-form.component.scss'
})
export class ReviewFormComponent {
  @Input() sellerId!: number;
  @Input() orderId!: number;

  reviewForm: FormGroup;
  isSubmitting = false;
  reviewSubmitted = false;

  constructor(
    private fb: FormBuilder,
    private reviewService: ReviewService,
    private toastr: ToastrService,
    private authService: AuthService // نفترض إنك بتجيبي بيانات اليوزر من هنا
  ) {
    this.reviewForm = this.fb.group({
      rating: [null, Validators.required],
      comment: ['', [Validators.required, Validators.maxLength(500)]],
       orderId: [null, [Validators.required, Validators.min(1)]],
    });
  }

 submitReview() {
  if (this.reviewForm.invalid || !this.sellerId || !this.orderId) return;
  this.isSubmitting = true;
  const currentUser = this.authService.getCurrentUser();

  if (!currentUser) {
    this.toastr.error('You must be logged in to submit a review.');
    return;
  }

  const payload: ICreateReview = {
    rating: this.reviewForm.value.rating,
    comment: this.reviewForm.value.comment,
    reviewerId: currentUser.id,
    sellerId: this.sellerId,
    orderId: this.reviewForm.value.orderId || this.orderId
  };

  this.isSubmitting = true;

  this.reviewService.createReview(payload).subscribe({
    next: () => {
      this.toastr.success('Review submitted successfully!');
      this.reviewForm.reset();
      this.reviewSubmitted = true;
    },
    error: () => {
    this.toastr.error('Failed to submit review');
     this.isSubmitting = false;
    }
    ,
    complete: () => (this.isSubmitting = false),
  });
}

}






















// sellerId!: number;
//   reviews: IReview[] = [];
//   isLoading = true;
//   stars = [1, 2, 3, 4, 5];

//   reviewForm!: FormGroup;
// isSubmitting = false;
// canReview = true; // يفترض أنك جايبه من API بناءً على حالة الأوردر

// constructor(
//   private fb: FormBuilder,
//   private reviewService: ReviewService,
//   private route: ActivatedRoute
// ) {}

// ngOnInit(): void {
//   this.sellerId = +this.route.snapshot.paramMap.get('id')!;
//   this.getReviews();
//   this.initForm();
// }

// initForm(): void {
//   this.reviewForm = this.fb.group({
//     rating: [null, [Validators.required, Validators.min(1), Validators.max(5)]],
//     comment: [''],
//     reviewerId: [1], // حط الـ ID الحقيقي من التوكن أو السيرفس
//     sellerId: [this.sellerId],
//     orderId: [123] // تحط الأوردر المرتبط بالمراجعة
//   });
// }

// submitReview(): void {
//   if (this.reviewForm.invalid) return;

//   this.isSubmitting = true;

//   this.reviewService.createReview(this.reviewForm.value).subscribe({
//     next: () => {
//       this.getReviews(); // إعادة تحميل الريفيوهات
//       this.reviewForm.reset(); // تفريغ الفورم
//       this.isSubmitting = false;
//     },
//     error: (err) => {
//       console.error(err);
//       this.isSubmitting = false;
//     }
//   });
//     }
//      getReviews(): void {
//     this.reviewService.getReviewsBySellerId(this.sellerId).subscribe({
//       next: (res) => {
//         this.reviews = res;
//         this.isLoading = false;
//       },
//       error: (err) => {
//         console.error(err);
//         this.isLoading = false;
//       }
//     });
//   }

//   setRating(value: number): void {
//     this.reviewForm.patchValue({ rating: value });
//   }

 
// }
//   // constructor(
//   //   private reviewService: ReviewService,
//   //   private route: ActivatedRoute
//   // ) {}

//   // ngOnInit(): void {
//   //   // sellerId من الـ Route
//   //   this.sellerId = +this.route.snapshot.paramMap.get('id')!;
//   //   this.getReviews();
//   // }

 



