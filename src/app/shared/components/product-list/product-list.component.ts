import { Component, input } from '@angular/core';
import { IProduct } from '../../../core/models/product.model';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import{environment} from '../../../../environments/environment';

@Component({
  selector: 'app-product-list',
  imports: [CommonModule,RouterLink],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss'
})
export class ProductListComponent {

  products = input<IProduct[]>();
  constructor() {
  console.log("ProductListComponent initialized with products:", this.products());

}
//  get productsArray(): IProduct[] {
//     const value = this.products();
//     return Array.isArray(value) ? value : [];
//   }
getMainImage(product: IProduct): string {
    const mainImage = product.images?.find((img) => img.isMain)
   return mainImage && mainImage.imageUrl
    ? `${environment.apiUrl}${mainImage.imageUrl}`
    : 'product.png';
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





  addToCart(product: IProduct): void {
    // Implement add to cart logic
    console.log("Added to cart:", product)
  }

  addToWishlist(product: IProduct): void {
    // Implement add to wishlist logic
    console.log("Added to wishlist:", product)
  }
}
