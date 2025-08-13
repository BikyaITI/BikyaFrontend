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
      this.toastr.success('تم إرسال طلب التبادل بنجاح', 'تم بنجاح');
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
      this.toastr.error('حدث خطأ أثناء تحميل طلبات التبادل');
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
        throw new Error(receivedResponse?.message || 'فشل تحميل طلبات التبادل الواردة');
      }

      // After received requests are loaded, load sent requests
      await this.loadSentRequests();
      
    } catch (error: any) {
      console.error('Error loading exchange requests:', error);
      this.toastr.error(
        error.error?.message || 'حدث خطأ أثناء تحميل طلبات التبادل',
        'خطأ في التحميل'
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
        throw new Error(sentResponse?.message || 'فشل تحميل طلبات التبادل المرسلة');
      }
    } catch (error: any) {
      console.error('Error loading sent requests:', error);
      this.toastr.error(
        error.error?.message || 'حدث خطأ أثناء تحميل الطلبات المرسلة',
        'خطأ في التحميل'
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
        return 'قيد الانتظار';
      case ExchangeStatus.Accepted:
        return 'موافق عليه';
      case ExchangeStatus.Rejected:
        return 'مرفوض';
      default:
        return 'غير معروف';
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

  async approveRequest(request: ExchangeRequest): Promise<void> {
    if (!request || !request.id) {
      this.toastr.warning('طلب تبادل غير صالح', 'خطأ');
      return;
    }

    const confirmResult = confirm('هل أنت متأكد من الموافقة على طلب التبادل؟');
    if (!confirmResult) return;

    try {
      this.isLoading = true;
      this.toastr.info('جاري معالجة طلب الموافقة...', 'يرجى الانتظار');
      
      const response = await this.exchangeService.approveRequest(request.id)
        .pipe(first())
        .toPromise();

      if (response?.success) {
        this.toastr.success('تمت الموافقة على طلب التبادل بنجاح', 'تم بنجاح');
        // Refresh the requests
        await this.loadExchangeRequests();
      } else {
        throw new Error(response?.message || 'فشل الموافقة على الطلب');
      }
    } catch (error: any) {
      console.error('Error approving request:', error);
      this.toastr.error(
        error.error?.message || 'حدث خطأ أثناء الموافقة على الطلب',
        'خطأ'
      );
    } finally {
      this.isLoading = false;
    }
  }

  async rejectRequest(request: ExchangeRequest): Promise<void> {
    if (!request || !request.id) {
      this.toastr.warning('طلب تبادل غير صالح', 'خطأ');
      return;
    }

    const reason = prompt('الرجاء إدخال سبب الرفض (اختياري):', '') || '';
    if (reason === null) return; // User cancelled

    try {
      this.isLoading = true;
      this.toastr.info('جاري معالجة طلب الرفض...', 'يرجى الانتظار');
      
      const response = await this.exchangeService.rejectRequest(request.id, reason)
        .pipe(first())
        .toPromise();

      if (response?.success) {
        this.toastr.success('تم رفض طلب التبادل بنجاح', 'تم بنجاح');
        // Refresh the requests
        await this.loadExchangeRequests();
      } else {
        throw new Error(response?.message || 'فشل رفض الطلب');
      }
    } catch (error: any) {
      console.error('Error rejecting request:', error);
      this.toastr.error(
        error.error?.message || 'حدث خطأ أثناء رفض الطلب',
        'خطأ'
      );
    } finally {
      this.isLoading = false;
    }
  }

  setActiveTab(tab: 'received' | 'sent'): void {
    this.activeTab = tab;
  }
}
