import { Component, OnInit } from '@angular/core';
import { ICategory } from '../../../core/models/icategory';
import { IProduct } from '../../../core/models/product.model';
import { CategoryService } from '../../../core/services/category.service';
import { ProductService } from '../../../core/services/product.service';
import { CommonModule } from "@angular/common"
import { RouterModule } from "@angular/router"
import { FormsModule } from "@angular/forms"
import { ProductListComponent } from '../../../shared/components/product-list/product-list.component';


@Component({
  selector: 'app-all-product',
  imports: [CommonModule, RouterModule, FormsModule,ProductListComponent],
  templateUrl: './all-product.component.html',
  styleUrl: './all-product.component.scss'
})
export class AllProductComponent implements OnInit {
  products: IProduct[] = []
  filteredProducts: IProduct[] = []
  categories: ICategory[] = []
  isLoading = true

  searchTerm = ""
  selectedCategoryIds: number[] = []
  selectedConditions: string[] = []
  minPrice: number | null = null
  maxPrice: number | null = null
  exchangeOnly = false
  sortBy = "featured"

  currentPage = 1
  itemsPerPage = 5
  totalPages = 1

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
  ) {}

  ngOnInit(): void {
    this.loadProducts()
    this.loadCategories()
  }

  loadProducts(): void {
    this.isLoading = true
    this.productService.getApprovedProducts().subscribe({
      next: (response) => {
        if (response.success) {
          this.products = response.data
          this.applyFilters()
        }
        this.isLoading = false
      },
      error: () => {
        this.isLoading = false
      },
    })
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: (response) => {
        if (response.success) {
          this.categories = response.data
        }
      },
    })
  }

  onCategoryChange(event: any): void {
    const categoryId = Number.parseInt(event.target.value)
    if (event.target.checked) {
      this.selectedCategoryIds.push(categoryId)
    } else {
      this.selectedCategoryIds = this.selectedCategoryIds.filter((id) => id !== categoryId)
    }
    // this.applyFilters()
  }

  onConditionChange(event: any): void {
    const condition = event.target.value
    if (event.target.checked) {
      this.selectedConditions.push(condition)
    } else {
      this.selectedConditions = this.selectedConditions.filter((c) => c !== condition)
    }
    // this.applyFilters()
  }

 onMinPriceChange(event: any): void {
    this.minPrice = Number.parseInt(event.target.value)
    // this.applyFilters()
  }
  onMaxPriceChange(event: any): void {
    this.maxPrice = Number.parseInt(event.target.value)
    // this.applyFilters()
  }

  onPriceRangeChange(event: any): void {
    this.maxPrice = Number.parseInt(event.target.value)
    // this.applyFilters()
  }

  onSearchInput(): void {
    // Debounce search
    setTimeout(() => this.applyFilters(), 300)
  }

  searchProducts(): void {
    this.applyFilters()
  }

  onSortChange(): void {
    this.applyFilters()
  }

  applyFilters(): void {
    let filtered = [...this.products]

    // Search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase()
      filtered = filtered.filter(
        (product) => product.title.toLowerCase().includes(term) || product.description.toLowerCase().includes(term),
      )
    }

    // Category filter
    if (this.selectedCategoryIds.length > 0) {
      filtered = filtered.filter((product) => this.selectedCategoryIds.includes(product.categoryId))
    }

    // Condition filter
    if (this.selectedConditions.length > 0) {
      filtered = filtered.filter((product) => this.selectedConditions.includes(product.condition))
    }

    // Price filter
    if (this.minPrice !== null) {
      filtered = filtered.filter((product) => product.price >= this.minPrice!)
    }
    if (this.maxPrice !== null) {
      filtered = filtered.filter((product) => product.price <= this.maxPrice!)
    }

    // Exchange filter
    if (this.exchangeOnly) {
      filtered = filtered.filter((product) => product.isForExchange)
    }

    // Sort
    filtered = this.sortProducts(filtered)

    this.filteredProducts = filtered
    this.totalPages = Math.ceil(filtered.length / this.itemsPerPage)
    this.currentPage = 1
  }

  sortProducts(products: IProduct[]): IProduct[] {
    switch (this.sortBy) {
      case "price-low":
        return products.sort((a, b) => a.price - b.price)
      case "price-high":
        return products.sort((a, b) => b.price - a.price)
      case "newest":
        return products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      case "rating":
        return products.sort((a, b) => 5 - 4) // Mock rating sort
      default:
        return products
    }
  }

  clearFilters(): void {
    this.searchTerm = ""
    this.selectedCategoryIds = []
    this.selectedConditions = []
    this.minPrice = null
    this.maxPrice = null
    this.exchangeOnly = false
    this.sortBy = "featured"

    // Clear checkboxes
    const checkboxes = document.querySelectorAll('input[type="checkbox"]') as NodeListOf<HTMLInputElement>
    checkboxes.forEach((checkbox) => (checkbox.checked = false))

    this.applyFilters()
  }

  

  getPageNumbers(): number[] {
    const pages = []
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i)
    }
    return pages
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page
    }
  }

//   pagedProducts(): IProduct[] {
//   const start = (this.currentPage - 1) * this.itemsPerPage;
//   return this.filteredProducts.slice(start, start + this.itemsPerPage);
// }
}
