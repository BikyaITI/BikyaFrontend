import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import {

  DeliveryOrderDto,
  UpdateOrderStatusDto,
  UpdateDeliveryShippingStatusDto,
  OrderStatusSummary,
  AvailableTransitions
} from '../../../core/models/delivery.model';
import { DeliveryService } from '../../../core/services/delivery.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-delivery-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule,RouterLink],

  templateUrl: './delivery-dashboard.component.html',
  styleUrls: ['./delivery-dashboard.component.scss']
})
export class DeliveryDashboardComponent implements OnInit {
  orders: DeliveryOrderDto[] = [];
  isLoading = false;
  userName = '';
  selectedOrder: DeliveryOrderDto | null = null;
  statusSummary: OrderStatusSummary | null = null;
  availableTransitions: AvailableTransitions | null = null;
  showStatusModal = false;
  isUpdatingStatus = false;
  filteredOrders: DeliveryOrderDto[] = [];

  // Status options with English labels and descriptions
  orderStatusOptions = [
    {
      value: 'Paid',
      label: 'Paid',
      description: 'The order is paid and ready for delivery',
      icon: '💰',
      color: 'blue'
    },
    {
      value: 'Shipped',
      label: 'Shipped',
      description: 'The order is on the way to the customer',
      icon: '🚚',
      color: 'yellow'
    },
    {
      value: 'Completed',
      label: 'Completed',
      description: 'The order has been successfully delivered',
      icon: '✅',
      color: 'green'
    },
    {
      value: 'Cancelled',
      label: 'Cancelled',
      description: 'The order has been cancelled',
      icon: '❌',
      color: 'red'
    }
  ];

  // Form data
  updateOrderStatusData: UpdateOrderStatusDto = {
    status: '',
    notes: ''
  };

  // Error and success messages
  errorMessage = '';
  successMessage = '';

  constructor(
    private deliveryService: DeliveryService,
    private router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    console.log('DeliveryDashboardComponent: Initializing...');
    this.userName = localStorage.getItem('userName') || 'Delivery User';
    this.loadOrders();
  }

  loadOrders(): void {
    console.log('DeliveryDashboardComponent: Loading orders...');
    this.isLoading = true;
    this.errorMessage = '';

    this.deliveryService.getOrdersForDelivery().subscribe({
      next: (response) => {
        console.log('DeliveryDashboardComponent: Orders response:', response);
        if (response.success) {
          this.orders = response.data!;
          console.log('DeliveryDashboardComponent: Loaded orders:', this.orders.length);
          console.log('DeliveryDashboardComponent: Loaded orders:', this.orders);
          this.filterOrders('All');
          if (this.orders.length > 0) {
            this.toastr.success(`Successfully loaded ${this.orders.length} orders`, 'Loaded');
          } else {
            this.toastr.info('No orders ready for delivery at the moment', 'No Orders');
          }
        } else {
          console.error('Failed to load orders:', response.message);
          this.errorMessage = response.message || 'Failed to load orders';
          this.toastr.error(this.errorMessage, 'Load Error');
        }
      },
      error: (error) => {
        console.error('DeliveryDashboardComponent: Error loading orders:', error);
        let errorMsg = 'Failed to load orders';

        if (error.status === 404) {
          errorMsg = 'Endpoint not found. Check if server is running.';
        } else if (error.status === 0) {
          errorMsg = 'Cannot connect to the server. Check if Backend is running.';
        } else if (error.status === 401) {
          errorMsg = 'Unauthorized. Please check login.';
        } else if (error.status === 403) {
          errorMsg = 'You do not have permission to access this data.';
        } else if (error.error?.message) {
          errorMsg = error.error.message;
        }

        this.errorMessage = errorMsg;
        this.toastr.error(errorMsg, 'Load Error');
      },
      complete: () => {
        console.log('DeliveryDashboardComponent: Orders loading completed');
        this.isLoading = false;
      }
    });
  }

  getOrdersByStatus(status: string | number): DeliveryOrderDto[] {
    const statusStr = status.toString();

    return this.orders.filter(order => {
      const orderStatus = order.status.toString();
      return orderStatus === statusStr;
    });
  }

  getSwapOrders(): DeliveryOrderDto[] {
    return this.orders.filter(order => order.isSwapOrder);
  }

