import { Component, EventEmitter, input, Output, OnInit } from '@angular/core';
import { IProduct } from '../../../core/models/product.model';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import{environment} from '../../../../environments/environment';
import { ProductService } from '../../../core/services/product.service';

@Component({
  selector: 'app-product-list',
  imports: [CommonModule,RouterLink],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss'
})
export class ProductListComponent implements OnInit {

  product = input<IProduct | undefined>();
  role = input<string>();
  @Output() deleteClicked = new EventEmitter<void>();


  constructor(private productService: ProductService,) {
  }

  ngOnInit() {
  }

getMainImage(product: IProduct): string {
    if (!product || !product.images) {
      return 'product.png';
    }
    
    const mainImage = product.images?.find((img) => img.isMain)
    return mainImage && mainImage.imageUrl
      ? `${environment.apiUrl}${mainImage.imageUrl}`
      : 'product.png';
  }

    onImageError(event: Event) {
      (event.target as HTMLImageElement).src = 'product.png';
    }
  
  getConditionBadgeClass(condition: string): string {
    if (!condition) return "bg-secondary";
    
    switch (condition.toLowerCase()) {
      case "new":
        return "bg-primary"
      case "used":
        return "bg-warning"
      default:
        return "bg-secondary"
    }
    
  }

  buy(product: IProduct): void {
    // Implement add to cart logic
  }

  addToWishlist(product: IProduct): void {
    // Implement add to wishlist logic
  }

  editProduct(product: IProduct): void {
    // Navigate to edit product page
    // For now, just show an alert
    alert("Edit functionality will be implemented")
  }
}
