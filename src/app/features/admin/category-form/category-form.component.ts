import { Component, inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, ReactiveFormsModule, FormsModule, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLinkActive } from '@angular/router';
import { CategoryService } from '../../../core/services/category.service';
import { ICategory } from '../../../core/models/icategory';


@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './category-form.component.html',
  styleUrl: './category-form.component.scss'
})

export class CategoryFormComponent implements OnInit {
  //  Inject services
  private fb = inject(FormBuilder);
  private categoryService = inject(CategoryService);
  private router = inject(Router);

  //  Variables
  categories: ICategory[] = [];
  categoryForm!: FormGroup;
  apiError = '';
  selectedCategory: ICategory | null = null;
  selectedImageUrl: string | ArrayBuffer | null = null;
  isEditing = false;
  showConfirm = false;
  categoryIdToDelete: number | null = null;
   currentPage = 1;
  pageSize = 9;
  totalPages = 0;

  //  Lifecycle hook
  ngOnInit(): void {
    this.categoryForm = this.fb.group({
      categoryArray: this.fb.array([this.createCategoryGroup()])
    });
    this.loadCategories();
  }

  //  Load all categories from API
  loadCategories() {
    this.categoryService.getAll().subscribe({
      next: (res) => {
        this.categories = res.data;
        console.log(res.data);
      },
      error: () => {
        this.apiError = 'Failed to load categories.';
      }
    });
  }

  //  Create a new category group (form model)
  createCategoryGroup(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      iconUrl: [''],
      parentCategoryId: [null],
      parentName: ['']
    });
  }

  //  Getter for category array
  get categoryArray(): FormArray {
    return this.categoryForm.get('categoryArray') as FormArray;
  }

  //  Add new category form group
  addCategoryGroup() {
    this.categoryArray.push(this.createCategoryGroup());
  }

  //  Remove category form group by index
  removeCategoryGroup(index: number) {
    this.categoryArray.removeAt(index);
  }

  //  Submit all form groups to API
  submitForm() {
    const newCategories = this.categoryArray.value as ICategory[];

    newCategories.forEach((cat: ICategory) => {
      this.categoryService.create(cat).subscribe({
        next: (res) => {
          this.loadCategories();
          console.log(res.message);
        },
        error: () => {
          this.apiError = 'Error while creating category.';
        }
      });
    });

    // Reset form after submission
    this.categoryForm.reset();
    this.categoryArray.clear();
    this.addCategoryGroup();
  }

  //  Reset specific form group
  resetForm(index: number) {
    const categoryArray = this.categoryForm.get('categoryArray') as FormArray;
    const group = categoryArray.at(index) as FormGroup;

    group.reset({
      name: '',
      description: '',
      iconUrl: '',
      parentCategoryId: null,
      parentname :''
    });

    // Clear preview image
    (group as any).previewUrl = null;
  }

  //  Clear the editing form
  clearForm(): void {
    if (this.selectedCategory) {
      this.selectedCategory.name = '';
      this.selectedCategory.description = '';
      this.selectedCategory.parentCategoryId = null;
      this.selectedCategory.iconUrl = '';
    }

    this.selectedImageUrl = null;

    const fileInput = document.getElementById('editImageInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  //  Load category by ID for editing
  editCategory(id: number) {
    this.categoryService.getById(id).subscribe({
      next: (res) => {
        this.selectedCategory = res.data;

        this.categoryForm.patchValue({
          name: this.selectedCategory.name,
          description: this.selectedCategory.description,
          iconUrl: this.selectedCategory.iconUrl,
          parentCategoryId: this.selectedCategory.parentCategoryId,
          parentname : this.selectedCategory.parentName
        });

        this.isEditing = true;
      },
      error: () => {
        this.apiError = 'Failed to load category for editing.';
      }
    });
  }

  //  Submit updated category
  submitEditForm() {
    if (this.selectedCategory) {
      this.categoryService.update(this.selectedCategory.id, this.selectedCategory).subscribe({
        next: (res) => {
          this.loadCategories();
          this.isEditing = false;
        },
        error: (err) => {
          console.error(err);
        }
      });
    }
  }

  //  Cancel edit mode
  cancelEdit() {
    this.isEditing = false;
    this.selectedCategory = null;
    this.categoryForm.reset();
  }

  //  Handle image upload for add/edit modes
  handleImageChange(event: Event, mode: 'add' | 'edit', index?: number): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        const base64 = reader.result as string;

        if (mode === 'add' && index !== undefined) {
          const formGroup = this.categoryArray.at(index);
          formGroup.patchValue({ iconUrl: base64 });
          (formGroup as any).previewUrl = base64; //  preview only
        } else if (mode === 'edit' && this.selectedCategory) {
          this.selectedCategory.iconUrl = base64;
          this.selectedImageUrl = base64;
        }
      };

      reader.readAsDataURL(file);
    }
  }

  //  Delete category by ID
  deleteCategory(id: number) {
    this.categoryService.delete(id).subscribe({
      next: (res) => {
        this.loadCategories();
      },
      error: () => {
        this.apiError = 'Error deleting category.';
      }
    });
  }

  //  Handle image upload in edit form directly
  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        this.selectedImageUrl = reader.result as string;
        this.categoryForm.patchValue({ iconUrl: this.selectedImageUrl });
      };

      reader.readAsDataURL(file);
    }
  }

  //  Get preview image URL
  getPreviewUrl(group: AbstractControl): string | null {
    return (group as any).previewUrl || null;
  }

  //  Open delete confirmation popup
  openConfirm(id: number) {
    this.categoryIdToDelete = id;
    this.showConfirm = true;
  }

  //  Close confirmation popup
  closeConfirm() {
    this.showConfirm = false;
    this.categoryIdToDelete = null;
  }

  //  Confirm deletion action
  confirmDelete() {
    if (this.categoryIdToDelete !== null) {
      this.deleteCategory(this.categoryIdToDelete);
    }
    this.closeConfirm();
  }
}
