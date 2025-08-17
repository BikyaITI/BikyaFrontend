import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { IProduct } from '../../core/models/product.model';
import { ProductListComponent } from '../../shared/components/product-list/product-list.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductListComponent],
  template: `
  <!-- Hero Section -->
  <section class="hero-section">
    <div class="container hero-container">
      <div class="row">
      <div class="hero-text text-light col-8">
        <h1 class="text-light">From a little hand to another… with love
</h1>
        <p>Safe, affordable, and sustainable shopping for modern families.</p>
        <div class="hero-buttons">
          <a routerLink="/products" class="btn btn-outline-primary bg-light btn-lg">Shop Now</a>
          <a routerLink="/register" class="btn btn-outline-primary bg-light btn-lg">Join Community</a>
        </div>
        <div class="hero-stats">
          <div class="stat-item">
            <h3>10K+</h3>
            <small>Happy Customers</small>
          </div>
          <div class="stat-item">
            <h3>50K+</h3>
            <small>Products Sold</small>
          </div>
          <div class="stat-item">
            <h3>99%</h3>
            <small>Satisfaction</small>
          </div>
        </div>
      </div>
      <div class="hero-image col-4">
        <img src="home.png" alt="Children's Products">
      </div>
      </div>
    </div>
  </section>

  <!-- Features Section -->
  <section class="features-section">
    <div class="container">
      <h2 class="section-title">Why Choose Bikya?</h2>
      <div class="features-grid">
        <div class="feature-card" *ngFor="let feature of features">
          <div class="feature-icon"><i class="{{feature.icon}}"></i></div>
          <h5>{{feature.title}}</h5>
          <p>{{feature.description}}</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Featured Products -->
  <section class="featured-products">
    <div class="container">
      <h2 class="section-title">Featured Products</h2>
      <p class="section-subtitle">Handpicked items parents love</p>

      <div *ngIf="isLoadingProducts" class="loading-spinner">
        <div class="spinner-border text-primary" role="status"></div>
      </div>

      <div class="products-grid" *ngIf="!isLoadingProducts">
        <app-product-list *ngFor="let product of featuredProducts" [product]="product" [role]="'user'"></app-product-list>
      </div>

      <div class="text-center m-5">
        <a routerLink="/products" class="btn btn-primary btn-lg">View All Products</a>
      </div>
    </div>
  </section>

  <!-- Newsletter Section -->
  <section class="newsletter-section">
    <div class="container">
      <h3>Stay Updated</h3>
      <p>Get the latest deals and new arrivals delivered to your inbox.</p>
      <div class="newsletter-form">
        <input type="email" placeholder="Enter your email">
        <button class="btn btn-primary">Subscribe</button>
      </div>
    </div>
  </section>
  `,
  styles: [`
  /* Hero Section */
  .hero-section {
    background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
    color: white;
    padding: 6rem 0 4rem;
    border-bottom-left-radius: 4rem;
    border-bottom-right-radius: 4rem;
    overflow: hidden;
  }
  .hero-container {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
  }
  .hero-text {
    flex: 1 1 500px;
    max-width: 600px;
  }
  .hero-text h1 {
    font-size: 3rem;
    font-weight: 800;
    margin-bottom: 1rem;
  }
  .hero-text p {
    font-size: 1.25rem;
    margin-bottom: 2rem;
  }
  .hero-buttons a {
    margin-right: 1rem;
  }
  .hero-stats {
    display: flex;
    gap: 2rem;
    margin-top: 2rem;
  }
  .stat-item h3 {
    font-size: 2rem;
    color: #fff;
  }
  .hero-image {
    flex: 1 1 400px;
    text-align: center;
  }
  .hero-image img {
    max-width: 100%;
    border-radius: 2rem;
    box-shadow: var(--shadow-xl);
  }

  /* Features Section */
  .features-section {
    padding: 5rem 0;
    background: #f9fafb;
    text-align: center;
  }
  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 2rem;
    margin-top: 3rem;
  }
  .feature-card {
    padding: 2rem;
    border-radius: var(--border-radius-xl);
    background: white;
    box-shadow: var(--shadow-md);
    transition: transform 0.3s, box-shadow 0.3s;
  }
  .feature-card:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-lg);
  }
  .feature-icon {
    font-size: 2rem;
    background: var(--gradient-primary);
    color: white;
    width: 70px;
    height: 70px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 auto 1rem;
  }

  /* Products Section */
  .products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
    margin-top: 2rem;
  }

  /* Newsletter Section */
  .newsletter-section {
    padding: 4rem 0;
    background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
    color: white;
    text-align: center;
    border-radius: 2rem 2rem 0 0;
  }
  .newsletter-form {
    display: flex;
    max-width: 500px;
    margin: 1.5rem auto 0;
  }
  .newsletter-form input {
    flex: 1;
    padding: 0.75rem 1rem;
    border-radius: var(--border-radius-lg) 0 0 var(--border-radius-lg);
    border: none;
    font-size: 1rem;
  }
  .newsletter-form button {
    border-radius: 0 var(--border-radius-lg) var(--border-radius-lg) 0;
    font-weight: 600;
  }

  /* Responsive */
  @media (max-width: 992px) {
    .hero-container {
      flex-direction: column-reverse;
      text-align: center;
    }
    .hero-text h1 {
      font-size: 2.5rem;
    }
    .hero-stats {
      justify-content: center;
    }
  }
  @media (max-width: 576px) {
    .hero-text h1 {
      font-size: 2rem;
    }
    .hero-text p {
      font-size: 1rem;
    }
    .features-grid {
      gap: 1.5rem;
    }
  }
  `]
})
export class HomeComponent implements OnInit {
  featuredProducts: IProduct[] = [];
  isLoadingProducts = true;

  features = [
    { icon: 'fas fa-shield-alt', title: 'Quality Assured', description: 'Every product is carefully inspected for quality and safety.' },
    { icon: 'fas fa-shipping-fast', title: 'Fast Delivery', description: 'Quick and secure delivery within 2-3 business days.' },
    { icon: 'fas fa-undo-alt', title: 'Easy Returns', description: 'Return within 7 days for a full refund, no questions asked.' },
    { icon: 'fas fa-leaf', title: 'Eco-Friendly', description: 'Support sustainable shopping and reduce waste with pre-loved items.' },
  ];

  constructor(private productService: ProductService) { }

  ngOnInit(): void {
    this.loadFeaturedProducts();
  }

  loadFeaturedProducts(): void {
    this.productService.getApprovedProducts().subscribe({
      next: (response) => {
        if (response.success) {
          this.featuredProducts = response.data.slice(0, 4);
        }
        this.isLoadingProducts = false;
      },
      error: () => {
        this.isLoadingProducts = false;
      },
    });
  }
}
