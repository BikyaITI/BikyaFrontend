import { Routes } from "@angular/router"
import { AdminLayoutComponent } from "./admin-layout/admin-layout.component"

export const adminRoutes: Routes = [
  {
    path: "",
    component: AdminLayoutComponent,
    children: [
      {
        path: "",
        loadComponent: () => import("./admin-dashboard/admin-dashboard.component").then((m) => m.AdminDashboardComponent)
      },
      {
        path: "products",
        loadComponent: () =>
          import("./product-management/product-management.component").then((m) => m.ProductManagementComponent),
      },
      {
        path: "categories",
        loadComponent: () =>
          import("./category-form/category-form.component").then((m) => m.CategoryFormComponent),
      },
      {
        path: "users",
        loadComponent: () => import("./user-list/user-list.component").then((m) => m.AdminUserListComponent),
      },
      {
        path: "orders",
        loadComponent: () =>
          import("./order-management/order-management.component").then((m) => m.OrderManagementComponent),
      }]
  }
]
