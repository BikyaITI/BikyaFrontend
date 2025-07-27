import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payment-cancel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cancel-container">
      <div class="container mt-5">
        <div class="row justify-content-center">
          <div class="col-md-6">
            <div class="card text-center">
              <div class="card-body">
                <div class="cancel-icon">
                  <i class="fas fa-times-circle"></i>
                </div>
                <h2 class="card-title text-danger">Payment Cancelled</h2>
                <p class="card-text">
                  Your payment was cancelled. No charges were made to your account.
                </p>
                
                <div class="mt-4">
                  <button class="btn btn-primary me-2" (click)="retryPayment()">
                    <i class="fas fa-redo me-2"></i>
                    Try Again
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
    .cancel-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%);
      padding: 20px 0;
    }

    .card {
      border: none;
      border-radius: 15px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    }

    .cancel-icon {
      font-size: 4rem;
      color: #dc3545;
      margin-bottom: 1rem;
    }

    .btn {
      border-radius: 10px;
      padding: 0.75rem 1.5rem;
      font-weight: 600;
    }
  `]
})
export class PaymentCancelComponent {
  constructor(private router: Router) {}

  retryPayment(): void {
    // Go back to payment page or orders page
    this.router.navigate(['/orders']);
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
} 