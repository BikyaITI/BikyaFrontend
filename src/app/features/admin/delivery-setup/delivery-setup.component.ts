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

  constructor(private deliveryService: DeliveryService) { }

  setupDeliverySystem(): void {
    this.isLoading = true;
    this.message = '';

    this.deliveryService.setupDeliverySystem().subscribe({
      next: (response) => {
        if (response.success) {
          this.message = 'Delivery system setup completed successfully! Delivery staff can now log in.';
        } else {
          this.message = response.message || 'Failed to set up delivery system.';
        }
      },
      error: (error) => {
        if (error.status === 404) {
          this.message = 'Backend not available. Please make sure the server is running.';
        } else if (error.status === 0) {
          this.message = 'Cannot connect to server. Please check if backend is running.';
        } else {
          this.message = 'An error occurred while setting up the delivery system.';
        }
        console.error('Error setting up delivery system:', error);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}
