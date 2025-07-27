import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentService } from '../../../core/services/payment.service';
import { ApiResponse } from '../../../core/models/api-response.model';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="success-container">
      <div class="container mt-5">
        <div class="row justify-content-center">
          <div class="col-md-6">
            <div class="card text-center">
              <div class="card-body">
                <div class="success-icon">
                  <i class="fas fa-check-circle"></i>
                </div>
                <h2 class="card-title text-success">Payment Successful!</h2>
                <p class="card-text">
                  Your payment has been processed successfully. Thank you for your purchase!
                </p>
                
                <div *ngIf="paymentDetails" class="payment-details mt-4">
                  <h5>Payment Details</h5>
                  <div class="row">
                    <div class="col-6">
                      <strong>Payment ID:</strong>
                      <p>{{ paymentDetails.paymentId }}</p>
                    </div>
                    <div class="col-6">
                      <strong>Amount:</strong>
                      <p>{{ paymentDetails.amount | currency:'EGP' }}</p>
                    </div>
                    <div class="col-6">
                      <strong>Order ID:</strong>
                      <p>{{ paymentDetails.orderId }}</p>
                    </div>
                    <div class="col-6">
                      <strong>Status:</strong>
                      <p class="badge bg-success">{{ paymentDetails.status }}</p>
                    </div>
                  </div>
                </div>

                <div class="mt-4">
                  <button class="btn btn-primary me-2" (click)="goToOrders()">
                    <i class="fas fa-list me-2"></i>
                    View Orders
                  </button>
                  <button class="btn btn-outline-secondary" (click)="goHome()">
                    <i class="fas fa-home me-2"></i>
                    Go Home
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .success-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
      padding: 20px 0;
    }

    .card {
      border: none;
      border-radius: 15px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    }

    .success-icon {
      font-size: 4rem;
      color: #28a745;
      margin-bottom: 1rem;
    }

    .payment-details {
      background-color: #f8f9fa;
      border-radius: 10px;
      padding: 1.5rem;
      margin-top: 1.5rem;
    }

    .payment-details h5 {
      color: #495057;
      margin-bottom: 1rem;
    }

    .payment-details p {
      margin-bottom: 0.5rem;
      color: #6c757d;
    }

    .btn {
      border-radius: 10px;
      padding: 0.75rem 1.5rem;
      font-weight: 600;
    }
  `]
})
export class PaymentSuccessComponent implements OnInit {
  paymentDetails: any = null;
  sessionId: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService
  ) {}

  ngOnInit(): void {
    // Get session_id from URL params
    this.route.queryParams.subscribe(params => {
      this.sessionId = params['session_id'];
      if (this.sessionId) {
        console.log('Stripe Session ID:', this.sessionId);
        // You can use this session ID to verify payment status with backend
        this.verifyPaymentStatus();
      }
    });
  }

  verifyPaymentStatus(): void {
    // Here you can call backend API to verify payment status
    // using the session_id
    console.log('Verifying payment status for session:', this.sessionId);
    
    // Example: Call payment service to get payment details
    // this.paymentService.verifyPaymentBySessionId(this.sessionId).subscribe({
    //   next: (response) => {
    //     if (response.success) {
    //       this.paymentDetails = response.data;
    //     }
    //   },
    //   error: (error) => {
    //     console.error('Error verifying payment:', error);
    //   }
    // });
  }

  goToOrders(): void {
    this.router.navigate(['/orders']);
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
} 