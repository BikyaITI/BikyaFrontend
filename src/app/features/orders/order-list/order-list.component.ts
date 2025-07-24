import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule } from "@angular/router"
import { OrderService } from "../../../core/services/order.service"
import { AuthService } from "../../../core/services/auth.service"
import { Order, OrderStatus } from "../../../core/models/order.model"
import { IUser } from "../../../core/models/user.model"


@Component({
  selector: "app-order-list",
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss'],
})
export class OrderListComponent implements OnInit {
  allOrders: Order[] = []
  activeTab = "all"
  isLoading = true
  currentUser: IUser | null = null
  selectedOrder: Order | null = null

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user
      if (user) {
        this.loadOrders()
      }
    })
  }

  loadOrders(): void {
    if (!this.currentUser) return

    this.isLoading = true

    this.orderService.getMyOrders(this.currentUser.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.allOrders = response.data
        }
        this.isLoading = false
      },
      error: () => {
        this.isLoading = false
      },
    })
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab
  }

  getFilteredOrders(): Order[] {
    switch (this.activeTab) {
      case "pending":
        return this.getPendingOrders()
      case "shipped":
        return this.getShippedOrders()
      case "delivered":
        return this.getDeliveredOrders()
      default:
        return this.allOrders
    }
  }

  getPendingOrders(): Order[] {
    return this.allOrders.filter((order) => order.status === "Pending")
  }

  getShippedOrders(): Order[] {
    return this.allOrders.filter((order) => order.status === "Shipped")
  }

  getDeliveredOrders(): Order[] {
    return this.allOrders.filter((order) => order.status === "Delivered")
  }

  getOrderStatusClass(status: OrderStatus): string {
    switch (status) {
      case "Pending":
        return "bg-warning text-dark"
      case "Confirmed":
        return "bg-info"
      case "Shipped":
        return "bg-primary"
      case "Delivered":
        return "bg-success"
      case "Cancelled":
        return "bg-danger"
      default:
        return "bg-secondary"
    }
  }

  getProductImage(product: any): string {
    const mainImage = product?.images?.find((img: any) => img.isMain)
    return mainImage?.imageUrl || "/placeholder.svg?height=80&width=80"
  }

  viewOrderDetails(order: Order): void {
    this.selectedOrder = order
    const modal = new (window as any).bootstrap.Modal(document.getElementById("orderDetailsModal"))
    modal.show()
  }

  cancelOrder(order: Order): void {
    if (confirm("Are you sure you want to cancel this order?")) {
      this.orderService.cancelOrder(order.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadOrders() // Reload orders
          }
        },
        error: () => {
          alert("Failed to cancel order. Please try again.")
        },
      })
    }
  }
}
