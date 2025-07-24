import { Component,  OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule } from "@angular/router"
import  { ProductService } from "../../../core/services/product.service"
import  { AuthService } from "../../../core/services/auth.service"

import { IProduct } from "../../../core/models/product.model"
import { IUser } from "../../../core/models/user.model"

@Component({
  selector: "app-my-products",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mt-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2><i class="bi bi-box"></i> My Products</h2>
          <p class="text-muted">Manage your product listings</p>
        </div>
        <a routerLink="/add-product" class="btn btn-primary">
          <i class="bi bi-plus-circle"></i> Add New Product
        </a>
      </div>

      <!-- Filter Tabs -->
      <ul class="nav nav-tabs mb-4">
        <li class="nav-item">
          <button
            class="nav-link"
            [class.active]="activeTab === 'all'"
            (click)="setActiveTab('all')">
            All Products ({{allProducts.length}})
          </button>
        </li>
        <li class="nav-item">
          <button
            class="nav-link"
            [class.active]="activeTab === 'approved'"
            (click)="setActiveTab('approved')">
            <i class="bi bi-check-circle text-success"></i>
            Approved ({{approvedProducts.length}})
          </button>
        </li>
        <li class="nav-item">
          <button
            class="nav-link"
            [class.active]="activeTab === 'pending'"
            (click)="setActiveTab('pending')">
            <i class="bi bi-clock text-warning"></i>
            Pending ({{pendingProducts.length}})
          </button>
        </li>
      </ul>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="loading-spinner">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <!-- Products Grid -->
      <div class="row" *ngIf="!isLoading">
        <div class="col-lg-4 col-md-6 mb-4" *ngFor="let product of getFilteredProducts()">
          <div class="card h-100 shadow-sm product-card">
            <!-- Product Image -->
            <div class="position-relative">
              <img
                [src]="getMainImage(product)"
                class="card-img-top product-image"
                [alt]="product.title"
                style="height: 250px; object-fit: cover;">

              <!-- Status Badge -->
              <div class="position-absolute top-0 end-0 m-2">
                <span class="badge" [class]="getStatusBadgeClass(product)">
                  {{getProductStatus(product)}}
                </span>
              </div>

              <!-- Exchange Badge -->
              <div class="position-absolute top-0 start-0 m-2" *ngIf="product.isForExchange">
                <span class="badge bg-info">
                  <i class="bi bi-arrow-left-right"></i> Exchange
                </span>
              </div>
            </div>

            <div class="card-body d-flex flex-column">
              <h5 class="card-title">{{product.title}}</h5>
              <p class="card-text text-muted flex-grow-1">
                {{product.description | slice:0:100}}
                <span *ngIf="product.description.length > 100">...</span>
              </p>

              <div class="product-details mb-3">
                <div class="d-flex justify-content-between align-items-center">
                  <span class="h5 text-primary mb-0">\${{product.price | number:'1.2-2'}}</span>
                  <small class="text-muted">{{product.condition}}</small>
                </div>
                <small class="text-muted">
                  <i class="bi bi-calendar3"></i>
                  Listed {{product.createdAt | date:'mediumDate'}}
                </small>
              </div>

              <!-- Action Buttons -->
              <div class="btn-group w-100" role="group">
                <a
                  [routerLink]="['/products', product.id]"
                  class="btn btn-outline-primary btn-sm">
                  <i class="bi bi-eye"></i> View
                </a>
                <button
                  class="btn btn-outline-warning btn-sm"
                  (click)="editProduct(product)">
                  <i class="bi bi-pencil"></i> Edit
                </button>
                <button
                  class="btn btn-outline-danger btn-sm"
                  (click)="deleteProduct(product)">
                  <i class="bi bi-trash"></i> Delete
                </button>
              </div>

              <!-- Product Stats -->
              <!-- <div class="product-stats mt-3 pt-3 border-top">
                <div class="row text-center">
                  <div class="col-4">
                    <small class="text-muted d-block">Views</small>
                    <strong>{{product.viewCount || 0}}</strong>
                  </div>
                  <div class="col-4">
                    <small class="text-muted d-block">Likes</small>
                    <strong>{{product.likeCount || 0}}</strong>
                  </div>
                  <div class="col-4">
                    <small class="text-muted d-block">Inquiries</small>
                    <strong>{{product.inquiryCount || 0}}</strong>
                  </div>
                </div>
              </div> -->
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading && getFilteredProducts().length === 0" class="text-center py-5">
        <div class="empty-state">
          <i class="bi bi-box-seam display-1 text-muted mb-3"></i>
          <h3>No products found</h3>
          <p class="text-muted mb-4">
            <span *ngIf="activeTab === 'all'">You haven't listed any products yet.</span>
            <span *ngIf="activeTab === 'approved'">You don't have any approved products.</span>
            <span *ngIf="activeTab === 'pending'">You don't have any pending products.</span>
          </p>
          <a routerLink="/add-product" class="btn btn-primary">
            <i class="bi bi-plus-circle"></i> List Your First Product
          </a>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div class="modal fade" id="deleteModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Confirm Delete</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to delete "<strong>{{productToDelete?.title}}</strong>"?</p>
            <p class="text-muted">This action cannot be undone.</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button
              type="button"
              class="btn btn-danger"
              (click)="confirmDelete()"
              [disabled]="isDeleting">
              <span *ngIf="isDeleting" class="spinner-border spinner-border-sm me-2"></span>
              {{isDeleting ? 'Deleting...' : 'Delete Product'}}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
    .product-card {
      transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
    }

    .product-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
    }

    .nav-tabs .nav-link {
      color: #6c757d;
      border: none;
      border-bottom: 2px solid transparent;
    }

    .nav-tabs .nav-link.active {
      color: #007bff;
      border-bottom-color: #007bff;
      background-color: transparent;
    }

    .product-stats {
      font-size: 0.875rem;
    }

    .empty-state {
      max-width: 400px;
      margin: 0 auto;
    }

    .btn-group .btn {
      flex: 1;
    }
  `,
  ],
})
export class MyProductsComponent implements OnInit {
  allProducts: IProduct[] = []
  approvedProducts: IProduct[] = []
  pendingProducts: IProduct[] = []
  activeTab = "all"
  isLoading = true
  isDeleting = false
  currentUser: IUser | null = null
  productToDelete: IProduct | null = null

  constructor(
    private productService: ProductService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user
      if (user) {
        this.loadProducts()
      }
    })
  }

  loadProducts(): void {
    if (!this.currentUser) return

    this.isLoading = true

    this.productService.getProductsByUser(this.currentUser.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.allProducts = response.data
          this.approvedProducts = this.allProducts.filter((p) => p.isApproved)
          this.pendingProducts = this.allProducts.filter((p) => !p.isApproved)
        }
        this.isLoading = false
      },
      error: () => {
        this.isLoading = false
      },
    })
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab
  }

  getFilteredProducts(): IProduct[] {
    switch (this.activeTab) {
      case "approved":
        return this.approvedProducts
      case "pending":
        return this.pendingProducts
      default:
        return this.allProducts
    }
  }

  getMainImage(product: IProduct): string {
    const mainImage = product.images?.find((img) => img.isMain)
    return mainImage?.imageUrl || "/placeholder.svg?height=250&width=300"
  }

  getProductStatus(product: IProduct): string {
    return product.isApproved ? "Approved" : "Pending Review"
  }

  getStatusBadgeClass(product: IProduct): string {
    return product.isApproved ? "bg-success" : "bg-warning"
  }

  editProduct(product: IProduct): void {
    // Navigate to edit product page
    // For now, just show an alert
    alert("Edit functionality will be implemented")
  }

  deleteProduct(product: IProduct): void {
    this.productToDelete = product
    const modal = new (window as any).bootstrap.Modal(document.getElementById("deleteModal"))
    modal.show()
  }

  confirmDelete(): void {
    if (!this.productToDelete) return

    this.isDeleting = true

    this.productService.deleteProduct(this.productToDelete.id).subscribe({
      next: (response) => {
        this.isDeleting = false
        if (response.success) {
          // Remove from arrays
          this.allProducts = this.allProducts.filter((p) => p.id !== this.productToDelete!.id)
          this.approvedProducts = this.approvedProducts.filter((p) => p.id !== this.productToDelete!.id)
          this.pendingProducts = this.pendingProducts.filter((p) => p.id !== this.productToDelete!.id)

          // Close modal
          const modal = (window as any).bootstrap.Modal.getInstance(document.getElementById("deleteModal"))
          modal.hide()

          this.productToDelete = null
        }
      },
      error: () => {
        this.isDeleting = false
        alert("Failed to delete product. Please try again.")
      },
    })
  }
}
