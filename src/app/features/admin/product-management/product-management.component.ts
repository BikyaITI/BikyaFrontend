import { Component,  OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule } from "@angular/router"
import  { ProductService } from "../../../core/services/product.service"
import  { AuthService } from "../../../core/services/auth.service"
import { ProductListComponent } from './../../../shared/components/product-list/product-list.component';
import  { User } from "../../../core/models/user.model"
import { IProduct } from "../../../core/models/product.model"

@Component({
  selector: 'app-product-management',
  imports: [CommonModule, RouterModule,ProductListComponent],

templateUrl: './product-management.component.html',
  styleUrl: './product-management.component.scss'
})


export class ProductManagementComponent implements OnInit  {

 allProducts: IProduct[] = []
  approvedProducts: IProduct[] = []
  pendingProducts: IProduct[] = []
  inProcessProducts: IProduct[] = []
  doneProducts: IProduct[] = []
  activeTab = "all"
  isLoading = true
  isDeleting = false
  currentUser: User | null = null
  productToDelete: IProduct | null = null

  constructor(
    private productService: ProductService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {

    this.loadProducts()
    console.log("MyProductsComponent initialized")
    console.log(this.allProducts)
  }

  loadProducts(): void {
    this.isLoading = true

    this.productService.getAllProducts().subscribe({
      next: (response) => {
        if (response.success) {
          this.allProducts = response.data
          this.approvedProducts = this.allProducts.filter((p) => p.isApproved)
          this.pendingProducts = this.allProducts.filter((p) => !p.isApproved)
          this.inProcessProducts = this.allProducts.filter((p) => p.status === "InProcess")
          this.doneProducts = this.allProducts.filter((p) => p.status === "Sold" || p.status === "Traded")
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
      default:
        return this.allProducts
    }
  }







  editProduct(product: IProduct): void {
    // Navigate to edit product page
    // For now, just show an alert
    alert("Edit functionality will be implemented")
  }

  deleteProduct(product: IProduct): void {
    // this.productToDelete = product
    // const modal = new (window as any).bootstrap.Modal(document.getElementById("deleteModal"))
    // modal.show()
  }

  confirmDelete(): void {
    if (!this.productToDelete) return

    this.isDeleting = true

    this.productService.deleteProduct(this.productToDelete.id).subscribe({
      next: (response) => {
        this.isDeleting = false
        if (response.success) {
          // Remove from arrays
          this.allProducts = this.allProducts.filter((p) => p.id !== this.productToDelete!.id)
          this.approvedProducts = this.approvedProducts.filter((p) => p.id !== this.productToDelete!.id)
          this.pendingProducts = this.pendingProducts.filter((p) => p.id !== this.productToDelete!.id)

          // Close modal
          const modal = (window as any).bootstrap.Modal.getInstance(document.getElementById("deleteModal"))
          modal.hide()

          this.productToDelete = null
        }
      },
      error: () => {
        this.isDeleting = false
        alert("Failed to delete product. Please try again.")
      },
    })
  }
}

