import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { IProduct } from '../../core/models/product.model';
import { ProductListComponent } from '../../shared/components/product-list/product-list.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule,ProductListComponent],
   templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  featuredProducts: IProduct[] = [];
  isLoadingProducts = true;

  features = [
    { icon: 'fas fa-shield-alt', title: 'Quality Assured', description: 'Every product is carefully inspected for quality and safety.' },
    { icon: 'fas fa-shipping-fast', title: 'Fast Delivery', description: 'Quick and secure delivery within 2-3 business days.' },
    { icon: 'fas fa-undo-alt', title: 'Easy Returns', description: 'Return within 7 days for a full refund, no questions asked.' },
    { icon: 'fas fa-leaf', title: 'Eco-Friendly', description: 'Support sustainable shopping and reduce waste with pre-loved items.' },
  ];

  constructor(private productService: ProductService) { }

  ngOnInit(): void {
    this.loadFeaturedProducts();
  }

  loadFeaturedProducts(): void {
    this.productService.getApprovedProducts().subscribe({
      next: (response) => {
        if (response.success) {
          this.featuredProducts = response.data.slice(0, 4);
        }
        this.isLoadingProducts = false;
      },
      error: () => {
        this.isLoadingProducts = false;
      },
    });
  }
}
