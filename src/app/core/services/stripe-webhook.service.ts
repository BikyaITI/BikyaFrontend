import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { OrderService } from './order.service';

export interface StripeWebhookEvent {
  id: string;
  object: string;
  api_version: string;
  created: number;
  data: {
    object: any;
  };
  livemode: boolean;
  pending_webhooks: number;
  request: {
    id: string;
    idempotency_key: string | null;
  };
  type: string;
}

export interface WebhookResponse {
  received: boolean;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class StripeWebhookService {
  private webhookUrl = 'https://bikya-api.duckdns.org/api/Wallet/Payment/webhook'; // Backend webhook endpoint

  constructor(
    private http: HttpClient,
    private orderService: OrderService
  ) {}

  /**
   * Process webhook events from Stripe
   * This would typically be called by your backend, not directly from Angular
   */
  processWebhookEvent(event: StripeWebhookEvent): Observable<WebhookResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Stripe-Signature': this.generateSignature(event) // In real implementation, this comes from Stripe
    });

    return this.http.post<WebhookResponse>(this.webhookUrl, event, { headers });
  }

  /**
   * Handle payment success webhook
   */
  handlePaymentSuccess(paymentIntent: any): void {
    console.log('Payment succeeded:', paymentIntent);
    // Update payment status in your local state
    // Navigate to success page
    // Update order status
  }

  /**
   * Handle payment failure webhook
   */
  handlePaymentFailure(paymentIntent: any): void {
    console.log('Payment failed:', paymentIntent);
    // Update payment status in your local state
    // Show error message to user
    // Update order status
  }

  /**
   * Handle checkout session completion
   */
  handleCheckoutSessionCompleted(session: any): void {
    console.log('Checkout session completed:', session);
    // Update order status
    // Send confirmation email
    // Update inventory
  }

  /**
   * Handle charge success
   */
  handleChargeSucceeded(charge: any): void {
    console.log('Charge succeeded:', charge);
    
    // Extract order ID from payment intent metadata
    const paymentIntentId = charge.payment_intent;
    if (paymentIntentId) {
      console.log('Processing payment intent:', paymentIntentId);
      
      // Update order status to 'Paid' when payment succeeds
      // Note: You'll need to implement a method to find order by payment intent
      this.updateOrderStatusByPaymentIntent(paymentIntentId, 'Paid');
    }
    
    // Update payment status
    // Send confirmation email
    // Process order fulfillment
  }

  /**
   * Handle charge update
   */
  handleChargeUpdated(charge: any): void {
    console.log('Charge updated:', charge);
    // Update payment status
    // Log changes
  }

  /**
   * Generate signature for webhook verification
   * Note: In production, this should be done on your backend
   */
  private generateSignature(event: StripeWebhookEvent): string {
    // This is a placeholder - actual signature generation should be on backend
    return 't=1234567890,v1=signature';
  }

  /**
   * Verify webhook signature
   * This should be implemented on your backend for security
   */
  verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    // Implementation should be on backend using crypto
    return true; // Placeholder
  }

  /**
   * Update order status by payment intent ID
   * This method will be called when payment succeeds
   */
  private updateOrderStatusByPaymentIntent(paymentIntentId: string, newStatus: string): void {
    // First, we need to find the order associated with this payment intent
    // This would typically be done by searching orders with this payment intent ID in metadata
    
    // For now, we'll log the action
    console.log(`Updating order status to '${newStatus}' for payment intent: ${paymentIntentId}`);
    
    // TODO: Implement order lookup by payment intent ID
    // This would require:
    // 1. Storing payment intent ID in order metadata when creating payment
    // 2. Adding a backend endpoint to find order by payment intent ID
    // 3. Calling updateOrderStatus with the found order ID
    
    // Example implementation (when backend supports it):
    // this.orderService.findOrderByPaymentIntent(paymentIntentId).subscribe({
    //   next: (order) => {
    //     this.orderService.updateOrderStatus({
    //       orderId: order.id,
    //       newStatus: newStatus
    //     }).subscribe({
    //       next: () => console.log('Order status updated successfully'),
    //       error: (err) => console.error('Failed to update order status:', err)
    //     });
    //   },
    //   error: (err) => console.error('Failed to find order by payment intent:', err)
    // });
  }
} 