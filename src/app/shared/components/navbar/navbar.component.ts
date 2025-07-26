import { Component,  OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule,  Router } from "@angular/router"
import  { AuthService } from "../../../core/services/auth.service"
import  { User } from "../../../core/models/user.model"

@Component({
  selector: "app-navbar",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
      <div class="container">
        <a class="navbar-brand d-flex align-items-center" routerLink="/">
          <div class="logo-container me-2">
            <i class="fas fa-baby-carriage"></i>
          </div>
          <span class="brand-name">Bikya</span>
        </a>

        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto">
            <li class="nav-item">
              <a class="nav-link" routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Home</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/products" routerLinkActive="active">Products</a>
            </li>
             <li class="nav-item">
              <a class="nav-link" routerLink="/allcategories" routerLinkActive="active">Categories</a>
            </li>
            <li class="nav-item" *ngIf="currentUser">
              <a class="nav-link" routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
            </li>
          </ul>

          <div class="d-flex align-items-center">
            <div class="search-container me-3">
              <input type="search" class="form-control" placeholder="Search products...">
              <i class="fas fa-search search-icon"></i>
            </div>

            <ng-container *ngIf="currentUser; else loginLinks">
              <a routerLink="/wallet" class="btn btn-outline-primary me-2" routerLinkActive="active">
                <i class="fas fa-wallet me-1"></i>Wallet
              </a>
              <a href="#" class="btn btn-outline-primary me-2 position-relative">
                <i class="fas fa-shopping-cart"></i>
                <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">3</span>
              </a>

              <div class="dropdown">
                <button class="btn btn-primary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                  <i class="fas fa-user me-1"></i>{{currentUser.fullName}}
                </button>
                <ul class="dropdown-menu">
                  <li><a class="dropdown-item" routerLink="/profile"><i class="fas fa-user me-2"></i>Profile</a></li>
                  <li><a class="dropdown-item" routerLink="/my-products"><i class="fas fa-box me-2"></i>My Products</a></li>
                  <li><a class="dropdown-item" routerLink="/orders"><i class="fas fa-receipt me-2"></i>Orders</a></li>
                  <li><a class="dropdown-item" routerLink="/wallet"><i class="fas fa-wallet me-2"></i>Wallet</a></li>
                  <li><hr class="dropdown-divider"></li>
                  <li><a class="dropdown-item" href="#" (click)="logout()"><i class="fas fa-sign-out-alt me-2"></i>Logout</a></li>
                </ul>
              </div>
            </ng-container>

            <ng-template #loginLinks>
              <a routerLink="/login" class="btn btn-outline-primary me-2">Login</a>
              <a routerLink="/register" class="btn btn-primary">Register</a>
            </ng-template>
          </div>
        </div>
      </div>
    </nav>
  `,
})
export class NavbarComponent implements OnInit {
  currentUser: User | null = null

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user
      if (user) {
        console.log("Current User:", user);
      } else {
        console.log("No user is currently logged in.");
      }
    })
  }

  logout(): void {
    this.authService.logout()
    this.router.navigate(["/"])
  }
}
