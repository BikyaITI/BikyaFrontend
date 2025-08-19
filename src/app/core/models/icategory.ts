
// models/category.model.ts

export interface SubCategory {
  name: string;
  description?: string;
  iconUrl?: string;
}

export interface ICategory {
  id: number;
  name: string;
  description?: string;
  icon:File
  iconUrl?: string;
  parentCategoryId?: number |null;
  parentName?: string;
  subCategories: SubCategory[];
}
export interface CreateCategoryDTO {
  id:number;
  name: string;
  description?: string;
  iconUrl?: string;
  parentCategoryId?: number;
  parentName?: string;
}
export interface CategoryDTO {
  id: number;
  name: string;
  description?: string;
  iconUrl?: string;
  parentCategoryId?: number;
  parentCategoryName?: string;     // optional display field
  subCategories?: CategoryDTO[];   // for nested display
}

export interface PaginatedCategoryResponse {
  items: CreateCategoryDTO[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}
