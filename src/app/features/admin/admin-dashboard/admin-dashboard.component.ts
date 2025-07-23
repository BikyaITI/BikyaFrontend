import { Component,  inject,  OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule } from "@angular/router"
import { ICategory } from "../../../core/models/icategory";
import { CategoryService } from "../../../core/services/category.service";

@Component({
  selector: "app-admin-dashboard",
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.component.html',
  
})
export class AdminDashboardComponent implements OnInit {
  stats = {
    totalUsers: 1250,
    totalProducts: 3420,
    totalCategories: 3420,
    totalOrders: 890,
    totalRevenue: 45680,
  }
  categories: ICategory[] = [];
  recentProducts: any[] = []
  recentOrders: any[] = []
  categoryService= inject(CategoryService)
  ngOnInit(): void {
    this.loadRecentData()
    this.loadAllCategories()
  }
 


  loadRecentData(): void {
    // Mock data - replace with actual API calls
    this.recentProducts = [
      { id: 1, title: "Baby Stroller", user: { fullName: "John Doe" }, isApproved: false },
      { id: 2, title: "Toy Set", user: { fullName: "Jane Smith" }, isApproved: true },
      { id: 3, title: "Baby Clothes", user: { fullName: "Mike Johnson" }, isApproved: true },
    ]

    this.recentOrders = [
      { id: 1001, totalAmount: 89.99, status: "Completed" },
      { id: 1002, totalAmount: 45.5, status: "Pending" },
      { id: 1003, totalAmount: 120.0, status: "Shipped" },
    ]
  }
  loadAllCategories(){
  this.categoryService.getAll().subscribe({
    next: (res) => {
      if (res.success) {
        this.categories = res.data;
        console.log("عدد الأقسام:", this.categories.length);
      } else {
        this.categories = [];
      }
    },
    error: () => {
      this.categories = [];
    }
  });
}

  }

