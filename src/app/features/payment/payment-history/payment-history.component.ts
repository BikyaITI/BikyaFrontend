import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PaymentService } from '../../../core/services/payment.service';
import { AuthService } from '../../../core/services/auth.service';
import { PaymentDto } from '../../../core/models/payment.model';

@Component({
  selector: 'app-payment-history',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="payment-history-container">
      <div class="container mt-4">
        <div class="row">
          <div class="col-12">
            <div class="card">
              <div class="card-header">
                <h3 class="mb-0">
                  <i class="fas fa-history me-2"></i>
                  Payment History
                </h3>
                <!-- Action Buttons -->
                <div class="mt-3">
                  <button 
                    class="btn btn-warning btn-sm me-2"
                    (click)="checkPendingPayments()"
                    [disabled]="isLoading"
                    title="Check Pending Payments"
                  >
                    <i class="fas fa-search me-1"></i>
                    Check Pending
                  </button>
                  <button 
                    class="btn btn-success btn-sm"
                    (click)="refreshAllPendingPayments()"
                    [disabled]="isLoading"
                    title="Refresh All Pending Payments"
                  >
                    <i class="fas fa-sync-alt me-1"></i>
                    Refresh All Pending
                  </button>
                </div>
              </div>
              <div class="card-body">
                <!-- Loading State -->
                <div *ngIf="isLoading" class="text-center">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                  <p class="mt-2">Loading payment history...</p>
                </div>

                <!-- Error Message -->
                <div *ngIf="errorMessage" class="alert alert-danger">
                  <i class="fas fa-exclamation-triangle me-2"></i>
                  {{ errorMessage }}
                </div>

                <!-- Payment History Table -->
                <div *ngIf="!isLoading && payments.length > 0" class="table-responsive">
                  <table class="table table-hover">
                    <thead class="table-light">
                      <tr>
                        <th>Payment ID</th>
                        <th>Order ID</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Gateway</th>
                        <th>Created At</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let payment of payments">
                        <td>
                          <span class="badge bg-secondary">#{{ payment.id }}</span>
                        </td>
                        <td>
                          <button 
                            class="btn btn-sm btn-outline-primary"
                            (click)="viewOrder(payment.orderId || 0)"
                          >
                            Order #{{ payment.orderId || 'N/A' }}
                          </button>
                        </td>
                        <td>
                          <span class="badge bg-primary fs-6">
                            {{ payment.amount | currency:'EGP' }}
                          </span>
                        </td>
                        <td>
                          <span 
                            class="badge" 
                            [ngClass]="{
                              'bg-warning': payment.status === 'Pending',
                              'bg-success': payment.status === 'Paid',
                              'bg-danger': payment.status === 'Failed'
                            }"
                          >
                            {{ payment.status }}
                          </span>
                        </td>
                        <td>
                          <span class="badge bg-info">Stripe</span>
                        </td>
                        <td>{{ payment.createdAt | date:'short' }}</td>
                        <td>
                          <div class="btn-group" role="group">
                            <button 
                              class="btn btn-sm btn-outline-info"
                              (click)="checkPaymentStatus(payment.id)"
                              [disabled]="isLoading"
                              title="Check Status"
                            >
                              <i class="fas fa-sync-alt"></i>
                            </button>
                            <button 
                              class="btn btn-sm btn-outline-secondary"
                              (click)="viewPaymentDetails(payment.id)"
                              title="View Details"
                            >
                              <i class="fas fa-eye"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <!-- No Payments Message -->
                <div *ngIf="!isLoading && payments.length === 0" class="text-center">
                  <div class="alert alert-info">
                    <i class="fas fa-info-circle me-2"></i>
                    No payment history found.
                  </div>
                  <button class="btn btn-primary" (click)="goToOrders()">
                    <i class="fas fa-shopping-cart me-2"></i>
                    View Orders
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
    .payment-history-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px 0;
    }

    .card {
      border: none;
      border-radius: 15px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    }

    .card-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 1.5rem;
    }

    .card-header h3 {
      margin: 0;
      font-weight: 600;
    }

    .card-body {
      padding: 2rem;
    }

    .table {
      border-radius: 10px;
      overflow: hidden;

      th {
        background-color: #f8f9fa;
        border: none;
        font-weight: 600;
        color: #495057;
        padding: 1rem;
      }

      td {
        border: none;
        padding: 1rem;
        vertical-align: middle;
      }

      tbody tr {
        transition: background-color 0.3s ease;

        &:hover {
          background-color: #f8f9fa;
        }
      }
    }

    .badge {
      font-size: 0.875rem;
      padding: 0.5rem 0.75rem;
      border-radius: 8px;
    }

    .btn-group .btn {
      margin-right: 0.25rem;
    }

    .btn-group .btn:last-child {
      margin-right: 0;
    }

    @media (max-width: 768px) {
      .card-body {
        padding: 1.5rem;
      }

      .table-responsive {
        font-size: 0.875rem;
      }
    }
  `]
})
export class PaymentHistoryComponent implements OnInit {
  payments: PaymentDto[] = [];
  isLoading = false;
  errorMessage = '';
  currentUserId: number = 0;

  constructor(
    private paymentService: PaymentService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.currentUserId = user.id;
      this.loadPaymentHistory();
    } else {
      this.router.navigate(['/login']);
    }
  }

  loadPaymentHistory(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Get all payments for the current user
    this.paymentService.getPaymentsByUserId(this.currentUserId).subscribe({
      next: (payments: PaymentDto[]) => {
        this.isLoading = false;
        this.payments = payments;
      },
      error: (err: any) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to load payment history: ' + err.message;
      }
    });
  }

  checkPaymentStatus(paymentId: number): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Use the new endpoint to check and update payment status
    this.paymentService.checkPaymentStatus(paymentId).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          // Refresh the payment history
          this.loadPaymentHistory();
          // Show success message
          this.showSuccessMessage('Payment status updated successfully');
        } else {
          this.errorMessage = res.message || 'Failed to update payment status';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to check payment status: ' + err.message;
      }
    });
  }

  // New method to refresh all pending payments
  refreshAllPendingPayments(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.paymentService.refreshAllPendingPayments(this.currentUserId).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          // Refresh the payment history
          this.loadPaymentHistory();
          // Show success message
          this.showSuccessMessage(`Updated ${res.data?.updatedCount || 0} payments`);
        } else {
          this.errorMessage = res.message || 'Failed to refresh payments';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to refresh payments: ' + err.message;
      }
    });
  }

  // New method to check pending payments without updating
  checkPendingPayments(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.paymentService.checkPendingPayments(this.currentUserId).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          console.log('Pending payments check:', res.data);
          // Show info about pending payments
          const pendingCount = res.data?.pendingPayments || 0;
          this.showInfoMessage(`Found ${pendingCount} pending payments`);
        } else {
          this.errorMessage = res.message || 'Failed to check pending payments';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to check pending payments: ' + err.message;
      }
    });
  }

  // Helper methods for showing messages
  private showSuccessMessage(message: string): void {
    // You can implement a toast or alert service here
    console.log('Success:', message);
    // For now, we'll use a simple alert
    alert('Success: ' + message);
  }

  private showInfoMessage(message: string): void {
    console.log('Info:', message);
    alert('Info: ' + message);
  }

  viewPaymentDetails(paymentId: number): void {
    // Navigate to payment details page
    this.router.navigate(['/payment/details', paymentId]);
  }

  viewOrder(orderId: number): void {
    // Navigate to order details
    this.router.navigate(['/orders', orderId]);
  }

  goToOrders(): void {
    this.router.navigate(['/orders']);
  }
} 