import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PaymentService } from '../../core/services/payment.service';
import { AuthService } from '../../core/services/auth.service';
import { OrderService } from '../../core/services/order.service';
import { 
  PaymentRequestDto, 
  PaymentResponseDto, 
  PaymentDto 
} from '../../core/models/payment.model';
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
  payments: PaymentDto[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  currentUserId: number = 0;
  orderId: number = 0;
  orderAmount: number = 0;
  orderDetails: any = null;

  constructor(
    private fb: FormBuilder, 
    private paymentService: PaymentService,
    private authService: AuthService,
    private orderService: OrderService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.paymentForm = this.fb.group({
      description: ['']
    });
  }

  ngOnInit(): void {
    // Get current user
    const user = this.authService.getCurrentUser();
    if (user) {
      this.currentUserId = user.id;
    }

    // Get order details from route params
    this.route.params.subscribe(params => {
      if (params['orderId']) {
        this.orderId = +params['orderId'];
        this.loadOrderDetails();
      }
      if (params['amount']) {
        this.orderAmount = +params['amount'];
      }
    });

    // Load payments for this order if orderId exists
    if (this.orderId) {
      this.loadPaymentsByOrder();
    }
  }

  loadOrderDetails(): void {
    if (!this.orderId) return;
    
    this.isLoading = true;
    this.orderService.getOrderById(this.orderId).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success && response.data) {
          this.orderDetails = response.data;
          this.orderAmount = response.data.totalAmount;
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to load order details: ' + err.message;
      }
    });
  }

  loadPaymentsByOrder(): void {
    if (!this.orderId) return;
    
    this.isLoading = true;
    this.paymentService.getPaymentsByOrderId(this.orderId).subscribe({
      next: (payments) => {
        this.isLoading = false;
        this.payments = payments;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to load payments: ' + err.message;
      }
    });
  }

  submit(): void {
    if (this.currentUserId && this.orderId && this.orderAmount) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const paymentData: PaymentRequestDto = {
        amount: this.orderAmount,
        orderId: this.orderId,
        userId: this.currentUserId,
        description: this.paymentForm.value.description
      };

      this.paymentService.createPayment(paymentData).subscribe({
        next: (res: ApiResponse<PaymentResponseDto>) => {
          this.isLoading = false;
          if (res.success && res.data) {
            this.successMessage = 'Payment session created successfully!';
            
            // Redirect to Stripe payment page
            if (res.data.stripeUrl) {
              window.location.href = res.data.stripeUrl;
            }
            
            // Reload payments
            this.loadPaymentsByOrder();
          } else {
            this.errorMessage = res.message || 'Payment creation failed';
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = 'Payment creation failed: ' + err.message;
        }
      });
    } else {
      this.errorMessage = 'Missing required information. Please try again.';
    }
  }

  checkPaymentStatus(paymentId: number): void {
    this.paymentService.getPaymentStatus(paymentId).subscribe({
      next: (res: ApiResponse<any>) => {
        if (res.success) {
          this.successMessage = `Payment status: ${res.data.status}`;
          this.loadPaymentsByOrder(); // Refresh list
        } else {
          this.errorMessage = res.message;
        }
      },
      error: (err) => {
        this.errorMessage = 'Failed to check payment status: ' + err.message;
      }
    });
  }
} 
