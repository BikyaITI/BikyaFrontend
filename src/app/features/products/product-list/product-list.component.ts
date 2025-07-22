import { Component,  OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule } from "@angular/router"
import { FormsModule } from "@angular/forms"
import  { ProductService } from "../../../core/services/product.service"
import  { CategoryService } from "../../../core/services/category.service"
import  { Product, Category } from "../../../core/models/product.model"
import { ICategory } from "../../../core/models/icategory"

@Component({
  selector: "app-product-list",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <!-- Page Header -->
    <section class="page-header py-5 bg-light">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-md-6">
            <h1 class="page-title">Our Products</h1>
            <p class="page-subtitle">Discover quality pre-loved children's items</p>
          </div>
          <div class="col-md-6">
            <nav aria-label="breadcrumb">
              <ol class="breadcrumb justify-content-md-end">
                <li class="breadcrumb-item"><a routerLink="/">Home</a></li>
                <li class="breadcrumb-item active">Products</li>
              </ol>
            </nav>
          </div>
        </div>
      </div>
    </section>

    <!-- Products Section -->
    <section class="products-section py-5">
      <div class="container">
        <div class="row">
          <!-- Filters Sidebar -->
          <div class="col-lg-3 mb-4">
            <div class="filters-sidebar">
              <div class="filter-section">
                <h6 class="filter-title">Categories</h6>
                <div class="filter-options">
                  <div class="form-check" *ngFor="let category of categories">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      [id]="'category-' + category.id"
                      [value]="category.id"
                      (change)="onCategoryChange($event)">
                    <label class="form-check-label" [for]="'category-' + category.id">
                      {{category.name}}
                    </label>
                  </div>
                </div>
              </div>

              <div class="filter-section">
                <h6 class="filter-title">Price Range</h6>
                <div class="price-range">
                  <div class="row mb-2">
                    <div class="col-6">
                      <input
                        type="number"
                        class="form-control form-control-sm"
                        placeholder="Min"
                        [(ngModel)]="minPrice"
                        (input)="applyFilters()">
                    </div>
                    <div class="col-6">
                      <input
                        type="number"
                        class="form-control form-control-sm"
                        placeholder="Max"
                        [(ngModel)]="maxPrice"
                        (input)="applyFilters()">
                    </div>
                  </div>
                  <input
                    type="range"
                    class="form-range"
                    min="0"
                    max="200"
                    [value]="maxPrice || 100"
                    (input)="onPriceRangeChange($event)">
                  <div class="d-flex justify-content-between">
                    <span class="small text-muted">\$0</span>
                    <span class="small text-muted">\$200+</span>
                  </div>
                </div>
              </div>

              <div class="filter-section">
                <h6 class="filter-title">Condition</h6>
                <div class="filter-options">
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="excellent" value="Excellent" (change)="onConditionChange($event)">
                    <label class="form-check-label" for="excellent">Excellent</label>
                  </div>
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="good" value="Good" (change)="onConditionChange($event)">
                    <label class="form-check-label" for="good">Good</label>
                  </div>
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="fair" value="Fair" (change)="onConditionChange($event)">
                    <label class="form-check-label" for="fair">Fair</label>
                  </div>
                </div>
              </div>

              <div class="filter-section">
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    id="exchangeOnly"
                    [(ngModel)]="exchangeOnly"
                    (change)="applyFilters()">
                  <label class="form-check-label" for="exchangeOnly">
                    Exchange Only
                  </label>
                </div>
              </div>

              <button class="btn btn-primary w-100 mt-3" (click)="applyFilters()">Apply Filters</button>
              <button class="btn btn-outline-secondary w-100 mt-2" (click)="clearFilters()">Clear All</button>
            </div>
          </div>

          <!-- Products Grid -->
          <div class="col-lg-9">
            <div class="products-header d-flex justify-content-between align-items-center mb-4">
              <div class="results-info">
                <span class="text-muted">Showing {{filteredProducts.length}} of {{products.length}} results</span>
              </div>
              <div class="d-flex align-items-center">
                <div class="search-container me-3" style="width: 250px;">
                  <input
                    type="text"
                    class="form-control"
                    placeholder="Search products..."
                    [(ngModel)]="searchTerm"
                    (keyup.enter)="searchProducts()"
                    (input)="onSearchInput()">
                  <i class="fas fa-search search-icon"></i>
                </div>
                <select class="form-select" style="width: auto;" [(ngModel)]="sortBy" (change)="onSortChange()">
                  <option value="featured">Sort by: Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                  <option value="rating">Best Rating</option>
                </select>
              </div>
            </div>

            <div *ngIf="isLoading" class="loading-spinner">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>

            <div class="row" *ngIf="!isLoading">
              <div class="col-lg-4 col-md-6 mb-4" *ngFor="let product of filteredProducts">
                <div class="product-card">
                  <div class="product-image">
                    <img
                      [src]="getMainImage(product)"
                      class="img-fluid"
                      [alt]="product.title">
                    <div class="product-badges">
                      <span class="badge" [class]="getConditionBadgeClass(product.condition)">
                        {{product.condition}}
                      </span>
                    </div>
                    <div class="product-overlay">
                      <button class="btn btn-primary btn-sm" [routerLink]="['/products', product.id]">
                        Quick View
                      </button>
                      <button class="btn btn-outline-primary btn-sm" (click)="addToWishlist(product)">
                        <i class="fas fa-heart"></i>
                      </button>
                    </div>
                  </div>
                  <div class="product-info">
                    <h6 class="product-title">{{product.title}}</h6>
                    <div class="product-rating">
                      <i class="fas fa-star" *ngFor="let star of getStarArray(5)"></i>
                      <span class="rating-count">({{getRandomRating()}})</span>
                    </div>
                    <div class="product-price">
                      <span class="current-price">\${{product.price | number:'1.2-2'}}</span>
                      <span class="original-price" *ngIf="getOriginalPrice(product.price) > product.price">
                        \${{getOriginalPrice(product.price) | number:'1.2-2'}}
                      </span>
                      <span class="discount-badge" *ngIf="getDiscountPercentage(product.price) > 0">
                        {{getDiscountPercentage(product.price)}}% OFF
                      </span>
                    </div>
                    <button class="btn btn-primary btn-sm w-100 mt-2" (click)="addToCart(product)">
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div *ngIf="!isLoading && filteredProducts.length === 0" class="text-center py-5">
              <i class="fas fa-box-open display-1 text-muted mb-3"></i>
              <h3>No products found</h3>
              <p class="text-muted">Try adjusting your search criteria</p>
            </div>

            <!-- Pagination -->
            <nav aria-label="Products pagination" class="mt-5" *ngIf="filteredProducts.length > 0">
              <ul class="pagination justify-content-center">
                <li class="page-item" [class.disabled]="currentPage === 1">
                  <a class="page-link" href="#" (click)="goToPage(currentPage - 1)" tabindex="-1">Previous</a>
                </li>
                <li class="page-item"
                    *ngFor="let page of getPageNumbers()"
                    [class.active]="page === currentPage">
                  <a class="page-link" href="#" (click)="goToPage(page)">{{page}}</a>
                </li>
                <li class="page-item" [class.disabled]="currentPage === totalPages">
                  <a class="page-link" href="#" (click)="goToPage(currentPage + 1)">Next</a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class ProductListComponent implements OnInit {
  products: Product[] = []
  filteredProducts: Product[] = []
  categories: ICategory[] = []
  isLoading = true

  searchTerm = ""
  selectedCategoryIds: number[] = []
  selectedConditions: string[] = []
  minPrice: number | null = null
  maxPrice: number | null = null
  exchangeOnly = false
  sortBy = "featured"

  currentPage = 1
  itemsPerPage = 12
  totalPages = 1

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
  ) {}

  ngOnInit(): void {
    this.loadProducts()
    this.loadCategories()
  }

  loadProducts(): void {
    this.isLoading = true
    this.productService.getApprovedProducts().subscribe({
      next: (response) => {
        if (response.success) {
          this.products = response.data
          this.applyFilters()
        }
        this.isLoading = false
      },
      error: () => {
        this.isLoading = false
      },
    })
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: (response) => {
        if (response.success) {
          this.categories = response.data
        }
      },
    })
  }

  onCategoryChange(event: any): void {
    const categoryId = Number.parseInt(event.target.value)
    if (event.target.checked) {
      this.selectedCategoryIds.push(categoryId)
    } else {
      this.selectedCategoryIds = this.selectedCategoryIds.filter((id) => id !== categoryId)
    }
    this.applyFilters()
  }

  onConditionChange(event: any): void {
    const condition = event.target.value
    if (event.target.checked) {
      this.selectedConditions.push(condition)
    } else {
      this.selectedConditions = this.selectedConditions.filter((c) => c !== condition)
    }
    this.applyFilters()
  }

  onPriceRangeChange(event: any): void {
    this.maxPrice = Number.parseInt(event.target.value)
    this.applyFilters()
  }

  onSearchInput(): void {
    // Debounce search
    setTimeout(() => this.applyFilters(), 300)
  }

  searchProducts(): void {
    this.applyFilters()
  }

  onSortChange(): void {
    this.applyFilters()
  }

  applyFilters(): void {
    let filtered = [...this.products]

    // Search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase()
      filtered = filtered.filter(
        (product) => product.title.toLowerCase().includes(term) || product.description.toLowerCase().includes(term),
      )
    }

    // Category filter
    if (this.selectedCategoryIds.length > 0) {
      filtered = filtered.filter((product) => this.selectedCategoryIds.includes(product.categoryId))
    }

    // Condition filter
    if (this.selectedConditions.length > 0) {
      filtered = filtered.filter((product) => this.selectedConditions.includes(product.condition))
    }

    // Price filter
    if (this.minPrice !== null) {
      filtered = filtered.filter((product) => product.price >= this.minPrice!)
    }
    if (this.maxPrice !== null) {
      filtered = filtered.filter((product) => product.price <= this.maxPrice!)
    }

    // Exchange filter
    if (this.exchangeOnly) {
      filtered = filtered.filter((product) => product.isForExchange)
    }

    // Sort
    filtered = this.sortProducts(filtered)

    this.filteredProducts = filtered
    this.totalPages = Math.ceil(filtered.length / this.itemsPerPage)
    this.currentPage = 1
  }

  sortProducts(products: Product[]): Product[] {
    switch (this.sortBy) {
      case "price-low":
        return products.sort((a, b) => a.price - b.price)
      case "price-high":
        return products.sort((a, b) => b.price - a.price)
      case "newest":
        return products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      case "rating":
        return products.sort((a, b) => 5 - 4) // Mock rating sort
      default:
        return products
    }
  }

  clearFilters(): void {
    this.searchTerm = ""
    this.selectedCategoryIds = []
    this.selectedConditions = []
    this.minPrice = null
    this.maxPrice = null
    this.exchangeOnly = false
    this.sortBy = "featured"

    // Clear checkboxes
    const checkboxes = document.querySelectorAll('input[type="checkbox"]') as NodeListOf<HTMLInputElement>
    checkboxes.forEach((checkbox) => (checkbox.checked = false))

    this.applyFilters()
  }

  getMainImage(product: Product): string {
    const mainImage = product.images?.find((img) => img.isMain)
    return mainImage?.imageUrl || "/placeholder.svg?height=250&width=250"
  }

  getConditionBadgeClass(condition: string): string {
    switch (condition.toLowerCase()) {
      case "excellent":
        return "bg-success"
      case "good":
        return "bg-primary"
      case "fair":
        return "bg-warning"
      default:
        return "bg-secondary"
    }
  }

  getStarArray(count: number): number[] {
    return Array(count).fill(0)
  }

  getRandomRating(): number {
    return Math.floor(Math.random() * 50) + 10
  }

  getOriginalPrice(currentPrice: number): number {
    return Math.round(currentPrice * 1.4)
  }

  getDiscountPercentage(currentPrice: number): number {
    const original = this.getOriginalPrice(currentPrice)
    return Math.round(((original - currentPrice) / original) * 100)
  }

  addToCart(product: Product): void {
    // Implement add to cart logic
    console.log("Added to cart:", product)
  }

  addToWishlist(product: Product): void {
    // Implement add to wishlist logic
    console.log("Added to wishlist:", product)
  }

  getPageNumbers(): number[] {
    const pages = []
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i)
    }
    return pages
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page
    }
  }
}
