import { Component,  OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule } from "@angular/router"
import  { AuthService } from "../../core/services/auth.service"
import  { ProductService } from "../../core/services/product.service"
import  { OrderService } from "../../core/services/order.service"
import  { IProduct} from "../../core/models/product.model"
import  { Order, OrederReview } from "../../core/models/order.model"
import { CategoryService } from "../../core/services/category.service"
import { IUser } from "../../core/models/user.model"
import { environment } from "../../../environments/environment"
import { ReviewFormComponent } from "../review-form/review-form.component"

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [CommonModule, RouterModule, ReviewFormComponent],
template: `
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="container">
        <div class="row align-items-center min-vh-75 ">
                <div *ngIf="ordersNeedingReview.length > 0" class="alert alert-info">
  You have {{ ordersNeedingReview.length }} orders waiting for your review.
  <a  class="cursor-pointer" (click)="openModal(ordersNeedingReview[0])">Leave a review now</a>.
</div>
          <div class="col-lg-6">
      
            <div class="hero-content">
              <h1 class="display-4 fw-bold mb-4">Welcome back, {{currentUser?.fullName}}!</h1>
              <p class="lead mb-4">Here's what's happening with your account today. Manage your products, track orders, and explore new opportunities.</p>
              <div class="hero-buttons">
                <a routerLink="/add-product" class="btn btn-primary btn-lg me-3">
                  <i class="fas fa-plus me-2"></i>Add Product
                </a>
                <a routerLink="/products" class="btn btn-outline-primary btn-lg">
                  <i class="fas fa-shopping-bag me-2"></i>Browse Products
                </a>
              </div>
              <div class="hero-stats mt-5">
                <div class="row">
                  <div class="col-4">
                    <div class="stat-item">
                      <h3 class="stat-number">{{stats.totalProducts}}</h3>
                      <p class="stat-label">My Products</p>
                    </div>
                  </div>
                  <div class="col-4">
                    <div class="stat-item">
                      <h3 class="stat-number">{{stats.totalOrders}}</h3>
                      <p class="stat-label">Orders</p>
                    </div>
                  </div>
                  <!-- <div class="col-4">
                    <div class="stat-item">
                      <h3 class="stat-number">\${{stats.walletBalance}}</h3>
                      <p class="stat-label">Wallet</p>
                    </div>
                  </div> -->
                </div>
              </div>
            </div>
          </div>
          <div class="col-lg-6">
            <div class="hero-image">
              <img src="#" alt="Dashboard" class="img-fluid rounded-4 shadow-lg">
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Dashboard Content -->
    <section class="dashboard-section py-5">
      <div class="container">
        <div class="row">
          <!-- Quick Actions -->
          <div class="col-lg-4 col-md-6 mb-4">
            <div class="feature-card text-center">
              <div class="feature-icon">
                <i class="fas fa-plus"></i>
              </div>
              <h5>Add Product</h5>
              <p>List a new item for sale or exchange</p>
              <a routerLink="/add-product" class="btn btn-primary">Get Started</a>
            </div>
          </div>

          <div class="col-lg-4 col-md-6 mb-4">
            <div class="feature-card text-center">
              <div class="feature-icon">
                <i class="fas fa-box"></i>
              </div>
              <h5>My Products</h5>
              <p>Manage your listed products</p>
              <a routerLink="/my-products" class="btn btn-primary">View Products</a>
            </div>
          </div>

<!-- <div class="col-lg-3 col-md-6 mb-4">
            <div class="feature-card text-center">
              <div class="feature-icon">
                <i class="fas fa-plus"></i>
              </div>
              <h5>Add Category</h5>
              <p>List new Categories</p>
              <a routerLink="/categories" class="btn btn-primary">Get Started</a>
            </div>
          </div> -->

          <div class="col-lg-4 col-md-6 mb-4">
            <div class="feature-card text-center">
              <div class="feature-icon">
                <i class="fas fa-receipt"></i>
              </div>
              <h5>Orders</h5>
              <p>Track your purchases and sales</p>
              <a routerLink="/orders" class="btn btn-primary">View Orders</a>
            </div>
          </div>

          <!-- <div class="col-lg-3 col-md-6 mb-4">
            <div class="feature-card text-center">
              <div class="feature-icon">
                <i class="fas fa-wallet"></i>
              </div>
              <h5>Wallet</h5>
              <p>Manage your account balance</p>
              <a routerLink="/wallet" class="btn btn-primary">Open Wallet</a>
            </div>
          </div> -->
        </div>

        <!-- Recent Activity -->
        <div class="row mt-5">
          <div class="col-lg-6 mb-4">
            <div class="card shadow-sm h-100">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0"><i class="fas fa-box me-2"></i>Recent Products</h5>
                <a routerLink="/my-products" class="btn btn-outline-primary btn-sm">View All</a>
              </div>
              <div class="card-body">
                <div *ngIf="recentProducts.length === 0" class="text-center py-4">
                  <i class="fas fa-box text-muted" style="font-size: 3rem;"></i>
                  <p class="text-muted mt-2">No products yet</p>
                  <a routerLink="/add-product" class="btn btn-primary btn-sm">Add Your First Product</a>
                </div>

                <div *ngFor="let product of recentProducts" class="d-flex align-items-center mb-3">
                  <img [src]="getMainImage(product)" class="rounded me-3"
                       style="width: 50px; height: 50px; object-fit: cover;">
                  <div class="flex-grow-1">
                    <h6 class="mb-0">{{product.title}}</h6>
                    <small class="text-muted">\${{product.price | number:'1.2-2'}}</small>
                  </div>
                  <div>
                    <span class="badge" [class]="getProductStatusClass(product)">
                      {{getProductStatus(product)}}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-lg-6 mb-4">
            <div class="card shadow-sm h-100">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0"><i class="fas fa-receipt me-2"></i>Recent Orders</h5>
                <a routerLink="/orders" class="btn btn-outline-primary btn-sm">View All</a>
              </div>
              <div class="card-body">
                <div *ngIf="recentOrders.length === 0" class="text-center py-4">
                  <i class="fas fa-receipt text-muted" style="font-size: 3rem;"></i>
                  <p class="text-muted mt-2">No orders yet</p>
                  <a routerLink="/products" class="btn btn-primary btn-sm">Start Shopping</a>
                </div>

                <div *ngFor="let order of recentOrders" class="d-flex align-items-center mb-3">
                  <div class="me-3">
                    <div class="bg-light rounded d-flex align-items-center justify-content-center"
                         style="width: 50px; height: 50px;">
                      <i class="fas fa-receipt text-muted"></i>
                    </div>
                  </div>
                  <div class="flex-grow-1">
                    <h6 class="mb-0">Order #{{order.id}}</h6>
                    <small class="text-muted">\${{order.totalAmount | number:'1.2-2'}}</small>
                  </div>
                  <div>
                    <span class="badge" [class]="getOrderStatusClass(order.status)">
                      {{order.status}}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Activity Feed -->
        <div class="row">
          <div class="col-12">
            <div class="card shadow-sm">
              <div class="card-header">
                <h5 class="mb-0"><i class="fas fa-activity me-2"></i>Recent Activity</h5>
              </div>
              <div class="card-body">
                <div class="activity-feed">
                  <div class="activity-item d-flex align-items-start mb-3" *ngFor="let activity of recentActivity">
                    <div class="activity-icon me-3">
                      <div [class]="activity.iconClass" style="width: 40px; height: 40px;">
                        <i [class]="activity.icon" class="text-white"></i>
                      </div>
                    </div>
                    <div class="flex-grow-1">
                      <p class="mb-1">{{activity.message}}</p>
                      <small class="text-muted">{{activity.timestamp | date:'short'}}</small>
                    </div>
                  </div>

                  <div *ngIf="recentActivity.length === 0" class="text-center py-4">
                    <i class="fas fa-activity text-muted" style="font-size: 3rem;"></i>
                    <p class="text-muted mt-2">No recent activity</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Modal: Add Review -->
 <div class="modal fade" id="reviewModal" tabindex="-1" aria-labelledby="reviewModalLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="reviewModalLabel">Add Review</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <!-- هنا تحطي component الفورم بتاعك -->
        <app-review-form    *ngIf="selectedOrder" [order]="selectedOrder"  (reviewDone)="onReviewDone()"></app-review-form>
      </div>
    </div>
  </div>
</div>
    </section>
  `,
  styles: [
    `
    .activity-icon {
      flex-shrink: 0;
    }

    .activity-icon > div {
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .card {
      transition: transform 0.2s ease-in-out;
    }

    .card:hover {
      transform: translateY(-2px);
    }
  `,
  ],
})
export class DashboardComponent implements OnInit {
  currentUser: IUser | null = null
  recentProducts: IProduct[] = []
  recentOrders: Order[] = []
  recentActivity: any[] = []
  ordersNeedingReview: OrederReview[] = []
  selectedOrder: OrederReview | undefined  = {} as OrederReview

