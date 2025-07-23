import { Component } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShippingService, TrackingResult } from '../../../core/services/shipping.service';

@Component({
  selector: 'app-track-shipping',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './track-shipping.component.html',
  styleUrls: ['./track-shipping.component.scss'],
  providers: [DatePipe]
})
export class TrackShippingComponent {
  trackingNumber = '';
  trackingInfo: TrackingResult | null = null;
  errorMessage = '';

  constructor(private shippingService: ShippingService) {}

  track() {
    this.trackingInfo = null;
    this.errorMessage = '';
    if (this.trackingNumber) {
      this.shippingService.trackShipping(this.trackingNumber).subscribe({
        next: (res) => this.trackingInfo = res.data,
        error: (err) => this.errorMessage = err.error?.message || 'Not found'
      });
    }
  }
} 