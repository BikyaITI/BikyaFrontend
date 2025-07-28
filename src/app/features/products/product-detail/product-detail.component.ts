import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, RouterLink, Router } from '@angular/router';
import { IProduct, IProductImage } from '../../../core/models/product.model';
import { IUser } from '../../../core/models/user.model';
import { AuthService } from '../../../core/services/auth.service';
import { OrderService } from '../../../core/services/order.service';
import { ProductService } from '../../../core/services/product.service';
import { environment } from '../../../../environments/environment';
import { ProductListComponent } from '../../../shared/components/product-list/product-list.component';

@Component({
  selector: 'app-product-detail',
  imports: [CommonModule, RouterModule, ReactiveFormsModule, ProductListComponent, RouterLink, FormsModule],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss'
})
export class ProductDetailComponent implements OnInit {
  product: IProduct | null = null
  relatedProducts: IProduct[] = []
  selectedImage:IProductImage|null = null
  currentUser: IUser | null = null
  isLoading = true
  isPlacingOrder = false
  doAction = false
  errorMessage = ""
  successMessage = ""
  confirmTitle = '';
  confirmMessage = '';
  confirmButtonText = '';
  confirmType: 'approve' | 'delete' = 'delete';
  confirmbuttonLoading = ""
  imageErrorMessage: string = '';
  selectedFile: File | null = null;
  newImageIsMain = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private authService: AuthService,
    private orderService: OrderService,
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
        console.error('Error loading from all products:', error)
        this.errorMessage = 'Failed to load product'
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
  selectImage(image: IProductImage): void {
    this.selectedImage = image
  }

  getMainImage(product: IProduct): IProductImage|null {
    return product.images?.find(img => img.isMain) ?? null;
      }
   
    
    GetImageUrl(image: IProductImage): string {
      if (!image.imageUrl) return 'product.png';
      return image.imageUrl.startsWith('http')
        ? image.imageUrl
        : `${environment.apiUrl}${image.imageUrl}`;
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
    this.successMessage = ""
    this.errorMessage = ""
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

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = 'product.png';
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

  validateImage(file: File): boolean {
    const maxSize = 5 * 1024 * 1024;
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];

    if (!allowedTypes.includes(file.type)) {
      this.imageErrorMessage = "Only JPG and PNG images are allowed";
      return false;
    }

    if (file.size > maxSize) {
      this.imageErrorMessage = "Image size should not exceed 5MB";
      return false;
    }

    return true;
  }


  deleteImage(image: IProductImage | null): void {
    if (!image || !this.product) return;
    this.successMessage = ""
    this.errorMessage=""
    this.productService.deleteImage(image.id).subscribe({
      next: (res) => {
        if (res.success) {
          this.successMessage = 'Image deleted successfully.';
          this.loadProduct(this.product!.id); // reload product data
        } else {
          console.log(res.message)
          this.errorMessage =  'Failed to delete image.';
        }
      },
      error: (err) => {
        console.log (err.error?.message)
        this.errorMessage =  'Server error while deleting image.';
      }
    });
  }

  setAsMain(image: IProductImage | null): void {
    if (!image || !this.product) return;

    this.successMessage = ""
    this.errorMessage = ""

    this.productService.setImageAsMain(image.id).subscribe({
      next: (res) => {
        if (res.success) {
          this.successMessage = "Main image updated successfully.";
          this.loadProduct(this.product!.id); // reload product to reflect main image change
        } else {
          console.log(res.message)
          this.errorMessage =  "Failed to set main image.";
        }
      },
      error: (err) => {
        console.log(err.error?.message)
        this.errorMessage =   "Server error while setting main image.";
      }
    });
  }
 


  // add Images

  addImage() {
    this.successMessage = ""
    this.errorMessage = ""
    const imageCount = this.product!.images?.length ?? 0;
    if (imageCount >= 5) {
      this.errorMessage = "You can only upload up to 5 images.";
      return;
    }
    const modal = new (window as any).bootstrap.Modal(document.getElementById("addImageModal"));
    this.errorMessage = '';
    this.selectedFile = null;
    this.newImageIsMain = false;
    modal.show();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      if (!this.validateImage(file)) {
        input.value = ''; // clear file
        return;
      }

      this.imageErrorMessage = ''; // clear any previous error
      this.selectedFile = file;
    }
  }
  submitNewImage() {
    if (!this.product || !this.selectedFile) return;
    this.successMessage = ""
    this.errorMessage = ""
    const formData = new FormData();
    formData.append("image", this.selectedFile);
    formData.append("productId", this.product.id.toString());
    formData.append("isMain", String(this.newImageIsMain));

    this.productService.createImage(this.product.id, formData).subscribe({
      next: (res) => {
        if (res.success) {
          this.successMessage = 'Image uploaded successfully';
          const modal = (window as any).bootstrap.Modal.getInstance(document.getElementById("addImageModal"))
          modal.hide()
          this.loadProduct(this.product!.id); // Refresh product with images
        } else {
          console.log(res.message)
          this.imageErrorMessage =  'Upload failed';
        }
      },
      error: (err) => {
        console.log(err.error?.message)
        this.imageErrorMessage =  'Server error while uploading image';
      }
    });
  }

}
