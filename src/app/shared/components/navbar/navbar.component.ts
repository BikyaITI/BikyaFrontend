import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule, Router } from "@angular/router"
import { AuthService } from "../../../core/services/auth.service"
import { IUser } from "../../../core/models/user.model"
import { Dropdown } from "bootstrap"
import { FormsModule } from "@angular/forms"


@Component({
  selector: "app-navbar",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
      <div class="container">
            <!-- Brand Logo -->
        <a class="navbar-brand d-flex align-items-center" routerLink="/">
          <div class="logo-container me-2">
            <i class="fas fa-baby-carriage"></i>
          </div>
          <span class="brand-name">Bikya</span>
        </a>
     <!-- Mobile Toggle Button -->
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
      <!-- Navigation Menu -->
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto">
            <li class="nav-item">
              <a class="nav-link" routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">   <i class="fas fa-home me-2"></i>Home</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/products" routerLinkActive="active"> <i class="fas fa-shopping-bag me-2"></i>Products</a>
            </li>
             <li class="nav-item">
              <a class="nav-link" routerLink="/allcategories" routerLinkActive="active">   <i class="fas fa-th-large me-2"></i>Categories</a>
            </li>
            <li class="nav-item" *ngIf="currentUser">
              <a class="nav-link" routerLink="/dashboard" routerLinkActive="active"
              (click)="goToDashboard()"><i class="fas fa-tachometer-alt me-2"></i>Dashboard</a>
            </li>
          </ul>
  <!-- Right Side Actions -->
          <div class="d-flex align-items-center">
                 <!-- Search Container -->
  <div class="search-container me-3" style="width: 250px;">
    <input
      type="search"
      class="form-control"
      placeholder="Search products..."
      [(ngModel)]="navSearchTerm"
      (keyup.enter)="onNavSearch()">
    <i class="fas fa-search search-icon"></i>
  </div>

              <!-- User Actions -->
            <ng-container *ngIf="currentUser; else loginLinks">
              
        <!-- wishlist  -->
       <div class="position-relative d-inline-block  me-3">

  <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger z-1">
    45
  </span>
  <a href="#" class="btn btn-outline-primary">
    <i class="fas fa-heart"></i>
  </a>
</div>
        <!-- User Dropdown -->
              <div class="dropdown">
                <button class="btn btn-outline-primary rounded-pill px-4 py-2 shadow-sm d-flex align-items-center gap-2"
                        type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
                  <i class="fas fa-user-circle fa-lg text-primary"></i>
                  <span class="fw-semibold">{{ currentUser.fullName }}</span>
                  <i class="fas fa-chevron-down ms-2"></i>
                </button>

                <ul class="dropdown-menu dropdown-menu-end shadow-sm mt-2 rounded-4" aria-labelledby="dropdownMenuButton">
                  <li><h6 class="dropdown-header text-muted small">My Account</h6></li>

                  <a
                    class="dropdown-item d-flex align-items-center gap-2 py-2"
                    (click)="goToProfile()"
                    style="cursor: pointer;"
                  >
                    <i class="fas fa-user text-primary"></i> 
                    <span class="fw-medium">Profile</span>
                  </a>

                  <li>
                    <a class="dropdown-item d-flex align-items-center gap-2 py-2" routerLink="/my-products">
                      <i class="fas fa-baby-carriage text-success"></i> <span class="fw-medium">My Products</span>
                    </a>
                  </li>

                  <li>
                    <a class="dropdown-item d-flex align-items-center gap-2 py-2" routerLink="/orders">
                      <i class="fas fa-receipt text-info"></i> <span class="fw-medium">Orders</span>
                    </a>
                  </li>



                  <li><hr class="dropdown-divider my-1"></li>

                  <li>
                    <a class="dropdown-item d-flex align-items-center gap-2 py-2 text-danger fw-medium cursor-pointer" href="/logout" (click)="logout()">
                      <i class="fas fa-sign-out-alt"></i> Logout
                    </a>
                  </li>
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
  styles: [`
    .dropdown-menu.show {
      display: block !important;
    }
  `]
})
export class NavbarComponent implements OnInit, AfterViewInit {
  @ViewChild('dropdownBtn', { static: false }) dropdownBtn?: ElementRef;

  currentUser: IUser | null = null;
  isAdmin: boolean = false;
  showAdminDropdown = false;
  showUserDropdown = false;
  navSearchTerm = "";

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
      this.isAdmin = this.checkIfAdmin(user);
    });
  }

  ngAfterViewInit(): void {
    if (this.dropdownBtn) {
      new Dropdown(this.dropdownBtn.nativeElement);
    }
  }
  
  goToDashboard(): void {
    const user = this.authService.getCurrentUser();
    const roles = user?.roles; // نوعها: string[] | undefined

    if (roles?.includes('Admin')) {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }
  goToProfile(): void {
    const user = this.authService.getCurrentUser();
    const roles = user?.roles; // نوعها: string[] | undefined

    if (roles?.includes('Admin')) {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate(['/profile']);
    }
  }
  onNavSearch() {
    if (this.navSearchTerm.trim()) {
      this.router.navigate(['/products'], { queryParams: { search: this.navSearchTerm.trim() } });
    }
  }

  private checkIfAdmin(user: IUser | null): boolean {
    if (!user || !user.roles) return false;
    return user.roles.includes('Admin');
  }

  toggleAdminDropdown(event: Event): void {
    event.preventDefault();
    this.showAdminDropdown = !this.showAdminDropdown;
    this.showUserDropdown = false;
  }

  toggleUserDropdown(event: Event): void {
    event.preventDefault()
    this.showUserDropdown = !this.showUserDropdown
    this.showAdminDropdown = false
  }

  hideAdminDropdown(): void {
    this.showAdminDropdown = false;
  }

  hideUserDropdown(): void {
    this.showUserDropdown = false
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}

