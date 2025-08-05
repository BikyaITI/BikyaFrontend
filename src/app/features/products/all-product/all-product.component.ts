import { Component, OnInit } from '@angular/core';
import { ICategory } from '../../../core/models/icategory';
import { IProduct } from '../../../core/models/product.model';
import { CategoryService } from '../../../core/services/category.service';
import { ProductService } from '../../../core/services/product.service';
import { CommonModule } from "@angular/common"
import { ActivatedRoute, Route, RouterModule } from "@angular/router"
import { FormsModule } from "@angular/forms"
import { ProductListComponent } from '../../../shared/components/product-list/product-list.component';


@Component({
  selector: 'app-all-product',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ProductListComponent],
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
  sortBy = ""

  currentPage = 1
  itemsPerPage = 10
  totalPages = 1

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.searchTerm = params['search'] || '';
      this.searchProducts();
    });
    this.loadProducts()
    this.loadCategories()
  }

  loadProducts(): void {
    this.isLoading = true
    this.productService.getApprovedProducts().subscribe({
      next: (response) => {
        if (response.success) {
          this.products = response.data || []
          this.applyFilters()
        } else {
          this.products = []
          this.filteredProducts = []
        }
        this.isLoading = false
      },
      error: (error) => {
        this.products = []
        this.filteredProducts = []
        this.isLoading = false
      },
    })
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: (response) => {
        if (response.success) {
          this.categories = response.data || []
        } else {
          this.categories = []
        }
      },
      error: (error) => {
        this.categories = []
      },
    })
  }

  onCategoryChange(event: any): void {
    const categoryId = Number.parseInt(event.target.value)
    if (isNaN(categoryId)) {
      return
    }
    if (event.target.checked) {
      this.selectedCategoryIds.push(categoryId)
    } else {
      this.selectedCategoryIds = this.selectedCategoryIds.filter((id) => id !== categoryId)
    }
  }

  onConditionChange(event: any): void {
    const condition = event.target.value
    if (!condition) {
      return
    }
    if (event.target.checked) {
      this.selectedConditions.push(condition)
    } else {
      this.selectedConditions = this.selectedConditions.filter((c) => c !== condition)
    }
  }

  onMinPriceChange(event: any): void {
    const value = event.target.value
    this.minPrice = value ? Number.parseInt(value) : null
    if (value && isNaN(this.minPrice!)) {
      this.minPrice = null
    }
  }

  onMaxPriceChange(event: any): void {
    const value = event.target.value
    this.maxPrice = value ? Number.parseInt(value) : null
    if (value && isNaN(this.maxPrice!)) {
      this.maxPrice = null
    }
  }

  onPriceRangeChange(event: any): void {
    const value = event.target.value
    this.maxPrice = value ? Number.parseInt(value) : null
    if (value && isNaN(this.maxPrice!)) {
      this.maxPrice = null
    }
  }

  onSearchInput(): void {
    // Debounce search
    setTimeout(() => {
      if (this.products.length > 0) {
        this.applyFilters()
      }
    }, 300)
  }

  searchProducts(): void {
    if (this.products.length > 0) {
      this.applyFilters()
    }
  }

  onSortChange(): void {
    if (this.products.length > 0) {
      this.applyFilters()
    }
  }

  applyFilters(): void {
    if (this.products.length === 0) {
      this.filteredProducts = []
      this.totalPages = 1
      this.currentPage = 1
      return
    }
    
    let filtered = [...this.products]

    // Search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase()
      filtered = filtered.filter(
        (product) => 
          (product.title && product.title.toLowerCase().includes(term)) || 
          (product.description && product.description.toLowerCase().includes(term)),
      )
    }

    // Category filter
    if (this.selectedCategoryIds.length > 0) {
      filtered = filtered.filter((product) => product.categoryId && this.selectedCategoryIds.includes(product.categoryId))
    }

    // Condition filter
    if (this.selectedConditions.length > 0) {
      filtered = filtered.filter((product) => product.condition && this.selectedConditions.includes(product.condition))
    }

    // Price filter
    if (this.minPrice !== null) {
      filtered = filtered.filter((product) => product.price && product.price >= this.minPrice!)
    }
    if (this.maxPrice !== null) {
      filtered = filtered.filter((product) => product.price && product.price <= this.maxPrice!)
    }

    // Exchange filter
    if (this.exchangeOnly) {
      filtered = filtered.filter((product) => product.isForExchange === true)
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
        return products.sort((a, b) => (a.price || 0) - (b.price || 0))
      case "price-high":
        return products.sort((a, b) => (b.price || 0) - (a.price || 0))
      case "newest":
        return products.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        })
      case "name-low":
        return products.sort((a, b) => (a.title || '').localeCompare(b.title || ''))
       case "name-high":
        return products.sort((a, b) => (b.title || '').localeCompare(a.title || ''))
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
    this.sortBy = ""

    // Clear checkboxes
    const checkboxes = document.querySelectorAll('input[type="checkbox"]') as NodeListOf<HTMLInputElement>
    checkboxes.forEach((checkbox) => (checkbox.checked = false))

    this.applyFilters()
  }

  onExchangeChange(event: any): void {
    if (event && event.target) {
      this.exchangeOnly = event.target.checked
    }
  }


  getPageNumbers(): number[] {
    if (this.totalPages <= 0) {
      return []
    }
    const pages = []
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i)
    }
    return pages
  }

  goToPage(page: number): void {
    if (this.totalPages <= 0) {
      return
    }
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page
    }
  }

  pagedProducts(): IProduct[] {
    if (this.filteredProducts.length === 0) {
      return []
    }
    
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredProducts.slice(start, end);
  }
  
}
