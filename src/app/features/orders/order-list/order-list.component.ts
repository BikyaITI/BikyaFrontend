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
  activeTab = 'all';
  isLoading = true;
  currentUser: IUser | null = null;
  selectedOrder: Order | null = null;

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService // Inject ToastrService for notifications
  ) { }

  ngOnInit(): void {
    // Subscribe to current user and load orders if user exists
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

    // Fetch orders for the current user
    this.orderService.getMyOrders(this.currentUser.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.allOrders = response.data;
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
  }

  getFilteredOrders(): Order[] {
    switch (this.activeTab) {
      case 'pending':
        return this.getPendingOrders();
      case 'shipped':
        return this.getShippedOrders();
      case 'completed':
        return this.getDeliveredOrders();
      default:
        return this.allOrders;
    }
  }

  getPendingOrders(): Order[] {
    return this.allOrders.filter((order) => order.status === OrderStatus.Pending);
  }

  getShippedOrders(): Order[] {
    return this.allOrders.filter((order) => order.status === OrderStatus.Shipped);
  }

  getDeliveredOrders(): Order[] {
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
    // Fetch order details by ID
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
    // Confirm order cancellation
    if (confirm('Are you sure you want to cancel this order?')) {
      this.orderService.cancelOrder(order.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadOrders(); // Reload orders after cancellation
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
}