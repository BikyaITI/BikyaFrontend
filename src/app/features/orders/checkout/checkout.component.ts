import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
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
  getProductImage(): string {
    if (!this.product) return 'product.png';
    
    const mainImage = this.product.images?.find((img) => img.isMain);
    if (mainImage && mainImage.imageUrl) {
      return mainImage.imageUrl.startsWith('http') 
        ? mainImage.imageUrl 
        : `https://localhost:65162${mainImage.imageUrl}`;
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

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router
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

    // Get productId from queryParams
    this.route.queryParams.subscribe(params => {
      const productId = params['productId'] ? +params['productId'] : null;
      console.log('Product ID from queryParams:', productId); // Debugging
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
          console.log('ProductService response:', response); // Debugging
          if (response.success && response.data) {
            this.product = response.data;
            console.log('Product assigned:', this.product); // Debugging
            this.orderRequest.productId = this.product.id;
            this.calculateTotal();
          }
          // else {
          //   this.errorMessage = 'Product not found. Please select a valid product.';
          //   this.router.navigate(['/products']);
          // }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error fetching product:', error);
          this.errorMessage = error.status === 404
            ? 'Product not found. Please select a valid product.'
            : 'Failed to load product details. Please try again.';
          this.router.navigate(['/products']);
        }
      });
    });
  }

  calculateTotal(): void {
    this.totalAmount = this.product?.price && this.orderRequest.quantity
      ? this.product.price * this.orderRequest.quantity
      : 0;
    console.log('Total calculated:', this.totalAmount); // Debugging
  }

  onSubmit(): void {
    if (!this.currentUser) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/checkout' } });
      return;
    }

    if (!this.validateForm()) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    console.log('Submitting order:', this.orderRequest); // Debugging
    this.orderService.createOrder(this.orderRequest).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.router.navigate(['/payment', response.data.id, this.totalAmount]);
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Failed to create order:', error);
        if (error.status === 401) {
          this.errorMessage = 'Please log in again.';
          this.router.navigate(['/login'], { queryParams: { returnUrl: '/checkout' } });
        } else if (error.status === 404) {
          this.errorMessage = 'Product not found. Please select a valid product.';
        } else if (error.status === 400) {
          this.errorMessage = error.error.message || 'Invalid order data. Please check your input.';
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