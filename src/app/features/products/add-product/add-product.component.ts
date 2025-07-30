import { Component,  OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ReactiveFormsModule,  FormBuilder,  FormGroup, Validators } from "@angular/forms"
import  { Router } from "@angular/router"
import  { ProductService } from "../../../core/services/product.service"
import  { CategoryService } from "../../../core/services/category.service"
import  { IProduct } from "../../../core/models/product.model"
import { ICategory } from "../../../core/models/icategory"
import { map } from 'rxjs/operators';
import { environment } from "../../../../environments/environment"
@Component({
  selector: 'app-add-product',
  standalone:true,
   imports: [CommonModule, ReactiveFormsModule],
templateUrl: './add-product.component.html',
  styleUrl: './add-product.component.scss'
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
  product:IProduct | null = null
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
