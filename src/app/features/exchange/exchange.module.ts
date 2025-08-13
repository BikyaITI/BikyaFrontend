import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';

// Components
import { ExchangeRequestComponent } from './exchange-request/exchange-request.component';
import { ExchangeListComponent } from './exchange-list/exchange-list.component';

// Services
import { ExchangeService } from '../../core/services/exchange.service';
import { ProductService } from '../../core/services/product.service';

// Routes
import { EXCHANGE_ROUTES } from './exchange.routes';

@NgModule({
  declarations: [
    ExchangeListComponent,
    ExchangeRequestComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(EXCHANGE_ROUTES),
    ToastrModule.forRoot({
      positionClass: 'toast-bottom-right',
      preventDuplicates: true
    })
  ],
  providers: [
    ExchangeService,
    ProductService
  ]
})
export class ExchangeModule { }
