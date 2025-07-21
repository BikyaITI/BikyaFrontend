import { Component,  OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import {  ActivatedRoute, RouterModule } from "@angular/router"
import { ReactiveFormsModule,  FormBuilder,  FormGroup, Validators } from "@angular/forms"
import  { ProductService } from "../../../core/services/product.service"
import  { AuthService } from "../../../core/services/auth.service"
import  { OrderService } from "../../../core/services/order.service"
import  { Product } from "../../../core/models/product.model"
import  { User } from "../../../core/models/user.model"

@Component({
  selector: "app-product-detail",
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="container mt-4" *ngIf="product">
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb">
          <li class="breadcrumb-item"><a routerLink="/">Home</a></li>
          <li class="breadcrumb-item"><a routerLink="/products">Products</a></li>
          <li class="breadcrumb-item active">{{product.title}}</li>
        </ol>
      </nav>

      <div class="row">
        <!-- Product Images -->
        <div class="col-lg-6">
          <div class="product-gallery">
            <div class="main-image mb-3">
              <img
                [src]="selectedImage"
                [alt]="product.title"
                class="img-fluid rounded shadow-sm w-100"
                style="height: 400px; object-fit: cover;">
            </div>

            <div class="thumbnail-images" *ngIf="product.images && product.images.length > 1">
              <div class="row g-2">
                <div class="col-3" *ngFor="let image of product.images">
                  <img
                    [src]="image.imageUrl"
                    [alt]="product.title"
                    class="img-fluid rounded cursor-pointer thumbnail"
                    [class.active]="selectedImage === image.imageUrl"
                    (click)="selectImage(image.imageUrl)"
                    style="height: 80px; object-fit: cover;">
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Product Info -->
        <div class="col-lg-6">
          <div class="product-info">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <h1 class="h2 mb-0">{{product.title}}</h1>
              <div class="badges">
                <span class="badge bg-success me-2" *ngIf="product.isForExchange">
                  <i class="bi bi-arrow-left-right"></i> Exchange Available
                </span>
                <span class="badge bg-info">{{product.condition}}</span>
              </div>
            </div>

            <div class="price-section mb-4">
              <h3 class="text-primary mb-0">\${{product.price | number:'1.2-2'}}</h3>
              <small class="text-muted">Price negotiable</small>
            </div>

            <div class="seller-info mb-4">
              <div class="d-flex align-items-center">
                <div class="avatar me-3">
                  <div class="bg-primary rounded-circle d-flex align-items-center justify-content-center"
                       style="width: 50px; height: 50px;">
                    <i class="bi bi-person-fill text-white fs-4"></i>
                  </div>
                </div>
                <div>
                  <h6 class="mb-0">{{product.user?.fullName || 'Unknown Seller'}}</h6>
                  <small class="text-muted">
                    <i class="bi bi-calendar3"></i>
                    Listed {{product.createdAt | date:'mediumDate'}}
                  </small>
                </div>
              </div>
            </div>

            <div class="description mb-4">
              <h5>Description</h5>
              <p class="text-muted">{{product.description}}</p>
            </div>

            <div class="product-details mb-4">
              <h5>Details</h5>
              <div class="row">
                <div class="col-6">
                  <strong>Category:</strong>
                  <span class="badge bg-light text-dark ms-2">{{product.category?.name}}</span>
                </div>
                <div class="col-6">
                  <strong>Condition:</strong>
                  <span class="ms-2">{{product.condition}}</span>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="action-buttons" *ngIf="currentUser && currentUser.id !== product.userId">
              <div class="row g-2">
                <div class="col-md-6">
                  <button
                    class="btn btn-primary btn-lg w-100"
                    data-bs-toggle="modal"
                    data-bs-target="#orderModal">
                    <i class="bi bi-cart-plus"></i> Buy Now
                  </button>
                </div>
                <div class="col-md-6" *ngIf="product.isForExchange">
                  <button
                    class="btn btn-outline-primary btn-lg w-100"
                    data-bs-toggle="modal"
                    data-bs-target="#exchangeModal">
                    <i class="bi bi-arrow-left-right"></i> Propose Exchange
                  </button>
                </div>
              </div>

              <div class="row g-2 mt-2">
                <div class="col-md-6">
                  <button class="btn btn-outline-secondary w-100">
                    <i class="bi bi-heart"></i> Add to Wishlist
                  </button>
                </div>
                <div class="col-md-6">
                  <button class="btn btn-outline-secondary w-100">
                    <i class="bi bi-share"></i> Share
                  </button>
                </div>
              </div>
            </div>

            <!-- Owner Actions -->
            <div class="owner-actions" *ngIf="currentUser && currentUser.id === product.userId">
              <div class="alert alert-info">
                <i class="bi bi-info-circle"></i> This is your product listing
              </div>
              <div class="row g-2">
                <div class="col-6">
                  <button class="btn btn-warning w-100">
                    <i class="bi bi-pencil"></i> Edit
                  </button>
                </div>
                <div class="col-6">
                  <button class="btn btn-danger w-100" (click)="deleteProduct()">
                    <i class="bi bi-trash"></i> Delete
                  </button>
                </div>
              </div>
            </div>

            <!-- Login Prompt -->
            <div class="login-prompt" *ngIf="!currentUser">
              <div class="alert alert-warning">
                <i class="bi bi-exclamation-triangle"></i>
                <a routerLink="/login" class="alert-link">Login</a> to purchase or exchange this item
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Related Products -->
      <div class="related-products mt-5">
        <h3 class="mb-4">Related Products</h3>
        <div class="row">
          <div class="col-md-3 mb-4" *ngFor="let relatedProduct of relatedProducts">
            <div class="card h-100 shadow-sm">
              <img
                [src]="getMainImage(relatedProduct)"
                class="card-img-top"
                style="height: 200px; object-fit: cover;"
                [alt]="relatedProduct.title">
              <div class="card-body">
                <h6 class="card-title">{{relatedProduct.title}}</h6>
                <p class="text-primary fw-bold">\${{relatedProduct.price}}</p>
                <a [routerLink]="['/products', relatedProduct.id]" class="btn btn-outline-primary btn-sm">
                  View Details
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Order Modal -->
    <div class="modal fade" id="orderModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Place Order</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <form [formGroup]="orderForm" (ngSubmit)="placeOrder()">
            <div class="modal-body">
              <div class="order-summary mb-4">
                <div class="d-flex align-items-center">
                  <img [src]="product ? getMainImage(product) : ''" class="rounded me-3" style="width: 60px; height: 60px; object-fit: cover;">
                  <div>
                    <h6 class="mb-0">{{product?.title}}</h6>
                    <p class="text-muted mb-0">\${{product?.price}}</p>
                  </div>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Quantity</label>
                <input type="number" class="form-control" formControlName="quantity" min="1" value="1">
              </div>

              <div class="mb-3">
                <label class="form-label">Shipping Address</label>
                <textarea class="form-control" formControlName="shippingAddress" rows="3"
                         placeholder="Enter your complete shipping address"></textarea>
              </div>

              <div class="order-total">
                <div class="d-flex justify-content-between">
                  <strong>Total: \${{calculateTotal()}}</strong>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="submit" class="btn btn-primary" [disabled]="orderForm.invalid || isPlacingOrder">
                <span *ngIf="isPlacingOrder" class="spinner-border spinner-border-sm me-2"></span>
                {{isPlacingOrder ? 'Placing Order...' : 'Place Order'}}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div class="container mt-5" *ngIf="isLoading">
      <div class="loading-spinner">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
    .thumbnail {
      cursor: pointer;
      transition: all 0.3s ease;
      border: 2px solid transparent;
    }

    .thumbnail:hover {
      border-color: var(--bs-primary);
      transform: scale(1.05);
    }

    .thumbnail.active {
      border-color: var(--bs-primary);
    }

    .product-gallery .main-image {
      position: relative;
      overflow: hidden;
    }

    .badges .badge {
      font-size: 0.75rem;
    }

    .avatar {
      flex-shrink: 0;
    }

    .action-buttons .btn {
      font-weight: 500;
    }

    .order-summary {
      background-color: #f8f9fa;
      padding: 1rem;
      border-radius: 0.5rem;
    }
  `,
  ],
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null
  relatedProducts: Product[] = []
  selectedImage = ""
  currentUser: User | null = null
  isLoading = true
  isPlacingOrder = false

  orderForm: FormGroup

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private authService: AuthService,
    private orderService: OrderService,
    private fb: FormBuilder,
  ) {
    this.orderForm = this.fb.group({
      quantity: [1, [Validators.required, Validators.min(1)]],
      shippingAddress: ["", Validators.required],
    })
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user
    })

    this.route.params.subscribe((params) => {
      const id = +params["id"]
      this.loadProduct(id)
    })
  }

  loadProduct(id: number): void {
    this.isLoading = true
    this.productService.getProductById(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.product = response.data
          this.selectedImage = this.getMainImage(this.product)
          this.loadRelatedProducts()
        }
        this.isLoading = false
      },
      error: () => {
        this.isLoading = false
      },
    })
  }

  loadRelatedProducts(): void {
    if (this.product) {
      this.productService.getProductsByCategory(this.product.categoryId).subscribe({
        next: (response) => {
          if (response.success) {
            this.relatedProducts = response.data.filter((p) => p.id !== this.product!.id).slice(0, 4)
          }
        },
      })
    }
  }

  selectImage(imageUrl: string): void {
    this.selectedImage = imageUrl
  }

  getMainImage(product: Product): string {
    const mainImage = product.images?.find((img) => img.isMain)
    return mainImage?.imageUrl || "/placeholder.svg?height=400&width=400"
  }

  calculateTotal(): number {
    if (!this.product) return 0
    const quantity = this.orderForm.get("quantity")?.value || 1
    return this.product.price * quantity
  }

  placeOrder(): void {
    if (this.orderForm.valid && this.product) {
      this.isPlacingOrder = true

      const orderRequest = {
        productId: this.product.id,
        quantity: this.orderForm.get("quantity")?.value,
        shippingAddress: this.orderForm.get("shippingAddress")?.value,
      }

      this.orderService.createOrder(orderRequest).subscribe({
        next: (response) => {
          this.isPlacingOrder = false
          if (response.success) {
            // Close modal and show success message
            const modal = document.getElementById("orderModal")
            if (modal) {
              const bsModal = (window as any).bootstrap.Modal.getInstance(modal)
              bsModal?.hide()
            }
            alert("Order placed successfully!")
          }
        },
        error: () => {
          this.isPlacingOrder = false
          alert("Failed to place order. Please try again.")
        },
      })
    }
  }

  deleteProduct(): void {
    if (this.product && confirm("Are you sure you want to delete this product?")) {
      this.productService.deleteProduct(this.product.id).subscribe({
        next: (response) => {
          if (response.success) {
            alert("Product deleted successfully!")
            // Navigate back to products list
          }
        },
        error: () => {
          alert("Failed to delete product.")
        },
      })
    }
  }
}
