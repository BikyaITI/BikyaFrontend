import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { 
  DeliveryService, 
  DeliveryOrderDto, 
  UpdateOrderStatusDto,
  UpdateDeliveryShippingStatusDto,
  OrderStatusSummary,
  AvailableTransitions
} from '../../../core/services/delivery.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.scss'],
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background-color: #f9fafb;
    }
    
    .bg-white {
      background-color: white !important;
    }
    
    .rounded-lg {
      border-radius: 0.5rem !important;
    }
    
    .shadow-sm {
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
    }
    
    .border {
      border: 1px solid #e5e7eb !important;
    }
    
    .p-6 {
      padding: 1.5rem !important;
    }
    
    .mb-4 {
      margin-bottom: 1rem !important;
    }
    
    .text-xl {
      font-size: 1.25rem !important;
    }
    
    .font-semibold {
      font-weight: 600 !important;
    }
    
    .text-gray-900 {
      color: #111827 !important;
    }
    
    .px-3 {
      padding-left: 0.75rem !important;
      padding-right: 0.75rem !important;
    }
    
    .py-1 {
      padding-top: 0.25rem !important;
      padding-bottom: 0.25rem !important;
    }
    
    .rounded-full {
      border-radius: 9999px !important;
    }
    
    .text-sm {
      font-size: 0.875rem !important;
    }
    
    .font-medium {
      font-weight: 500 !important;
    }
    
    .text-gray-500 {
      color: #6b7280 !important;
    }
    
    .text-gray-600 {
      color: #4b5563 !important;
    }
    
    .text-green-600 {
      color: #059669 !important;
    }
    
    .bg-blue-100 {
      background-color: #dbeafe !important;
    }
    
    .text-blue-800 {
      color: #1e40af !important;
    }
    
    .bg-yellow-100 {
      background-color: #fef3c7 !important;
    }
    
    .text-yellow-800 {
      color: #92400e !important;
    }
    
    .bg-green-100 {
      background-color: #d1fae5 !important;
    }
    
    .text-green-700 {
      color: #065f46 !important;
    }
    
    .bg-red-100 {
      background-color: #fee2e2 !important;
    }
    
    .text-red-700 {
      color: #991b1b !important;
    }
    
    .bg-red-500 {
      background-color: #ef4444 !important;
    }
    
    .hover\\:bg-red-600:hover {
      background-color: #dc2626 !important;
    }
    
    .text-white {
      color: white !important;
    }
    
    .px-4 {
      padding-left: 1rem !important;
      padding-right: 1rem !important;
    }
    
    .py-2 {
      padding-top: 0.5rem !important;
      padding-bottom: 0.5rem !important;
    }
    
    .text-2xl {
      font-size: 1.5rem !important;
    }
    
    .font-bold {
      font-weight: 700 !important;
    }
    
    .space-y-6 > * + * {
      margin-top: 1.5rem !important;
    }
    
    .space-y-3 > * + * {
      margin-top: 0.75rem !important;
    }
    
    .space-y-4 > * + * {
      margin-top: 1rem !important;
    }
    
    .grid {
      display: grid !important;
    }
    
    .grid-cols-1 {
      grid-template-columns: repeat(1, minmax(0, 1fr)) !important;
    }
    
    .md\\:grid-cols-3 {
      grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
    }
    
    .lg\\:grid-cols-2 {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    }
    
    .gap-6 {
      gap: 1.5rem !important;
    }
    
    .flex {
      display: flex !important;
    }
    
    .items-center {
      align-items: center !important;
    }
    
    .justify-between {
      justify-content: space-between !important;
    }
    
    .space-x-4 > * + * {
      margin-left: 1rem !important;
    }
    
    .w-16 {
      width: 4rem !important;
    }
    
    .h-16 {
      height: 4rem !important;
    }
    
    .bg-gray-200 {
      background-color: #e5e7eb !important;
    }
    
    .flex {
      display: flex !important;
    }
    
    .items-center {
      align-items: center !important;
    }
    
    .justify-center {
      justify-content: center !important;
    }
    
    .w-full {
      width: 100% !important;
    }
    
    .border-gray-300 {
      border-color: #d1d5db !important;
    }
    
    .focus\\:ring-2:focus {
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5) !important;
    }
    
    .focus\\:ring-blue-500:focus {
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5) !important;
    }
    
    .focus\\:border-blue-500:focus {
      border-color: #3b82f6 !important;
    }
    
    .resize-none {
      resize: none !important;
    }
    
    .bg-blue-600 {
      background-color: #2563eb !important;
    }
    
    .hover\\:bg-blue-700:hover {
      background-color: #1d4ed8 !important;
    }
    
    .disabled\\:opacity-50:disabled {
      opacity: 0.5 !important;
    }
    
    .disabled\\:cursor-not-allowed:disabled {
      cursor: not-allowed !important;
    }
    
    .p-3 {
      padding: 0.75rem !important;
    }
    
    .text-center {
      text-align: center !important;
    }
    
    .py-20 {
      padding-top: 5rem !important;
      padding-bottom: 5rem !important;
    }
    
    .max-w-md {
      max-width: 28rem !important;
    }
    
    .mx-auto {
      margin-left: auto !important;
      margin-right: auto !important;
    }
    
    .h-12 {
      height: 3rem !important;
    }
    
    .w-12 {
      width: 3rem !important;
    }
    
    .mb-4 {
      margin-bottom: 1rem !important;
    }
    
    .text-lg {
      font-size: 1.125rem !important;
    }
    
    .font-medium {
      font-weight: 500 !important;
    }
    
    .mb-2 {
      margin-bottom: 0.5rem !important;
    }
    
    .mb-6 {
      margin-bottom: 1.5rem !important;
    }
    
    .animate-spin {
      animation: spin 1s linear infinite !important;
    }
    
    .rounded-full {
      border-radius: 9999px !important;
    }
    
    .h-12 {
      height: 3rem !important;
    }
    
    .w-12 {
      width: 3rem !important;
    }
    
    .border-b-2 {
      border-bottom-width: 2px !important;
    }
    
    .border-blue-600 {
      border-color: #2563eb !important;
    }
    
    .mx-auto {
      margin-left: auto !important;
      margin-right: auto !important;
    }
    
    .mb-4 {
      margin-bottom: 1rem !important;
    }
    
    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
  `]
})
export class OrderDetailsComponent implements OnInit, OnDestroy {
  orderId: number = 0;
  order: DeliveryOrderDto | null = null;
  isLoading = false;
  userName = '';
  private refreshSubscription?: Subscription;

  constructor(
    private deliveryService: DeliveryService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userName = localStorage.getItem('userName') || 'مستخدم التوصيل';
    this.orderId = Number(this.route.snapshot.paramMap.get('id'));
    
    console.log('Initialized order details for order ID:', this.orderId);
    
    this.loadOrderDetails();
    
    // Auto-refresh order details every 10 seconds
    this.refreshSubscription = interval(10000).subscribe(() => {
      if (this.order) {
        this.loadOrderDetails();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  loadOrderDetails(): void {
    this.isLoading = true;

    console.log('OrderDetailsComponent: Loading order details for order ID:', this.orderId);

    this.deliveryService.getOrderById(this.orderId).subscribe({
      next: (response) => {
        console.log('OrderDetailsComponent: Order details response:', response);
        if (response.success) {
          this.order = response.data;
          console.log('OrderDetailsComponent: Order loaded successfully:', this.order);
          console.log('OrderDetailsComponent: Order status:', this.order?.status);
          console.log('OrderDetailsComponent: Order status type:', typeof this.order?.status);
          console.log('OrderDetailsComponent: Order status value:', this.order?.status);
          
          // إعادة تعيين حالة التحديث
          
          console.log('OrderDetailsComponent: Reset updateStatus to empty values');
          
          // تحميل الحالات المتاحة
          const availableStatuses = this.getAvailableStatuses();
          console.log('OrderDetailsComponent: Available statuses for current order:', availableStatuses);
        } else {
          console.error('OrderDetailsComponent: Failed to load order details:', response.message);
        }
      },
      error: (error) => {
        console.error('OrderDetailsComponent: Error loading order details:', error);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  getAvailableStatuses(): { value: string; text: string }[] {
    if (!this.order) return [];
    
    const currentStatus = this.order.status.toString();
    const availableStatuses: { value: string; text: string }[] = [];
    
    switch (currentStatus) {
      case 'Paid':
      case '1':
        availableStatuses.push(
          { value: 'Shipped', text: 'تم الشحن' },
          { value: 'Cancelled', text: 'ملغي' }
        );
        break;
      case 'Shipped':
      case '2':
        availableStatuses.push(
          { value: 'Completed', text: 'مكتمل' },
          { value: 'Cancelled', text: 'ملغي' }
        );
        break;
      case 'Completed':
      case '3':
        // لا يمكن تحديث الحالة من مكتمل
        break;
      case 'Cancelled':
      case '4':
        // لا يمكن تحديث الحالة من ملغي
        break;
      default:
        // للحالات الأخرى، السماح بجميع الحالات
        availableStatuses.push(
          { value: 'Paid', text: 'مدفوع' },
          { value: 'Shipped', text: 'تم الشحن' },
          { value: 'Completed', text: 'مكتمل' },
          { value: 'Cancelled', text: 'ملغي' }
        );
    }
    
    return availableStatuses;
  }

  getAvailableStatusesText(): string {
    const statuses = this.getAvailableStatuses();
    return statuses.map(s => s.text).join('، ');
  }

  getStatusClass(status: string | number): string {
    const statusStr = status.toString();
    
    switch (statusStr) {
      case 'Paid':
      case '1':
        return 'bg-blue-100 text-blue-800';
      case 'Shipped':
      case '2':
        return 'bg-yellow-100 text-yellow-800';
      case 'Completed':
      case '3':
        return 'bg-green-100 text-green-800';
      case 'Pending':
      case '0':
        return 'bg-gray-100 text-gray-800';
      case 'Cancelled':
      case '4':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  goBack(): void {
    this.router.navigate(['/delivery/dashboard']);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userRoles');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    this.router.navigate(['/login']);
  }
} 