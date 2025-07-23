import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ShippingService, CreateShippingRequest, Shipping } from '../../../core/services/shipping.service';

@Component({
  selector: 'app-create-shipping',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-shipping.component.html',
  styleUrls: ['./create-shipping.component.scss']
})
export class CreateShippingComponent {
  shippingForm: FormGroup;
  successMessage = '';
  errorMessage = '';

  constructor(private fb: FormBuilder, private shippingService: ShippingService) {
    this.shippingForm = this.fb.group({
      recipientName: ['', Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required],
      postalCode: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      orderId: ['', Validators.required]
    });
  }

  createShipping() {
    if (this.shippingForm.valid) {
      const request: CreateShippingRequest = this.shippingForm.value;
      this.shippingService.createShipping(request).subscribe({
        next: () => {
          this.successMessage = 'Shipping created successfully!';
          this.errorMessage = '';
          this.shippingForm.reset();
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Error creating shipping';
          this.successMessage = '';
        }
      });
    }
  }
} 