import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaymentService } from '../../core/services/payment.service';
import { Payment, PaymentGateway } from '../../core/models/wallet.model';
import { ApiResponse } from '../../core/models/api-response.model';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent implements OnInit {
  paymentForm: FormGroup;
  payments: Payment[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  gateways = [PaymentGateway.Mock, PaymentGateway.PayPal, PaymentGateway.Stripe];

  constructor(private fb: FormBuilder, private paymentService: PaymentService) {
    this.paymentForm = this.fb.group({
      amount: ['', [Validators.required, Validators.min(1)]],
      userId: ['', Validators.required],
      orderId: [''],
      gateway: [PaymentGateway.Stripe, Validators.required],
      description: ['']
    });
  }

  ngOnInit(): void {
    // Optionally, load payments for a default user
  }

  loadPayments(userId: number): void {
    this.isLoading = true;
    this.paymentService.getPaymentsByUser(userId).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          this.payments = res.data;
        } else {
          this.errorMessage = res.message;
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.message;
      }
    });
  }

  submit(): void {
    if (this.paymentForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';
      const paymentData = this.paymentForm.value;
      this.paymentService.createPayment(paymentData).subscribe({
        next: (res) => {
          this.isLoading = false;
          if (res.success) {
            this.successMessage = 'Payment created successfully!';
            this.paymentForm.reset({ gateway: PaymentGateway.Mock });
            if (paymentData.userId) {
              this.loadPayments(paymentData.userId);
            }
          } else {
            this.errorMessage = res.message;
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.message;
        }
      });
    }
  }
} 
