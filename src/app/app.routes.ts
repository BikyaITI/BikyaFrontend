import { Routes } from "@angular/router";
import { AuthGuard } from "./core/guards/auth.guard";
import { AdminGuard } from "./core/guards/admin.guard";
import { DeliveryGuard } from "./core/guards/delivery.guard";
import { DeliveryRestrictionGuard } from "./core/guards/delivery-restriction.guard";

export const routes: Routes = [
  {
    path: "",
    loadComponent: () => import("./features/home/home.component").then((m) => m.HomeComponent),
    canActivate: [DeliveryRestrictionGuard],
  },
  {
    path: "login",
    loadComponent: () => import("./features/auth/login/login.component").then((m) => m.LoginComponent),
  },
  {
    path: "register",
    loadComponent: () => import("./features/auth/register/register.component").then((m) => m.RegisterComponent),
    canActivate: [DeliveryRestrictionGuard],
  },
  {
    path: "category/:id",
    loadComponent: () => import("./features/category-details/category-details.component").then((m) => m.CategoryDetailsComponent),
    canActivate: [DeliveryRestrictionGuard],
  },
  {
    path: "products",
    loadComponent: () => import("./features/products/all-product/all-product.component").then((m) => m.AllProductComponent),
    canActivate: [DeliveryRestrictionGuard],
  },
  {
    path: "products/:id",
    loadComponent: () => import("./features/products/product-detail/product-detail.component").then((m) => m.ProductDetailComponent),
    canActivate: [DeliveryRestrictionGuard],
  },
  {
    path: "dashboard",
    loadComponent: () => import("./features/dashboard/dashboard.component").then((m) => m.DashboardComponent),
    canActivate: [AuthGuard, DeliveryRestrictionGuard],
  },
  {
    path: "add-product",
    loadComponent: () =>
      import("./features/products/add-product/add-product.component").then((m) => m.AddProductComponent),
    canActivate: [AuthGuard, DeliveryRestrictionGuard],
  },
  {
    path: "edit-product/:id",
    loadComponent: () =>
      import("./features/products/edit-product/edit-product.component").then((m) => m.EditProductComponent),
    canActivate: [DeliveryRestrictionGuard],
  },
  {
    path: "my-products",
    loadComponent: () =>
      import("./features/products/my-products/my-products.component").then((m) => m.MyProductsComponent),
    canActivate: [AuthGuard, DeliveryRestrictionGuard],
  },
  {
    path: "wishlist",
    loadComponent: () =>
      import("./features/products/wishlist-product/wishlist-product.component").then((m) => m.WishlistProductComponent),
    canActivate: [AuthGuard],
  },
  {
    path: "orders",
    loadComponent: () => import("./features/orders/order-list/order-list.component").then((m) => m.OrderListComponent),
    canActivate: [AuthGuard, DeliveryRestrictionGuard],
  },
  {
    path: "checkout",
    loadComponent: () => import("./features/orders/checkout/checkout.component").then((m) => m.CheckoutComponent),
    canActivate: [AuthGuard, DeliveryRestrictionGuard],
  },
  {
    path: "profile",
    loadComponent: () => import("./features/profile/profile.component").then((m) => m.ProfileComponent),
    canActivate: [AuthGuard, DeliveryRestrictionGuard],
  },
  {
    path: "payment/:orderId/:amount",
    loadComponent: () => import("./features/payment/payment.component").then((m) => m.PaymentComponent),
    canActivate: [AuthGuard, DeliveryRestrictionGuard],
  },

  {
    path: "payment/success",
    loadComponent: () => import("./features/payment/success/success.component").then((m) => m.PaymentSuccessComponent),
    canActivate: [DeliveryRestrictionGuard],
  },
  {
    path: "payment/cancel",
    loadComponent: () => import("./features/payment/cancel/cancel.component").then((m) => m.PaymentCancelComponent),
    canActivate: [DeliveryRestrictionGuard],
  },
  {
    path: "payment/history",
    loadComponent: () => import("./features/payment/payment-history/payment-history.component").then((m) => m.PaymentHistoryComponent),
    canActivate: [AuthGuard, DeliveryRestrictionGuard],
  },



  {
    path: "wallet",
    loadComponent: () => import("./features/wallet/wallet.component").then((m) => m.WalletComponent),
    canActivate: [AuthGuard, DeliveryRestrictionGuard],
  },
  {
    path: "wallet/payment",
    loadComponent: () => import("./features/payment/payment.component").then((m) => m.PaymentComponent),
    canActivate: [AuthGuard, DeliveryRestrictionGuard],
  },
  {
    path: "allcategories",
    loadComponent: () => import("./features/allcategories/allcategories.component").then((m) => m.AllCategoriesComponent),
    canActivate: [DeliveryRestrictionGuard],
  },
  {
    path: "shipping/create",
    loadComponent: () => import("./features/shipping/create-shipping/create-shipping.component").then(m => m.CreateShippingComponent),
    canActivate: [AuthGuard, DeliveryRestrictionGuard],
  },
  {
    path: "shipping/track",
    loadComponent: () => import("./features/shipping/track-shipping/track-shipping.component").then(m => m.TrackShippingComponent),
    canActivate: [AuthGuard, DeliveryRestrictionGuard],
  },
  {
    path: "admin/shippings",
    loadComponent: () => import("./features/shipping/admin-shipping-list/admin-shipping-list.component").then(m => m.AdminShippingListComponent),
    canActivate: [AdminGuard, DeliveryRestrictionGuard],
  },
  {
    path: "shipping/calculate",
    loadComponent: () => import("./features/shipping/calculate-shipping-cost/calculate-shipping-cost.component").then(m => m.CalculateShippingCostComponent),
    canActivate: [AuthGuard, DeliveryRestrictionGuard],
  },
  {
    path: "verify-email",
    loadComponent: () => import("./features/auth/verify-email/verify-email.component").then((m) => m.VerifyEmailComponent),
    canActivate: [DeliveryRestrictionGuard],
  },

  {
    path: "review/:sellerId/:orderId",
    loadComponent: () => import("./features/review/review.component").then((m) => m.ReviewComponent),
    canActivate: [DeliveryRestrictionGuard],
  },

  {
    path: "forgot-password",
    loadComponent: () => import("./features/auth/forgot-password/forgot-password.component").then(m => m.ForgotPasswordComponent),
    canActivate: [DeliveryRestrictionGuard],
  },
  {
    path: "reset-password",
    loadComponent: () => import("./features/auth/reset-password/reset-password.component").then(m => m.ResetPasswordComponent),
    canActivate: [DeliveryRestrictionGuard],
  },
  {
    path: "logout",
    loadComponent: () => import("./features/auth/logout/logout.component").then(m => m.LogoutComponent),
    canActivate: [DeliveryRestrictionGuard],
  },
  {
    path: "profile/edit",
    loadComponent: () => import("./features/profile/profile-edit/profile-edit.component").then(m => m.ProfileEditComponent),
    canActivate: [AuthGuard, DeliveryRestrictionGuard],
  },
  {
    path: "profile/change-password",
    loadComponent: () => import("./features/profile/change-password/change-password.component").then(m => m.ChangePasswordComponent),
    canActivate: [AuthGuard, DeliveryRestrictionGuard],
  },
  {
    path: "users/:userId",
    loadComponent: () => import("./features/public-profile/public-profile.component").then((m) => m.PublicProfileComponent),
  },
  // Admin Routes (Admin Only)
  {
    path: "admin",
    loadChildren: () => import("./features/admin/admin.routes").then((m) => m.adminRoutes),
    canActivate: [AdminGuard, DeliveryRestrictionGuard],
  },
  // Delivery Routes (Delivery Only)
  {
    path: "delivery/dashboard",
    loadComponent: () => import("./features/delivery/delivery-dashboard/delivery-dashboard.component").then((m) => m.DeliveryDashboardComponent),
    canActivate: [DeliveryGuard],
  },
  {
    path: "delivery/orders/:id",
    loadComponent: () => import("./features/delivery/order-details/order-details.component").then((m) => m.OrderDetailsComponent),
    canActivate: [DeliveryGuard],
  },
  // Exchange Routes
  {
    path: "exchange",
    children: [
      {
        path: "",
        loadComponent: () => import("./features/exchange/exchange-list/exchange-list.component").then((m) => m.ExchangeListComponent),
        canActivate: [AuthGuard, DeliveryRestrictionGuard],
      },
      {
        path: "request/:id",
        loadComponent: () => import("./features/exchange/exchange-request/exchange-request.component").then((m) => m.ExchangeRequestComponent),
        canActivate: [AuthGuard, DeliveryRestrictionGuard],
      },
      {
        path: "received",
        loadComponent: () => import("./features/exchange/exchange-list/exchange-list.component").then((m) => m.ExchangeListComponent),
        canActivate: [AuthGuard, DeliveryRestrictionGuard],
        data: { tab: 'received' }
      },
      {
        path: "sent",
        loadComponent: () => import("./features/exchange/exchange-list/exchange-list.component").then((m) => m.ExchangeListComponent),
        canActivate: [AuthGuard, DeliveryRestrictionGuard],
        data: { tab: 'sent' }
      }
    ]
  },
  {
    path: "**",
    redirectTo: "",
  },
]
