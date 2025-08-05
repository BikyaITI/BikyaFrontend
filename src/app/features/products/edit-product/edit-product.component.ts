import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from "@angular/forms"
import { Router, ActivatedRoute } from "@angular/router"
import { ProductService } from "../../../core/services/product.service"
import { CategoryService } from "../../../core/services/category.service"
import {  IProduct } from "../../../core/models/product.model"
import { ICategory } from "../../../core/models/icategory"
import { map, filter } from 'rxjs/operators';
import { environment } from "../../../../environments/environment"

@Component({
  selector: 'app-edit-product',
  imports: [CommonModule, ReactiveFormsModule],
  standalone: true,
  templateUrl: './edit-product.component.html',
  styleUrl: './edit-product.component.scss'
})
export class EditProductComponent implements OnInit {
  productForm: FormGroup
  productId: number = 0;
  categories: ICategory[] = []
  isSubmitting = false
  submitted = false
  errorMessage = ""
  successMessage = ""
  product: IProduct | null = null
  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private categoryService: CategoryService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.productForm = this.fb.group({
      title: ["", [Validators.required, Validators.maxLength(100)]],
      description: ["", [Validators.required, Validators.maxLength(500)]],
      price: ["", [Validators.required, Validators.min(0.01)]],
      categoryId: ["", Validators.required],
      condition: ["", Validators.required],
      isForExchange: [false],
    })
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.productId = idParam ? +idParam : 0;
    this.loadCategories()
    this.loadProduct()
  }
  loadProduct(): void {

    this.productService.getProductById(this.productId).subscribe({
      next: (response) => {
        if (response.success) {
          const product = response.data
          this.productForm.patchValue({
            title: product.title,
            description: product.description,
            price: product.price,
            categoryId: product.categoryId,
            condition: product.condition,
            isForExchange: product.isForExchange,
          })
  
        } else {
          console.error("Failed to load product:", response.message)
        }
      }
    })
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: (response) => {
        if (response.success) {
          console.log("Loaded categories:", response.data); // 👈 See the categories
          this.categories = response.data;
        } else {
          console.warn("Failed to load categories:", response.message);
        }
      },
      error: (err) => {
        console.error("Error loading categories:", err); // 👈 Handle error if request fails
      }
    });
  }

  getDescriptionCountClass(): string {
    const length = this.productForm.get("description")?.value?.length || 0
    if (length > 450) return "text-danger"
    if (length > 400) return "text-warning"
    return "text-muted"
  }

  onSubmit(): void {
    this.submitted = true
    this.errorMessage = ""
    this.successMessage = ""

    if (this.productForm.valid) {
      this.isSubmitting = true

      const formData = new FormData()
      formData.append("title", this.productForm.get("title")?.value)
      formData.append("description", this.productForm.get("description")?.value)
      formData.append("price", this.productForm.get("price")?.value)
      formData.append("categoryId", this.productForm.get("categoryId")?.value)
      formData.append("condition", this.productForm.get("condition")?.value)
      formData.append("isForExchange", this.productForm.get("isForExchange")?.value)
      

      this.productService.updateProduct(this.productId, formData).subscribe({
        next: (response) => {
          this.isSubmitting = false
          if (response.success) {
            this.successMessage = "Product updated successfully! It will be reviewed by admin before being republished."
            setTimeout(() => {
              this.router.navigate(["/my-products"])
            }, 1000)
          } else {
            this.errorMessage = response.message
          }
        },
        error: (error) => {
          this.isSubmitting = false
          this.errorMessage = "Failed to add product. Please try again."
        },
      })
    } else {
      this.errorMessage = "Invalid input"
    }
  }
  

  goBack(): void {
    this.router.navigate(["/dashboard"])
  }

}
