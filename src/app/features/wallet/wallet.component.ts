import { Component,  OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ReactiveFormsModule, FormsModule,  FormBuilder,  FormGroup, Validators } from "@angular/forms"
import  { AuthService } from "../../core/services/auth.service"
import  { User } from "../../core/models/user.model"
import  { WalletTransaction, TransactionType, TransactionStatus } from "../../core/models/wallet.model"

@Component({
  selector: "app-wallet",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <!-- Page Header -->
    <section class="page-header py-5 bg-light">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-md-6">
            <h1 class="page-title">My Wallet</h1>
            <p class="page-subtitle">Manage your balance and transactions</p>
          </div>
          <div class="col-md-6">
            <nav aria-label="breadcrumb">
              <ol class="breadcrumb justify-content-md-end">
                <li class="breadcrumb-item"><a routerLink="/">Home</a></li>
                <li class="breadcrumb-item active">Wallet</li>
              </ol>
            </nav>
          </div>
        </div>
      </div>
    </section>

    <!-- Wallet Dashboard -->
    <section class="wallet-section py-5">
      <div class="container">
        <div class="row">
          <!-- Wallet Balance Cards -->
          <div class="col-lg-4 col-md-6 mb-4">
            <div class="card shadow-sm h-100" style="border-left: 4px solid var(--success-color);">
              <div class="card-header bg-light">
                <div class="d-flex align-items-center">
                  <div class="feature-icon me-3" style="width: 50px; height: 50px; background: var(--gradient-primary);">
                    <i class="fas fa-wallet"></i>
                  </div>
                  <div>
                    <h6 class="card-title mb-0">Available Balance</h6>
                    <small class="text-muted">Ready to spend</small>
                  </div>
                </div>
              </div>
              <div class="card-body">
                <h2 class="text-success mb-3">\${{walletBalance | number:'1.2-2'}}</h2>
                <div class="d-grid gap-2">
                  <button class="btn btn-success btn-sm" data-bs-toggle="modal" data-bs-target="#addMoneyModal">
                    <i class="fas fa-plus me-1"></i>Add Money
                  </button>
                  <button class="btn btn-outline-primary btn-sm" data-bs-toggle="modal" data-bs-target="#withdrawModal">
                    <i class="fas fa-arrow-up me-1"></i>Withdraw
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="col-lg-4 col-md-6 mb-4">
            <div class="card shadow-sm h-100" style="border-left: 4px solid var(--warning-color);">
              <div class="card-header bg-light">
                <div class="d-flex align-items-center">
                  <div class="feature-icon me-3" style="width: 50px; height: 50px; background: var(--gradient-accent);">
                    <i class="fas fa-clock"></i>
                  </div>
                  <div>
                    <h6 class="card-title mb-0">Pending Balance</h6>
                    <small class="text-muted">Processing transactions</small>
                  </div>
                </div>
              </div>
              <div class="card-body">
                <h2 class="text-warning mb-3">\${{monthlyStats.pendingAmount | number:'1.2-2'}}</h2>
                <p class="text-muted mb-0">Expected in 2-3 business days</p>
              </div>
            </div>
          </div>

          <div class="col-lg-4 col-md-6 mb-4">
            <div class="card shadow-sm h-100" style="border-left: 4px solid var(--info-color);">
              <div class="card-header bg-light">
                <div class="d-flex align-items-center">
                  <div class="feature-icon me-3" style="width: 50px; height: 50px; background: var(--gradient-secondary);">
                    <i class="fas fa-gift"></i>
                  </div>
                  <div>
                    <h6 class="card-title mb-0">Reward Points</h6>
                    <small class="text-muted">Earn with every purchase</small>
                  </div>
                </div>
              </div>
              <div class="card-body">
                <h2 class="text-info mb-3">{{monthlyStats.rewardPoints}}</h2>
                <p class="text-muted mb-0">= \${{(monthlyStats.rewardPoints * 0.01) | number:'1.2-2'}} value</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="row mb-5">
          <div class="col-12">
            <div class="card shadow-sm">
              <div class="card-header">
                <h5 class="mb-0">Quick Actions</h5>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-lg-3 col-md-6 mb-3">
                    <button class="btn btn-outline-primary w-100 h-100 py-3" data-bs-toggle="modal" data-bs-target="#addMoneyModal">
                      <i class="fas fa-credit-card mb-2 d-block" style="font-size: 2rem;"></i>
                      Add Money
                    </button>
                  </div>
                  <div class="col-lg-3 col-md-6 mb-3">
                    <button class="btn btn-outline-primary w-100 h-100 py-3" data-bs-toggle="modal" data-bs-target="#transferModal">
                      <i class="fas fa-exchange-alt mb-2 d-block" style="font-size: 2rem;"></i>
                      Transfer Money
                    </button>
                  </div>
                  <div class="col-lg-3 col-md-6 mb-3">
                    <button class="btn btn-outline-primary w-100 h-100 py-3">
                      <i class="fas fa-file-invoice mb-2 d-block" style="font-size: 2rem;"></i>
                      Pay Bills
                    </button>
                  </div>
                  <div class="col-lg-3 col-md-6 mb-3">
                    <button class="btn btn-outline-primary w-100 h-100 py-3">
                      <i class="fas fa-mobile-alt mb-2 d-block" style="font-size: 2rem;"></i>
                      Mobile Recharge
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Transaction History -->
        <div class="row">
          <div class="col-12">
            <div class="card shadow-sm">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">Recent Transactions</h5>
                <div class="d-flex align-items-center">
                  <select class="form-select form-select-sm me-2" [(ngModel)]="activeFilter" (change)="setFilter(activeFilter)">
                    <option value="all">All Transactions</option>
                    <option value="deposit">Deposits</option>
                    <option value="withdrawal">Withdrawals</option>
                    <option value="payment">Payments</option>
                    <option value="refund">Refunds</option>
                  </select>
                </div>
              </div>
              <div class="card-body">
                <div *ngIf="isLoadingTransactions" class="text-center py-4">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                </div>

                <div *ngIf="!isLoadingTransactions && getFilteredTransactions().length === 0" class="text-center py-5">
                  <i class="fas fa-receipt display-4 text-muted"></i>
                  <h5 class="mt-3">No transactions found</h5>
                  <p class="text-muted">Your transaction history will appear here</p>
                </div>

                <div class="transaction-list" *ngIf="!isLoadingTransactions && getFilteredTransactions().length > 0">
                  <div
                    class="d-flex align-items-center justify-content-between py-3 border-bottom"
                    *ngFor="let transaction of getFilteredTransactions()">
                    <div class="d-flex align-items-center">
                      <div class="me-3">
                        <div [class]="getTransactionIconClass(transaction.type)" style="width: 50px; height: 50px;">
                          <i [class]="getTransactionIcon(transaction.type)" class="text-white"></i>
                        </div>
                      </div>
                      <div>
                        <h6 class="mb-0">{{getTransactionTitle(transaction.type)}}</h6>
                        <small class="text-muted">{{transaction.description}}</small>
                        <br>
                        <small class="text-muted">{{transaction.createdAt | date:'medium'}}</small>
                      </div>
                    </div>
                    <div class="text-end">
                      <div [class]="getAmountClass(transaction.type)" class="fw-bold">
                        {{getAmountPrefix(transaction.type)}}\${{transaction.amount | number:'1.2-2'}}
                      </div>
                      <span class="badge" [class]="getStatusBadgeClass(transaction.status)">
                        {{transaction.status}}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Load More Button -->
                <div class="text-center mt-3" *ngIf="hasMoreTransactions">
                  <button class="btn btn-outline-primary" (click)="loadMoreTransactions()">
                    Load More Transactions
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Add Money Modal -->
    <div class="modal fade" id="addMoneyModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fas fa-plus-circle text-success me-2"></i>Add Money to Wallet
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <form [formGroup]="depositForm" (ngSubmit)="deposit()">
            <div class="modal-body">
              <div class="mb-3">
                <label for="depositAmount" class="form-label">Amount (\$) *</label>
                <div class="input-group">
                  <span class="input-group-text">\$</span>
                  <input
                    type="number"
                    class="form-control"
                    id="depositAmount"
                    formControlName="amount"
                    placeholder="0.00"
                    step="0.01"
                    min="1"
                    [class.is-invalid]="depositForm.get('amount')?.invalid && depositForm.get('amount')?.touched">
                </div>
                <div class="invalid-feedback" *ngIf="depositForm.get('amount')?.invalid && depositForm.get('amount')?.touched">
                  Please enter a valid amount (minimum \$1.00)
                </div>
                <div class="form-text">Minimum \$1.00, Maximum \$1000.00</div>
              </div>

              <div class="mb-3">
                <label for="depositDescription" class="form-label">Description (Optional)</label>
                <input
                  type="text"
                  class="form-control"
                  id="depositDescription"
                  formControlName="description"
                  placeholder="Add a note for this deposit">
              </div>

              <div class="payment-methods">
                <h6>Payment Method</h6>
                <div class="form-check mb-2">
                  <input class="form-check-input" type="radio" name="paymentMethod" id="creditCard" checked>
                  <label class="form-check-label" for="creditCard">
                    <i class="fas fa-credit-card me-2"></i>Credit/Debit Card
                  </label>
                </div>
                <div class="form-check mb-2">
                  <input class="form-check-input" type="radio" name="paymentMethod" id="paypal">
                  <label class="form-check-label" for="paypal">
                    <i class="fab fa-paypal me-2"></i>PayPal
                  </label>
                </div>
                <div class="form-check">
                  <input class="form-check-input" type="radio" name="paymentMethod" id="bankTransfer">
                  <label class="form-check-label" for="bankTransfer">
                    <i class="fas fa-university me-2"></i>Bank Transfer
                  </label>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button
                type="submit"
                class="btn btn-success"
                [disabled]="depositForm.invalid || isProcessingDeposit">
                <span *ngIf="isProcessingDeposit" class="spinner-border spinner-border-sm me-2"></span>
                {{isProcessingDeposit ? 'Processing...' : 'Add Money'}}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Withdraw Modal -->
    <div class="modal fade" id="withdrawModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fas fa-arrow-up-circle text-primary me-2"></i>Withdraw Money
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <form [formGroup]="withdrawForm" (ngSubmit)="withdraw()">
            <div class="modal-body">
              <div class="alert alert-info">
                <i class="fas fa-info-circle me-2"></i>
                Available balance: <strong>\${{walletBalance | number:'1.2-2'}}</strong>
              </div>

              <div class="mb-3">
                <label for="withdrawAmount" class="form-label">Amount (\$) *</label>
                <div class="input-group">
                  <span class="input-group-text">\$</span>
                  <input
                    type="number"
                    class="form-control"
                    id="withdrawAmount"
                    formControlName="amount"
                    placeholder="0.00"
                    step="0.01"
                    min="1"
                    [max]="walletBalance"
                    [class.is-invalid]="withdrawForm.get('amount')?.invalid && withdrawForm.get('amount')?.touched">
                </div>
                <div class="invalid-feedback" *ngIf="withdrawForm.get('amount')?.invalid && withdrawForm.get('amount')?.touched">
                  Please enter a valid amount (minimum \$1.00, maximum \${{walletBalance}})
                </div>
              </div>

              <div class="mb-3">
                <label for="withdrawDescription" class="form-label">Description (Optional)</label>
                <input
                  type="text"
                  class="form-control"
                  id="withdrawDescription"
                  formControlName="description"
                  placeholder="Add a note for this withdrawal">
              </div>

              <div class="withdrawal-info">
                <h6>Withdrawal Information</h6>
                <ul class="list-unstyled">
                  <li><i class="fas fa-clock text-muted me-2"></i>Processing time: 1-3 business days</li>
                  <li><i class="fas fa-dollar-sign text-muted me-2"></i>Withdrawal fee: \$2.50</li>
                  <li><i class="fas fa-shield-check text-muted me-2"></i>Secure and encrypted</li>
                </ul>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button
                type="submit"
                class="btn btn-primary"
                [disabled]="withdrawForm.invalid || isProcessingWithdraw">
                <span *ngIf="isProcessingWithdraw" class="spinner-border spinner-border-sm me-2"></span>
                {{isProcessingWithdraw ? 'Processing...' : 'Withdraw Money'}}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
})
export class WalletComponent implements OnInit {
  currentUser: User | null = null
  walletBalance = 1250.75
  activeFilter = "all"
  isLoadingTransactions = false
  isProcessingDeposit = false
  isProcessingWithdraw = false
  hasMoreTransactions = true

