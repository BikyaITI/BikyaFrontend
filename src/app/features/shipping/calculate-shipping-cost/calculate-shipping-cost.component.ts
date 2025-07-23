import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ShippingService, ShippingCostRequest, ShippingCostResult } from '../../../core/services/shipping.service';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';

@Component({
  selector: 'app-calculate-shipping-cost',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DecimalPipe, DatePipe],
  templateUrl: './calculate-shipping-cost.component.html',
  styleUrls: ['./calculate-shipping-cost.component.scss'],
  providers: [DecimalPipe, DatePipe]
})
export class CalculateShippingCostComponent {
  costForm: FormGroup;
  result: ShippingCostResult | null = null;
  errorMessage = '';

  constructor(private fb: FormBuilder, private shippingService: ShippingService) {
    this.costForm = this.fb.group({
      weight: ['', Validators.required],
      destination: ['', Validators.required], // أضف هذا السطر
      method: ['Standard', Validators.required]
    });
  }

  calculate() {
    if (this.costForm.valid) {
      const request: ShippingCostRequest = this.costForm.value;
      this.shippingService.calculateShippingCost(request).subscribe({
        next: (res) => {
          this.result = res.data;
          this.errorMessage = '';
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Error calculating cost';
          this.result = null;
        }
      });
    }
  }
} 