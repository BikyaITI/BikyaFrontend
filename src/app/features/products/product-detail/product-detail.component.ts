import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { IProduct } from '../../../core/models/product.model';
import { User } from '../../../core/models/user.model';
import { AuthService } from '../../../core/services/auth.service';
import { OrderService } from '../../../core/services/order.service';
import { ProductService } from '../../../core/services/product.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-product-detail',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
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

  orderForm: FormGroup

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private authService: AuthService,
    private orderService: OrderService,
    private fb: FormBuilder,
  ) {
    this.orderForm = this.fb.group({
      quantity: [1, [Validators.required, Validators.min(1)]],
      shippingAddress: ["", Validators.required],
    })
  }

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
    this.isLoading = true
    this.productService.getProductById(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.product = response.data
          this.selectedImage = this.getMainImage(this.product)
          this.loadRelatedProducts()
        }
        this.isLoading = false
      },
      error: () => {
        this.isLoading = false
      },
    })
  }

  loadRelatedProducts(): void {
    if (this.product) {
      this.productService.getProductsByCategory(this.product.categoryId).subscribe({
        next: (response) => {
          if (response.success) {
            this.relatedProducts = response.data.filter((p) => p.id !== this.product!.id).slice(0, 4)
          }
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
  calculateTotal(): number {
    if (!this.product) return 0
    const quantity = this.orderForm.get("quantity")?.value || 1
    return this.product.price * quantity
  }

  placeOrder(): void {
    if (this.orderForm.valid && this.product) {
      this.isPlacingOrder = true

      const orderRequest = {
        productId: this.product.id,
        quantity: this.orderForm.get("quantity")?.value,
        shippingAddress: this.orderForm.get("shippingAddress")?.value,
      }

      this.orderService.createOrder(orderRequest).subscribe({
        next: (response) => {
          this.isPlacingOrder = false
          if (response.success) {
            // Close modal and show success message
            const modal = document.getElementById("orderModal")
            if (modal) {
              const bsModal = (window as any).bootstrap.Modal.getInstance(modal)
              bsModal?.hide()
            }
            alert("Order placed successfully!")
          }
        },
        error: () => {
          this.isPlacingOrder = false
          alert("Failed to place order. Please try again.")
        },
      })
    }
  }

  deleteProduct(): void {
    if (this.product && confirm("Are you sure you want to delete this product?")) {
      this.productService.deleteProduct(this.product.id).subscribe({
        next: (response) => {
          if (response.success) {
            alert("Product deleted successfully!")
            // Navigate back to products list
          }
        },
        error: () => {
          alert("Failed to delete product.")
        },
      })
    }
  }
  AddToWishlist(): void {
    if (this.product) {
      // Implement wishlist logic here
      alert("Product added to wishlist!")
    }
  }
  EditProduct(): void {
    if (this.product) {
    
      // this.router.navigate(['/edit-product', this.product.id]);
      alert("Navigate to edit product page")
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
}
