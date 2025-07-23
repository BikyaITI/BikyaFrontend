import  { Routes } from "@angular/router"

export const adminRoutes: Routes = [
  {
    path: "",
    loadComponent: () => import("./admin-dashboard/admin-dashboard.component").then((m) => m.AdminDashboardComponent),
  },
  {
    path: "products",
    loadComponent: () =>
      import("./product-management/product-management.component").then((m) => m.ProductManagementComponent),
  },
  {
    path: "users",
    loadComponent: () => import("./user-management/user-management.component").then((m) => m.UserManagementComponent),
  },
  {
    path: "orders",
    loadComponent: () =>
      import("./order-management/order-management.component").then((m) => m.OrderManagementComponent),
  },
    {
    path: "categories",
    loadComponent: () => import("./category-form/category-form.component").then((m) => m.CategoryFormComponent),
    
  },
]
