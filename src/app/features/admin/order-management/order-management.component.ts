import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { OrderService } from '../../../core/services/order.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { OrderStatus } from '../../../core/models/order.model';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-order-management',
  templateUrl: './order-management.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class OrderManagementComponent implements OnInit, OnDestroy {
  orders: any[] = [];
  isLoading = false;
  errorMessage = '';
  searchTerm = '';
  isCancelling: { [key: number]: boolean } = {};
  isProcessing: { [key: number]: boolean } = {};
  private refreshInterval: any;
  private refreshSubscription?: Subscription;

  orderService = inject(OrderService);
  toastr = inject(ToastrService);

  ngOnInit() {
    this.loadOrders();
    
    // Auto-refresh orders every 15 seconds to catch updates
    this.refreshInterval = setInterval(() => {
      this.loadOrders();
    }, 15000); // 15 seconds
    
    // Additional refresh subscription for more frequent updates
    this.refreshSubscription = interval(10000).subscribe(() => {
      if (!this.isLoading) {
        this.loadOrders();
      }
    });
  }

  ngOnDestroy() {
    // Clean up the interval when component is destroyed
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  loadOrders() {
    this.isLoading = true;
    this.errorMessage = '';
    this.orderService.getAllOrders().subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res.success) {
          // فلترة العناصر الفارغة أو غير الصالحة
          this.orders = Array.isArray(res.data) ? res.data.filter((o: any) => o && o.id) : [];
          if (this.orders.length > 0) {
            console.log(`Loaded ${this.orders.length} orders successfully`);
            this.toastr.success(`Loaded ${this.orders.length} orders successfully`);
          } else {
            console.log('No orders found');
            this.toastr.info('No orders found');
          }
        } else {
          this.errorMessage = res.message || 'Failed to load orders.';
          console.error('Failed to load orders:', res.message);
          this.toastr.error(this.errorMessage);
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        let errorMsg = 'Failed to load orders.';
        
        if (err?.error?.message) {
          errorMsg = err.error.message;
        } else if (err?.message) {
          errorMsg = err.message;
        } else if (err?.status === 401) {
          errorMsg = 'Unauthorized. Please login again.';
        } else if (err?.status === 403) {
          errorMsg = 'Access denied. You do not have permission to view orders.';
        } else if (err?.status >= 500) {
          errorMsg = 'Server error. Please try again later.';
        }
        
        this.errorMessage = errorMsg;
        console.error('Error loading orders:', err);
        this.toastr.error(errorMsg);
      }
    });
  }

  searchOrders() {
    if (!this.searchTerm.trim()) {
      this.loadOrders();
      return;
    }
    this.isLoading = true;
    this.orderService.getAllOrders().subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res.success) {
          this.orders = (res.data || []).filter((o: any) =>
            o.productTitle?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
            o.buyerName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
            o.sellerName?.toLowerCase().includes(this.searchTerm.toLowerCase())
          );
          if (this.orders.length > 0) {
            this.toastr.success(`Found ${this.orders.length} orders matching your search`);
          } else {
            this.toastr.info('No orders found matching your search');
          }
        } else {
          this.toastr.error(res.message || 'Failed to search orders');
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        this.toastr.error('Failed to search orders');
        console.error('Error searching orders:', err);
      }
    });
  }

  clearFilters() {
    this.searchTerm = '';
    this.loadOrders();
  }

  getStatusBadgeClass(order: any): string {
    const status = typeof order.status === 'string' ? order.status.toLowerCase() : String(order.status || '').toLowerCase();
    switch (status) {
      case 'pending':
        return 'badge bg-warning text-dark';
      case 'paid':
        return 'badge bg-info';
      case 'shipped':
        return 'badge bg-primary';
      case 'completed':
        return 'badge bg-success';
      case 'cancelled':
        return 'badge bg-danger';
      default:
        return 'badge bg-secondary';
    }
  }

  getStatusText(order: any): string {
    let status = order.status;
    if (typeof status === 'number') {
      switch (status) {
        case 0: return 'Pending';
        case 1: return 'Paid';
        case 2: return 'Shipped';
        case 3: return 'Completed';
        case 4: return 'Cancelled';
        default: return 'Unknown';
      }
    } else if (typeof status === 'string') {
      switch (status.toLowerCase()) {
        case 'pending': return 'Pending';
        case 'paid': return 'Paid';
        case 'shipped': return 'Shipped';
        case 'completed': return 'Completed';
        case 'cancelled': return 'Cancelled';
        default: return status;
      }
    }
    return 'Unknown';
  }

  // تحويل enum إلى نص
  getStatusStringFromEnum(status: number | string): string {
    if (typeof status === 'string') return status;
    switch (status) {
      case 0: return 'Pending';
      case 1: return 'Paid';
      case 2: return 'Shipped';
      case 3: return 'Completed';
      case 4: return 'Cancelled';
      default: return 'Pending';
    }
  }

  // تغيير حالة الطلب
  onStatusChange(order: any, newStatus: string) {
    console.log('Payload sent to backend:', {
      orderId: order.id,
      newStatus: newStatus
    });
    this.orderService.updateOrderStatus({
      orderId: order.id,
      newStatus: newStatus // يجب أن يكون اسم الخاصية newStatus
    }).subscribe({
      next: (res: any) => {
        if (res.success) {
          order.status = newStatus;
          this.toastr.success('Order status updated successfully');
        } else {
          this.toastr.error('Failed to update order status');
        }
      },
      error: () => {
        this.toastr.error('Failed to update order status');
      }
    });
  }

  async confirmCancelOrder(order: any) {
    const result = await Swal.fire({
      title: 'تأكيد الإلغاء',
      text: `هل أنت متأكد من إلغاء الطلب "${order.productTitle}"؟`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'نعم، ألغِ!',
      cancelButtonText: 'إلغاء',
      reverseButtons: true
    });
    if (result.isConfirmed) {
      this.cancelOrder(order.id);
    }
  }

  async confirmCompleteOrder(order: any) {
    const result = await Swal.fire({
      title: 'تأكيد الإكمال',
      text: `هل أنت متأكد من إكمال الطلب "${order.productTitle}"؟`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'نعم، أكمل!',
      cancelButtonText: 'إلغاء',
      reverseButtons: true
    });
    if (result.isConfirmed) {
      this.completeOrder(order.id);
    }
  }

  cancelOrder(id: number) {
    this.isCancelling[id] = true;
    this.orderService.cancelOrder(id).subscribe({
      next: () => {
        this.isCancelling[id] = false;
        this.toastr.success('Order cancelled successfully');
        this.loadOrders();
      },
      error: (err: any) => {
        this.isCancelling[id] = false;
        let errorMsg = 'Failed to cancel order.';
        
        if (err?.error?.message) {
          errorMsg = err.error.message;
        } else if (err?.message) {
          errorMsg = err.message;
        } else if (err?.status === 401) {
          errorMsg = 'Unauthorized. Please login again.';
        } else if (err?.status === 403) {
          errorMsg = 'Access denied. You do not have permission to cancel orders.';
        } else if (err?.status === 404) {
          errorMsg = 'Order not found.';
        } else if (err?.status >= 500) {
          errorMsg = 'Server error. Please try again later.';
        }
        
        this.toastr.error(errorMsg);
        console.error('Error cancelling order:', err);
      }
    });
  }

  completeOrder(id: number) {
    this.isProcessing[id] = true;
    // Use updateOrderStatus instead of completeOrder
    const updateRequest = {
      orderId: id,
      newStatus: OrderStatus.Completed
    };
    this.orderService.updateOrderStatus(updateRequest).subscribe({
      next: () => {
        this.isProcessing[id] = false;
        this.toastr.success('Order completed successfully');
        this.loadOrders();
      },
      error: (err: any) => {
        this.isProcessing[id] = false;
        let errorMsg = 'Failed to complete order.';
        
        if (err?.error?.message) {
          errorMsg = err.error.message;
        } else if (err?.message) {
          errorMsg = err.message;
        } else if (err?.status === 401) {
          errorMsg = 'Unauthorized. Please login again.';
        } else if (err?.status === 403) {
          errorMsg = 'Access denied. You do not have permission to complete orders.';
        } else if (err?.status === 404) {
          errorMsg = 'Order not found.';
        } else if (err?.status >= 500) {
          errorMsg = 'Server error. Please try again later.';
        }
        
        this.toastr.error(errorMsg);
        console.error('Error completing order:', err);
      }
    });
  }

  viewOrderDetails(order: any) {
    this.isLoading = true;
    this.orderService.getOrderById(order.id).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res.success && res.data) {
          const details = res.data;
          Swal.fire({
            title: `تفاصيل الطلب - #${details.id}`,
            html: `
              <div class="text-start">
                <p><strong>المنتج:</strong> ${details.productTitle}</p>
                <p><strong>المشتري:</strong> ${details.buyerName}</p>
                <p><strong>البائع:</strong> ${details.sellerName}</p>
                <p><strong>الحالة:</strong> ${details.status}</p>
                <p><strong>تاريخ الإنشاء:</strong> ${new Date(details.createdAt).toLocaleString()}</p>
                <p><strong>المبلغ:</strong> ${details.totalAmount}</p>
                <p><strong>الإيميل:</strong> ${details.buyerEmail || '---'}</p>
                <!-- أضف أي تفاصيل أخرى متوفرة في OrderDetailsDTO -->
              </div>
            `,
            icon: 'info',
            confirmButtonText: 'إغلاق'
          });
        } else {
          this.toastr.error('تعذر جلب تفاصيل الطلب');
        }
      },
      error: () => {
        this.isLoading = false;
        this.toastr.error('تعذر جلب تفاصيل الطلب');
      }
    });
  }
} 