import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { AdminUserService } from '../../../core/services/admin-user.service';
import { CategoryFormComponent } from '../category-form/category-form.component';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { IUser } from '../../../core/models/user.model';

@Component({
  selector: 'app-admin-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
  standalone: true,
  imports: [CommonModule, CategoryFormComponent, FormsModule],
  providers: [AdminUserService]
})
export class AdminUserListComponent implements OnInit, OnDestroy {
  users: IUser[] = [];
  isLoading = false;
  errorMessage = '';
  showAddCategory = false;

  searchTerm = '';
  statusFilter = '';
  isDeleting: { [key: number]: boolean } = {};
  isLocking: { [key: number]: boolean } = {};
  isAssigning: { [key: number]: boolean } = {};

  // Pagination variables
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;

  adminUserService = inject(AdminUserService);
  toastr = inject(ToastrService);

  private keyboardListener?: (event: KeyboardEvent) => void;

  ngOnInit() {
    this.loadUsers();
    this.setupKeyboardNavigation();
  }

  ngOnDestroy() {
    if (this.keyboardListener) {
      document.removeEventListener('keydown', this.keyboardListener);
    }
  }

  setupKeyboardNavigation() {
    // Add keyboard navigation for search input
    this.keyboardListener = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && event.target instanceof HTMLInputElement) {
        if (event.target.placeholder?.includes('Search')) {
          this.searchUsers();
        }
      }
    };
    document.addEventListener('keydown', this.keyboardListener);
  }

  loadUsers() {
    this.isLoading = true;
    this.errorMessage = '';
    this.adminUserService.getAll(this.searchTerm, this.statusFilter, this.currentPage, this.pageSize).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res.success) {
          this.users = res.data || [];
          
          // Update pagination info if available in response
          if (res.totalItems !== undefined && res.totalItems !== null) {
            this.totalItems = res.totalItems;
            this.totalPages = Math.ceil(this.totalItems / this.pageSize);
          } else {
            // Fallback: if no totalItems, assume we have more pages if we got a full page
            if (this.users.length === this.pageSize) {
              this.totalItems = this.currentPage * this.pageSize + 1; // Assume there's at least one more
              this.totalPages = Math.ceil(this.totalItems / this.pageSize);
            } else {
              this.totalItems = this.users.length;
              this.totalPages = 1;
            }
          }
          
          if (this.users.length > 0) {
            this.toastr.success(`Loaded ${this.users.length} users successfully`);
          } else {
            this.toastr.info('No users found');
          }
        } else {
          this.errorMessage = res.message || 'Failed to load users.';
          this.toastr.error(this.errorMessage);
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        let errorMsg = 'Failed to load users.';
        
        if (err?.error?.message) {
          errorMsg = err.error.message;
        } else if (err?.message) {
          errorMsg = err.message;
        } else if (err?.status === 401) {
          errorMsg = 'Unauthorized. Please login again.';
        } else if (err?.status === 403) {
          errorMsg = 'Access denied. You do not have permission to view users.';
        } else if (err?.status === 404) {
          errorMsg = 'Users endpoint not found.';
        } else if (err?.status >= 500) {
          errorMsg = 'Server error. Please try again later.';
        }
        
        this.errorMessage = errorMsg;
        this.toastr.error(errorMsg);
        console.error('Error loading users:', err);
      }
    });
  }

  searchUsers() {
    // Reset to first page when searching
    this.currentPage = 1;
    this.loadUsers();
  }

  clearFilters() {
    this.searchTerm = '';
    this.statusFilter = '';
    this.currentPage = 1;
    this.loadUsers();
    this.toastr.info('Filters cleared');
  }

  // Pagination methods
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadUsers();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  getDisplayInfo(): string {
    const start = (this.currentPage - 1) * this.pageSize + 1;
    const end = Math.min(this.currentPage * this.pageSize, this.totalItems);
    return `Showing ${start} to ${end} of ${this.totalItems} users`;
  }

  changePageSize(newSize: number) {
    this.pageSize = newSize;
    this.currentPage = 1; // Reset to first page
    this.loadUsers();
  }

  onPageSizeChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    if (target && target.value) {
      this.changePageSize(+target.value);
    }
  }

  async confirmDelete(user: IUser) {
    const result = await Swal.fire({
      title: 'Confirm Deletion',
      text: `Are you sure you want to delete the user "${user.FullName || user.email}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      this.deleteUser(user.id);
    }
  }

  deleteUser(id: number) {
    this.isDeleting[id] = true;
    this.adminUserService.delete(id).subscribe({
      next: (res: any) => {
        this.isDeleting[id] = false;
        if (res.success) {
          this.toastr.success(res.message || 'User deleted successfully');
          // Reload current page
          this.loadUsers();
        } else {
          this.toastr.error(res.message || 'Failed to delete user');
        }
      },
      error: (err: any) => {
        this.isDeleting[id] = false;
        let errorMsg = 'Failed to delete user.';
        
        if (err?.error?.message) {
          errorMsg = err.error.message;
        } else if (err?.message) {
          errorMsg = err.message;
        } else if (err?.status === 401) {
          errorMsg = 'Unauthorized. Please login again.';
        } else if (err?.status === 403) {
          errorMsg = 'Access denied. You do not have permission to delete users.';
        } else if (err?.status === 404) {
          errorMsg = 'User not found.';
        } else if (err?.status >= 500) {
          errorMsg = 'Server error. Please try again later.';
        }
        
        this.toastr.error(errorMsg);
        console.error('Error deleting user:', err);
      }
    });
  }

  async confirmLock(user: IUser) {
    const isLocked = this.adminUserService.isUserLocked(user);
    const actionText = isLocked ? 'Unlock' : 'Lock';

    const result = await Swal.fire({
      title: `Confirm ${actionText}`,
      text: `Are you sure you want to ${actionText.toLowerCase()} the user "${user.fullName}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: isLocked ? '#28a745' : '#ffc107',
      cancelButtonColor: '#6c757d',
      confirmButtonText: `Yes, ${actionText}`,
      cancelButtonText: 'Cancel',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      if (isLocked) {
        this.unlockUser(user.id);
      } else {
        this.lockUser(user.id);
      }
    }
  }


  lockUser(id: number) {
    this.isLocking[id] = true;
    this.adminUserService.lock(id).subscribe({
      next: (res: any) => {
        this.isLocking[id] = false;
        if (res.success) {
          this.toastr.success(res.message || 'User locked successfully');
          // Reload current page
          this.loadUsers();
        } else {
          this.toastr.error(res.message || 'Failed to lock user');
        }
      },
      error: (err: any) => {
        this.isLocking[id] = false;
        let errorMsg = 'Failed to lock user.';
        
        if (err?.error?.message) {
          errorMsg = err.error.message;
        } else if (err?.message) {
          errorMsg = err.message;
        } else if (err?.status === 401) {
          errorMsg = 'Unauthorized. Please login again.';
        } else if (err?.status === 403) {
          errorMsg = 'Access denied. You do not have permission to lock users.';
        } else if (err?.status === 404) {
          errorMsg = 'User not found.';
        } else if (err?.status >= 500) {
          errorMsg = 'Server error. Please try again later.';
        }
        
        this.toastr.error(errorMsg);
        console.error('Error locking user:', err);
      }
    });
  }

  unlockUser(id: number) {
    this.isLocking[id] = true;
    this.adminUserService.unlock(id).subscribe({
      next: (res: any) => {
        this.isLocking[id] = false;
        if (res.success) {
          this.toastr.success(res.message || 'User unlocked successfully');
          // Reload current page
          this.loadUsers();
        } else {
          this.toastr.error(res.message || 'Failed to unlock user');
        }
      },
      error: (err: any) => {
        this.isLocking[id] = false;
        let errorMsg = 'Failed to unlock user.';
        
        if (err?.error?.message) {
          errorMsg = err.error.message;
        } else if (err?.message) {
          errorMsg = err.message;
        } else if (err?.status === 401) {
          errorMsg = 'Unauthorized. Please login again.';
        } else if (err?.status === 403) {
          errorMsg = 'Access denied. You do not have permission to unlock users.';
        } else if (err?.status === 404) {
          errorMsg = 'User not found.';
        } else if (err?.status >= 500) {
          errorMsg = 'Server error. Please try again later.';
        }
        
        this.toastr.error(errorMsg);
        console.error('Error unlocking user:', err);
      }
    });
  }

  async assignAdmin(user: IUser) {
    const isAdmin = user.roles?.includes('Admin');
    const actionText = isAdmin ? 'Remove Admin Role' : 'Assign as Admin';

    const result = await Swal.fire({
      title: `Confirm ${actionText}`,
      text: `Are you sure you want to ${actionText.toLowerCase()} for the user "${user.fullName}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: isAdmin ? '#dc3545' : '#17a2b8',
      cancelButtonColor: '#6c757d',
      confirmButtonText: `Yes, ${actionText}`,
      cancelButtonText: 'Cancel',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      if (isAdmin) {
        this.removeAdminRole(user.id);
      } else {
        this.assignAdminRole(user.id);
      }
    }
  }


  assignAdminRole(id: number) {
    this.isAssigning[id] = true;
    this.adminUserService.assignRole(id, 'Admin').subscribe({
      next: (res: any) => {
        this.isAssigning[id] = false;
        if (res.success) {
          this.toastr.success(res.message || 'User is now an admin');
          // Reload current page
          this.loadUsers();
        } else {
          this.toastr.error(res.message || 'Failed to assign admin role');
        }
      },
      error: (err: any) => {
        this.isAssigning[id] = false;
        let errorMsg = 'Failed to assign admin role.';
        
        if (err?.error?.message) {
          errorMsg = err.error.message;
        } else if (err?.message) {
          errorMsg = err.message;
        } else if (err?.status === 401) {
          errorMsg = 'Unauthorized. Please login again.';
        } else if (err?.status === 403) {
          errorMsg = 'Access denied. You do not have permission to assign admin roles.';
        } else if (err?.status === 404) {
          errorMsg = 'User not found.';
        } else if (err?.status >= 500) {
          errorMsg = 'Server error. Please try again later.';
        }
        
        this.toastr.error(errorMsg);
        console.error('Error assigning admin role:', err);
      }
    });
  }

  removeAdminRole(id: number) {
    this.isAssigning[id] = true;
    this.adminUserService.removeRole(id, 'Admin').subscribe({
      next: (res: any) => {
        this.isAssigning[id] = false;
        if (res.success) {
          this.toastr.success(res.message || 'Admin role removed successfully');
          // Reload current page
          this.loadUsers();
        } else {
          this.toastr.error(res.message || 'Failed to remove admin role');
        }
      },
      error: (err: any) => {
        this.isAssigning[id] = false;
        let errorMsg = 'Failed to remove admin role.';
        
        if (err?.error?.message) {
          errorMsg = err.error.message;
        } else if (err?.message) {
          errorMsg = err.message;
        } else if (err?.status === 401) {
          errorMsg = 'Unauthorized. Please login again.';
        } else if (err?.status === 403) {
          errorMsg = 'Access denied. You do not have permission to remove admin roles.';
        } else if (err?.status === 404) {
          errorMsg = 'User not found.';
        } else if (err?.status >= 500) {
          errorMsg = 'Server error. Please try again later.';
        }
        
        this.toastr.error(errorMsg);
        console.error('Error removing admin role:', err);
      }
    });
  }

  getUserStatusText(user: IUser): string {
    return this.adminUserService.getUserStatusText(user);
  }

  getLockButtonText(user: IUser): string {
    return this.adminUserService.isUserLocked(user) ? 'Unlock' : 'Lock';
  }

  getLockButtonClass(user: IUser): string {
    return this.adminUserService.isUserLocked(user) ? 'btn-success' : 'btn-warning';
  }

  getAdminButtonText(user: IUser): string {
    return user.roles?.includes('Admin') ? 'Remove Admin' : 'Make Admin';
  }

  getAdminButtonClass(user: IUser): string {
    return user.roles?.includes('Admin') ? 'btn-danger' : 'btn-info';
  }

  onCategoryAdded() {
    this.showAddCategory = false;
    // Optionally reload categories here if you have a category list
  }
} 