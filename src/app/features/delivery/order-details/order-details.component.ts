import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {  DeliveryOrderDto,} from '../../../core/models/delivery.model';
import { interval, Subscription } from 'rxjs';
import { DeliveryService } from '../../../core/services/delivery.service';
import { environment } from '../../../../environments/environment';


@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.scss'],

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
  ) { }

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
  getImageUrl(image: string): string {
    return image
      ? `${environment.apiUrl}${image}`
      : 'product.png';
  }
  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = 'product.png';
  }

} 