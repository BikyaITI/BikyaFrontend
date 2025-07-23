import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { AdminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: "",
    loadComponent: () => import("./features/home/home.component").then((m) => m.HomeComponent),
  },
  {
    path: "login",
    loadComponent: () => import("./features/auth/login/login.component").then((m) => m.LoginComponent),
  },
  {
    path: "register",
    loadComponent: () => import("./features/auth/register/register.component").then((m) => m.RegisterComponent),
  },
  {
    path: "products",
    loadComponent: () =>
      import("./features/products/all-product/all-product.component").then((m) => m.AllProductComponent),
  },
  {
    path: "products/:id",
    loadComponent: () =>
      import("./features/products/product-detail/product-detail.component").then((m) => m.ProductDetailComponent),
  },
  {
    path: "dashboard",
    loadComponent: () => import("./features/dashboard/dashboard.component").then((m) => m.DashboardComponent),
    // canActivate: [AuthGuard],
  },
  {
    path: "add-product",
    loadComponent: () =>
      import("./features/products/add-product/add-product.component").then((m) => m.AddProductComponent),
    // canActivate: [AuthGuard],
  },
  {
    path: "my-products",
    loadComponent: () =>
      import("./features/products/my-products/my-products.component").then((m) => m.MyProductsComponent),
    // canActivate: [AuthGuard],
  },
  {
    path: "orders",
    loadComponent: () => import("./features/orders/order-list/order-list.component").then((m) => m.OrderListComponent),
    // canActivate: [AuthGuard],
  },
  {
    path: "profile",
    loadComponent: () => import("./features/profile/profile.component").then((m) => m.ProfileComponent),
    // canActivate: [AuthGuard],
  },
  {
    path: "wallet",
    loadComponent: () => import("./features/wallet/wallet.component").then((m) => m.WalletComponent),
    // canActivate: [AuthGuard],
  },
  {
    path: "admin",
    loadChildren: () => import("./features/admin/admin.routes").then((m) => m.adminRoutes),
    // canActivate: [AdminGuard],
  },
  {
    path: "categories",
    loadComponent: () => import("./features/category-form/category-form.component").then((m) => m.CategoryFormComponent),
    // canActivate: [AuthGuard],
  },
  {
    path: "allcategories",
    loadComponent: () => import("./features/allcategories/allcategories.component").then((m) => m.AllCategoriesComponent),
    // canActivate: [AuthGuard],
  },
  {
    path: "**",
    redirectTo: "",
  },
]
