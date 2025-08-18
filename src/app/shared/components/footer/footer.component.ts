import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
  <footer class="footer bg-gray-900 text-white pt-5 pb-3">
    <div class="container">
      <div class="row">
        <!-- Brand & About -->
        <div class="col-md-4 mb-4">
          <a routerLink="/" class="d-flex align-items-center mb-3 text-white text-decoration-none">
            <div class="logo-container me-2"><i class="fas fa-baby-carriage"></i></div>
            <span class="brand-name">Bikya</span>
          </a>
          <p class="small">Safe, affordable, and sustainable used children’s products for modern families.</p>
        </div>

        <!-- Quick Links -->
        <div class="col-md-2 mb-4">
          <h6 class="text-uppercase fw-bold mb-3">Quick Links</h6>
          <ul class="list-unstyled">
            <li><a routerLink="/" class="footer-link">Home</a></li>
            <li><a routerLink="/products" class="footer-link">Products</a></li>
            <li><a routerLink="/allcategories" class="footer-link">Categories</a></li>
            <li><a routerLink="/exchange" class="footer-link">Exchange</a></li>
          </ul>
        </div>

        <!-- Support -->
        <div class="col-md-2 mb-4">
          <h6 class="text-uppercase fw-bold mb-3">Support</h6>
          <ul class="list-unstyled">
            <li><a routerLink="/faq" class="footer-link">FAQ</a></li>
            <li><a routerLink="/contact" class="footer-link">Contact Us</a></li>
            <li><a routerLink="/privacy" class="footer-link">Privacy Policy</a></li>
            <li><a routerLink="/terms" class="footer-link">Terms of Service</a></li>
          </ul>
        </div>

        <!-- Newsletter -->
        <div class="col-md-4 mb-4">
          <h6 class="text-uppercase fw-bold mb-3">Subscribe</h6>
          <p class="small">Get the latest deals and updates delivered to your inbox.</p>
          <div class="d-flex">
            <input type="email" class="form-control rounded-start" placeholder="Enter your email">
            <button class="btn btn-primary rounded-end">Subscribe</button>
          </div>
        </div>
      </div>

      <hr class="bg-gray-700">

      <div class="d-flex justify-content-between align-items-center flex-column flex-md-row">
        <p class="mb-0 small">&copy; {{currentYear}} Bikya. All rights reserved.</p>
        <div class="social-links mt-2 mt-md-0">
          <a href="#" class="text-white me-3"><i class="fab fa-facebook-f"></i></a>
          <a href="#" class="text-white me-3"><i class="fab fa-twitter"></i></a>
          <a href="#" class="text-white me-3"><i class="fab fa-instagram"></i></a>
          <a href="#" class="text-white"><i class="fab fa-linkedin-in"></i></a>
        </div>
      </div>
    </div>
  </footer>
  `,
  styles: [`
    .footer {
      font-family: 'Inter', sans-serif;
      background: #243967ff;
      color: #ffffff;
    }
    .footer-link {
      color: #cbd5e1;
      text-decoration: none;
      display: block;
      margin-bottom: 0.5rem;
      transition: color 0.2s;
    }
    .footer-link:hover {
      color: var(--primary-color);
    }
    .social-links a {
      font-size: 1.2rem;
      transition: color 0.2s;
    }
    .social-links a:hover {
      color: var(--primary-light);
    }
    input.form-control {
      border: 1px solid #374151;
      background: #2c3a4dff;
      color: #ffffff;
    }
    input.form-control::placeholder {
      color: #9ca3af;
    }
    button.btn-primary {
      background: var(--gradient-primary);
      border: none;
    }
    button.btn-primary:hover {
      background: var(--primary-dark);
    }
  `]
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
