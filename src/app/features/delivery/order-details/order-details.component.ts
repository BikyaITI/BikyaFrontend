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
    this.userName = localStorage.getItem('userName') || 'Delivery User';
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

          // Reset updateStatus state

          console.log('OrderDetailsComponent: Reset updateStatus to empty values');

          // Load available statuses
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
          { value: 'Shipped', text: 'Shipped' },
          { value: 'Cancelled', text: 'Cancelled' }
        );
        break;
      case 'Shipped':
      case '2':
        availableStatuses.push(
          { value: 'Completed', text: 'Completed' },
          { value: 'Cancelled', text: 'Cancelled' }
        );
        break;
      case 'Completed':
      case '3':
        // Cannot update status from Completed
        break;
      case 'Cancelled':
      case '4':
        // Cannot update status from Cancelled
        break;
      default:
        // For other statuses, allow all
        availableStatuses.push(
          { value: 'Paid', text: 'Paid' },
          { value: 'Shipped', text: 'Shipped' },
          { value: 'Completed', text: 'Completed' },
          { value: 'Cancelled', text: 'Cancelled' }
        );
    }

    return availableStatuses;
  }

  getAvailableStatusesText(): string {
    const statuses = this.getAvailableStatuses();
    return statuses.map(s => s.text).join(', ');
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