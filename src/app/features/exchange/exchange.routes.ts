import { Routes } from "@angular/router";
import { ExchangeListComponent } from "./exchange-list/exchange-list.component";
import { ExchangeRequestComponent } from "./exchange-request/exchange-request.component";
import { AuthGuard } from "../../core/guards/auth.guard";
import { DeliveryRestrictionGuard } from "../../core/guards/delivery-restriction.guard";

export const EXCHANGE_ROUTES: Routes = [
  {
    path: "",
    component: ExchangeListComponent,
    canActivate: [AuthGuard, DeliveryRestrictionGuard],
    data: { title: "طلبات التبادل" }
  },
  {
    path: "request/:id",
    component: ExchangeRequestComponent,
    canActivate: [AuthGuard, DeliveryRestrictionGuard],
    data: { title: "طلب تبادل جديد" }
  }
];
