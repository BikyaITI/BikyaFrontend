import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Wallet, WalletTransaction, DepositRequest, WithdrawRequest, TransactionType, TransactionStatus } from '../models/wallet.model';
import { ApiResponse } from '../models/api-response.model';

// DTOs for API requests
export interface UserIdRequestDto {
  userId: number;
}

export interface DepositRequestDto {
  userId: number;
  amount: number;
  description?: string;
}

export interface WithdrawRequestDto {
  userId: number;
  amount: number;
  description?: string;
}

export interface PayRequestDto {
  userId: number;
  amount: number;
  orderId: number;
  description?: string;
}

export interface RefundRequestDto {
  userId: number;
  transactionId: number;
  reason?: string;
}

export interface LinkPaymentDto {
  userId: number;
  methodName: string;
}

// API Response interfaces
export interface WalletBalanceResponse {
  success: boolean;
  message: string;
  data: {
    balance: number;
    pendingAmount: number;
    rewardPoints: number;
  };
}

export interface TransactionResponse {
  success: boolean;
  message: string;
  data: WalletTransaction[];
}

export interface SingleTransactionResponse {
  success: boolean;
  message: string;
  data: WalletTransaction;
}

export interface WalletStats {
  deposits: number;
  withdrawals: number;
  payments: number;
  refunds: number;
  pendingAmount: number;
  rewardPoints: number;
}

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  private readonly baseUrl = 'http://bikya-api.duckdns.org/api/Wallet';
  
  private walletBalanceSubject = new BehaviorSubject<number>(0);
  private pendingAmountSubject = new BehaviorSubject<number>(0);
  private rewardPointsSubject = new BehaviorSubject<number>(0);
  private transactionsSubject = new BehaviorSubject<WalletTransaction[]>([]);

  public walletBalance$ = this.walletBalanceSubject.asObservable();
  public pendingAmount$ = this.pendingAmountSubject.asObservable();
  public rewardPoints$ = this.rewardPointsSubject.asObservable();
  public transactions$ = this.transactionsSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Create Wallet
  createWallet(userId: number): Observable<ApiResponse<Wallet>> {
    const dto: UserIdRequestDto = { userId };
    return this.http.post<ApiResponse<Wallet>>(`${this.baseUrl}/create`, dto).pipe(
      catchError(this.handleError)
    );
  }

  // Get Balance
  getBalance(userId: number): Observable<WalletBalanceResponse> {
    return this.http.get<WalletBalanceResponse>(`${this.baseUrl}/balance?userId=${userId}`).pipe(
      tap(response => {
        if (response.success) {
          this.walletBalanceSubject.next(response.data.balance);
          this.pendingAmountSubject.next(response.data.pendingAmount);
          this.rewardPointsSubject.next(response.data.rewardPoints);
        }
      }),
      catchError(this.handleError)
    );
  }

  // Deposit
  deposit(userId: number, amount: number, description?: string): Observable<ApiResponse<WalletTransaction>> {
    const dto: DepositRequestDto = { userId, amount, description };
    return this.http.post<ApiResponse<WalletTransaction>>(`${this.baseUrl}/deposit`, dto).pipe(
      tap(() => {
        // Refresh balance after successful deposit
        this.getBalance(userId).subscribe();
        this.getTransactions(userId).subscribe();
      }),
      catchError(this.handleError)
    );
  }

  // Withdraw
  withdraw(userId: number, amount: number, description?: string): Observable<ApiResponse<WalletTransaction>> {
    const dto: WithdrawRequestDto = { userId, amount, description };
    return this.http.post<ApiResponse<WalletTransaction>>(`${this.baseUrl}/withdraw`, dto).pipe(
      tap(() => {
        // Refresh balance after successful withdrawal
        this.getBalance(userId).subscribe();
        this.getTransactions(userId).subscribe();
      }),
      catchError(this.handleError)
    );
  }

  // Pay
  pay(userId: number, amount: number, orderId: number, description?: string): Observable<ApiResponse<WalletTransaction>> {
    const dto: PayRequestDto = { userId, amount, orderId, description };
    return this.http.post<ApiResponse<WalletTransaction>>(`${this.baseUrl}/pay`, dto).pipe(
      tap(() => {
        // Refresh balance after successful payment
        this.getBalance(userId).subscribe();
        this.getTransactions(userId).subscribe();
      }),
      catchError(this.handleError)
    );
  }

  // Refund
  refund(userId: number, transactionId: number, reason?: string): Observable<ApiResponse<WalletTransaction>> {
    const dto: RefundRequestDto = { userId, transactionId, reason };
    return this.http.post<ApiResponse<WalletTransaction>>(`${this.baseUrl}/refund`, dto).pipe(
      tap(() => {
        // Refresh balance after successful refund
        this.getBalance(userId).subscribe();
        this.getTransactions(userId).subscribe();
      }),
      catchError(this.handleError)
    );
  }

  // Get All Transactions
  getTransactions(userId: number): Observable<TransactionResponse> {
    return this.http.get<TransactionResponse>(`${this.baseUrl}/transactions?userId=${userId}`).pipe(
      tap(response => {
        if (response.success) {
          this.transactionsSubject.next(response.data);
        }
      }),
      catchError(this.handleError)
    );
  }

  // Get Transaction by Id
  getTransactionById(userId: number, transactionId: number): Observable<SingleTransactionResponse> {
    return this.http.get<SingleTransactionResponse>(`${this.baseUrl}/transaction/${transactionId}?userId=${userId}`).pipe(
      catchError(this.handleError)
    );
  }

  // Lock Wallet
  lockWallet(userId: number): Observable<ApiResponse<Wallet>> {
    const dto: UserIdRequestDto = { userId };
    return this.http.post<ApiResponse<Wallet>>(`${this.baseUrl}/lock`, dto).pipe(
      catchError(this.handleError)
    );
  }

  // Confirm Transaction
  confirmTransaction(transactionId: number): Observable<ApiResponse<WalletTransaction>> {
    return this.http.post<ApiResponse<WalletTransaction>>(`${this.baseUrl}/confirm/${transactionId}`, {}).pipe(
      catchError(this.handleError)
    );
  }

  // Link Payment Method
  linkPaymentMethod(userId: number, methodName: string): Observable<ApiResponse<any>> {
    const dto: LinkPaymentDto = { userId, methodName };
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/link-method`, dto).pipe(
      catchError(this.handleError)
    );
  }

  // Unlock Wallet
  unlockWallet(userId: number): Observable<ApiResponse<Wallet>> {
    const dto: UserIdRequestDto = { userId };
    return this.http.post<ApiResponse<Wallet>>(`${this.baseUrl}/unlock`, dto).pipe(
      catchError(this.handleError)
    );
  }

  // Get Wallet Statistics
  getWalletStats(userId: number): Observable<WalletStats> {
    return this.getTransactions(userId).pipe(
      map(transactionResponse => {
        if (!transactionResponse.success) {
          throw new Error('Failed to fetch transactions');
        }

        const transactions = transactionResponse.data;
        const stats: WalletStats = {
          deposits: 0,
          withdrawals: 0,
          payments: 0,
          refunds: 0,
          pendingAmount: 0,
          rewardPoints: 0
        };

        transactions.forEach(transaction => {
          switch (transaction.type) {
            case TransactionType.Deposit:
              stats.deposits += transaction.amount;
              break;
            case TransactionType.Withdraw: // تم التصحيح هنا
              stats.withdrawals += transaction.amount;
              break;
            case TransactionType.Payment:
              stats.payments += transaction.amount;
              break;
            case TransactionType.Refund:
              stats.refunds += transaction.amount;
              break;
          }

          if (transaction.status === TransactionStatus.Pending) {
            stats.pendingAmount += transaction.amount;
          }
        });

        // Calculate reward points (1 point per $1 spent)
        stats.rewardPoints = Math.floor(stats.payments * 0.1); // 10% of payments as reward points

        return stats;
      }),
      catchError(this.handleError)
    );
  }

  getWalletByUserId(userId: number): Observable<ApiResponse<Wallet>> {
    return this.http.get<ApiResponse<Wallet>>(`${this.baseUrl}/user/${userId}`);
  }

  // Error handling
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      }
    }
    
    console.error('Wallet Service Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  // Clear all subjects (useful for logout)
  clearWalletData(): void {
    this.walletBalanceSubject.next(0);
    this.pendingAmountSubject.next(0);
    this.rewardPointsSubject.next(0);
    this.transactionsSubject.next([]);
  }
} 