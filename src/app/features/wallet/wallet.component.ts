import { Component,  OnInit, OnDestroy } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ReactiveFormsModule, FormsModule,  FormBuilder,  FormGroup, Validators } from "@angular/forms"
import { RouterModule } from '@angular/router';
import { Subject, takeUntil, combineLatest } from "rxjs"
import { AuthService } from "../../core/services/auth.service"
import { WalletService } from "../../core/services/wallet.service"
import { WalletTransaction, WalletStats } from "../../core/models/wallet.model"
import { User } from "../../core/models/user.model"
import { OrderService } from '../../core/services/order.service';
import { Order, OrderStatus } from '../../core/models/order.model';

@Component({
  selector: "app-wallet",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: "./wallet.component.html",
  styleUrls: ["./wallet.component.scss"]
})
export class WalletComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  currentUser: User | null = null
  walletBalance = 0
  activeFilter = "all"
  isLoadingTransactions = false
  isProcessingDeposit = false
  isProcessingWithdraw = false
  hasMoreTransactions = true
  errorMessage = ""
  successMessage = ""
  walletLocked = false;

  depositForm: FormGroup
  withdrawForm: FormGroup
  payOrderForm: FormGroup;
  isLoadingOrders = false;
  selectedOrder: Order | null = null;
  linkPaymentForm: FormGroup;
  isLinkingPayment = false;
  linkPaymentSuccess: string | null = null;
  linkPaymentError: string | null = null;

  monthlyStats: WalletStats = {
    deposits: 0,
    withdrawals: 0,
    payments: 0,
    refunds: 0,
    pendingAmount: 0,
    rewardPoints: 0,
  }

  transactions: WalletTransaction[] = []
  orders: Order[] = [];
  // احذف متغيرات showPayOrderModal, showWithdrawModal, showTransactionModal
  // احذف جميع الدوال التالية:
  // openPayOrderModal, closePayOrderModal, openWithdrawModal, closeWithdrawModal, closeAddMoneyModal, openTransactionModal, closeTransactionModal
  // في دوال مثل deposit/withdraw/payOrder، احذف أي كود يغلق المودال من TypeScript (مثل this.closeAddMoneyModal() ... إلخ)

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private walletService: WalletService,
    private orderService: OrderService,
  ) {
    this.depositForm = this.fb.group({
      amount: ["", [Validators.required, Validators.min(1), Validators.max(1000)]],
      description: [""],
    })

    this.withdrawForm = this.fb.group({
      amount: ["", [Validators.required, Validators.min(1)]],
      description: [""],
    })
    this.payOrderForm = this.fb.group({
      orderId: [null, Validators.required],
      amount: [{ value: '', disabled: true }, Validators.required],
      description: [''],
    });
    this.linkPaymentForm = this.fb.group({
      methodName: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.authService.currentUser$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((user) => {
      this.currentUser = user
      if (user) {
        this.loadWalletData()
        this.loadPayableOrders()
      }
    })
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  loadWalletData(): void {
    if (!this.currentUser?.id) return;

    this.isLoadingTransactions = true
    this.errorMessage = ""

    // Load balance and transactions in parallel
    combineLatest([
      this.walletService.getBalance(this.currentUser.id),
      this.walletService.getTransactions(this.currentUser.id),
      this.walletService.getWalletStats(this.currentUser.id)
    ]).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: ([balanceResponse, transactionResponse, stats]) => {
        this.isLoadingTransactions = false

        if (balanceResponse.success) {
          this.walletBalance = balanceResponse.data.balance
          // تحقق من وجود currentUser قبل استدعاء getWalletByUserId
          if (this.currentUser && this.currentUser.id) {
            this.walletService.getWalletByUserId(this.currentUser.id).subscribe(res => {
              if (res.success && res.data) {
                this.walletLocked = res.data.isLocked;
              }
            });
          }
        }

        if (transactionResponse.success) {
          this.transactions = transactionResponse.data
        }

        this.monthlyStats = stats
      },
      error: (error) => {
        this.isLoadingTransactions = false
        this.errorMessage = error.message || 'Failed to load wallet data'
        console.error('Error loading wallet data:', error)
      }
    })

    // Subscribe to real-time updates
    this.walletService.walletBalance$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(balance => {
      this.walletBalance = balance
    })

    this.walletService.pendingAmount$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(pendingAmount => {
      this.monthlyStats.pendingAmount = pendingAmount
    })

    this.walletService.rewardPoints$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(rewardPoints => {
      this.monthlyStats.rewardPoints = rewardPoints
    })

    this.walletService.transactions$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(transactions => {
      this.transactions = transactions
    })
  }

  loadPayableOrders(): void {
    if (!this.currentUser?.id) return;
    this.isLoadingOrders = true;
    this.orderService.getOrdersByBuyer(this.currentUser.id).subscribe({
      next: (res) => {
        this.isLoadingOrders = false;
        if (res.success && res.data) {
          this.orders = res.data.filter(o => o.status === OrderStatus.Pending);
        } else {
          this.orders = [];
        }
      },
      error: () => {
        this.isLoadingOrders = false;
        this.orders = [];
      }
    });
  }

  // دالة دفع الطلب - تحتاج تسجيل دخول
  payOrder(): void {
    if (/* !this.currentUser?.id || */ this.payOrderForm.invalid) return;
    const orderId = this.payOrderForm.get('orderId')?.value;
    const amount = this.payOrderForm.get('amount')?.value;
    const description = this.payOrderForm.get('description')?.value;
    this.isLoadingOrders = true;
    this.walletService.pay(/* this.currentUser.id, */ 1, amount, orderId, description).subscribe({
      next: (res) => {
        this.isLoadingOrders = false;
        if (res.success) {
          this.successMessage = 'تم الدفع بنجاح!';
          this.loadWalletData();
          this.loadPayableOrders();
          this.payOrderForm.reset();
          setTimeout(() => { this.successMessage = ''; }, 3000);
        } else {
          this.errorMessage = res.message;
        }
      },
      error: (err) => {
        this.isLoadingOrders = false;
        this.errorMessage = err.message || 'فشل الدفع';
      }
    });
  }

  setFilter(filter: string): void {
    this.activeFilter = filter
  }

  getFilteredTransactions(): WalletTransaction[] {
    if (this.activeFilter === "all") {
      return this.transactions
    }
    switch (this.activeFilter) {
      case "deposit":
        return this.transactions.filter((t) => t.type === 1)
              case "withdrawal":
          return this.transactions.filter((t) => t.type === 2)
        case "payment":
          return this.transactions.filter((t) => t.type === 3)
        case "refund":
        return this.transactions.filter((t) => t.type === 4)
      default:
        return this.transactions
    }
  }

  getTransactionIcon(type: WalletTransaction['type']): string {
    switch (type) {
      case 1:
        return "fas fa-plus-circle"
      case 2:
        return "fas fa-arrow-up-circle"
      case 3:
        return "fas fa-credit-card"
      case 4:
        return "fas fa-undo"
      default:
        return "fas fa-circle"
    }
  }

  getTransactionIconClass(type: WalletTransaction['type']): string {
    switch (type) {
      case 1:
        return "bg-success rounded-circle d-flex align-items-center justify-content-center"
      case 2:
        return "bg-primary rounded-circle d-flex align-items-center justify-content-center"
      case 3:
        return "bg-danger rounded-circle d-flex align-items-center justify-content-center"
      case 4:
        return "bg-warning rounded-circle d-flex align-items-center justify-content-center"
      default:
        return "bg-secondary rounded-circle d-flex align-items-center justify-content-center"
    }
  }

  getTransactionTitle(type: WalletTransaction['type']): string {
    switch (type) {
      case 1:
        return "Money Added"
      case 2:
        return "Money Withdrawn"
      case 3:
        return "Payment Made"
      case 4:
        return "Refund Received"
      default:
        return "Transaction"
    }
  }

  getAmountClass(type: WalletTransaction['type']): string {
    switch (type) {
      case 1:
      case 4:
        return "text-success"
      case 2:
      case 3:
        return "text-danger"
      default:
        return "text-muted"
    }
  }

  getAmountPrefix(type: WalletTransaction['type']): string {
    switch (type) {
      case 1:
      case 4:
        return "+"
      case 2:
      case 3:
        return "-"
      default:
        return ""
    }
  }

  getStatusBadgeClass(status: WalletTransaction['status']): string {
    switch (status) {
      case 1: // Completed
        return "bg-success"
      case 0: // Pending
        return "bg-warning text-dark"
      case 2: // Failed
        return "bg-danger"
      default:
        return "bg-secondary"
    }
  }

  // دالة إضافة المال - تحتاج تسجيل دخول
  deposit(): void {
    if (this.depositForm.valid /* && this.currentUser?.id */) {
      this.isProcessingDeposit = true
      this.errorMessage = ""
      this.successMessage = ""

      const amount = this.depositForm.get("amount")?.value
      const description = this.depositForm.get("description")?.value

      this.walletService.deposit(/* this.currentUser.id, */ 1, amount, description).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: (response) => {
          this.isProcessingDeposit = false
          this.successMessage = "Money added successfully!"

          this.depositForm.reset()

          setTimeout(() => {
            this.successMessage = ""
          }, 3000)
        },
        error: (error) => {
          this.isProcessingDeposit = false
          this.errorMessage = error.message || 'Failed to add money'
          console.error('Error depositing money:', error)
        }
      })
    }
  }

  // دالة سحب المال - تحتاج تسجيل دخول
  withdraw(): void {
    if (this.withdrawForm.valid /* && this.currentUser?.id */) {
      this.isProcessingWithdraw = true
      this.errorMessage = ""
      this.successMessage = ""

      const amount = this.withdrawForm.get("amount")?.value
      const description = this.withdrawForm.get("description")?.value

      this.walletService.withdraw(/* this.currentUser.id, */ 1, amount, description).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: (response) => {
          this.isProcessingWithdraw = false
          this.successMessage = "Withdrawal request submitted successfully!"

          this.withdrawForm.reset()

          setTimeout(() => {
            this.successMessage = ""
          }, 3000)
        },
        error: (error) => {
          this.isProcessingWithdraw = false
          this.errorMessage = error.message || 'Failed to withdraw money'
          console.error('Error withdrawing money:', error)
        }
      })
    }
  }

  loadMoreTransactions(): void {
    // This could be implemented with pagination if the API supports it
    this.hasMoreTransactions = false
  }

  // Create wallet if it doesn't exist
  createWalletIfNeeded(): void {
    if (!this.currentUser?.id) return;

    this.walletService.createWallet(this.currentUser.id).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        console.log('Wallet created successfully')
        this.loadWalletData() // Reload data after creating wallet
      },
      error: (error) => {
        // If wallet already exists, this is not an error
        if (error.status !== 400) {
          console.error('Error creating wallet:', error)
        }
      }
    })
  }

  // Clear error message
  clearError(): void {
    this.errorMessage = ""
  }

  // Clear success message
  clearSuccess(): void {
    this.successMessage = ""
  }

  openPaymentComponent(): void {
    window.open('/wallet/payment', '_blank');
  }

  toggleWalletLock(): void {
    if (!this.currentUser?.id) return;
    if (this.walletLocked) {
      // فتح المحفظة
      this.walletService.unlockWallet(this.currentUser.id).subscribe({
        next: (res) => {
          if (res.success) {
            this.walletLocked = false;
            this.successMessage = 'تم فتح المحفظة بنجاح';
          } else {
            this.errorMessage = res.message;
          }
        },
        error: (err) => {
          this.errorMessage = err.message || 'فشل في فتح المحفظة';
        }
      });
    } else {
      // قفل المحفظة
      this.walletService.lockWallet(this.currentUser.id).subscribe({
        next: (res) => {
          if (res.success) {
            this.walletLocked = true;
            this.successMessage = 'تم قفل المحفظة بنجاح';
          } else {
            this.errorMessage = res.message;
          }
        },
        error: (err) => {
          this.errorMessage = err.message || 'فشل في قفل المحفظة';
        }
      });
    }
  }

  linkPaymentMethod(): void {
    if (!this.currentUser?.id || this.linkPaymentForm.invalid) return;
    this.isLinkingPayment = true;
    this.linkPaymentSuccess = null;
    this.linkPaymentError = null;
    const methodName = this.linkPaymentForm.get('methodName')?.value;
    this.walletService.linkPaymentMethod(this.currentUser.id, methodName).subscribe({
      next: (res) => {
        this.isLinkingPayment = false;
        if (res.success) {
          this.linkPaymentSuccess = 'تم ربط وسيلة الدفع بنجاح!';
          this.linkPaymentForm.reset();
        } else {
          this.linkPaymentError = res.message;
        }
      },
      error: (err) => {
        this.isLinkingPayment = false;
        this.linkPaymentError = err.message || 'فشل في ربط وسيلة الدفع';
      }
    });
  }
}
