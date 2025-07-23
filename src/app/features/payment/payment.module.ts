import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { PaymentComponent } from './payment.component';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, FormsModule, PaymentComponent, TranslateModule],
  exports: [PaymentComponent]
})
export class PaymentModule {} 
