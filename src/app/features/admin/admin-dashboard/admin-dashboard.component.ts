import { Component,  OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule } from "@angular/router"

@Component({
  selector: "app-admin-dashboard",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: 'admin-dashboard.component.html',
})
export class AdminDashboardComponent implements OnInit {
  stats = {
    totalUsers: 1250,
    totalProducts: 3420,
    totalOrders: 890,
    totalRevenue: 45680,
  }

  recentProducts: any[] = []
  recentOrders: any[] = []

  ngOnInit(): void {
    this.loadRecentData()
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
}
