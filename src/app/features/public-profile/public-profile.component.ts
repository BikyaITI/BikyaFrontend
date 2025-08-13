import { Component, inject, input, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { PublicUserProfile } from '../../core/models/user.model';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { IProduct } from '../../core/models/product.model';
import { IReview } from '../../core/models/ireview';
import { single } from 'rxjs';
import { ReviewComponent } from '../review/review.component';
import { ReviewFormComponent } from '../review-form/review-form.component';
import { AuthService } from '../../core/services/auth.service';
import bootstrap, { Modal } from 'bootstrap';
import { ProductListComponent } from '../../shared/components/product-list/product-list.component';

@Component({
  selector: 'app-public-profile',
  imports: [FormsModule, CommonModule, RouterModule , ReviewComponent, ReviewFormComponent, ProductListComponent],
  templateUrl: './public-profile.component.html',
  styleUrl: './public-profile.component.scss'
})
export class PublicProfileComponent implements OnInit {
  profile!: PublicUserProfile;
  userId!: number;
  loading = true;
  error: string | null = null;
 currentPage = 0; // نبدأ من أول منتج
itemsPerPage = 3;

  private route = inject(ActivatedRoute);
  private userService = inject(UserService);
  private authService = inject(AuthService);


  ngOnInit(): void {
    const paramId = this.route.snapshot.paramMap.get('userId');
    if (paramId) {
      this.userId = +paramId;
      this.loadProfile();
    } else {
      this.error = 'Invalid user ID.';
      this.loading = false;
    }
  }

  loadProfile() {
    this.loading = true;
    this.userService.getPublicProfile(this.userId).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.profile = res.data;
        } else {
          this.error = res.message || 'Could not load profile.';
        }
        this.loading = false;
      },
      error: () => {
        this.error = 'An error occurred while loading profile.';
        this.loading = false;
      }
    });
  }
  

 get visibleProducts() {
  const products = this.profile?.productsForSale ?? [];
  const start = this.currentPage * this.itemsPerPage;
  return products.slice(start, start + this.itemsPerPage);
}

nextP() {
  const totalProducts = this.profile?.productsForSale?.length ?? 0;
  if ((this.currentPage + 1) * this.itemsPerPage < totalProducts) {
    this.currentPage++;
  }
}

prevP() {
  if (this.currentPage > 0) {
    this.currentPage--;
  }
}


 onReviewSubmitted() {
  // Close the modal
  const modalEl = document.getElementById('reviewModal');
  if (modalEl) {
    const modal = Modal.getOrCreateInstance(modalEl);
    modal.hide();
  }

  // Reload profile to refresh reviews and rating
  this.loadProfile();
}

}