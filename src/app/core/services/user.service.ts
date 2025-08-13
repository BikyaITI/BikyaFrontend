// import { HttpClient } from '@angular/common/http';
// import { Injectable } from '@angular/core';
// import { Observable } from 'rxjs';
// import { ApiResponse } from './shipping.service';
// import { environment } from '../../../environments/environment';
// import { IChangePasswordRequest, IUpdateProfileRequest, IUser, IUserStats } from '../models/user.model';

// @Injectable({
//   providedIn: 'root'
// })
// export class UserService {

//   private baseUrl = `${environment.apiUrl}/api/Users`;

//   constructor(private http: HttpClient) {}

//   getProfile(userId: number): Observable<ApiResponse<IUser>> {
//     return this.http.get<ApiResponse<IUser>>(`${this.baseUrl}/${userId}`);
//   }

//   updateProfile(userId: number, data: IUpdateProfileRequest): Observable<ApiResponse<boolean>> {
//     return this.http.put<ApiResponse<boolean>>(`${this.baseUrl}/${userId}`, data);
//   }

//   changePassword(userId: number, data: IChangePasswordRequest): Observable<ApiResponse<boolean>> {
//     return this.http.put<ApiResponse<boolean>>(`${this.baseUrl}/${userId}/ChangePassword`, data);
//   }

//   deactivateAccount(userId: number): Observable<ApiResponse<boolean>> {
//     return this.http.put<ApiResponse<boolean>>(`${this.baseUrl}/${userId}/Deactivate`, {});
//   }
//   getUserStats(userId: number): Observable<ApiResponse<IUserStats>> {
//   return this.http.get<ApiResponse<IUserStats>>(`${this.baseUrl}/stats/${userId}`);
// }


// }

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { IChangePasswordRequest, IUpdateProfileRequest, IUser, PublicUserProfile, UserStats } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = `${environment.apiUrl}/api/Identity/Users`;

  constructor(private http: HttpClient) {}

  // Get current user's profile information
  getCurrentUser(): Observable<ApiResponse<IUser>> {
    return this.http.get<ApiResponse<IUser>>(`${this.baseUrl}/me`);
  }

  // Get user by ID (only accessible by the user themselves or admins)
  getById(id: number): Observable<ApiResponse<IUser>> {
    return this.http.get<ApiResponse<IUser>>(`${this.baseUrl}/${id}`);
  }

  // Update current user's profile
  updateProfile(data: IUpdateProfileRequest): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(`${this.baseUrl}/profile`, data);
  }

  // Change current user's password
  changePassword(data: IChangePasswordRequest): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(`${this.baseUrl}/change-password`, data);
  }

  // Deactivate current user's account
  deactivateAccount(): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.baseUrl}/deactivate`);
  }

  // Get current user's activity status
  getUserStatus(): Observable<ApiResponse<IUser>> {
    return this.http.get<ApiResponse<IUser>>(`${this.baseUrl}/status`);
  }

   getUserStats(userId: number): Observable<ApiResponse<UserStats>> {
    const url = `${this.baseUrl}/${userId}/stats`;
    return this.http.get<ApiResponse<UserStats>>(url);
  }
  // Logout current user
  logout(): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/logout`, {});
  }

  // Upload profile image for current user
  // uploadProfileImage(file: File): Observable<ApiResponse<any>> {
  //   const formData = new FormData();
  //   formData.append('file', file);
  //   return this.http.post<ApiResponse<any>>(`${this.baseUrl}/upload-profile-image`, formData);
  // }

  // Legacy methods for backward compatibility
  getProfile(userId: number): Observable<ApiResponse<IUser>> {
    return this.getById(userId);
  }

  updateProfileMe(data: IUpdateProfileRequest): Observable<ApiResponse<boolean>> {
    return this.updateProfile(data);
  }

  changePasswordMe(data: IChangePasswordRequest): Observable<ApiResponse<boolean>> {
    return this.changePassword(data);
  }

  deactivateAccountMe(): Observable<ApiResponse<boolean>> {
    return this.deactivateAccount();
  }

   uploadProfileImage(file: File) {
    const formData = new FormData();
    formData.append('imageFile', file);

    return this.http.post<ApiResponse<string>>(`${this.baseUrl}/upload-profile-image`,formData);
  }
    getPublicProfile(userId: number): Observable<ApiResponse<PublicUserProfile>> {
    return this.http.get<ApiResponse<PublicUserProfile>>(`${this.baseUrl}/public-profile/${userId}`);
  }
}
