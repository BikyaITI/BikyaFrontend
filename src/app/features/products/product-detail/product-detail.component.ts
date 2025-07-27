import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { RouterModule, ActivatedRoute, RouterLink, Router } from '@angular/router';
import { IProduct } from '../../../core/models/product.model';
import { IUser } from '../../../core/models/user.model';
import { AuthService } from '../../../core/services/auth.service';
import { OrderService } from '../../../core/services/order.service';
import { ProductService } from '../../../core/services/product.service';
import { environment } from '../../../../environments/environment';
import { ProductListComponent } from '../../../shared/components/product-list/product-list.component';

@Component({
  selector: 'app-product-detail',
  imports: [CommonModule, RouterModule, ReactiveFormsModule ,ProductListComponent,RouterLink],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss'
})
export class ProductDetailComponent implements OnInit {
  product: IProduct | null = null
  relatedProducts: IProduct[] = []
  selectedImage = ""
  currentUser: IUser | null = null
  isLoading = true
  isPlacingOrder = false
  doAction = false
  errorMessage = ""
  successMessage=""
  confirmTitle = '';
  confirmMessage = '';
  confirmButtonText = '';
  confirmType: 'approve' | 'delete' = 'delete';
  confirmbuttonLoading=""

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private authService: AuthService,
    private orderService: OrderService,
    private router: Router,
    private fb: FormBuilder,
  ) { }

    ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user
    })

    this.route.params.subscribe((params) => {
      const id = +params["id"]
        if (!id || isNaN(id)) {
    alert("Invalid product ID.")
    return
  }
      this.loadProduct(id)
    })
  }

    loadProduct(id: number): void {
    console.log('Loading product with ID:', id)
    this.isLoading = true
    
    // Try to get product by ID first
    this.productService.getProductById(id).subscribe({
      next: (response) => {
        console.log('Product response:', response)
        if (response.success) {
          this.product = response.data
          console.log('Product loaded:', this.product)
          this.selectedImage = this.getMainImage(this.product)
          this.loadRelatedProducts()
        } else {
          console.error('Failed to load product:', response.message)
          // Try to get from all products as fallback
          this.loadProductFromAllProducts(id)
        }
        this.isLoading = false
      },
      error: (error) => {
        console.error('Error loading product:', error)
        this.errorMessage = `Failed to load product: ${error.status} ${error.statusText}`
        // Try to get from all products as fallback
        this.loadProductFromAllProducts(id)
      },
    })
  }

  private loadProductFromAllProducts(id: number): void {
    console.log('Trying to load product from all products as fallback')
    this.productService.getAllProducts().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const product = response.data.find(p => p.id === id)
          if (product) {
            this.product = product
            console.log('Product found in all products:', this.product)
            this.selectedImage = this.getMainImage(this.product)
            this.loadRelatedProducts()
          } else {
            console.error('Product not found in all products')
            this.errorMessage = 'Product not found'
          }
        }
        this.isLoading = false
      },
      error: (error) => {
        console.error('Error loading all products:', error)
        this.errorMessage = `Failed to load products: ${error.status} ${error.statusText}`
        this.isLoading = false
      }
    })
  }

  loadRelatedProducts(): void {
    if (this.product) {
      console.log("Loading related products for category:", this.product.categoryId)
      this.productService.getProductsByCategory(this.product.categoryId).subscribe({
        next: (response) => {
          if (response.success) {
            this.relatedProducts = response.data.filter((p) => p.id !== this.product!.id).slice(0, 5)
          }
        },
        error: (err) => {
          console.error("Failed to load related products:", err)
        },
      })
    }
  }

  selectImage(imageUrl: string): void {
    this.selectedImage = this.GetImage(imageUrl)
  }

  getMainImage(product: IProduct): string {
    const mainImage = product.images?.find((img) => img.isMain)
    return mainImage && mainImage.imageUrl
      ? `${environment.apiUrl}${mainImage.imageUrl}`
      : 'product.png';
  }
  GetImage(imageUrl: string): string {
    return imageUrl ? `${environment.apiUrl}${imageUrl}` : 'product.png';
  }


  
  
  deleteProduct(): void {
    this.confirmTitle = 'Confirm Delete';
    this.confirmMessage = 'Are you sure you want to delete ';
    this.confirmButtonText = 'Delete Product';
    this.confirmType = 'delete';
    this.confirmbuttonLoading="Deleting..."
    const modal = new (window as any).bootstrap.Modal(document.getElementById("Modal"))
    modal.show()
  }

  approveProduct(): void {
    this.confirmTitle = 'Confirm Approve';
    this.confirmMessage = 'Are you sure you want to approve ';
    this.confirmButtonText = 'Approve Product';
    this.confirmType = 'approve';
    this.confirmbuttonLoading = "Approving..."
    const modal = new (window as any).bootstrap.Modal(document.getElementById("Modal"))
    modal.show()
  }

  confirmAction(): void {
    if (!this.product) return

    this.doAction = true
    if (this.confirmType === "delete") {
      this.productService.deleteProduct(this.product.id).subscribe({
        next: (response) => {
          this.doAction = false
          if (response.success) {
            this.router.navigate(['/dashboard']);
          }
        },
        error: (err) => {
          this.doAction = false
          this.errorMessage = `Error : ${err.message}`
          const modal = (window as any).bootstrap.Modal.getInstance(document.getElementById("Modal"))
          modal.hide()
          //show error
        }
      })
    }
    if (this.confirmType === "approve") {
      this.productService.approveProduct(this.product.id).subscribe({
        next: (response) => {
          this.doAction = false
          if (response.success) {
            this.successMessage = "Product Approved successfully"
            const modal = (window as any).bootstrap.Modal.getInstance(document.getElementById("Modal"))
            modal.hide()
          }
        },
        error: (err) => {
          this.doAction = false
          this.errorMessage = `Error : ${err.message}`
          const modal = (window as any).bootstrap.Modal.getInstance(document.getElementById("deleteModal"))
          modal.hide()
          //show error
        }
      })
    }
    
  }
  AddToWishlist(): void {
    if (this.product) {
      // Implement wishlist logic here
      alert("Product added to wishlist!")
    }
  }

  getConditionBadgeClass(condition: string): string {
    switch (condition.toLowerCase()) {
      case "new":
        return "bg-primary"
      case "used":
        return "bg-warning"
      default:
        return "bg-secondary"
    }
  }
  showRelatedProducts(): boolean|null {
    return this.relatedProducts.length > 0 && this.currentUser && !this.currentUser.roles?.includes("Admin");
  }

  getRole(): string{
    if (this.currentUser?.roles?.includes('Admin'))
      return "admin";
    else if (this.currentUser?.id === this.product?.userId)
      return "owner"
    else
      return "user"
  }
}
