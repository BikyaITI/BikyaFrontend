import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShippingService, Shipping } from '../../../core/services/shipping.service';

@Component({
  selector: 'app-admin-shipping-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-shipping-list.component.html',
  styleUrls: ['./admin-shipping-list.component.scss']
})
export class AdminShippingListComponent implements OnInit {
  shippings: Shipping[] = [];
  errorMessage = '';

  constructor(private shippingService: ShippingService) {}

  ngOnInit() {
    this.loadShippings();
  }

  loadShippings() {
    this.shippingService.getAllShippings().subscribe({
      next: (res) => this.shippings = res.data || [],
      error: (err) => this.errorMessage = err.error?.message || 'Error loading shippings'
    });
  }

  deleteShipping(id: number) {
    if (confirm('Are you sure you want to delete this shipping?')) {
      this.shippingService.deleteShipping(id).subscribe({
        next: () => this.loadShippings(),
        error: (err) => this.errorMessage = err.error?.message || 'Error deleting shipping'
      });
    }
  }
} 