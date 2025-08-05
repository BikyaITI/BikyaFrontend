import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ProductListComponent } from '../../../shared/components/product-list/product-list.component';
import { IProduct } from '../../../core/models/product.model';
import { IUser } from '../../../core/models/user.model';
import { AuthService } from '../../../core/services/auth.service';
import { ProductService } from '../../../core/services/product.service';
import { WishListService } from '../../../core/services/wish-list.service';
// import { environment } from "../../../../environments/environment"

@Component({
  selector: 'app-wishlist-product',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductListComponent],
templateUrl: './wishlist-product.component.html',
  styleUrl: './wishlist-product.component.scss'
})
export class WishlistProductComponent implements OnInit {
  products: IProduct[] = []
  isLoading = true
  currentUser: IUser | null = null

  constructor(
    private WishListService: WishListService,
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user
      if (user) {
        console.log("WishlistProductsComponent initialized")
        this.loadProducts()
      }
    })

  }

  loadProducts(): void {
    if (!this.currentUser) return

    this.isLoading = true

    this.WishListService.getWishlistProducts().subscribe({
      next: (response) => {
        if (response.success) {
          this.products = response.data
        }
        this.isLoading = false
      },
      error: (err) => {
        console.log(err)
        this.isLoading = false
      },
    })
  }
}
