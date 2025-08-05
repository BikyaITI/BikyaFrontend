import { Component,  OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule } from "@angular/router"
import  { ProductService } from "../../core/services/product.service"
import  { IProduct } from "../../core/models/product.model"
import { ProductListComponent } from "../../shared/components/product-list/product-list.component"

@Component({
  selector: "app-home",
  standalone: true,
  imports: [CommonModule, RouterModule,ProductListComponent],
  template: `
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="container">
        <div class="row align-items-center min-vh-75">
          <div class="col-lg-6">
            <div class="hero-content">
              <h1 class="display-4 fw-bold mb-4">Premium Used Children's Products</h1>
              <p class="lead mb-4">Discover quality pre-loved items for your little ones. Safe, affordable, and sustainable shopping for modern families.</p>
              <div class="hero-buttons">
                <a routerLink="/products" class="btn btn-primary btn-lg me-3">
                  <i class="fas fa-shopping-bag me-2"></i>Shop Now
                </a>
                <a routerLink="/register" class="btn btn-outline-primary btn-lg me-3">
                  <i class="fas fa-user-plus me-2"></i>Join Community
                </a>
               
              </div>
              <div class="hero-stats mt-5">
                <div class="row">
                  <div class="col-4">
                    <div class="stat-item">
                      <h3 class="stat-number">10K+</h3>
                      <p class="stat-label">Happy Customers</p>
                    </div>
                  </div>
                  <div class="col-4">
                    <div class="stat-item">
                      <h3 class="stat-number">50K+</h3>
                      <p class="stat-label">Products Sold</p>
                    </div>
                  </div>
                  <div class="col-4">
                    <div class="stat-item">
                      <h3 class="stat-number">99%</h3>
                      <p class="stat-label">Satisfaction</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
                     <div class="col-lg-6">
             <div class="hero-image">
               <img src="https://via.placeholder.com/600x500/4F46E5/FFFFFF?text=Bikya+Products" alt="Children's Products" class="img-fluid rounded-4 shadow-lg">
             </div>
           </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section py-5">
      <div class="container">
        <div class="row">
          <div class="col-lg-3 col-md-6 mb-4">
            <div class="feature-card text-center">
              <div class="feature-icon">
                <i class="fas fa-shield-alt"></i>
              </div>
              <h5>Quality Assured</h5>
              <p>Every product is carefully inspected for quality and safety standards.</p>
            </div>
          </div>
          <div class="col-lg-3 col-md-6 mb-4">
            <div class="feature-card text-center">
              <div class="feature-icon">
                <i class="fas fa-shipping-fast"></i>
              </div>
              <h5>Fast Delivery</h5>
              <p>Quick and secure delivery to your doorstep within 2-3 business days.</p>
            </div>
          </div>
          <div class="col-lg-3 col-md-6 mb-4">
            <div class="feature-card text-center">
              <div class="feature-icon">
                <i class="fas fa-undo-alt"></i>
              </div>
              <h5>Easy Returns</h5>
              <p>Not satisfied? Return within 7 days for a full refund, no questions asked.</p>
            </div>
          </div>
          <div class="col-lg-3 col-md-6 mb-4">
            <div class="feature-card text-center">
              <div class="feature-icon">
                <i class="fas fa-leaf"></i>
              </div>
              <h5>Eco-Friendly</h5>
              <p>Support sustainable shopping and reduce waste with pre-loved items.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Products -->
    <section class="featured-products py-5 bg-light">
      <div class="container">
        <div class="text-center mb-5">
          <h2 class="section-title">Featured Products</h2>
          <p class="section-subtitle">Handpicked items that parents love</p>
        </div>

        <div *ngIf="isLoadingProducts" class="loading-spinner">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>

        <div class="row" *ngIf="!isLoadingProducts">
          <div class="col-lg-3 col-md-6 mb-4" *ngFor="let product of featuredProducts">
          

              <app-product-list  [product]="product" [role]="'user'" ></app-product-list>
          </div>
        </div>

        <div class="text-center mt-4">
          <a routerLink="/products" class="btn btn-outline-primary btn-lg">View All Products</a>
        </div>
      </div>
    </section>

    <!-- Newsletter -->
    <section class="newsletter-section py-5" style="background: var(--gradient-primary);">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-lg-6 text-center text-white">
            <h3 class="mb-3">Stay Updated</h3>
            <p class="mb-4">Get the latest deals and new arrivals delivered to your inbox.</p>
            <div class="newsletter-form">
              <div class="input-group">
                <input type="email" class="form-control" placeholder="Enter your email">
                <button class="btn btn-light text-primary fw-bold" type="button">Subscribe</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class HomeComponent implements OnInit {
  featuredProducts: IProduct[] = []
  isLoadingProducts = true

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadFeaturedProducts()
  }

  loadFeaturedProducts(): void {
    this.productService.getApprovedProducts().subscribe({
      next: (response) => {
        if (response.success) {
          this.featuredProducts = response.data.slice(0, 4)
        }
        this.isLoadingProducts = false
      },
      error: () => {
        this.isLoadingProducts = false
      },
    })
  }

  getMainImage(product: IProduct): string {
    const mainImage = product.images?.find((img) => img.isMain)
    if (mainImage?.imageUrl) {
      // Check if the URL is relative and add the API base URL
      if (mainImage.imageUrl.startsWith('/')) {
        return `https://localhost:65162${mainImage.imageUrl}`
      }
      return mainImage.imageUrl
    }
    return "https://via.placeholder.com/250x250?text=No+Image"
  }

  getStarArray(count: number): number[] {
    return Array(count).fill(0)
  }

  getRandomRating(): number {
    // Use a fixed value to avoid ExpressionChangedAfterItHasBeenCheckedError
    return 23
  }

  getOriginalPrice(currentPrice: number): number {
    return Math.round(currentPrice * 1.4)
  }
}
