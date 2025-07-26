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

  product = input<IProduct>();
  role = input<string>();
  constructor() {
  console.log("ProductListComponent initialized with products:", this.product());
  
}
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


 


  buy(product: IProduct): void {
    // Implement add to cart logic
    console.log("Added to buy:", product)
  }

  addToWishlist(product: IProduct): void {
    // Implement add to wishlist logic
    console.log("Added to wishlist:", product)
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
    alert("Delete functionality will be implemented")
  }

}
