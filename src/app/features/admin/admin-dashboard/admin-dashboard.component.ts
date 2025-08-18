import { Component, inject, OnInit, OnDestroy } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule } from "@angular/router"
import { ICategory } from "../../../core/models/icategory";
import { CategoryService } from "../../../core/services/category.service";
import { ProductService } from "../../../core/services/product.service";
import { OrderService } from "../../../core/services/order.service";
import { AdminUserService } from "../../../core/services/admin-user.service";
import { DashboardService, DashboardStats } from "../../../core/services/dashboard.service";
import { IProduct } from "../../../core/models/product.model";
import { ToastrService } from "ngx-toastr";
import { interval, Subscription } from 'rxjs';
import { ChartConfiguration, ChartType, ChartOptions } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';

@Component({
  selector: "app-admin-dashboard",
  standalone: true,
  imports: [CommonModule, RouterModule, NgChartsModule],
  templateUrl: './admin-dashboard.component.html',
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  // Dashboard statistics
  stats = {
    totalUsers: 0,
    totalProducts: 0,
    totalCategories: 0,
    totalOrders: 0,
    totalSales: 0,
    totalPlatformProfit: 0,
    totalSellerProfit: 0,
    completedOrders: 0,
    pendingOrders: 0,
    averageOrderValue: 0
  }

  // Data arrays
  categories: ICategory[] = [];
  recentProducts: any[] = [];
  recentOrders: any[] = [];
  products: IProduct[] = [];

  // UI state
  isLoading = false;
  showModal = false;
  currentChartType: 'users' | 'products' | 'categories' | 'orders' = 'users';

  // Services
  categoryService = inject(CategoryService);
  productService = inject(ProductService);
  orderService = inject(OrderService);
  adminUserService = inject(AdminUserService);
  dashboardService = inject(DashboardService);
  toastr = inject(ToastrService);

  // Subscriptions
  private refreshSubscription?: Subscription;

  // Chart configurations
  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [{
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
    }]
  };

  public lineChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: { size: 12, weight: 'bold' },
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
          label: function (context: any) {
            return `Orders: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: { color: '#6b7280', font: { size: 11 } }
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: { 
          color: '#6b7280', 
          font: { size: 11 },
          callback: function (value: any) {
            return Math.floor(Number(value));
          }
        }
      }
    },
    interaction: { intersect: false, mode: 'index' }
  };

  public lineChartType: ChartType = 'line';

  // Users chart configuration
  public usersBarChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Users',
      backgroundColor: [
        'rgba(240, 147, 251, 0.9)', 'rgba(240, 147, 251, 0.8)', 'rgba(240, 147, 251, 0.7)',
        'rgba(240, 147, 251, 0.6)', 'rgba(240, 147, 251, 0.5)', 'rgba(240, 147, 251, 0.4)',
        'rgba(240, 147, 251, 0.3)', 'rgba(240, 147, 251, 0.2)', 'rgba(240, 147, 251, 0.9)',
        'rgba(240, 147, 251, 0.8)', 'rgba(240, 147, 251, 0.7)', 'rgba(240, 147, 251, 0.6)'
      ],
      borderColor: '#f093fb',
      borderWidth: 2,
      borderRadius: 12,
      borderSkipped: false,
      barThickness: 25,
    }]
  };

  public usersBarChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: { size: 12, weight: 'bold' },
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
          label: function (context: any) {
            return `Users: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#6b7280', font: { size: 10 }, maxRotation: 45 }
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: { 
          color: '#6b7280', 
          font: { size: 11 },
          callback: function (value: any) {
            return Math.floor(Number(value));
          }
        }
      }
    }
  };

  public usersBarChartType: ChartType = 'bar';

  // Products chart configuration
  public productsBarChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Products',
      backgroundColor: [
        'rgba(79, 172, 254, 0.9)', 'rgba(79, 172, 254, 0.8)', 'rgba(79, 172, 254, 0.7)',
        'rgba(79, 172, 254, 0.6)', 'rgba(79, 172, 254, 0.5)', 'rgba(79, 172, 254, 0.4)',
        'rgba(79, 172, 254, 0.3)', 'rgba(79, 172, 254, 0.2)', 'rgba(79, 172, 254, 0.9)',
        'rgba(79, 172, 254, 0.8)', 'rgba(79, 172, 254, 0.7)', 'rgba(79, 172, 254, 0.6)'
      ],
      borderColor: '#4facfe',
      borderWidth: 2,
      borderRadius: 12,
      borderSkipped: false,
      barThickness: 25,
    }]
  };

  public productsBarChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: { size: 12, weight: 'bold' },
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
          label: function (context: any) {
            return `Products: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#6b7280', font: { size: 10 }, maxRotation: 45 }
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: { 
          color: '#6b7280', 
          font: { size: 11 },
          callback: function (value: any) {
            return Math.floor(Number(value));
          }
        }
      }
    }
  };

  public productsBarChartType: ChartType = 'bar';

  // Categories chart configuration
  public categoriesBarChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Categories',
      backgroundColor: [
        'rgba(67, 233, 123, 0.9)', 'rgba(67, 233, 123, 0.8)', 'rgba(67, 233, 123, 0.7)',
        'rgba(67, 233, 123, 0.6)', 'rgba(67, 233, 123, 0.5)', 'rgba(67, 233, 123, 0.4)',
        'rgba(67, 233, 123, 0.3)', 'rgba(67, 233, 123, 0.2)', 'rgba(67, 233, 123, 0.9)',
        'rgba(67, 233, 123, 0.8)', 'rgba(67, 233, 123, 0.7)', 'rgba(67, 233, 123, 0.6)'
      ],
      borderColor: '#43e97b',
      borderWidth: 2,
      borderRadius: 12,
      borderSkipped: false,
      barThickness: 25,
    }]
  };

  public categoriesBarChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: { size: 12, weight: 'bold' },
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
          label: function (context: any) {
            return `Categories: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#6b7280', font: { size: 10 }, maxRotation: 45 }
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: { 
          color: '#6b7280', 
          font: { size: 11 },
          callback: function (value: any) {
            return Math.floor(Number(value));
          }
        }
      }
    }
  };

  public categoriesBarChartType: ChartType = 'bar';

  ngOnInit(): void {
    console.log('AdminDashboardComponent: Initializing...');
    this.loadDashboardData();

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
    const titles = {
      'users': 'Users Activity Chart',
      'products': 'Products Distribution Chart',
      'categories': 'Categories Overview Chart',
      'orders': 'Orders Status Chart'
    };
    return titles[this.currentChartType] || 'Chart';
  }

  getChartData(): any {
    const chartData = {
      'users': this.usersBarChartData,
      'products': this.productsBarChartData,
      'categories': this.categoriesBarChartData,
      'orders': this.lineChartData
    };
    return chartData[this.currentChartType] || this.usersBarChartData;
  }

  getChartType(): ChartType {
    const chartTypes = {
      'users': this.usersBarChartType,
      'products': this.productsBarChartType,
      'categories': this.categoriesBarChartType,
      'orders': this.lineChartType
    };
    return chartTypes[this.currentChartType] || this.usersBarChartType;
  }

  getChartOptions(): ChartOptions {
    const chartOptions = {
      'users': this.usersBarChartOptions,
      'products': this.productsBarChartOptions,
      'categories': this.categoriesBarChartOptions,
      'orders': this.lineChartOptions
    };
    return chartOptions[this.currentChartType] || this.usersBarChartOptions;
  }

  // Main data loading method
  loadDashboardData(): void {
    this.isLoading = true;

    Promise.all([
      this.loadAllCategories(),
      this.loadAllProducts(),
      this.loadAllOrders(),
      this.loadUserCount(),
      this.loadRecentData(),
      this.loadDashboardStats()
    ]).finally(() => {
      this.isLoading = false;
    });
  }

  // Load dashboard statistics
  loadDashboardStats(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.dashboardService.getDashboardStats().subscribe({
        next: (res) => {
          if (res.success && res.data) {
            const stats = res.data;
            this.stats.totalSales = stats.totalSales;
            this.stats.totalPlatformProfit = stats.totalPlatformProfit;
            this.stats.totalSellerProfit = stats.totalSellerProfit;
            this.stats.completedOrders = stats.completedOrders;
            this.stats.pendingOrders = stats.pendingOrders;
            this.stats.averageOrderValue = stats.averageOrderValue;
            
            this.toastr.success('Dashboard statistics loaded successfully');
          } else {
            this.toastr.warning('Failed to load dashboard statistics');
          }
          resolve();
        },
        error: (err) => {
          console.error('Error loading dashboard stats:', err);
          this.toastr.error('Failed to load dashboard statistics');
          resolve();
        }
      });
    });
  }

  // Load categories data
  loadAllCategories(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.categoryService.getAll().subscribe({
        next: (res) => {
          if (res.success) {
            if (res.data && (res.data as any).items) {
              this.categories = (res.data as any).items || [];
            } else if (res.data && Array.isArray(res.data)) {
              this.categories = res.data;
            } else {
              this.categories = [];
            }

            this.stats.totalCategories = this.categories.length;
            this.updateCategoriesChart();
          } else {
            this.categories = [];
            this.stats.totalCategories = 0;
            this.clearCategoriesChart();
          }
          resolve();
        },
        error: () => {
          this.categories = [];
          this.stats.totalCategories = 0;
          this.clearCategoriesChart();
          resolve();
        }
      });
    });
  }

  // Load products data
  loadAllProducts(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.productService.getAllProducts().subscribe({
        next: (res) => {
          if (res.success) {
            this.products = res.data;
            this.stats.totalProducts = this.products.length;
            this.updateProductsChart();
          } else {
            this.products = [];
            this.stats.totalProducts = 0;
            this.clearProductsChart();
          }
          resolve();
        },
        error: () => {
          this.products = [];
          this.stats.totalProducts = 0;
          this.clearProductsChart();
          resolve();
        }
      });
    });
  }

  // Load orders data
  loadAllOrders(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.orderService.getAllOrders().subscribe({
        next: (res) => {
          if (res.success) {
            this.stats.totalOrders = res.data?.length || 0;
            this.updateOrdersChart(res.data);
          } else {
            this.stats.totalOrders = 0;
            this.clearOrdersChart();
          }
          resolve();
        },
        error: () => {
          this.stats.totalOrders = 0;
          this.clearOrdersChart();
          resolve();
        }
      });
    });
  }

  // Load user count
  loadUserCount(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.adminUserService.getAll('', '', 1, 10000).subscribe({
        next: (res) => {
          if (res.success) {
            this.stats.totalUsers = res.data?.length || 0;
            this.updateUsersChart(res.data);
          } else {
            this.stats.totalUsers = 0;
            this.clearUsersChart();
          }
          resolve();
        },
        error: () => {
          this.stats.totalUsers = 0;
          this.clearUsersChart();
          resolve();
        }
      });
    });
  }

  // Load recent data
  loadRecentData(): void {
    this.loadRecentProducts();
    this.loadRecentOrders();
  }

  // Load recent products
  loadRecentProducts(): void {
    this.productService.getAllProducts().subscribe({
      next: (res) => {
        if (res.success) {
          this.recentProducts = res.data?.slice(0, 5).map((product: any) => {
            let userName = 'Unknown';
            if (product.user?.FullName) {
              userName = product.user.FullName;
            } else if (product.user?.fullName) {
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
  }

  // Load recent orders
  loadRecentOrders(): void {
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

  // Chart update methods
  updateCategoriesChart(): void {
    const categoryStats = this.analyzeCategoriesByProductCount(this.categories);
    this.categoriesBarChartData.labels = categoryStats.labels;
    this.categoriesBarChartData.datasets[0].data = categoryStats.data;
  }

  updateProductsChart(): void {
    const categoryStats = this.analyzeProductsByCategory(this.products);
    this.productsBarChartData.labels = categoryStats.labels;
    this.productsBarChartData.datasets[0].data = categoryStats.data;
  }

  updateOrdersChart(orders: any[]): void {
    const orderStats = this.analyzeOrdersByStatus(orders);
    this.lineChartData.labels = orderStats.labels;
    this.lineChartData.datasets[0].data = orderStats.data;
  }

  updateUsersChart(users: any[]): void {
    const userStats = this.analyzeUsersByActivity(users);
    this.usersBarChartData.labels = userStats.labels;
    this.usersBarChartData.datasets[0].data = userStats.data;
  }

  // Chart clear methods
  clearCategoriesChart(): void {
    this.categoriesBarChartData.labels = [];
    this.categoriesBarChartData.datasets[0].data = [];
  }

  clearProductsChart(): void {
    this.productsBarChartData.labels = [];
    this.productsBarChartData.datasets[0].data = [];
  }

  clearOrdersChart(): void {
    this.lineChartData.labels = [];
    this.lineChartData.datasets[0].data = [];
  }

  clearUsersChart(): void {
    this.usersBarChartData.labels = [];
    this.usersBarChartData.datasets[0].data = [];
  }

  // Data analysis methods
  analyzeCategoriesByProductCount(categories: any[]): { labels: string[], data: number[] } {
    const categoryStats: { [key: string]: number } = {};
    categories.forEach(category => {
      const categoryName = category.name || 'Unknown';
      const productCount = category.products?.length || 0;
      categoryStats[categoryName] = productCount;
    });
    return {
      labels: Object.keys(categoryStats),
      data: Object.values(categoryStats)
    };
  }

  analyzeProductsByCategory(products: any[]): { labels: string[], data: number[] } {
    const categoryCount: { [key: string]: number } = {};
    products.forEach(product => {
      const categoryName = product.category?.name || product.categoryName || 'Unknown';
      categoryCount[categoryName] = (categoryCount[categoryName] || 0) + 1;
    });
    return {
      labels: Object.keys(categoryCount),
      data: Object.values(categoryCount)
    };
  }

  analyzeOrdersByStatus(orders: any[]): { labels: string[], data: number[] } {
    const statusCount: { [key: string]: number } = {};
    orders.forEach(order => {
      const status = order.status || 'Unknown';
      statusCount[status] = (statusCount[status] || 0) + 1;
    });
    return {
      labels: Object.keys(statusCount),
      data: Object.values(statusCount)
    };
  }

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

    return {
      labels: Object.keys(activityCount),
      data: Object.values(activityCount)
    };
  }
}

