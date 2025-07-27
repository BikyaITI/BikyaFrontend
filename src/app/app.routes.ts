import { Routes } from "@angular/router";
import { AuthGuard } from "./core/guards/auth.guard";
import { AdminGuard } from "./core/guards/admin.guard";

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
    path: "category/:id",
    loadComponent: () => import("./features/category-details/category-details.component").then((m) => m.CategoryDetailsComponent),
  },
  {
    path: "products",
    loadComponent: () => import("./features/products/all-product/all-product.component").then((m) => m.AllProductComponent),
  },
  {
    path: "products/:id",
    loadComponent: () => import("./features/products/product-detail/product-detail.component").then((m) => m.ProductDetailComponent),
  },
  {
    path: "dashboard",
    loadComponent: () => import("./features/dashboard/dashboard.component").then((m) => m.DashboardComponent),
    canActivate: [AuthGuard],
  },
  {
    path: "add-product",
    loadComponent: () =>
      import("./features/products/add-product/add-product.component").then((m) => m.AddProductComponent),
    canActivate: [AuthGuard],
  },
  {
    path: "my-products",
    loadComponent: () =>
      import("./features/products/my-products/my-products.component").then((m) => m.MyProductsComponent),
    canActivate: [AuthGuard],
  },
  {
    path: "orders",
    loadComponent: () => import("./features/orders/order-list/order-list.component").then((m) => m.OrderListComponent),
    canActivate: [AuthGuard],
  },
  {
    path: "checkout",
    loadComponent: () => import("./features/orders/checkout/checkout.component").then((m) => m.CheckoutComponent),
    canActivate: [AuthGuard],
  },
  {
    path: "profile",
    loadComponent: () => import("./features/profile/profile.component").then((m) => m.ProfileComponent),
    canActivate: [AuthGuard],
  },
   {
    path: "payment/:orderId/:amount",
    loadComponent: () => import("./features/payment/payment.component").then((m) => m.PaymentComponent),
    canActivate: [AuthGuard],
  },

  {
    path: "payment/success",
    loadComponent: () => import("./features/payment/success/success.component").then((m) => m.PaymentSuccessComponent),
  },
  {
    path: "payment/cancel",
    loadComponent: () => import("./features/payment/cancel/cancel.component").then((m) => m.PaymentCancelComponent),
  },
  {
    path: "payment/history",
    loadComponent: () => import("./features/payment/payment-history/payment-history.component").then((m) => m.PaymentHistoryComponent),
    canActivate: [AuthGuard],
  },

  {
    path: "wallet",
    loadComponent: () => import("./features/wallet/wallet.component").then((m) => m.WalletComponent),
    canActivate: [AuthGuard],
  },
  {
    path: "wallet/payment",
    loadComponent: () => import("./features/payment/payment.component").then((m) => m.PaymentComponent),
    canActivate: [AuthGuard],
  },
  {
    path: "allcategories",
    loadComponent: () => import("./features/allcategories/allcategories.component").then((m) => m.AllCategoriesComponent),
  },
  {
    path: "shipping/create",
    loadComponent: () => import("./features/shipping/create-shipping/create-shipping.component").then(m => m.CreateShippingComponent),
    canActivate: [AuthGuard],
  },
  {
    path: "shipping/track",
    loadComponent: () => import("./features/shipping/track-shipping/track-shipping.component").then(m => m.TrackShippingComponent),
    canActivate: [AuthGuard],
  },
  {
    path: "admin/shippings",
    loadComponent: () => import("./features/shipping/admin-shipping-list/admin-shipping-list.component").then(m => m.AdminShippingListComponent),
    canActivate: [AdminGuard],
  },
  {
    path: "shipping/calculate",
    loadComponent: () => import("./features/shipping/calculate-shipping-cost/calculate-shipping-cost.component").then(m => m.CalculateShippingCostComponent),
    canActivate: [AuthGuard],
  },
  {
    path: "verify-email",
    loadComponent: () => import("./features/auth/verify-email/verify-email.component").then((m) => m.VerifyEmailComponent),
  },
  {
    path: "forgot-password",
    loadComponent: () => import("./features/auth/forgot-password/forgot-password.component").then(m => m.ForgotPasswordComponent),
  },
  {
    path: "reset-password",
    loadComponent: () => import("./features/auth/reset-password/reset-password.component").then(m => m.ResetPasswordComponent),
  },
  {
    path: "logout",
    loadComponent: () => import("./features/auth/logout/logout.component").then(m => m.LogoutComponent),
  },
  {
    path: "profile/edit",
    loadComponent: () => import("./features/profile/profile-edit/profile-edit.component").then(m => m.ProfileEditComponent),
    canActivate: [AuthGuard],
  },
  {
    path: "profile/change-password",
    loadComponent: () => import("./features/profile/change-password/change-password.component").then(m => m.ChangePasswordComponent),
    canActivate: [AuthGuard],
  },
  // Admin Routes (Admin Only)
  {
    path: "admin",
    loadChildren: () => import("./features/admin/admin.routes").then((m) => m.adminRoutes),
    canActivate: [AdminGuard],
  },
  {
    path: "**",
    redirectTo: "",
  },
]
