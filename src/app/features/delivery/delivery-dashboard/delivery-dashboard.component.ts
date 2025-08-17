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

  // Status options with Arabic labels and descriptions
  orderStatusOptions = [
    { 
      value: 'Paid', 
      label: 'مدفوع', 
      description: 'الطلب مدفوع وجاهز للتوصيل',
      icon: '💰',
      color: 'blue'
    },
    { 
      value: 'Shipped', 
      label: 'تم الشحن', 
      description: 'الطلب في الطريق للعميل',
      icon: '🚚',
      color: 'yellow'
    },
    { 
      value: 'Completed', 
      label: 'مكتمل', 
      description: 'تم توصيل الطلب بنجاح',
      icon: '✅',
      color: 'green'
    },
    { 
      value: 'Cancelled', 
      label: 'ملغي', 
      description: 'تم إلغاء الطلب',
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
  ) {}

  ngOnInit(): void {
    console.log('DeliveryDashboardComponent: Initializing...');
    this.userName = localStorage.getItem('userName') || 'مستخدم التوصيل';
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
          
          if (this.orders.length > 0) {
            this.toastr.success(`تم تحميل ${this.orders.length} طلب بنجاح`, 'تم التحميل');
          } else {
            this.toastr.info('لا توجد طلبات جاهزة للتوصيل في الوقت الحالي', 'لا توجد طلبات');
          }
        } else {
          console.error('Failed to load orders:', response.message);
          this.errorMessage = response.message || 'فشل في تحميل الطلبات';
          this.toastr.error(this.errorMessage, 'خطأ في التحميل');
        }
      },
      error: (error) => {
        console.error('DeliveryDashboardComponent: Error loading orders:', error);
        let errorMsg = 'فشل في تحميل الطلبات';
        
        if (error.status === 404) {
          errorMsg = 'نقطة النهاية غير موجودة. تحقق من تشغيل الخادم.';
        } else if (error.status === 0) {
          errorMsg = 'لا يمكن الاتصال بالخادم. تحقق من تشغيل Backend.';
        } else if (error.status === 401) {
          errorMsg = 'غير مصرح. تحقق من تسجيل الدخول.';
        } else if (error.status === 403) {
          errorMsg = 'ليس لديك صلاحية للوصول لهذه البيانات.';
        } else if (error.error?.message) {
          errorMsg = error.error.message;
        }
        
        this.errorMessage = errorMsg;
        this.toastr.error(errorMsg, 'خطأ في التحميل');
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
        return 'مدفوع';
      case 'Shipped':
      case '2':
        return 'تم الشحن';
      case 'Completed':
      case '3':
        return 'مكتمل';
      case 'Pending':
      case '0':
        return 'في الانتظار';
      case 'Cancelled':
      case '4':
        return 'ملغي';
      default:
        return statusStr;
    }
  }

  getShippingStatusText(status: string): string {
    switch (status) {
      case 'Pending':
        return 'في الانتظار';
      case 'InTransit':
        return 'في الطريق';
      case 'Delivered':
        return 'تم التوصيل';
      case 'Failed':
        return 'فشل التوصيل';
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
      this.toastr.error('لم يتم اختيار طلب للتحديث', 'خطأ');
      return;
    }

    if (!this.updateOrderStatusData.status) {
      this.toastr.error('يرجى اختيار حالة جديدة', 'خطأ في الإدخال');
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
          let successMsg = `تم تحديث حالة الطلب #${this.selectedOrder?.id} إلى "${newStatusText}" بنجاح`;
          
          // إذا كان طلب تبادل وتم إكماله، أضف رسالة إضافية
          if (this.selectedOrder?.isSwapOrder && this.updateOrderStatusData.status === 'Completed') {
            successMsg += ' (تم تحديث الطلب المرتبط أيضاً)';
          }
          
          this.successMessage = successMsg;
          this.toastr.success(successMsg, 'تم التحديث بنجاح');
          
          this.loadOrders(); // Reload orders
          this.showStatusModal = false;
        } else {
          console.error('❌ Failed to update order status:', response.message);
          this.errorMessage = response.message || 'فشل في تحديث الحالة';
          this.toastr.error(this.errorMessage, 'خطأ في التحديث');
        }
      },
      error: (error) => {
        console.error('=== Update Error ===');
        console.error('Error:', error);
        console.error('Error Status:', error.status);
        console.error('Error Message:', error.message);
        
        let errorMessage = 'خطأ في تحديث الحالة';
        
        if (error.status === 400) {
          errorMessage = 'تحول الحالة غير مسموح. تحقق من الحالة الحالية للطلب.';
        } else if (error.status === 401) {
          errorMessage = 'غير مصرح. تحقق من تسجيل الدخول.';
        } else if (error.status === 404) {
          errorMessage = 'الطلب غير موجود.';
        } else if (error.status === 0) {
          errorMessage = 'لا يمكن الاتصال بالخادم. تحقق من تشغيل Backend.';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        } else {
          errorMessage = error.message || 'خطأ غير معروف';
        }
        
        this.errorMessage = errorMessage;
        this.toastr.error(errorMessage, 'خطأ في التحديث');
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
    this.toastr.success('تم تسجيل الخروج بنجاح', 'تسجيل الخروج');
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