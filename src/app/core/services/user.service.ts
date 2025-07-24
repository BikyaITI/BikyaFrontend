import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from './shipping.service';
import { environment } from '../../../environments/environment';
import { IChangePasswordRequest, IUpdateProfileRequest, IUser, IUserStats } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private baseUrl = `${environment.apiUrl}/api/Users`;

  constructor(private http: HttpClient) {}

  getProfile(userId: number): Observable<ApiResponse<IUser>> {
    return this.http.get<ApiResponse<IUser>>(`${this.baseUrl}/${userId}`);
  }

  updateProfile(userId: number, data: IUpdateProfileRequest): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(`${this.baseUrl}/${userId}`, data);
  }

  changePassword(userId: number, data: IChangePasswordRequest): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(`${this.baseUrl}/${userId}/ChangePassword`, data);
  }

  deactivateAccount(userId: number): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(`${this.baseUrl}/${userId}/Deactivate`, {});
  }
  getUserStats(userId: number): Observable<ApiResponse<IUserStats>> {
  return this.http.get<ApiResponse<IUserStats>>(`${this.baseUrl}/stats/${userId}`);
}


}
