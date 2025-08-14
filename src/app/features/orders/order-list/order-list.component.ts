import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { AuthService } from '../../../core/services/auth.service';
import { Order, OrderStatus } from '../../../core/models/order.model';
import { IUser } from '../../../core/models/user.model';
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss'],
})
export class OrderListComponent implements OnInit {
  allOrders: Order[] = [];
  filteredOrders: Order[] = []; // أضفنا array جديدة للعرض
  activeTab = 'all';
  isLoading = true;
  currentUser: IUser | null = null;
  selectedOrder: Order | null = null;

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
      if (user) {
        this.loadOrders();
      }
    });
  }

  loadOrders(): void {
    if (!this.currentUser) return;

    this.isLoading = true;

    this.orderService.getMyOrders(this.currentUser.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.allOrders = response.data;
          console.log('Loaded orders:', this.allOrders);
          console.log('Completed orders:', this.allOrders.filter(order => order.status === OrderStatus.Completed));
          this.filterOrdersByTab(); // فلتر الأوردارات حسب التب الحالي
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.toastr.error('Failed to load orders');
      },
    });
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    this.filteredOrders = []; // نفضي اللي موجود قبل ما نعرض الجديد
    this.filterOrdersByTab(); // فلتر الأوردارات حسب التب الجديد
  }

  filterOrdersByTab(): void {
    this.filteredOrders = []; // نفضي الـ array عشان يمسح اللي موجود
    switch (this.activeTab) {
      case 'pending':
        this.filteredOrders = this.getPendingOrders();
        break;
      case 'shipped':
        this.filteredOrders = this.getShippedOrders();
        break;
      case 'completed':
        this.filteredOrders = this.getCompletedOrders();
        break;
      default:
        this.filteredOrders = this.allOrders;
        break;
    }
    console.log(`Filtered orders for tab ${this.activeTab}:`, this.filteredOrders); // للتشخيص
  }

  getPendingOrders(): Order[] {
    return this.allOrders.filter((order) => order.status === OrderStatus.Pending);
  }

  getShippedOrders(): Order[] {
    return this.allOrders.filter((order) => order.status === OrderStatus.Shipped);
  }

  getCompletedOrders(): Order[] {
    return this.allOrders.filter((order) => order.status === OrderStatus.Completed);
  }

  getStatusText(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.Pending:
        return 'Pending';
      case OrderStatus.Paid:
        return 'Paid';
      case OrderStatus.Shipped:
        return 'Shipped';
      case OrderStatus.Completed:
        return 'Completed';
      case OrderStatus.Cancelled:
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  }

  getOrderStatusClass(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.Pending:
        return 'bg-warning text-dark';
      case OrderStatus.Paid:
        return 'bg-info';
      case OrderStatus.Shipped:
        return 'bg-primary';
      case OrderStatus.Completed:
        return 'bg-success';
      case OrderStatus.Cancelled:
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }

  getProductImage(product: any): string {
    const mainImage = product?.images?.find((img: any) => img.isMain);
    return mainImage?.imageUrl || '/placeholder.svg?height=80&width=80';
  }

  viewOrderDetails(order: Order): void {
    this.isLoading = true;
    this.orderService.getOrderById(order.id).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res.success && res.data) {
          const details = res.data;
          Swal.fire({
            title: `Order Details - #${details.id}`,
            html: `
              <div class="text-start">
                <p><strong>Product:</strong> ${details.productTitle}</p>
                <p><strong>Buyer:</strong> ${details.buyerName}</p>
                <p><strong>Seller:</strong> ${details.sellerName}</p>
                <p><strong>Status:</strong> ${details.status}</p>
                <p><strong>Created At:</strong> ${new Date(details.createdAt).toLocaleString()}</p>
                <p><strong>Total Amount:</strong> ${details.totalAmount}</p>
              </div>
            `,
            icon: 'info',
            confirmButtonText: 'Close',
          });
        } else {
          this.toastr.error('Failed to fetch order details');
        }
      },
      error: () => {
        this.isLoading = false;
        this.toastr.error('Failed to fetch order details');
      },
    });
  }

  cancelOrder(order: Order): void {
    if (confirm('Are you sure you want to cancel this order?')) {
      this.orderService.cancelOrder(order.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadOrders();
            this.toastr.success('Order cancelled successfully');
          }
        },
        error: () => {
          this.toastr.error('Failed to cancel order. Please try again.');
        },
      });
    }
  }

  payForOrder(order: Order): void {
    this.router.navigate(['/payment', order.id, order.totalAmount]);
  }

  leaveReview(order: Order): void {
    console.log('Attempting to leave review for order:', order);
    if (!order.seller?.id || !order.id) {
      this.toastr.error('Invalid order or seller information');
      return;
    }
    this.router.navigate(['/review', order.seller.id, order.id]);
  }
}