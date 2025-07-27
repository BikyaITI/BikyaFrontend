import { Component,  OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule } from "@angular/router"
import  { ProductService } from "../../../core/services/product.service"
import  { AuthService } from "../../../core/services/auth.service"
import { ProductListComponent } from './../../../shared/components/product-list/product-list.component';
import  { IUser } from "../../../core/models/user.model"
import { IProduct } from "../../../core/models/product.model"


@Component({
  selector: 'app-product-management',
  imports: [CommonModule, RouterModule,ProductListComponent],

templateUrl: './product-management.component.html',
  styleUrl: './product-management.component.scss'
})


export class ProductManagementComponent   {

}

