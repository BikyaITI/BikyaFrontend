import { Component,  OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule } from "@angular/router"
import  { ProductService } from "../../core/services/product.service"
import  { IProduct } from "../../core/models/product.model"
import { ProductListComponent } from "../../shared/components/product-list/product-list.component"

@Component({
  selector: "app-home",
  standalone: true,
  imports: [CommonModule, RouterModule,ProductListComponent],
   templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  featuredProducts: IProduct[] = []
  isLoadingProducts = true

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadFeaturedProducts()
  }

  loadFeaturedProducts(): void {
    this.productService.getApprovedProducts().subscribe({
      next: (response) => {
        if (response.success) {
          this.featuredProducts = response.data.slice(0, 4)
        }
        this.isLoadingProducts = false
      },
      error: () => {
        this.isLoadingProducts = false
      },
    })
  }

  getMainImage(product: IProduct): string {
    const mainImage = product.images?.find((img) => img.isMain)
    if (mainImage?.imageUrl) {
      // Check if the URL is relative and add the API base URL
      if (mainImage.imageUrl.startsWith('/')) {
        return `https://localhost:65162${mainImage.imageUrl}`
      }
      return mainImage.imageUrl
    }
    return "https://via.placeholder.com/250x250?text=No+Image"
  }

  getStarArray(count: number): number[] {
    return Array(count).fill(0)
  }

  getRandomRating(): number {
    // Use a fixed value to avoid ExpressionChangedAfterItHasBeenCheckedError
    return 23
  }

  getOriginalPrice(currentPrice: number): number {
    return Math.round(currentPrice * 1.4)
  }
}
