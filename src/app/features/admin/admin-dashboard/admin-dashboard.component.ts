import { Component, inject, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule } from "@angular/router"
import { ICategory } from "../../../core/models/icategory";
import { CategoryService } from "../../../core/services/category.service";
import { ProductService } from "../../../core/services/product.service";
import { OrderService } from "../../../core/services/order.service";
import { AdminUserService } from "../../../core/services/admin-user.service";
import { IProduct } from "../../../core/models/product.model";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-admin-dashboard",
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.component.html',
})
export class AdminDashboardComponent implements OnInit {
  stats = {
    totalUsers: 0,
    totalProducts: 0,
    totalCategories: 0,
    totalOrders: 0,
    totalRevenue: 0,
  }
  categories: ICategory[] = [];
  recentProducts: any[] = []
  recentOrders: any[] = []
  isLoading = false;
  
  categoryService = inject(CategoryService)
  productService = inject(ProductService)
  orderService = inject(OrderService)
  adminUserService = inject(AdminUserService)
  toastr = inject(ToastrService)
  
  products: IProduct[] = [];

  ngOnInit(): void {
    this.loadDashboardData()
  }

  loadDashboardData(): void {
    this.isLoading = true;
    
    // Load all data in parallel
    Promise.all([
      this.loadAllCategories(),
      this.loadAllProducts(),
      this.loadAllOrders(),
      this.loadUserCount(),
      this.loadRecentData()
    ]).finally(() => {
      this.isLoading = false;
    });
  }

            loadAllCategories() {
          return new Promise<void>((resolve) => {
            this.categoryService.getAll().subscribe({
              next: (res) => {
                if (res.success) {
                  // Check if data is in items array (paginated response)
                  if (res.data && (res.data as any).items) {
                    this.categories = (res.data as any).items || [];
                  } else if (res.data && Array.isArray(res.data)) {
                    this.categories = res.data;
                  } else {
                    this.categories = [];
                  }
                  
                  this.stats.totalCategories = this.categories.length;
                } else {
                  this.categories = [];
                  this.stats.totalCategories = 0;
                }
                resolve();
              },
              error: () => {
                this.categories = [];
                this.stats.totalCategories = 0;
                resolve();
              }
            });
          });
        }

  loadAllProducts() {
    return new Promise<void>((resolve) => {
      this.productService.getAllProducts().subscribe({
        next: (res) => {
          if (res.success) {
            this.products = res.data;
            this.stats.totalProducts = this.products.length;
          } else {
            this.products = [];
            this.stats.totalProducts = 0;
          }
          resolve();
        },
        error: () => {
          this.products = [];
          this.stats.totalProducts = 0;
          resolve();
        }
      });
    });
  }

  loadAllOrders() {
    return new Promise<void>((resolve) => {
      this.orderService.getAllOrders().subscribe({
        next: (res) => {
          if (res.success) {
            this.stats.totalOrders = res.data?.length || 0;
            // Calculate total revenue from orders
            this.stats.totalRevenue = res.data?.reduce((sum: number, order: any) => 
              sum + (order.totalAmount || 0), 0) || 0;
          } else {
            this.stats.totalOrders = 0;
            this.stats.totalRevenue = 0;
          }
          resolve();
        },
        error: () => {
          this.stats.totalOrders = 0;
          this.stats.totalRevenue = 0;
          resolve();
        }
      });
    });
  }

  loadUserCount() {
    return new Promise<void>((resolve) => {
      this.adminUserService.getAll().subscribe({
        next: (res) => {
          if (res.success) {
            this.stats.totalUsers = res.data?.length || 0;
          } else {
            this.stats.totalUsers = 0;
          }
          resolve();
        },
        error: () => {
          this.stats.totalUsers = 0;
          resolve();
        }
      });
    });
  }

  loadRecentData(): void {
    // Load recent products (last 5)
    this.productService.getAllProducts().subscribe({
      next: (res) => {
        if (res.success) {
          this.recentProducts = res.data?.slice(0, 5).map((product: any) => {
            // The API returns product with user object containing FullName
            let userName = 'Unknown';
            
            // Check if user object exists and has FullName
            if (product.user && product.user.FullName) {
              userName = product.user.FullName;
            } else if (product.user && product.user.fullName) {
              userName = product.user.fullName;
            } else if (product.userName) {
              userName = product.userName;
            } else if (product.sellerName) {
              userName = product.sellerName;
            } else if (product.ownerName) {
              userName = product.ownerName;
            }
            
            return {
              id: product.id,
              title: product.title,
              user: { FullName: userName },
              isApproved: product.isApproved
            };
          }) || [];
        }
      },
      error: () => {
        this.recentProducts = [];
      }
    });

    // Load recent orders (last 5)
    this.orderService.getAllOrders().subscribe({
      next: (res) => {
        if (res.success) {
          this.recentOrders = res.data?.slice(0, 5).map((order: any) => ({
            id: order.id,
            productTitle: order.productTitle || 'Unknown Product',
            customerName: order.buyerName || order.customerName || 'Unknown Customer',
            totalAmount: order.totalAmount || 0,
            status: order.status || 'Pending',
            createdAt: order.createdAt || new Date()
          })) || [];
        }
      },
      error: () => {
        this.recentOrders = [];
      }
    });
  }
}

