// admin-orders.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { OrderService } from "../../../core/services/order.service"
import { AuthService } from "../../../core/services/auth.service"
import { Order, OrderStatus } from "../../../core/models/order.model"
import { IUser } from "../../../core/models/user.model"
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-orders.component.html',
  styleUrls: ['./admin-orders.component.scss']
})
export class AdminOrdersComponent implements OnInit {
  allOrders: Order[] = [];
  activeTab = 'all';
  isLoading = true;
  currentUser: IUser | null = null;
  selectedOrder: Order | null = null;

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.currentUser = user;
    if (user && this.isAdmin(user)) {
      this.loadOrders();
    } else {
      this.router.navigate(['/']);
      alert('Access restricted to admins only');
    }
  }

  private isAdmin(user: any): boolean {
    return user.roles?.includes('Admin') || false; // نفس التشييك زي AdminGuard
  }

  loadOrders(): void {
    this.isLoading = true;
    this.orderService.getAllOrders().subscribe({
      next: (response) => {
        if (response.success) {
          this.allOrders = response.data;
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Failed to load orders:', error); // لوج أفضل للأخطاء
        alert('Failed to load orders');
      }
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
      case 'delivered':
        return this.getDeliveredOrders();
      default:
        return this.allOrders;
    }
  }

  getPendingOrders(): Order[] {
    return this.allOrders.filter((order) => order.status === 'Pending');
  }

  getShippedOrders(): Order[] {
    return this.allOrders.filter((order) => order.status === 'Shipped');
  }

  getDeliveredOrders(): Order[] {
    return this.allOrders.filter((order) => order.status === 'Delivered');
  }

  getOrderStatusClass(status: OrderStatus): string {
    switch (status) {
      case 'Pending':
        return 'bg-warning text-dark';
      case 'Confirmed':
        return 'bg-info';
      case 'Shipped':
        return 'bg-primary';
      case 'Delivered':
        return 'bg-success';
      case 'Cancelled':
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
    this.selectedOrder = order;
    const modalElement = document.getElementById('orderDetailsModal');
    if (modalElement) {
      const modal = new (window as any).bootstrap.Modal(modalElement);
      modal.show();
    } else {
      console.error('Modal element not found');
      alert('Failed to open order details modal');
    }
  }

  updateOrderStatus(order: Order, newStatus: string): void {
    const status: OrderStatus = newStatus as OrderStatus;
    const request = { orderId: order.id, status };
    this.orderService.updateOrderStatus(request).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadOrders();
        }
      },
      error: (error) => {
        console.error('Failed to update order status:', error);
        alert('Failed to update order status');
      }
    });
  }
}