import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CategoryService } from '../../core/services/category.service';
import { CommonModule } from '@angular/common';
import { IProduct } from '../../core/models/product.model';

@Component({
  selector: 'app-category-details',
  imports: [CommonModule],
  templateUrl: './category-details.component.html',
  styleUrl: './category-details.component.scss'
})
export class CategoryDetailsComponent implements OnInit {
  categoryName = '';
  products: IProduct[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private categoryService: CategoryService
  ) { }

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.categoryService.getByIdWithProducts(id).subscribe({
      next: (res) => {
        this.categoryName = res.data.category.name;
        this.products = res.data.products;

        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = '❌ Failed to load category details';
        this.isLoading = false;
      }
    });
  }
}
