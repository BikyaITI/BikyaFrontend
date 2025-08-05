import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from './shipping.service';
import { environment } from '../../../environments/environment';


@Injectable({ providedIn: 'root' })
export class ChatbotService {
  private baseUrl = `${environment.apiUrl}/api/chatbot`;

  constructor(private http: HttpClient) {}

  sendMessage(message: string): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.baseUrl}/message`, {
      message
    });
  }
}
