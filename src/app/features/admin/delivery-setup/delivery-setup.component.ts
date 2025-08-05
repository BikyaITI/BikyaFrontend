import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeliveryService } from '../../../core/services/delivery.service';

@Component({
  selector: 'app-delivery-setup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delivery-setup.component.html',
  styleUrls: ['./delivery-setup.component.scss']
})
export class DeliverySetupComponent {
  isLoading = false;
  message = '';

  constructor(private deliveryService: DeliveryService) {}

  setupDeliverySystem(): void {
    this.isLoading = true;
    this.message = '';

    this.deliveryService.setupDeliverySystem().subscribe({
      next: (response) => {
        if (response.success) {
          this.message = 'تم إعداد نظام التوصيل بنجاح! يمكن الآن لموظفي التوصيل تسجيل الدخول.';
        } else {
          this.message = response.message || 'فشل إعداد نظام التوصيل';
        }
      },
      error: (error) => {
        if (error.status === 404) {
          this.message = 'الباك إند غير متاح. يرجى التأكد من تشغيل الخادم.';
        } else if (error.status === 0) {
          this.message = 'لا يمكن الاتصال بالخادم. يرجى التحقق من تشغيل الباك إند.';
        } else {
          this.message = 'حدث خطأ في إعداد نظام التوصيل';
        }
        console.error('Error setting up delivery system:', error);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
} 