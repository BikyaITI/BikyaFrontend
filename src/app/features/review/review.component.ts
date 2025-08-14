import { Component, computed, effect, ElementRef, inject, input, OnInit, signal, ViewChild } from '@angular/core';
import { Validators, FormBuilder, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { ReviewService } from '../../core/services/review.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';


import { ToastrService } from 'ngx-toastr';
import { IReview } from '../../core/models/ireview';

@Component({
  selector: 'app-review',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './review.component.html',
  styleUrl: './review.component.scss'
})
export class ReviewComponent {
  sellerId: number | undefined;
  orderId: number | undefined;
  reviews: IReview[] = [];
  paginatedReviews: IReview[] = [];
  isLoading = false;
  errorMessage = '';
  currentPage: number = 1;
  itemsPerPage: number = 1;

  constructor(
    private reviewService: ReviewService,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.sellerId = Number(params.get('sellerId'));
      this.orderId = Number(params.get('orderId'));
      if (this.sellerId) {
        this.loadReviewsForSeller(this.sellerId);
      }
    });
  }

  loadReviewsForSeller(sellerId: number): void {
    this.isLoading = true;
    this.reviewService.getReviewsBySellerId(sellerId).subscribe({
      next: (res) => {
        this.reviews = res.data || [];
        this.currentPage = 1;
        this.paginateReviews();
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load reviews.';
        this.isLoading = false;
        this.toastr.error('Failed to load reviews.');
      }
    });
  }

  get totalPages(): number {
    return Math.ceil(this.reviews.length / this.itemsPerPage);
  }

  prevR() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.paginateReviews();
    }
  }

  nextR() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.paginateReviews();
    }
  }

  paginateReviews() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedReviews = this.reviews.slice(startIndex, endIndex);
  }
}


//   reviews: IReview[] = [];
//   editForm!: FormGroup;
//   currentUserId = 1;
//   selectedReviewId: number | null = null;
//   selectedReview: IReview | null = null;
//   showEditModal = false;

//   @ViewChild('editModal') editModalRef!: ElementRef;
//   modalInstance!: Modal;

//   constructor(private fb: FormBuilder, private reviewService: ReviewService) { }

//   ngOnInit(): void {
//     this.loadReviews();
//     this.editForm = this.fb.group({
//       rating: [null, [Validators.required, Validators.min(1), Validators.max(5)]],
//       comment: ['', Validators.required]
//     });
//   }

//   loadReviews(): void {
//     // Use dummy data or API call
//     this.reviewService.getReviewsBySellerId(2).subscribe(res => {
//       this.reviews = res.data ?? [];
//     });

//   }

//   canEditOrDelete(review: IReview): boolean {
//     return review.reviewerId === this.currentUserId && !!review.orderId;
//   }
//   onEdit(review: IReview) {
//     // Open the edit form (e.g., a modal) and fill it with review data
//     this.selectedReview = { ...review };
//     this.showEditModal = true;
//   }

//   openEditModal(review: IReview): void {
//     this.selectedReviewId = review.id;
//     this.editForm.patchValue({
//       rating: review.rating,
//       comment: review.comment
//     });

//     this.modalInstance = new Modal(this.editModalRef.nativeElement);
//     this.modalInstance.show();
//   }

//   submitEdit(): void {
//     if (!this.selectedReviewId) return;

//     const updatedReview = {
//       ...this.editForm.value,
//       id: this.selectedReviewId
//     };

//     this.reviewService.updateReview(updatedReview).subscribe(() => {
//       const index = this.reviews.findIndex(r => r.id === this.selectedReviewId);
//       if (index !== -1) {
//         this.reviews[index] = {
//           ...this.reviews[index],
//           ...updatedReview
//         };
//       }

//       this.modalInstance.hide();
//     });
//   }

//   onDelete(id: number): void {
//     this.reviewService.deleteReview(id).subscribe(() => {
//       this.reviews = this.reviews.filter(r => r.id !== id);
//     });
//   }
// }


// export class ReviewComponent implements OnInit {
//  reviews: IReview[] = [];
//   isLoading = false;
//   errorMessage = '';
//   useDummyData = true; // ✅ Switch to true only for testing
//   sellerId = 2;
//   currentUserId = 1;

//   constructor(private reviewService: ReviewService) {}

//   ngOnInit(): void {
//     this.useDummyData ? this.loadDummyReviews() : this.loadReviewsFromApi();
//   }

//   // ✅ Load from API
//   loadReviewsFromApi(): void {
//     this.isLoading = true;
//     this.reviewService.getReviewsBySellerId(this.sellerId).subscribe({
//       next: (res) => {
//         this.reviews = res.data; // Assuming res is ApiResponse<IReview[]>
//         this.isLoading = false;
//       },
//       error: (err) => {
//         this.errorMessage = 'Failed to load reviews';
//         this.isLoading = false;
//       }
//     });
//   }

//   // 🧪 Dummy test reviews (for dev testing only)
//   loadDummyReviews(): void {
//     this.isLoading = true;

//     setTimeout(() => {
//       this.reviews = [
//         {
//           id: 1,
//           rating: 5,
//           comment: 'بائع ممتاز جداً ⭐⭐⭐⭐⭐',
//           createdAt: new Date().toISOString(),
//           reviewerId: this.currentUserId,
//           sellerId: this.sellerId ?? 0,
//           orderId: 101,
//           reviewer: {
//             id: this.currentUserId,
//             fullName: 'Alaa',
//             isDeleted: false,
//             isVerified: true
//           },
//           seller: {
//             id: this.sellerId,
//             fullName: 'Seller X',
//             isDeleted: false,
//             isVerified: true
//           },
//         },
//         {
//           id: 2,
//           rating: 3,
//           comment: 'الخدمة جيدة لكن الشحن تأخر',
//           createdAt: new Date().toISOString(),
//           reviewerId: 88,
//           sellerId: this.sellerId,
//           orderId: 102,
//           reviewer: {
//             id: 88,
//             fullName: 'Ahmed',
//             isDeleted: false,
//             isVerified: true
//           },
//           seller: {
//             id: this.sellerId,
//             fullName: 'Seller X',
//             isDeleted: false,
//             isVerified: true
//           },
//         }
//       ];
//       this.isLoading = false;
//     }, 500);
//   }

//   onEdit(review: IReview): void {
//     console.log('Editing review:', review);
//     // Show popup for edit
//   }

//   onDelete(id: number): void {
//     // Optional: confirm first
//     this.reviewService.deleteReview(id).subscribe({
//       next: () => {
//         this.reviews = this.reviews.filter(r => r.id !== id);
//       },
//       error: () => {
//         this.errorMessage = 'Failed to delete review';
//       }
//     });
//   }
//   canEditOrDelete(review: IReview): boolean {
//   return review.reviewerId === this.currentUserId && !!review.orderId;
// }

// }