  depositForm: FormGroup
  withdrawForm: FormGroup

  monthlyStats = {
    deposits: 500.0,
    withdrawals: 200.0,
    payments: 350.0,
    refunds: 50.0,
    pendingAmount: 32.5,
    rewardPoints: 1245,
  }

  transactions: WalletTransaction[] = [
    {
      id: 1,
      walletId: 1,
      type: "Deposit" as TransactionType,
      amount: 100.0,
      description: "Added money to wallet",
      status: "Completed" as TransactionStatus,
      createdAt: new Date(Date.now() - 86400000),
    },
    {
      id: 2,
      walletId: 1,
      type: "Payment" as TransactionType,
      amount: 25.5,
      description: "Payment for iPhone Case",
      orderId: 123,
      status: "Completed" as TransactionStatus,
      createdAt: new Date(Date.now() - 172800000),
    },
    {
      id: 3,
      walletId: 1,
      type: "Refund" as TransactionType,
      amount: 15.0,
      description: "Refund for cancelled order",
      orderId: 122,
      status: "Completed" as TransactionStatus,
      createdAt: new Date(Date.now() - 259200000),
    },
  ]

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
  ) {
    this.depositForm = this.fb.group({
      amount: ["", [Validators.required, Validators.min(1), Validators.max(1000)]],
      description: [""],
    })

    this.withdrawForm = this.fb.group({
      amount: ["", [Validators.required, Validators.min(1)]],
      description: [""],
    })
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user
      if (user) {
        this.loadWalletData()
      }
    })
  }

  loadWalletData(): void {
    // Mock API calls - replace with actual service calls
    this.isLoadingTransactions = true
    setTimeout(() => {
      this.isLoadingTransactions = false
    }, 1000)
  }

  setFilter(filter: string): void {
    this.activeFilter = filter
  }

  getFilteredTransactions(): WalletTransaction[] {
    if (this.activeFilter === "all") {
      return this.transactions
    }
    return this.transactions.filter((t) => t.type.toLowerCase() === this.activeFilter)
  }

  getTransactionIcon(type: TransactionType): string {
    switch (type) {
      case "Deposit":
        return "fas fa-plus-circle"
      case "Withdrawal":
        return "fas fa-arrow-up-circle"
      case "Payment":
        return "fas fa-credit-card"
      case "Refund":
        return "fas fa-undo"
      default:
        return "fas fa-circle"
    }
  }

  getTransactionIconClass(type: TransactionType): string {
    switch (type) {
      case "Deposit":
        return "bg-success rounded-circle d-flex align-items-center justify-content-center"
      case "Withdrawal":
        return "bg-primary rounded-circle d-flex align-items-center justify-content-center"
      case "Payment":
        return "bg-danger rounded-circle d-flex align-items-center justify-content-center"
      case "Refund":
        return "bg-warning rounded-circle d-flex align-items-center justify-content-center"
      default:
        return "bg-secondary rounded-circle d-flex align-items-center justify-content-center"
    }
  }

  getTransactionTitle(type: TransactionType): string {
    switch (type) {
      case "Deposit":
        return "Money Added"
      case "Withdrawal":
        return "Money Withdrawn"
      case "Payment":
        return "Payment Made"
      case "Refund":
        return "Refund Received"
      default:
        return "Transaction"
    }
  }

  getAmountClass(type: TransactionType): string {
    switch (type) {
      case "Deposit":
      case "Refund":
        return "text-success"
      case "Withdrawal":
      case "Payment":
        return "text-danger"
      default:
        return "text-muted"
    }
  }

  getAmountPrefix(type: TransactionType): string {
    switch (type) {
      case "Deposit":
      case "Refund":
        return "+"
      case "Withdrawal":
      case "Payment":
        return "-"
      default:
        return ""
    }
  }

  getStatusBadgeClass(status: TransactionStatus): string {
    switch (status) {
      case "Completed":
        return "bg-success"
      case "Pending":
        return "bg-warning text-dark"
      case "Failed":
        return "bg-danger"
      default:
        return "bg-secondary"
    }
  }

  deposit(): void {
    if (this.depositForm.valid) {
      this.isProcessingDeposit = true

      // Mock API call
      setTimeout(() => {
        this.isProcessingDeposit = false
        const amount = this.depositForm.get("amount")?.value
        this.walletBalance += amount

        // Add transaction to history
        this.transactions.unshift({
          id: Date.now(),
          walletId: 1,
          type: "Deposit" as TransactionType,
          amount: amount,
          description: this.depositForm.get("description")?.value || "Added money to wallet",
          status: "Completed" as TransactionStatus,
          createdAt: new Date(),
        })

        // Close modal
        const modal = document.getElementById("addMoneyModal")
        if (modal) {
          const bsModal = (window as any).bootstrap.Modal.getInstance(modal)
          bsModal?.hide()
        }

        this.depositForm.reset()
      }, 2000)
    }
  }

  withdraw(): void {
    if (this.withdrawForm.valid) {
      this.isProcessingWithdraw = true

      // Mock API call
      setTimeout(() => {
        this.isProcessingWithdraw = false
        const amount = this.withdrawForm.get("amount")?.value
        this.walletBalance -= amount

        // Add transaction to history
        this.transactions.unshift({
          id: Date.now(),
          walletId: 1,
          type: "Withdrawal" as TransactionType,
          amount: amount,
          description: this.withdrawForm.get("description")?.value || "Money withdrawn from wallet",
          status: "Pending" as TransactionStatus,
          createdAt: new Date(),
        })

        // Close modal
        const modal = document.getElementById("withdrawModal")
        if (modal) {
          const bsModal = (window as any).bootstrap.Modal.getInstance(modal)
          bsModal?.hide()
        }

        this.withdrawForm.reset()
      }, 2000)
    }
  }

  loadMoreTransactions(): void {
    // Mock loading more transactions
    this.hasMoreTransactions = false
  }
}