  getStatusBadgeClass(status: string | number): string {
    const statusStr = status.toString();

    switch (statusStr) {
      case 'Paid':
      case '1':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Shipped':
      case '2':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Completed':
      case '3':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Pending':
      case '0':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Cancelled':
      case '4':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  getShippingStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Pending':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'InTransit':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  getStatusText(status: string | number): string {
    const statusStr = status.toString();

    switch (statusStr) {
      case 'Paid':
      case '1':
        return 'Paid';
      case 'Shipped':
      case '2':
        return 'Shipped';
      case 'Completed':
      case '3':
        return 'Completed';
      case 'Pending':
      case '0':
        return 'Pending';
      case 'Cancelled':
      case '4':
        return 'Cancelled';
      default:
        return statusStr;
    }
  }

  getShippingStatusText(status: string): string {
    switch (status) {
      case 'Pending':
        return 'Pending';
      case 'InTransit':
        return 'In Transit';
      case 'Delivered':
        return 'Delivered';
      case 'Failed':
        return 'Delivery Failed';
      default:
        return status;
    }
  }

  getStatusIcon(status: string | number): string {
    const statusStr = status.toString();

    switch (statusStr) {
      case 'Paid':
      case '1':
        return '💰';
      case 'Shipped':
      case '2':
        return '🚚';
      case 'Completed':
      case '3':
        return '✅';
      case 'Pending':
      case '0':
        return '⏳';
      case 'Cancelled':
      case '4':
        return '❌';
      default:
        return '📦';
    }
  }
  filterOrders(status: string): void {
    console.log(`Filtering orders by status: ${status}`);
    if (status === 'All') {
      this.filteredOrders = this.orders;
    }
    else if (status === 'Swap') {
      this.filteredOrders = this.getSwapOrders();
    }
    else {
      this.filteredOrders = this.getOrdersByStatus(status);
    }
  }


  viewOrderDetails(orderId: number): void {
    this.router.navigate(['/delivery/orders', orderId]);
  }

  // Enhanced status management methods
  openStatusModal(order: DeliveryOrderDto): void {
    this.selectedOrder = order;
    this.updateOrderStatusData = {
      status: order.status,
      notes: ''
    };
    this.showStatusModal = true;

    // Load available transitions for this order
    this.loadAvailableTransitions(order.id);
  }

  loadAvailableTransitions(orderId: number): void {
    this.deliveryService.getAvailableTransitions(orderId).subscribe({
      next: (response) => {
        if (response.success) {
          this.availableTransitions = response.data;
          console.log('Available transitions:', this.availableTransitions);
        }
      },
      error: (error) => {
        console.error('Failed to load available transitions:', error);
      }
    });
  }

  getAvailableStatusOptions(): any[] {
    if (!this.availableTransitions?.orderStatusTransitions) {
      return this.orderStatusOptions;
    }

    const transitions = this.availableTransitions?.orderStatusTransitions;
    return this.orderStatusOptions.filter(option =>
      transitions?.includes(option.value) || false
    );
  }

  updateOrderStatus(): void {
    if (!this.selectedOrder) {
      this.toastr.error('No order selected for update', 'Error');
      return;
    }

    if (!this.updateOrderStatusData.status) {
      this.toastr.error('Please select a new status', 'Input Error');
      return;
    }

    this.isUpdatingStatus = true;
    this.errorMessage = '';
    this.successMessage = '';

    console.log('=== Order Status Update Debug ===');
    console.log('Order ID:', this.selectedOrder?.id);
    console.log('Current Status:', this.selectedOrder?.status);
    console.log('New Status:', this.updateOrderStatusData.status);
    console.log('Notes:', this.updateOrderStatusData.notes);
    console.log('Update Data:', this.updateOrderStatusData);

    this.deliveryService.updateOrderStatus(this.selectedOrder!.id, this.updateOrderStatusData).subscribe({
      next: (response) => {
        console.log('=== Update Response ===');
        console.log('Response:', response);

        if (response.success) {
          console.log('✅ Order status updated successfully');

          const newStatusText = this.getStatusText(this.updateOrderStatusData.status);
          let successMsg = `Order #${this.selectedOrder?.id} status updated to "${newStatusText}" successfully`;

          // If it's a swap order and completed, add extra message
          if (this.selectedOrder?.isSwapOrder && this.updateOrderStatusData.status === 'Completed') {
            successMsg += ' (Linked order also updated)';
          }

          this.successMessage = successMsg;
          this.toastr.success(successMsg, 'Updated Successfully');

          this.loadOrders(); // Reload orders
          this.showStatusModal = false;
        } else {
          console.error('❌ Failed to update order status:', response.message);
          this.errorMessage = response.message || 'Failed to update status';
          this.toastr.error(this.errorMessage, 'Update Error');
        }
      },
      error: (error) => {
        console.error('=== Update Error ===');
        console.error('Error:', error);
        console.error('Error Status:', error.status);
        console.error('Error Message:', error.message);

        let errorMessage = 'Status update error';

        if (error.status === 400) {
          errorMessage = 'Status transition not allowed. Check current order status.';
        } else if (error.status === 401) {
          errorMessage = 'Unauthorized. Please check login.';
        } else if (error.status === 404) {
          errorMessage = 'Order not found.';
        } else if (error.status === 0) {
          errorMessage = 'Cannot connect to server. Check if Backend is running.';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        } else {
          errorMessage = error.message || 'Unknown error';
        }

        this.errorMessage = errorMessage;
        this.toastr.error(errorMessage, 'Update Error');
      },
      complete: () => {
        this.isUpdatingStatus = false;
      }
    });
  }

  closeModal(): void {
    this.showStatusModal = false;
    this.selectedOrder = null;
    this.statusSummary = null;
    this.availableTransitions = null;
    this.errorMessage = '';
    this.successMessage = '';
  }

  getStatusDescription(status: string): string {
    const option = this.orderStatusOptions.find(opt => opt.value === status);
    return option?.description || '';
  }

  getStatusIconForOption(status: string): string {
    const option = this.orderStatusOptions.find(opt => opt.value === status);
    return option?.icon || '📦';
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userRoles');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    this.toastr.success('Logged out successfully', 'Logout');
    this.router.navigate(['/login']);
  }
  getImageUrl(image: string): string {
    return image
      ? `${environment.apiUrl}${image}`
      : 'product.png';
  }
  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = 'product.png';
  }
}  