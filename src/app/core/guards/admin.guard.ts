import { Injectable } from "@angular/core"
import { CanActivate, Router } from "@angular/router"
import { AuthService } from "../services/auth.service"

@Injectable({
  providedIn: "root",
})
export class AdminGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) { }

  canActivate(): boolean {
    const user = this.authService.getCurrentUser()
    if (user && this.isAdmin(user)) {
      return true
    }
    this.router.navigate(["/"])
    return false
  }

  private isAdmin(user: any): boolean {
    // This would need to be implemented based on your user model
    // For now, assuming there's a role property or similar
    return user.roles?.includes("Admin") || false
  }
}
