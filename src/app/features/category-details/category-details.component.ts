import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CategoryService } from '../../core/services/category.service';
import { CommonModule } from '@angular/common';
import { IProduct } from '../../core/models/product.model';
import { ProductService } from '../../core/services/product.service';
import { ProductListComponent } from "../../shared/components/product-list/product-list.component";

@Component({
  selector: 'app-category-details',
  imports: [CommonModule, ProductListComponent],
templateUrl: './category-details.component.html',
  styleUrl: './category-details.component.scss'
})
export class CategoryDetailsComponent implements OnInit {
  products: IProduct[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private categoryService: CategoryService,
    private productService: ProductService
  ) { }

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.productService.getProductsByCategory(id).subscribe({
      next: (res) => {
        this.products = res.data;

        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = '❌ Failed to load category details';
        this.isLoading = false;
      }
    });
  }
}
