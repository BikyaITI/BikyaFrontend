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
  pendingOrders: Order[] = [];
  shippedOrders: Order[] = [];
  completedOrders: Order[] = [];
  filteredOrders: Order[] = [];
  activeTab = 'all';
  isLoading = true;
  currentUser: IUser | null = null;
  selectedOrder: Order | null = null;
  OrderStatus = OrderStatus;

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
          this.allOrders = response.data.map((order: any) => ({
            ...order,
            product: order.product || { title: order.productTitle || 'Unknown Product' },
            buyer: order.buyer || { fullName: order.buyerName || 'Unknown Buyer' },
            seller: order.seller || { fullName: order.sellerName || 'Unknown Seller' },
            status: order.status || 'Unknown',
          }));
          this.pendingOrders = this.allOrders.filter(
            (order) => order.status === OrderStatus.Pending || order.status === 'Pending'
          );
          this.shippedOrders = this.allOrders.filter(
            (order) => order.status === OrderStatus.Shipped || order.status === 'Shipped'
          );
          this.completedOrders = this.allOrders.filter(
            (order) => order.status === OrderStatus.Completed || order.status === 'Completed' || order.status === 'completed'
          );
          console.log('Loaded orders:', this.allOrders);
          console.log('Pending orders:', this.pendingOrders);
          console.log('Shipped orders:', this.shippedOrders);
          console.log('Completed orders:', this.completedOrders);
          this.filterOrdersByTab();
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
    console.log('Switching to tab:', this.activeTab);
    this.filterOrdersByTab();
  }

  filterOrdersByTab(): void {
    this.filteredOrders = [];
    this.filteredOrders = this.getFilteredOrders();
    console.log(`Filtered orders for tab ${this.activeTab}:`, this.filteredOrders);
  }

  getFilteredOrders(): Order[] {
    switch (this.activeTab) {
      case 'pending':
        return [...this.pendingOrders];
      case 'shipped':
        return [...this.shippedOrders];
      case 'completed':
        return [...this.completedOrders];
      default:
        return [...this.allOrders];
    }
  }

  getStatusText(status: OrderStatus | string): string {
    switch (status) {
      case OrderStatus.Pending:
      case 'Pending':
        return 'Pending';
      case OrderStatus.Paid:
      case 'Paid':
        return 'Paid';
      case OrderStatus.Shipped:
      case 'Shipped':
        return 'Shipped';
      case OrderStatus.Completed:
      case 'Completed':
      case 'completed':
        return 'Completed';
      case OrderStatus.Cancelled:
      case 'Cancelled':
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  }

  getOrderStatusClass(status: OrderStatus | string): string {
    switch (status) {
      case OrderStatus.Pending:
      case 'Pending':
        return 'bg-warning text-dark';
      case OrderStatus.Paid:
      case 'Paid':
        return 'bg-info';
      case OrderStatus.Shipped:
      case 'Shipped':
        return 'bg-primary';
      case OrderStatus.Completed:
      case 'Completed':
      case 'completed':
        return 'bg-success';
      case OrderStatus.Cancelled:
      case 'Cancelled':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }

  isStatus(status: OrderStatus | string, expected: OrderStatus | string): boolean {
    return status === expected || status === expected.toString();
  }

  getProductImage(product: any): string {
    const mainImage = product?.images?.find((img: any) => img.isMain);
    return mainImage?.imageUrl || 'https://via.placeholder.com/80?text=Product';
  }

  viewOrderDetails(order: Order): void {
    this.selectedOrder = order;
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
                <p><strong>Product:</strong> ${details.productTitle || 'Unknown Product'}</p>
                <p><strong>Buyer:</strong> ${details.buyerName || 'Unknown Buyer'}</p>
                <p><strong>Seller:</strong> ${details.sellerName || 'Unknown Seller'}</p>
                <p><strong>Status:</strong> ${this.getStatusText(details.status || 'Unknown')}</p>
                <p><strong>Created At:</strong> ${new Date(details.createdAt).toLocaleString()}</p>
                <p><strong>Total Amount:</strong> ${details.totalAmount || 'N/A'}</p>
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