  stats = {
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    walletBalance: 247.85,
  }

  constructor(
    private authService: AuthService,
    private productService: ProductService,
    private orderService: OrderService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user
      if (user) {
        this.loadDashboardData()
        this.loadOrdersNeedingReview()
      }
    })
  }

  loadDashboardData(): void {
    if (!this.currentUser) return

    // Load user's products
    this.productService.getProductsByUser(this.currentUser.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.recentProducts = response.data?.slice(0, 5) || []
          this.stats.totalProducts = response.data?.length || 0
        } else {
          this.recentProducts = []
          this.stats.totalProducts = 0
        }
      },
      error: (error) => {
        this.recentProducts = []
        this.stats.totalProducts = 0
      },
    })

    // Load user's orders
    this.orderService.getMyOrders(this.currentUser.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.recentOrders = response.data?.slice(0, 5) || []
          this.stats.totalOrders = response.data?.length || 0
          this.stats.pendingOrders = response.data?.filter((o) => o.status === "Pending").length || 0
        } else {
          this.recentOrders = []
          this.stats.totalOrders = 0
          this.stats.pendingOrders = 0
        }
      },
      error: (error) => {
        this.recentOrders = []
        this.stats.totalOrders = 0
        this.stats.pendingOrders = 0
      },
    })

    // Mock recent activity
    this.recentActivity = [
      {
        message: "You listed a new product",
        timestamp: new Date(),
        icon: "fas fa-plus-circle",
        iconClass: "bg-success rounded-circle d-flex align-items-center justify-content-center",
      },
      {
        message: "Order #123 was delivered",
        timestamp: new Date(Date.now() - 86400000),
        icon: "fas fa-check-circle",
        iconClass: "bg-primary rounded-circle d-flex align-items-center justify-content-center",
      },
      {
        message: "You received a new message",
        timestamp: new Date(Date.now() - 172800000),
        icon: "fas fa-envelope",
        iconClass: "bg-info rounded-circle d-flex align-items-center justify-content-center",
      },
    ]
  }
  loadOrdersNeedingReview(): void { 
    this.orderService.getOrdersForReview().subscribe({
      next: (response:any) => {
        if (response.success) {
          this.ordersNeedingReview = [...response.data];
        } 
      },
      error: (err:any) => {
        console.error("Failed to load orders needing review", err);
      },
    })
  }

  openModal(order:OrederReview): void { 
    // Set to undefined first to force destroy
    this.selectedOrder = undefined;

    // Delay a tick so Angular destroys the component
    setTimeout(() => {
      this.selectedOrder = order;
      const modal = new (window as any).bootstrap.Modal(document.getElementById("reviewModal"));
      modal.show();
    });
  }


  // ngAfterViewInit() {
  //   const modalEl = document.getElementById('reviewModal');
  //   if (modalEl) {
  //     modalEl.addEventListener('hidden.bs.modal', () => {
  //       this.loadOrdersNeedingReview(); // Always refresh when modal closes
  //     });
  //   }
  // }

getMainImage(product: IProduct): string {
    const mainImage = product.images?.find((img) => img.isMain)
   return mainImage && mainImage.imageUrl
    ? `${environment.apiUrl}${mainImage.imageUrl}`
    : 'product.png';
  }
  getProductStatus(product: IProduct): string {
    return product.isApproved ? "Approved" : "Pending"
  }

  getProductStatusClass(product: IProduct): string {
    return product.isApproved ? "bg-success" : "bg-warning"
  }

  getOrderStatusClass(status: string): string {
    switch (status) {
      case "Pending":
        return "bg-warning text-dark"
      case "Confirmed":
        return "bg-info"
      case "Shipped":
        return "bg-primary"
      case "Delivered":
        return "bg-success"
      case "Cancelled":
        return "bg-danger"
      default:
        return "bg-secondary"
    }
  }
  onReviewDone() {
    this.loadOrdersNeedingReview();
   console.log("Review done,",this.ordersNeedingReview);
  }
}
