import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { PaymentService } from '../../../core/services/payment.service';
import { AuthService } from '../../../core/services/auth.service';
import { CreateOrderRequest, ShippingInfo } from '../../../core/models/order.model';
import { IUser } from '../../../core/models/user.model';
import { IProduct } from '../../../core/models/product.model';
import { ProductService } from '../../../core/services/product.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {
  readonly SWAP_SHIPPING_FEE = 50;
  isSwapOrder = false;
  orderId: number | null = null;
  getProductImage(): string {
    if (!this.product) return 'product.png';
    
    const mainImage = this.product.images?.find((img) => img.isMain);
    if (mainImage && mainImage.imageUrl) {
      if (mainImage.imageUrl.startsWith('http')) {
        return mainImage.imageUrl;
      }
      const ensured = mainImage.imageUrl.startsWith('/') ? mainImage.imageUrl : `/${mainImage.imageUrl}`;
      return `https://localhost:65162${ensured}`;
    }
    
    return 'product.png';
  }
  product: IProduct | null = null;
  shippingInfo: ShippingInfo = {
    recipientName: '',
    address: '',
    city: '',
    postalCode: '',
    phoneNumber: ''
  };
  orderRequest: CreateOrderRequest = {
    productId: 0,
    buyerId: 0,
    quantity: 1,
    shippingInfo: this.shippingInfo
  };
  currentUser: IUser | null = null;
  totalAmount: number = 0;
  isLoading = false;
  errorMessage: string | null = null;
  private hasSubmitted = false;

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService
  ) { }

  ngOnInit(): void {
    // Check if user is logged in
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      this.errorMessage = 'Please log in to proceed with checkout.';
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/checkout' } });
      return;
    }

    // Set buyerId and recipientName
    this.orderRequest.buyerId = this.currentUser.id;
    this.shippingInfo.recipientName = this.currentUser.fullName || 'Unknown User';

    // Get query params and support either existing orderId (exchange flow) or productId (regular)
    this.route.queryParams.subscribe(params => {
      const orderIdParam = params['orderId'] ? +params['orderId'] : null;
      const productId = params['productId'] ? +params['productId'] : null;

      if (orderIdParam && !isNaN(orderIdParam)) {
        this.orderId = orderIdParam;
        this.loadExistingOrder(orderIdParam);
        return;
      }

      if (!productId || isNaN(productId)) {
        this.errorMessage = 'No valid product selected. Please select a product to proceed.';
        this.router.navigate(['/products']);
        return;
      }

      // Fetch product from ProductService
      this.isLoading = true;
      this.productService.getProductById(productId).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success && response.data) {
            this.product = response.data;
            this.orderRequest.productId = this.product.id;
            // If product is marked as Traded (exchange flow), treat as swap order
            this.isSwapOrder = (this.product.status === 'Traded');
            if (this.isSwapOrder) {
              this.orderRequest.isSwapOrder = true;
              this.orderRequest.quantity = 1; // enforce single item for swap
            }
            this.calculateTotal();
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.status === 404
            ? 'Product not found. Please select a valid product.'
            : 'Failed to load product details. Please try again.';
          this.router.navigate(['/products']);
        }
      });
    });
  }

  private loadExistingOrder(orderId: number) {
    this.isLoading = true;
    this.orderService.getOrderById(orderId).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (!res?.success || !res.data) {
          this.errorMessage = 'Order not found';
          this.router.navigate(['/exchange']);
          return;
        }
        const order: any = res.data;
        this.isSwapOrder = !!(order.isSwapOrder ?? order.IsSwapOrder);
        this.totalAmount = order.totalAmount ?? order.TotalAmount ?? this.SWAP_SHIPPING_FEE;
        const productId = order.productId ?? order.ProductId;
        if (productId) {
          this.orderRequest.productId = productId;
          this.productService.getProductById(productId).subscribe(p => {
            if (p.success) this.product = p.data;
          });
        }
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Failed to load order';
        this.router.navigate(['/exchange']);
      }
    });
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = 'assets/images/placeholder-product.svg';
  }

  calculateTotal(): void {
    if (this.isSwapOrder) {
      this.totalAmount = this.SWAP_SHIPPING_FEE;
      return;
    }
    this.totalAmount = this.product?.price && this.orderRequest.quantity
      ? this.product.price * this.orderRequest.quantity
      : 0;
    console.log('Total calculated:', this.totalAmount); // Debugging
  }

  onSubmit(): void {
    if (this.hasSubmitted || this.isLoading) {
      return; // Prevent double submission
    }
    if (!this.currentUser) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/checkout' } });
      return;
    }

    if (!this.validateForm()) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }

    this.isLoading = true;
    this.hasSubmitted = true;
    this.errorMessage = null;

    // Attach a per-attempt idempotency key tying user+product to timestamp
    const idempotencyKey = `${this.currentUser!.id}-${this.orderRequest.productId}-${Date.now()}`;
    (this.orderRequest as any).idempotencyKey = idempotencyKey;

    console.log('Submitting order:', this.orderRequest); // Debugging

    // If we already have an existing order ID (exchange path), only update shipping
    if (this.orderId) {
      const shippingDto: any = {
        RecipientName: this.shippingInfo.recipientName,
        Address: this.shippingInfo.address,
        City: this.shippingInfo.city,
        PostalCode: this.shippingInfo.postalCode,
        PhoneNumber: this.shippingInfo.phoneNumber,
      };
      this.orderService.updateShippingInfo(this.orderId, shippingDto).subscribe({
        next: () => {
          this.isLoading = false;
          this.hasSubmitted = false;
          this.paymentService.createPayment({
            amount: this.totalAmount,
            orderId: this.orderId!,
            userId: this.currentUser!.id,
            description: 'Order payment'
          }).subscribe({
            next: (res: any) => {
              const stripeUrl = res?.data?.stripeUrl;
              if (stripeUrl) window.location.href = stripeUrl; else this.router.navigate(['/payment', this.orderId, this.totalAmount]);
            },
            error: () => this.router.navigate(['/payment', this.orderId, this.totalAmount])
          });
        },
        error: (error) => {
          this.isLoading = false;
          this.hasSubmitted = false;
          this.errorMessage = 'Failed to update shipping info. Please try again later.';
          console.error('Failed to update shipping info:', error);
        }
      });
      return;
    }

    this.orderService.createOrder(this.orderRequest).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.hasSubmitted = false;
        if (response.success) {
          // Immediately create a Stripe session and redirect the user
          this.paymentService.createPayment({
            amount: this.totalAmount,
            orderId: response.data.id,
            userId: this.currentUser!.id,
            description: 'Order payment'
          }).subscribe({
            next: (res: any) => {
              const stripeUrl = res?.data?.stripeUrl;
              if (stripeUrl) {
                window.location.href = stripeUrl;
              } else {
                // Fallback to payment page if stripe URL missing
                this.router.navigate(['/payment', response.data.id, this.totalAmount]);
              }
            },
            error: () => {
              // Fallback to payment page on error
              this.router.navigate(['/payment', response.data.id, this.totalAmount]);
            }
          });
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.hasSubmitted = false;
        console.error('Failed to create order:', error);
        // Surface backend error details if available (ModelState or message)
        const backendMsg = error?.error?.message
          || error?.error?.Message
          || (error?.error && typeof error.error === 'object' ? JSON.stringify(error.error) : null);
        if (error.status === 401) {
          this.errorMessage = 'Please log in again.';
          this.router.navigate(['/login'], { queryParams: { returnUrl: '/checkout' } });
        } else if (error.status === 404) {
          this.errorMessage = 'Product not found. Please select a valid product.';
        } else if (error.status === 400) {
          this.errorMessage = backendMsg || 'Invalid order data. Please check your input.';
        } else {
          this.errorMessage = 'Failed to create order. Please try again later.';
        }
      }
    });
  }

  private validateForm(): boolean {
    return this.shippingInfo.recipientName.trim() !== '' &&
      this.shippingInfo.address.trim() !== '' &&
      this.shippingInfo.city.trim() !== '' &&
      this.shippingInfo.postalCode.trim() !== '' &&
      this.shippingInfo.phoneNumber.trim() !== '' &&
      this.orderRequest.quantity >= 1 &&
      !!this.product?.id;
  }
}