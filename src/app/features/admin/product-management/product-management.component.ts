import { Component, OnInit, inject } from '@angular/core';
import { ProductService } from '../../../core/services/product.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { IProduct } from '../../../core/models/product.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-product-management',
  templateUrl: './product-management.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule,RouterLink],
})
export class ProductManagementComponent implements OnInit {
  products: IProduct[] = [];
  isLoading = false;
  errorMessage = '';
  searchTerm = '';
  isDeleting: { [key: number]: boolean } = {};
  isApproving: { [key: number]: boolean } = {};
  // isRejecting: { [key: number]: boolean } = {};

  productService = inject(ProductService);
  toastr = inject(ToastrService);

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.isLoading = true;
    this.productService.getAllProducts().subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.products = res.data || [];
        if (this.products.length > 0) {
          this.toastr.success(`Loaded ${this.products.length} products successfully`);
        } else {
          this.toastr.info('No products found');
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        let errorMsg = 'Failed to load products.';
        
        if (err?.error?.message) {
          errorMsg = err.error.message;
        } else if (err?.message) {
          errorMsg = err.message;
        } else if (err?.status === 401) {
          errorMsg = 'Unauthorized. Please login again.';
        } else if (err?.status === 403) {
          errorMsg = 'Access denied. You do not have permission to view products.';
        } else if (err?.status === 404) {
          errorMsg = 'Products endpoint not found.';
        } else if (err?.status >= 500) {
          errorMsg = 'Server error. Please try again later.';
        }
        
        this.errorMessage = errorMsg;
        this.toastr.error(errorMsg);
        console.error('Error loading products:', err);
      }
    });
  }

  searchProducts() {
    if (!this.searchTerm.trim()) {
      this.loadProducts();
      return;
    }
    this.isLoading = true;
    this.productService.getAllProducts().subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.products = (res.data || []).filter((p: any) =>
          p.title?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          p.description?.toLowerCase().includes(this.searchTerm.toLowerCase())
        );
      },
      error: (err: any) => {
        this.isLoading = false;
        this.toastr.error('Failed to search products');
      }
    });
  }

  async confirmDelete(product: IProduct) {
    const result = await Swal.fire({
      title: 'تأكيد الحذف',
      text: `هل أنت متأكد من حذف المنتج "${product.title}"؟`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'نعم، احذف!',
      cancelButtonText: 'إلغاء',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      this.deleteProduct(product.id);
    }
  }

  deleteProduct(id: number) {
    this.isDeleting[id] = true;
    this.productService.deleteProduct(id).subscribe({
      next: (res: any) => {
        this.isDeleting[id] = false;
        if (res.success) {
          this.toastr.success(res.message || 'Product deleted successfully');
          this.loadProducts();
        } else {
          this.toastr.error(res.message || 'Failed to delete product');
        }
      },
      error: (err: any) => {
        this.isDeleting[id] = false;
        let errorMsg = 'Failed to delete product.';
        
        if (err?.error?.message) {
          errorMsg = err.error.message;
        } else if (err?.message) {
          errorMsg = err.message;
        } else if (err?.status === 401) {
          errorMsg = 'Unauthorized. Please login again.';
        } else if (err?.status === 403) {
          errorMsg = 'Access denied. You do not have permission to delete products.';
        } else if (err?.status === 404) {
          errorMsg = 'Product not found.';
        } else if (err?.status >= 500) {
          errorMsg = 'Server error. Please try again later.';
        }
        
        this.toastr.error(errorMsg);
        console.error('Error deleting product:', err);
      }
    });
  }

  async confirmApprove(product: IProduct) {
    const result = await Swal.fire({
      title: 'تأكيد الموافقة',
      text: `هل أنت متأكد من الموافقة على المنتج "${product.title}"؟`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'نعم، وافق',
      cancelButtonText: 'إلغاء',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      this.approveProduct(product.id);
    }
  }

  approveProduct(id: number) {
    this.isApproving[id] = true;
    this.productService.approveProduct(id).subscribe({
      next: (res: any) => {
        this.isApproving[id] = false;
        if (res.success) {
          this.toastr.success(res.message || 'Product approved successfully');
          this.loadProducts();
        } else {
          this.toastr.error(res.message || 'Failed to approve product');
        }
      },
      error: (err: any) => {
        this.isApproving[id] = false;
        let errorMsg = 'Failed to approve product.';
        
        if (err?.error?.message) {
          errorMsg = err.error.message;
        } else if (err?.message) {
          errorMsg = err.message;
        } else if (err?.status === 401) {
          errorMsg = 'Unauthorized. Please login again.';
        } else if (err?.status === 403) {
          errorMsg = 'Access denied. You do not have permission to approve products.';
        } else if (err?.status === 404) {
          errorMsg = 'Product not found.';
        } else if (err?.status >= 500) {
          errorMsg = 'Server error. Please try again later.';
        }
        
        this.toastr.error(errorMsg);
        console.error('Error approving product:', err);
      }
    });
  }

  // async confirmReject(product: IProduct) {
  //   const result = await Swal.fire({
  //     title: 'تأكيد الرفض',
  //     text: `هل أنت متأكد من رفض المنتج "${product.title}"؟`,
  //     icon: 'warning',
  //     showCancelButton: true,
  //     confirmButtonColor: '#dc3545',
  //     cancelButtonColor: '#6c757d',
  //     confirmButtonText: 'نعم، ارفض',
  //     cancelButtonText: 'إلغاء',
  //     reverseButtons: true
  //   });

  //   if (result.isConfirmed) {
  //     this.rejectProduct(product.id);
  //   }
  // }

  // rejectProduct(id: number) {
  //   this.isRejecting[id] = true;
  //   this.productService.rejectProduct(id).subscribe({
  //     next: (res: any) => {
  //       this.isRejecting[id] = false;
  //       if (res.success) {
  //         this.toastr.success(res.message || 'Product rejected successfully');
  //         this.loadProducts();
  //       } else {
  //         this.toastr.error(res.message || 'Failed to reject product');
  //       }
  //     },
  //     error: (err: any) => {
  //       this.isRejecting[id] = false;
  //       let errorMsg = 'Failed to reject product.';
        
  //       if (err?.error?.message) {
  //         errorMsg = err.error.message;
  //       } else if (err?.message) {
  //         errorMsg = err.message;
  //       } else if (err?.status === 401) {
  //         errorMsg = 'Unauthorized. Please login again.';
  //       } else if (err?.status === 403) {
  //         errorMsg = 'Access denied. You do not have permission to reject products.';
  //       } else if (err?.status === 404) {
  //         errorMsg = 'Product not found.';
  //       } else if (err?.status >= 500) {
  //         errorMsg = 'Server error. Please try again later.';
  //       }
        
  //       this.toastr.error(errorMsg);
  //       console.error('Error rejecting product:', err);
  //     }
  //   });
  // }

  getStatusBadgeClass(product: IProduct): string {
    if (product.isApproved === true) return 'bg-success';
    if (product.isApproved === false) return 'bg-danger';
    return 'bg-warning';
  }

  getStatusText(product: IProduct): string {
    if (product.isApproved === true) return 'Approved';
    if (product.isApproved === false) return 'Rejected';
    return 'Pending';
  }

  clearFilters() {
    this.searchTerm = '';
    this.loadProducts();
    this.toastr.info('Filters cleared');
  }
} 