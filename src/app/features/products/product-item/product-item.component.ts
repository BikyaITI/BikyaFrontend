import { Component, input } from '@angular/core';
import { IProduct, IProductImage } from '../../../core/models/product.model';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-item',
  imports: [RouterLink ,CommonModule, FormsModule],
  templateUrl: './product-item.component.html',
  styleUrl: './product-item.component.scss'
})
export class ProductItemComponent {
product = input<IProduct>();

  getMainImage(product: IProductImage): string {
    return product.imageUrl || 'assets/placeholder.png';
  }


  getOriginalPrice(price: number): number {
    return price * 1.15;
  }

  getDiscountPercentage(price: number): number {
    const original = this.getOriginalPrice(price);
    return Math.floor(((original - price) / original) * 100);
  }

  addToWishlist(product:IProduct) {
    console.log('Added to wishlist:', product);
  }
    getConditionBadgeClass(condition: string): string {
    switch (condition.toLowerCase()) {
      case "excellent":
        return "bg-success"
      case "good":
        return "bg-primary"
      case "fair":
        return "bg-warning"
      default:
        return "bg-secondary"
    }
  }

}
