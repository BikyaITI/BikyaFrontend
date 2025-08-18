import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { ExchangeService } from '../../../core/services/exchange.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { CreateExchangeRequest } from '../../../core/models/exchange.model';
import { IProduct } from '../../../core/models/product.model';
import { ApiResponse } from '../../../core/models/api-response.model';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-exchange-request',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './exchange-request.component.html',
  styleUrls: ['./exchange-request.component.scss']
})
export class ExchangeRequestComponent implements OnInit {
  requestedProductId!: number;
  myProducts: IProduct[] = [];
  selectedProductId: number | null = null;
  message: string = '';
  isLoading = false;
  isSubmitting = false;
  requestedProduct: IProduct | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private exchangeService: ExchangeService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const productId = params.get('id');
      if (productId && !isNaN(Number(productId))) {
        this.requestedProductId = Number(productId);
        this.loadRequestedProduct();
        this.loadMyProducts();
      } else {
        this.toastr.error('Invalid product ID');
        this.router.navigate(['/']);
      }
    });
  }

  async loadRequestedProduct(): Promise<void> {
    try {
      const response = await this.productService.getProductById(this.requestedProductId)
        .pipe(first())
        .toPromise();

      if (response?.success && response.data) {
        this.requestedProduct = response.data;
        console.log('Loaded requested product:', this.requestedProduct);
      } else {
        throw new Error(response?.message || 'Product not found');
      }
    } catch (error: any) {
      console.error('Error loading product:', error);
      this.toastr.error(
        error.error?.message || 'Failed to load product details',
        'Product Load Error'
      );
      this.router.navigate(['/']);
    }
  }

  private getCurrentUserId(): number | null {
    let currentUserId: number | null = null;
    // Synchronously get the current user value by subscribing and unsubscribing immediately
    const subscription = this.authService.currentUser$.subscribe(user => {
      if (user?.id) {
        currentUserId = user.id;
      } else {
        console.error('No current user found in auth service');
      }
    });
    subscription.unsubscribe();

    return currentUserId;
  }

  async loadMyProducts(): Promise<void> {
    this.isLoading = true;
    const userId = this.getCurrentUserId();

    if (!userId) {
      this.toastr.error('You must log in first', 'Authentication Error');
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    try {
      const response = await this.productService.getProductsByUser(userId)
        .pipe(first())
        .toPromise();

      if (response?.success && response.data) {
        this.myProducts = response.data.filter(p =>
          p.status === 'Available' && p.id !== this.requestedProductId
        );
        console.log(`Loaded ${this.myProducts.length} products for exchange`);
      } else {
        throw new Error(response?.message || 'Failed to load products');
      }
    } catch (error: any) {
      console.error('Error loading products:', error);
      this.toastr.error(
        error.error?.message || 'Failed to load your products',
        'Product Load Error'
      );
    } finally {
      this.isLoading = false;
    }
  }

  getMainImageUrl(product: IProduct | null): string {
    if (!product?.images || product.images.length === 0) {
      return 'assets/images/placeholder-product.svg';
    }

    // Find main image or fallback to first image
    const mainImage = product.images.find(img => img.isMain);
    let imageUrl = mainImage?.imageUrl || (product.images[0]?.imageUrl || '');

    // If imageUrl is relative, ensure it has a leading slash
    if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('assets/')) {
      if (!imageUrl.startsWith('/')) {
        imageUrl = '/' + imageUrl;
      }
      // Prepend the API base URL if it's a relative path
      if (!imageUrl.startsWith('http')) {
        imageUrl = 'https://localhost:65162' + imageUrl;
      }
    }

    // Return local placeholder if no valid URL or if it's a broken placeholder URL
    if (!imageUrl || imageUrl.includes('via.placeholder.com')) {
      return 'assets/images/placeholder-product.svg';
    }

    return imageUrl;
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/placeholder-product.svg';
  }

  async submitRequest(): Promise<void> {
    // Validate form
    if (!this.selectedProductId) {
      this.toastr.warning('Please select a product to exchange');
      return;
    }

    if (!this.requestedProduct) {
      this.toastr.error('Error loading requested product data');
      return;
    }

    // Prepare request data
    const request: CreateExchangeRequest = {
      requestedProductId: this.requestedProductId,
      offeredProductId: this.selectedProductId,
      message: this.message || ''
    };

    console.log('Submitting exchange request:', request);
    this.isSubmitting = true;

    try {
      this.toastr.info('Sending exchange request...', 'Please wait');

      const response = await this.exchangeService.createExchange(request)
        .pipe(first())
        .toPromise();

      if (response?.success) {
        this.toastr.success('Exchange request sent successfully', 'Success');

        await this.router.navigate(['/exchange'], {
          state: { exchangeSuccess: true }
        });
      } else {
        throw new Error(response?.message || 'Failed to send exchange request');
      }
    } catch (error: any) {
      console.error('Error creating exchange request:', error);

      const errorMessage = error?.error?.message ||
        error?.message ||
        'Unexpected error occurred. Please try again';

      this.toastr.error(errorMessage, 'Error');
    } finally {
      this.isSubmitting = false;
    }
  }
}
