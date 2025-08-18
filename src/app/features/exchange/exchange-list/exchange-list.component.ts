import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { ExchangeService } from '../../../core/services/exchange.service';
import { ExchangeRequest, ExchangeStatus } from '../../../core/models/exchange.model';
import { ToastrService } from 'ngx-toastr';
import { ProductService } from '../../../core/services/product.service';
import { ApiResponse } from '../../../core/models/api-response.model';
import { IProduct } from '../../../core/models/product.model';
import { first } from 'rxjs/operators';
import { ImageUtils } from '../../../core/utils/image.utils';

@Component({
  selector: 'app-exchange-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './exchange-list.component.html',
  styleUrls: ['./exchange-list.component.scss']
})
export class ExchangeListComponent implements OnInit {
  receivedRequests: ExchangeRequest[] = [];
  sentRequests: ExchangeRequest[] = [];
  activeTab: 'received' | 'sent' = 'received';
  isLoading = false;
  currentUserId: number | null = null;

  constructor(
    private exchangeService: ExchangeService,
    private productService: ProductService,
    private toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Check for success state from navigation
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state?.['exchangeSuccess']) {
      this.toastr.success('Exchange request sent successfully', 'Success');
    }
  }

  ngOnInit(): void {
    try {
      const userJson = localStorage.getItem('currentUser');
      if (userJson) {
        const user = JSON.parse(userJson);
        this.currentUserId = user?.id || null;
      }
      this.loadExchangeRequests();
    } catch (error) {
      console.error('Error initializing exchange list:', error);
      this.toastr.error('An error occurred while loading exchange requests');
      this.router.navigate(['/']);
    }
  }

  async loadExchangeRequests(): Promise<void> {
    this.isLoading = true;

    try {
      // Load received requests
      const receivedResponse = await this.exchangeService.getReceivedRequests()
        .pipe(first())
        .toPromise();

      if (receivedResponse?.success && receivedResponse.data) {
        this.receivedRequests = receivedResponse.data;
        console.log('Loaded received requests:', this.receivedRequests);
      } else {
        throw new Error(receivedResponse?.message || 'Failed to load received exchange requests');
      }

      // After received requests are loaded, load sent requests
      await this.loadSentRequests();

    } catch (error: any) {
      console.error('Error loading exchange requests:', error);
      this.toastr.error(
        error.error?.message || 'An error occurred while loading exchange requests',
        'Load Error'
      );
    } finally {
      this.isLoading = false;
    }
  }

  private async loadSentRequests(): Promise<void> {
    try {
      const sentResponse = await this.exchangeService.getSentRequests()
        .pipe(first())
        .toPromise();

      if (sentResponse?.success && sentResponse.data) {
        this.sentRequests = sentResponse.data;
        console.log('Loaded sent requests:', this.sentRequests);
      } else {
        throw new Error(sentResponse?.message || 'Failed to load sent exchange requests');
      }
    } catch (error: any) {
      console.error('Error loading sent requests:', error);
      this.toastr.error(
        error.error?.message || 'An error occurred while loading sent requests',
        'Load Error'
      );
      throw error; // Re-throw to be caught by the caller
    }
  }

  getStatusBadgeClass(status: ExchangeStatus): string {
    switch (status) {
      case ExchangeStatus.Accepted:
        return 'bg-success';
      case ExchangeStatus.Rejected:
        return 'bg-danger';
      case ExchangeStatus.Pending:
        return 'bg-warning';
      default:
        return 'bg-info';
    }
  }

  getStatusText(status: ExchangeStatus): string {
    switch (status) {
      case ExchangeStatus.Pending:
        return 'Pending';
      case ExchangeStatus.Accepted:
        return 'Accepted';
      case ExchangeStatus.Rejected:
        return 'Rejected';
      default:
        return 'Unknown';
    }
  }

  getMainImageUrl(product: any): string {
    if (!product?.images?.length) {
      return 'assets/images/placeholder-product.svg';
    }
    const mainImage = product.images.find((img: any) => img.isMain);
    const url = mainImage?.imageUrl || product.images[0]?.imageUrl;
    return ImageUtils.getImageUrl(url);
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = 'product.png';
  }

  async approveRequest(request: ExchangeRequest): Promise<void> {
    if (!request || !request.id) {
      this.toastr.warning('Invalid exchange request', 'Error');
      return;
    }

    const confirmResult = confirm('Are you sure you want to approve this exchange request?');
    if (!confirmResult) return;

    try {
      this.isLoading = true;
      this.toastr.info('Processing approval request...', 'Please wait');

      const response = await this.exchangeService.approveRequest(request.id)
        .pipe(first())
        .toPromise();

      if (response?.success) {
        this.toastr.success('Exchange request approved successfully', 'Success');
        // Refresh the requests
        await this.loadExchangeRequests();
      } else {
        throw new Error(response?.message || 'Failed to approve the request');
      }
    } catch (error: any) {
      console.error('Error approving request:', error);
      this.toastr.error(
        error.error?.message || 'An error occurred while approving the request',
        'Error'
      );
    } finally {
      this.isLoading = false;
    }
  }

  async rejectRequest(request: ExchangeRequest): Promise<void> {
    if (!request || !request.id) {
      this.toastr.warning('Invalid exchange request', 'Error');
      return;
    }

    const reason = prompt('Please enter a rejection reason (optional):', '') || '';
    if (reason === null) return; // User cancelled

    try {
      this.isLoading = true;
      this.toastr.info('Processing rejection request...', 'Please wait');

      const response = await this.exchangeService.rejectRequest(request.id, reason)
        .pipe(first())
        .toPromise();

      if (response?.success) {
        this.toastr.success('Exchange request rejected successfully', 'Success');
        // Refresh the requests
        await this.loadExchangeRequests();
      } else {
        throw new Error(response?.message || 'Failed to reject the request');
      }
    } catch (error: any) {
      console.error('Error rejecting request:', error);
      this.toastr.error(
        error.error?.message || 'An error occurred while rejecting the request',
        'Error'
      );
    } finally {
      this.isLoading = false;
    }
  }

  setActiveTab(tab: 'received' | 'sent'): void {
    this.activeTab = tab;
  }
}
