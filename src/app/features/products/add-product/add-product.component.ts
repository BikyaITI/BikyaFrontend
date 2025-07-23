import { Component,  OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ReactiveFormsModule,  FormBuilder,  FormGroup, Validators } from "@angular/forms"
import  { Router } from "@angular/router"
import  { ProductService } from "../../../core/services/product.service"
import  { CategoryService } from "../../../core/services/category.service"
import { ICategory } from "../../../core/models/icategory"

@Component({
  selector: "app-add-product",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container mt-4">
      <div class="row justify-content-center">
        <div class="col-lg-8">
          <div class="card shadow">
            <div class="card-header bg-primary text-white">
              <h3 class="mb-0"><i class="bi bi-plus-circle"></i> Add New Product</h3>
            </div>
            <div class="card-body">
              <form [formGroup]="productForm" (ngSubmit)="onSubmit()">
                <!-- Basic Information -->
                <div class="section-header mb-4">
                  <h5 class="text-primary"><i class="bi bi-info-circle"></i> Basic Information</h5>
                  <hr>
                </div>

                <div class="row">
                  <div class="col-md-8 mb-3">
                    <label for="title" class="form-label">Product Title *</label>
                    <input
                      type="text"
                      class="form-control"
                      id="title"
                      formControlName="title"
                      placeholder="Enter product title"
                      [class.is-invalid]="productForm.get('title')?.invalid && productForm.get('title')?.touched">
                    <div class="invalid-feedback">
                      Product title is required
                    </div>
                  </div>

                  <div class="col-md-4 mb-3">
                    <label for="price" class="form-label">Price (\$) *</label>
                    <div class="input-group">
                      <span class="input-group-text">\$</span>
                      <input
                        type="number"
                        class="form-control"
                        id="price"
                        formControlName="price"
                        placeholder="0.00"
                        step="0.01"
                        [class.is-invalid]="productForm.get('price')?.invalid && productForm.get('price')?.touched">
                      <div class="invalid-feedback">
                        Valid price is required
                      </div>
                    </div>
                  </div>
                </div>

                <div class="mb-3">
                  <label for="description" class="form-label">Description *</label>
                  <textarea
                    class="form-control"
                    id="description"
                    formControlName="description"
                    rows="4"
                    placeholder="Describe your product in detail..."
                    [class.is-invalid]="productForm.get('description')?.invalid && productForm.get('description')?.touched"></textarea>
                  <div class="invalid-feedback">
                    Product description is required
                  </div>
                  <div class="form-text">
                    <span [class]="getDescriptionCountClass()">
                      {{productForm.get('description')?.value?.length || 0}}/500 characters
                    </span>
                  </div>
                </div>

                <!-- Category and Condition -->
                <div class="section-header mb-4 mt-4">
                  <h5 class="text-primary"><i class="bi bi-tags"></i> Category & Condition</h5>
                  <hr>
                </div>

                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="categoryId" class="form-label">Category *</label>
                    <select
                      class="form-select"
                      id="categoryId"
                      formControlName="categoryId"
                      [class.is-invalid]="productForm.get('categoryId')?.invalid && productForm.get('categoryId')?.touched">
                      <option value="">Select a category</option>
                      <option *ngFor="let category of categories" [value]="category.id">
                        {{category.name}}
                      </option>
                    </select>
                    <div class="invalid-feedback">
                      Please select a category
                    </div>
                  </div>

                  <div class="col-md-6 mb-3">
                    <label for="condition" class="form-label">Condition *</label>
                    <select
                      class="form-select"
                      id="condition"
                      formControlName="condition"
                      [class.is-invalid]="productForm.get('condition')?.invalid && productForm.get('condition')?.touched">
                      <option value="">Select condition</option>
                      <option value="New">New</option>
                      <option value="Like New">Like New</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                      <option value="Poor">Poor</option>
                    </select>
                    <div class="invalid-feedback">
                      Please select condition
                    </div>
                  </div>
                </div>

                <!-- Exchange Option -->
                <div class="section-header mb-4 mt-4">
                  <h5 class="text-primary"><i class="bi bi-arrow-left-right"></i> Exchange Options</h5>
                  <hr>
                </div>

                <div class="mb-3">
                  <div class="form-check form-switch">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      id="isForExchange"
                      formControlName="isForExchange">
                    <label class="form-check-label" for="isForExchange">
                      <strong>Allow Exchange</strong>
                      <div class="form-text">Enable this if you're willing to exchange this item for other products</div>
                    </label>
                  </div>
                </div>

                <!-- Images -->
                <div class="section-header mb-4 mt-4">
                  <h5 class="text-primary"><i class="bi bi-images"></i> Product Images</h5>
                  <hr>
                </div>

                <div class="mb-3">
                  <label for="mainImage" class="form-label">Main Image *</label>
                  <input
                    type="file"
                    class="form-control"
                    id="mainImage"
                    (change)="onMainImageSelected($event)"
                    accept="image/*"
                    [class.is-invalid]="!mainImage && submitted">
                  <div class="invalid-feedback">
                    Main image is required
                  </div>
                  <div class="form-text">Upload the main image for your product (JPG, PNG, max 5MB)</div>

                  <!-- Main Image Preview -->
                  <div class="mt-2" *ngIf="mainImagePreview">
                    <img [src]="mainImagePreview" class="img-thumbnail" style="max-width: 200px; max-height: 200px;">
                  </div>
                </div>

                <div class="mb-3">
                  <label for="additionalImages" class="form-label">Additional Images (Optional)</label>
                  <input
                    type="file"
                    class="form-control"
                    id="additionalImages"
                    (change)="onAdditionalImagesSelected($event)"
                    accept="image/*"
                    multiple>
                  <div class="form-text">Upload up to 4 additional images (JPG, PNG, max 5MB each)</div>

                  <!-- Additional Images Preview -->
                  <div class="row mt-2" *ngIf="additionalImagePreviews.length > 0">
                    <div class="col-3" *ngFor="let preview of additionalImagePreviews; let i = index">
                      <div class="position-relative">
                        <img [src]="preview" class="img-thumbnail w-100" style="height: 100px; object-fit: cover;">
                        <button
                          type="button"
                          class="btn btn-danger btn-sm position-absolute top-0 end-0"
                          (click)="removeAdditionalImage(i)"
                          style="transform: translate(25%, -25%);">
                          <i class="bi bi-x"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Error Messages -->
                <div class="alert alert-danger" *ngIf="errorMessage">
                  <i class="bi bi-exclamation-triangle"></i> {{errorMessage}}
                </div>

                <!-- Success Message -->
                <div class="alert alert-success" *ngIf="successMessage">
                  <i class="bi bi-check-circle"></i> {{successMessage}}
                </div>

                <!-- Form Actions -->
                <div class="d-flex justify-content-between mt-4">
                  <button type="button" class="btn btn-outline-secondary" (click)="goBack()">
                    <i class="bi bi-arrow-left"></i> Cancel
                  </button>
                  <button
                    type="submit"
                    class="btn btn-primary btn-lg"
                    [disabled]="productForm.invalid || isSubmitting">
                    <span *ngIf="isSubmitting" class="spinner-border spinner-border-sm me-2"></span>
                    <i class="bi bi-plus-circle" *ngIf="!isSubmitting"></i>
                    {{isSubmitting ? 'Adding Product...' : 'Add Product'}}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
    .section-header h5 {
      margin-bottom: 0.5rem;
    }

    .form-check-label .form-text {
      margin-top: 0.25rem;
      font-size: 0.875rem;
    }

    .img-thumbnail {
      border: 2px solid #dee2e6;
      transition: border-color 0.3s ease;
    }

    .img-thumbnail:hover {
      border-color: #007bff;
    }

    .position-relative .btn {
      border-radius: 50%;
      width: 30px;
      height: 30px;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `,
  ],
})
export class AddProductComponent implements OnInit {
  productForm: FormGroup
  categories: ICategory[] = []
  mainImage: File | null = null
  additionalImages: File[] = []
  mainImagePreview: string | null = null
  additionalImagePreviews: string[] = []
  isSubmitting = false
  submitted = false
  errorMessage = ""
  successMessage = ""

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private categoryService: CategoryService,
    private router: Router,
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
    this.loadCategories()
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: (response) => {
        if (response.success) {
          this.categories = response.data
        }
      },
    })
  }

  onMainImageSelected(event: any): void {
    const file = event.target.files[0]
    if (file) {
      if (this.validateImage(file)) {
        this.mainImage = file
        this.createImagePreview(file, (preview) => {
          this.mainImagePreview = preview
        })
      }
    }
  }

  onAdditionalImagesSelected(event: any): void {
    const files = Array.from(event.target.files) as File[]

    if (files.length + this.additionalImages.length > 4) {
      this.errorMessage = "You can upload maximum 4 additional images"
      return
    }

    files.forEach((file) => {
      if (this.validateImage(file)) {
        this.additionalImages.push(file)
        this.createImagePreview(file, (preview) => {
          this.additionalImagePreviews.push(preview)
        })
      }
    })
  }

  removeAdditionalImage(index: number): void {
    this.additionalImages.splice(index, 1)
    this.additionalImagePreviews.splice(index, 1)
  }

  validateImage(file: File): boolean {
    const maxSize = 5 * 1024 * 1024 // 5MB
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"]

    if (!allowedTypes.includes(file.type)) {
      this.errorMessage = "Only JPG and PNG images are allowed"
      return false
    }

    if (file.size > maxSize) {
      this.errorMessage = "Image size should not exceed 5MB"
      return false
    }

    return true
  }

  createImagePreview(file: File, callback: (preview: string) => void): void {
    const reader = new FileReader()
    reader.onload = (e) => {
      callback(e.target?.result as string)
    }
    reader.readAsDataURL(file)
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

    if (this.productForm.valid && this.mainImage) {
      this.isSubmitting = true

      const formData = new FormData()
      formData.append("title", this.productForm.get("title")?.value)
      formData.append("description", this.productForm.get("description")?.value)
      formData.append("price", this.productForm.get("price")?.value)
      formData.append("categoryId", this.productForm.get("categoryId")?.value)
      formData.append("condition", this.productForm.get("condition")?.value)
      formData.append("isForExchange", this.productForm.get("isForExchange")?.value)
      formData.append("mainImage", this.mainImage)

      this.additionalImages.forEach((image, index) => {
        formData.append("additionalImages", image)
      })

      this.productService.createProductWithImages(formData).subscribe({
        next: (response) => {
          this.isSubmitting = false
          if (response.success) {
            this.successMessage = "Product added successfully! It will be reviewed by admin before being published."
            setTimeout(() => {
              this.router.navigate(["/my-products"])
            }, 2000)
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
      if (!this.mainImage) {
        this.errorMessage = "Please select a main image for your product"
      }
    }
  }

  goBack(): void {
    this.router.navigate(["/dashboard"])
  }
}
