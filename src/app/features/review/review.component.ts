import { Component, computed, effect, ElementRef, inject, input, OnInit, signal, ViewChild } from '@angular/core';
import { Validators, FormBuilder, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { ReviewService } from '../../core/services/review.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';


import { ToastrService } from 'ngx-toastr';
import { IReview } from '../../core/models/ireview';

@Component({
  selector: 'app-review',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './review.component.html',
  styleUrl: './review.component.scss'
})
export class ReviewComponent {
  sellerId = input<number | undefined>();

  reviews: IReview[] = [];
  paginatedReviews: IReview[] = [];
  isLoading = false;
  errorMessage = '';

  currentPage: number = 1;
  itemsPerPage: number = 1; // كل مرة نعرض ريفيو واحد بس (السلايدر)

  constructor(private reviewService: ReviewService) {
    effect(() => {
      const sid = this.sellerId();
      if (sid) {
        this.loadReviewsForSeller(sid);
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