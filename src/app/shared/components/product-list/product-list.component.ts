import { Component, EventEmitter, input, Output, OnInit } from '@angular/core';
import { IProduct } from '../../../core/models/product.model';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import{environment} from '../../../../environments/environment';
import { ProductService } from '../../../core/services/product.service';
import { WishListService } from '../../../core/services/wish-list.service';
import { IUser } from '../../../core/models/user.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule,RouterLink],
templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss'
})
export class ProductListComponent implements OnInit {

  product = input<IProduct | undefined>();
  role = input<string>();
  currentUser:IUser|null=null
  @Output() deleteClicked = new EventEmitter<void>();
  @Output() notify = new EventEmitter<{ type: 'success' | 'error', message: string }>();

  constructor(private productService: ProductService, private wishListService: WishListService, private authService: AuthService, private router: Router,) {

    }

    // Subscribe to auth state
    
    ngOnInit() {
      this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
      });
  }

getMainImage(product: IProduct): string {
    if (!product || !product.images) {
      return 'product.png';
    }
    
    const mainImage = product.images?.find((img) => img.isMain)
     return mainImage && mainImage.imageUrl
        ? `${environment.apiUrl}${mainImage.imageUrl}`
        : 'product.png';
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = 'product.png';
  }
  
  getConditionBadgeClass(condition: string): string {
    if (!condition) return "bg-secondary";
    
    switch (condition.toLowerCase()) {
      case "new":
        return "bg-primary"
      case "used":
        return "bg-warning"
      default:
        return "bg-secondary"
    }
    
  }
      

  buyNow(product: IProduct): void {
    if (product.userId === this.currentUser?.id) {
      this.notify.emit({ type: 'error', message: 'You cannot buy your own product.' });
console.log("You cannot buy your own product.");
      return;
}
console.log("buy now clicked")
    // this.router.navigate(['/checkout']), { queryParams: { productId: product.id } };
    this.router.navigate(['/checkout'], { queryParams: { productId: product.id } });
  }

  ToggleWishlist(product: IProduct): void {
    // Prevent adding own product to wishlist
    if (this.currentUser?.id === product.userId) {
      this.notify.emit({ type: 'error', message: 'You cannot add your own product to wishlist.' });
      return;
    }
    console.log("inside toggle")
    const action$ = product.isInWishlist
      ? this.wishListService.removefromWishlist(product.id)
      : this.wishListService.addToWishlist(product.id);

    action$.subscribe({
      next: (res) => {
        if(res.success)
          product.isInWishlist = !product.isInWishlist;
        this.wishListService.updateCount(res.data); 
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
   
  OnEdit(productId: number): void {
    if(this.product()?.status!=="Available") {
      this.notify.emit({ type: 'error', message: 'You cannot edit this product. only edit products that are available.' });
      return;
    }
    this.router.navigate(['/edit-product', productId]);
  }

  onDelete(productId: number): void {
      if (this.product()?.status !== "Available") {
        this.notify.emit({ type: 'error', message: 'You cannot delete this product. Only delete products that are available.' });
        return;

      }
    this.deleteClicked.emit()
  }
  isMyProduct(): boolean | null {
    console.log("isMyProduct called", this.currentUser?.id, this.product()!.id);
    return this.currentUser && this.product && this.product()!.userId === this.currentUser?.id;
  }
}
