import { Component,  OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule } from "@angular/router"
import  { ProductService } from "../../../core/services/product.service"
import  { AuthService } from "../../../core/services/auth.service"

import { IProduct } from "../../../core/models/product.model"
import { environment } from "../../../../environments/environment"
import { ProductListComponent } from "../../../shared/components/product-list/product-list.component"
import { IUser } from "../../../core/models/user.model"

@Component({
  selector: 'app-my-products',
  imports: [CommonModule, RouterModule, ProductListComponent],
  templateUrl: './my-products.component.html',
  styleUrl: './my-products.component.scss'
})
export class MyProductsComponent implements OnInit {
  errorMessage = ""
  successMessage = ""
  allProducts: IProduct[] = []
  approvedProducts: IProduct[] = []
  pendingProducts: IProduct[] = []
  inProcessProducts: IProduct[] = []
  soldProducts: IProduct[] = []
  activeTab = "all"
  isLoading = true
  isDeleting = false
  currentUser: IUser | null = null
  productToDelete: IProduct | null = null

  constructor(
    private productService: ProductService,
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user
      if (user) {
        this.loadProducts()
      }
    })

    this.loadProducts()
    console.log("MyProductsComponent initialized")
    console.log(this.allProducts)
  }

  loadProducts(): void {
    if (!this.currentUser) return

    this.isLoading = true

    this.productService.getProductsByUser(this.currentUser.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.allProducts = response.data
          this.approvedProducts = this.allProducts.filter((p) => p.isApproved && p.status !== "InProcess")
          this.pendingProducts = this.allProducts.filter((p) => !p.isApproved)
          this.inProcessProducts = this.allProducts.filter((p) => p.status === "InProcess")
          this.soldProducts = this.allProducts.filter((p) => p.status === "Sold" || p.status === "Traded")
        }
        this.isLoading = false
      },
      error: () => {
        this.isLoading = false
      },
    })
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab
  }

  getFilteredProducts(): IProduct[] {
    switch (this.activeTab) {
      case "approved":
        return this.approvedProducts
      case "pending":
        return this.pendingProducts
      case "inprocess":
        return this.inProcessProducts
      case "sold":
        return this.soldProducts
      default:
        return this.allProducts
    }
  }







  deleteProduct(product: IProduct): void {
    this.productToDelete = product
    const modal = new (window as any).bootstrap.Modal(document.getElementById("deleteModal"))
    modal.show()
  }

  confirmDelete(): void {
    if (!this.productToDelete) return

    this.isDeleting = true
    this.errorMessage = "";
    this.successMessage = "";
    this.productService.deleteProduct(this.productToDelete.id).subscribe({
      next: (response) => {
        this.isDeleting = false
        if (response.success) {
          // Remove from arrays
          this.allProducts = this.allProducts.filter((p) => p.id !== this.productToDelete!.id)
          this.approvedProducts = this.approvedProducts.filter((p) => p.id !== this.productToDelete!.id)
          this.pendingProducts = this.pendingProducts.filter((p) => p.id !== this.productToDelete!.id)

          this.successMessage = "Product deleted successfully.";
          // Close modal
          const modal = (window as any).bootstrap.Modal.getInstance(document.getElementById("deleteModal"))
          modal.hide()

          this.productToDelete = null
        }
           else {
          this.errorMessage = `Failed to delete product: ${response.message}`;
        
        }
      },
      error: (err) => {
        this.isDeleting = false
        this.errorMessage = err.error?.message || "Server error while deleting the product.";
      },
    })
  }
  openDeleteModal(product: IProduct): void {
    this.productToDelete = product;

    // Open Bootstrap modal programmatically
    const modalEl = document.getElementById('deleteModal');
    if (modalEl) {
      const modal = new (window as any).bootstrap.Modal(document.getElementById("deleteModal"))
      modal.show()
    }
  }
}
