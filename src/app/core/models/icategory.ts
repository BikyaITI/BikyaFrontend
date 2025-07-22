
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
  iconUrl?: string;
  parentCategoryId?: number |null;
  parentName?: string;
  subCategories: SubCategory[];
}
export interface CreateCategoryDTO {
  name: string;
  description?: string;
  iconUrl?: string;
  parentCategoryId?: number;
  parentName?: string;
}

export interface PaginatedCategoryResponse {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  data: ICategory[];
}