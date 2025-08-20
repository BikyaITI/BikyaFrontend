import { Component, inject, OnInit } from '@angular/core';
import { CategoryService } from '../../core/services/category.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink, RouterModule } from '@angular/router';
import { CreateCategoryDTO} from '../../core/models/icategory';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-allCategories',
  imports: [CommonModule,RouterLink, RouterModule],
  templateUrl: './allcategories.component.html',
  styleUrl: './allcategories.component.scss'
})

export class AllCategoriesComponent implements OnInit {
  categories: CreateCategoryDTO[] = [];
  currentPage = 1;
  pageSize = 9;
  totalPages = 0;
  isLoading = true;
  errorMessage = '';
  _router = inject(ActivatedRoute)

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.fetchCategories();
  }

  fetchCategories(): void {
    this.isLoading = true;
    this.categoryService.getPaginated(this.currentPage, this.pageSize).subscribe({
  next: (res) => {
    this.categories = res.data.items;      // ← items مباشرة
    this.totalPages = res.data.totalPages;
    this.currentPage = res.data.currentPage;
    this.isLoading = false;
  },
  error: () => {
    this.errorMessage = '❌ Failed to load categories';
    this.isLoading = false;
  }
});

  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.fetchCategories();
  }
    getImageUrl(url:string): string {
      if (!url) {
          return 'product.png';
      }
    
      if (url.startsWith('data:') || url.startsWith('http')) {
        return url; // base64 or external URL → return as-is
        }
    
        console.log('Image URL:', url);
      console.log('Image URL:', `${environment.apiUrl}${url}`);
         return url
            ? `${environment.apiUrl}${url}`
            : 'product.png';
      }
    
      onImageError(event: Event) {
        (event.target as HTMLImageElement).src = 'product.png';
      }
}



  