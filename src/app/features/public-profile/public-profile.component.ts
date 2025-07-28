import { Component, inject, input, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { IPublicUserProfileDto } from '../../core/models/user.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IProduct } from '../../core/models/product.model';
import { IReview } from '../../core/models/ireview';
import { single } from 'rxjs';
import { ProductItemComponent } from '../products/product-item/product-item.component';
import { ReviewComponent } from '../review/review.component';

@Component({
  selector: 'app-public-profile',
  imports: [FormsModule, CommonModule, RouterModule, ProductItemComponent,ReviewComponent],
  templateUrl: './public-profile.component.html',
  styleUrl: './public-profile.component.scss'
})
export class PublicProfileComponent {
   loading = signal(false);
  error = signal<string | null>(null);
  profile = signal<IPublicUserProfileDto | null>(null);
  userService =inject(UserService)
  _router =inject(ActivatedRoute)
  userId!: number; // هنعبّيها من الرابط
  reviews = single<IReview |null>();


  ngOnInit() {
    // ناخد الـ userId من المعاملات في الرابط
    this._router.paramMap.subscribe(params => {
      const id = params.get('userId'); // تأكدي من اسم الباراميتر في الروتر لينك
      if (id) {
        this.userId = +id;
        this.loadProfile();
      } else {
        this.error.set('User ID is missing in the URL.');
      }
    });
  }

  loadProfile() {
    this.loading.set(true);
    this.error.set(null);

    this.userService.getPublicUserProfile(this.userId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.profile.set(response.data);
        } else {
          this.error.set(response.message || 'Failed to load profile.');
          this.profile.set(null);
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('An error occurred while loading profile.');
        console.error(err);
        this.loading.set(false);
        this.profile.set(null);
      },
    });
  }
}
