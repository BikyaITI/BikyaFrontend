import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-logout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card">
            <div class="card-body text-center">
              <h3>Logout</h3>
              <p *ngIf="isLoading">Logging out...</p>
              <p *ngIf="!isLoading && !errorMessage">You have been logged out successfully!</p>
              <p *ngIf="errorMessage" class="text-danger">{{ errorMessage }}</p>
              
              <div *ngIf="!isLoading" class="mt-3">
                <button class="btn btn-primary me-2" routerLink="/login">
                  Login Again
                </button>
                <button class="btn btn-secondary" routerLink="/home">
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
  `]
})
export class LogoutComponent implements OnInit {
  isLoading = true;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.performLogout();
  }

  private performLogout(): void {
    // Directly clear local data
    this.authService.logout();
    this.isLoading = false;
    console.log('Logout completed');
  }
}