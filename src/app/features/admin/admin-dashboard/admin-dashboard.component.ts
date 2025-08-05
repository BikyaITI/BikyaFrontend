import { Component, inject, OnInit, OnDestroy } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule } from "@angular/router"
import { ICategory } from "../../../core/models/icategory";
import { CategoryService } from "../../../core/services/category.service";
import { ProductService } from "../../../core/services/product.service";
import { OrderService } from "../../../core/services/order.service";
import { AdminUserService } from "../../../core/services/admin-user.service";
import { IProduct } from "../../../core/models/product.model";
import { ToastrService } from "ngx-toastr";
import { interval, Subscription } from 'rxjs';
import { ChartConfiguration, ChartType, ChartOptions } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { addMonths, format } from 'date-fns';

@Component({
  selector: "app-admin-dashboard",
  standalone: true,
  imports: [CommonModule, RouterModule, NgChartsModule],
  templateUrl: './admin-dashboard.component.html',
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
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
  private refreshSubscription?: Subscription;
  
  // Modal control
  showModal = false;
  currentChartType: 'users' | 'products' | 'categories' | 'orders' = 'users';
  
  categoryService = inject(CategoryService)
  productService = inject(ProductService)
  orderService = inject(OrderService)
  adminUserService = inject(AdminUserService)
  toastr = inject(ToastrService)
  
  products: IProduct[] = [];

  // تحسين إعدادات الشارت للطلبات
  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Orders',
        fill: true,
        tension: 0.4,
        borderColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        pointBackgroundColor: '#667eea',
        pointBorderColor: '#fff',
        pointRadius: 6,
        pointHoverRadius: 8,
        borderWidth: 3,
      }
    ]
  };

  public lineChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: {
            size: 12,
            weight: 'bold'
          },
          color: '#374151',
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#667eea',
        borderWidth: 2,
        cornerRadius: 12,
        displayColors: false,
        padding: 12,
        callbacks: {
          label: function(context: any) {
            return `Orders: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 11
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 11
          },
          callback: function(value: any) {
            return Math.floor(Number(value));
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  public lineChartType: ChartType = 'line';

  // تحسين إعدادات شارت المستخدمين
  public usersBarChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Users',
        backgroundColor: [
          'rgba(240, 147, 251, 0.9)',
          'rgba(240, 147, 251, 0.8)',
          'rgba(240, 147, 251, 0.7)',
          'rgba(240, 147, 251, 0.6)',
          'rgba(240, 147, 251, 0.5)',
          'rgba(240, 147, 251, 0.4)',
          'rgba(240, 147, 251, 0.3)',
          'rgba(240, 147, 251, 0.2)',
          'rgba(240, 147, 251, 0.9)',
          'rgba(240, 147, 251, 0.8)',
          'rgba(240, 147, 251, 0.7)',
          'rgba(240, 147, 251, 0.6)'
        ],
        borderColor: '#f093fb',
        borderWidth: 2,
        borderRadius: 12,
        borderSkipped: false,
        barThickness: 25,
      }
    ]
  };

  public usersBarChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: {
            size: 12,
            weight: 'bold'
          },
          color: '#374151',
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#f093fb',
        borderWidth: 2,
        cornerRadius: 12,
        displayColors: false,
        padding: 12,
        callbacks: {
          label: function(context: any) {
            return `Users: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 10
          },
          maxRotation: 45
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 11
          },
          callback: function(value: any) {
            return Math.floor(Number(value));
          }
        }
      }
    }
  };

  public usersBarChartType: ChartType = 'bar';

  // تحسين إعدادات شارت المنتجات
  public productsBarChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Products',
        backgroundColor: [
          'rgba(79, 172, 254, 0.9)',
          'rgba(79, 172, 254, 0.8)',
          'rgba(79, 172, 254, 0.7)',
          'rgba(79, 172, 254, 0.6)',
          'rgba(79, 172, 254, 0.5)',
          'rgba(79, 172, 254, 0.4)',
          'rgba(79, 172, 254, 0.3)',
          'rgba(79, 172, 254, 0.2)',
          'rgba(79, 172, 254, 0.9)',
          'rgba(79, 172, 254, 0.8)',
          'rgba(79, 172, 254, 0.7)',
          'rgba(79, 172, 254, 0.6)'
        ],
        borderColor: '#4facfe',
        borderWidth: 2,
        borderRadius: 12,
        borderSkipped: false,
        barThickness: 25,
      }
    ]
  };

  public productsBarChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: {
            size: 12,
            weight: 'bold'
          },
          color: '#374151',
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#4facfe',
        borderWidth: 2,
        cornerRadius: 12,
        displayColors: false,
        padding: 12,
        callbacks: {
          label: function(context: any) {
            return `Products: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 10
          },
          maxRotation: 45
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 11
          },
          callback: function(value: any) {
            return Math.floor(Number(value));
          }
        }
      }
    }
  };

  public productsBarChartType: ChartType = 'bar';

  // Chart for categories
  public categoriesBarChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Categories',
        backgroundColor: [
          'rgba(67, 233, 123, 0.9)',
          'rgba(67, 233, 123, 0.8)',
          'rgba(67, 233, 123, 0.7)',
          'rgba(67, 233, 123, 0.6)',
          'rgba(67, 233, 123, 0.5)',
          'rgba(67, 233, 123, 0.4)',
          'rgba(67, 233, 123, 0.3)',
          'rgba(67, 233, 123, 0.2)',
          'rgba(67, 233, 123, 0.9)',
          'rgba(67, 233, 123, 0.8)',
          'rgba(67, 233, 123, 0.7)',
          'rgba(67, 233, 123, 0.6)'
        ],
        borderColor: '#43e97b',
        borderWidth: 2,
        borderRadius: 12,
        borderSkipped: false,
        barThickness: 25,
      }
    ]
  };

  public categoriesBarChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: {
            size: 12,
            weight: 'bold'
          },
          color: '#374151',
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#43e97b',
        borderWidth: 2,
        cornerRadius: 12,
        displayColors: false,
        padding: 12,
        callbacks: {
          label: function(context: any) {
            return `Categories: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 10
          },
          maxRotation: 45
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 11
          },
          callback: function(value: any) {
            return Math.floor(Number(value));
          }
        }
      }
    }
  };

  public categoriesBarChartType: ChartType = 'bar';

  ngOnInit(): void {
    console.log('AdminDashboardComponent: Initializing...'); // Debug
    this.loadDashboardData()
    
    // Auto-refresh dashboard data every 30 seconds
    this.refreshSubscription = interval(30000).subscribe(() => {
      this.loadDashboardData();
    });
  }

  ngOnDestroy(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  // Modal control methods
  showChart(chartType: 'users' | 'products' | 'categories' | 'orders'): void {
    this.currentChartType = chartType;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  getChartTitle(): string {
    switch (this.currentChartType) {
      case 'users':
        return 'Users Activity Chart';
      case 'products':
        return 'Products Distribution Chart';
      case 'categories':
        return 'Categories Overview Chart';
      case 'orders':
        return 'Orders Status Chart';
      default:
        return 'Chart';
    }
  }

  getChartData(): any {
    switch (this.currentChartType) {
      case 'users':
        return this.usersBarChartData;
      case 'products':
        return this.productsBarChartData;
      case 'categories':
        return this.categoriesBarChartData;
      case 'orders':
        return this.lineChartData;
      default:
        return this.usersBarChartData;
    }
  }

  getChartType(): ChartType {
    switch (this.currentChartType) {
      case 'users':
        return this.usersBarChartType;
      case 'products':
        return this.productsBarChartType;
      case 'categories':
        return this.categoriesBarChartType;
      case 'orders':
        return this.lineChartType;
      default:
        return this.usersBarChartType;
    }
  }

  getChartOptions(): ChartOptions {
    switch (this.currentChartType) {
      case 'users':
        return this.usersBarChartOptions;
      case 'products':
        return this.productsBarChartOptions;
      case 'categories':
        return this.categoriesBarChartOptions;
      case 'orders':
        return this.lineChartOptions;
      default:
        return this.usersBarChartOptions;
    }
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

            // تحليل التصنيفات حسب عدد المنتجات
            const categoryStats = this.analyzeCategoriesByProductCount(this.categories);
            this.categoriesBarChartData.labels = categoryStats.labels;
            this.categoriesBarChartData.datasets[0].data = categoryStats.data;
          } else {
            this.categories = [];
            this.stats.totalCategories = 0;
            this.categoriesBarChartData.labels = [];
            this.categoriesBarChartData.datasets[0].data = [];
          }
          resolve();
        },
        error: () => {
          this.categories = [];
          this.stats.totalCategories = 0;
          this.categoriesBarChartData.labels = [];
          this.categoriesBarChartData.datasets[0].data = [];
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

            // تحليل المنتجات حسب التصنيف بدلاً من التاريخ
            const categoryStats = this.analyzeProductsByCategory(this.products);
            this.productsBarChartData.labels = categoryStats.labels;
            this.productsBarChartData.datasets[0].data = categoryStats.data;
          } else {
            this.products = [];
            this.stats.totalProducts = 0;
            this.productsBarChartData.labels = [];
            this.productsBarChartData.datasets[0].data = [];
          }
          resolve();
        },
        error: () => {
          this.products = [];
          this.stats.totalProducts = 0;
          this.productsBarChartData.labels = [];
          this.productsBarChartData.datasets[0].data = [];
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
            this.stats.totalRevenue = res.data?.reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0) || 0;

            // تحليل الطلبات حسب الحالة بدلاً من التاريخ
            const orderStats = this.analyzeOrdersByStatus(res.data);
            this.lineChartData.labels = orderStats.labels;
            this.lineChartData.datasets[0].data = orderStats.data;
          } else {
            this.stats.totalOrders = 0;
            this.stats.totalRevenue = 0;
            this.lineChartData.labels = [];
            this.lineChartData.datasets[0].data = [];
          }
          resolve();
        },
        error: (err) => {
          this.stats.totalOrders = 0;
          this.stats.totalRevenue = 0;
          this.lineChartData.labels = [];
          this.lineChartData.datasets[0].data = [];
          resolve();
        }
      });
    });
  }

  loadUserCount() {
    return new Promise<void>((resolve) => {
      this.adminUserService.getAll('', '', 1, 10000).subscribe({
        next: (res) => {
          if (res.success) {
            this.stats.totalUsers = res.data?.length || 0;

            // تحليل المستخدمين حسب النشاط بدلاً من التاريخ
            const userStats = this.analyzeUsersByActivity(res.data);
            this.usersBarChartData.labels = userStats.labels;
            this.usersBarChartData.datasets[0].data = userStats.data;
          } else {
            this.stats.totalUsers = 0;
            this.usersBarChartData.labels = [];
            this.usersBarChartData.datasets[0].data = [];
          }
          resolve();
        },
        error: () => {
          this.stats.totalUsers = 0;
          this.usersBarChartData.labels = [];
          this.usersBarChartData.datasets[0].data = [];
          resolve();
        }
      });
    });
  }

  // تحليل التصنيفات حسب عدد المنتجات
  analyzeCategoriesByProductCount(categories: any[]): { labels: string[], data: number[] } {
    const categoryStats: { [key: string]: number } = {};
    
    categories.forEach(category => {
      const categoryName = category.name || 'Unknown';
      const productCount = category.products?.length || 0;
      categoryStats[categoryName] = productCount;
    });

    const labels = Object.keys(categoryStats);
    const data = Object.values(categoryStats);

    return { labels, data };
  }

  // تحليل المنتجات حسب التصنيف
  analyzeProductsByCategory(products: any[]): { labels: string[], data: number[] } {
    const categoryCount: { [key: string]: number } = {};
    
    products.forEach(product => {
      const categoryName = product.category?.name || product.categoryName || 'Unknown';
      categoryCount[categoryName] = (categoryCount[categoryName] || 0) + 1;
    });

    const labels = Object.keys(categoryCount);
    const data = Object.values(categoryCount);

    return { labels, data };
  }

  // تحليل الطلبات حسب الحالة
  analyzeOrdersByStatus(orders: any[]): { labels: string[], data: number[] } {
    const statusCount: { [key: string]: number } = {};
    
    orders.forEach(order => {
      const status = order.status || 'Unknown';
      statusCount[status] = (statusCount[status] || 0) + 1;
    });

    const labels = Object.keys(statusCount);
    const data = Object.values(statusCount);

    return { labels, data };
  }

  // تحليل المستخدمين حسب النشاط
  analyzeUsersByActivity(users: any[]): { labels: string[], data: number[] } {
    const activityCount: { [key: string]: number } = {
      'Active': 0,
      'Inactive': 0,
      'Banned': 0
    };
    
    users.forEach(user => {
      if (user.isDeleted) {
        activityCount['Banned']++;
      } else if (user.isActive) {
        activityCount['Active']++;
      } else {
        activityCount['Inactive']++;
      }
    });

    const labels = Object.keys(activityCount);
    const data = Object.values(activityCount);

    return { labels, data };
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

