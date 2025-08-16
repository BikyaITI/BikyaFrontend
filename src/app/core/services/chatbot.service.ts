import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { ApiResponse } from './shipping.service';
import { environment } from '../../../environments/environment';



@Injectable({ providedIn: 'root' })
export class ChatbotService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/chatbot`;

  // 🟢 signals
  sessionId = signal<string | null>(null);
  loading = signal<boolean>(false);

  /** Helper: يفك الـ ApiResponse ويرجع الداتا */
  private unwrap<T>(res: ApiResponse<T> | undefined): T {
    if (!res || !res.success) throw new Error(res?.message ?? 'حصل خطأ غير متوقع');
    return res.data;
  }

  /** إنشاء Session جديدة */
  async createSession() {
    try {
      const res = await firstValueFrom(
        this.http.post<ApiResponse<string>>(`${this.apiUrl}/sessions`, {})
      );
      this.sessionId.set(this.unwrap(res));
    } catch (err) {
      console.error('فشل إنشاء جلسة:', err);
      this.sessionId.set(null);
    }
  }

  /** إرسال رسالة واستقبال الرد */
  async send(text: string) {
    if (!this.sessionId()) {
      await this.createSession();
    }
    this.loading.set(true);
    try {
      const res = await firstValueFrom(
        this.http.post<ApiResponse<string>>(`${this.apiUrl}/send`, {
          sessionId: this.sessionId(),
          text
        })
      );
      return this.unwrap(res);
    } catch (err) {
      console.error('خطأ أثناء الإرسال:', err);
      return 'حصل خطأ غير متوقع 🚨';
    } finally {
      this.loading.set(false);
    }
  }
}
//   private conversationsSubject = new BehaviorSubject<ChatConversation[]>([]);
//   public conversations$ = this.conversationsSubject.asObservable();
  
//   private isTypingSubject = new BehaviorSubject<boolean>(false);
//   public isTyping$ = this.isTypingSubject.asObservable();

//   constructor() {
//     // تحميل المحادثات المحفوظة من التخزين المؤقت
//     this.loadConversationsFromStorage();
//   }

//   sendMessage(message: string): Observable<ChatResponse> {
//     const chatMessage: ChatMessage = {
//       message: message,
//       userId: this.getCurrentUserId(),
//       isAuthenticated: this.isUserAuthenticated(),
//       timestamp: new Date(),
//       isFromUser: true
//     };

//     this.isTypingSubject.next(true);

//     const headers = new HttpHeaders({
//       'Content-Type': 'application/json'
//     });

//     // إضافة Authorization header إذا كان المستخدم مسجل دخول
//     const token = this.getAuthToken();
//     if (token) {
//       headers.set('Authorization', `Bearer ${token}`);
//     }

//     return new Observable<ChatResponse>(observer => {
//       this.http.post<ChatResponse>(`${this.apiUrl}/message`, chatMessage, { headers })
//         .subscribe({
//           next: (response) => {
//             this.isTypingSubject.next(false);
            
//             // حفظ المحادثة
//             const conversation: ChatConversation = {
//               userMessage: chatMessage,
//               botResponse: response,
//               timestamp: new Date()
//             };
            
//             this.addConversation(conversation);
//             observer.next(response);
//             observer.complete();
//           },
//           error: (error) => {
//             this.isTypingSubject.next(false);
//             console.error('Error sending message:', error);
            
//             const errorResponse: ChatResponse = {
//               response: 'عذراً، حدث خطأ في النظام. يرجى المحاولة مرة أخرى',
//               responseType: 'error',
//               requiresAuth: false
//             };
            
//             observer.next(errorResponse);
//             observer.complete();
//           }
//         });
//     });
//   }

//   getCategories(): Observable<ICategory[]> {
//     return this.http.get<ICategory[]>(`${this.apiUrl}/categories`);
//   }

//   private addConversation(conversation: ChatConversation): void {
//     const currentConversations = this.conversationsSubject.value;
//     const updatedConversations = [...currentConversations, conversation];
    
//     this.conversationsSubject.next(updatedConversations);
//     this.saveConversationsToStorage(updatedConversations);
//   }

//   clearConversations(): void {
//     this.conversationsSubject.next([]);
//     localStorage.removeItem('chatbot_conversations');
//   }

//   private loadConversationsFromStorage(): void {
//     const stored = localStorage.getItem('chatbot_conversations');
//     if (stored) {
//       try {
//         const conversations = JSON.parse(stored);
//         this.conversationsSubject.next(conversations);
//       } catch (error) {
//         console.error('Error loading conversations from storage:', error);
//       }
//     }
//   }

//   private saveConversationsToStorage(conversations: ChatConversation[]): void {
//     try {
//       // حفظ آخر 50 محادثة فقط
//       const limitedConversations = conversations.slice(-50);
//       localStorage.setItem('chatbot_conversations', JSON.stringify(limitedConversations));
//     } catch (error) {
//       console.error('Error saving conversations to storage:', error);
//     }
//   }

//   private getCurrentUserId(): string {
//     // يمكنك تعديل هذا حسب طريقة إدارة المستخدمين في مشروعك
//     const user = localStorage.getItem('user');
//     if (user) {
//       try {
//         const userData = JSON.parse(user);
//         return userData.id || userData.userId || '';
//       } catch {
//         return '';
//       }
//     }
//     return '';
//   }

//   private isUserAuthenticated(): boolean {
//     const token = this.getAuthToken();
//     return !!token && !this.isTokenExpired(token);
//   }

//   private getAuthToken(): string | null {
//     return localStorage.getItem('auth_token') || localStorage.getItem('token');
//   }

//   private isTokenExpired(token: string): boolean {
//     try {
//       const payload = JSON.parse(atob(token.split('.')[1]));
//       const expiry = payload.exp * 1000;
//       return Date.now() > expiry;
//     } catch {
//       return true;
//     }
//   }

//   // دوال مساعدة للواجهة
//   formatMessage(text: string): string {
//     return text.replace(/\n/g, '<br>');
//   }

//   getMessageTypeIcon(responseType: string): string {
//     const icons: { [key: string]: string } = {
//       'categories': '🛍️',
//       'orders': '📦',
//       'shipping': '🚚',
//       'login': '🔐',
//       'error': '❌',
//       'text': '💬'
//     };
//     return icons[responseType] || icons['text'];
//   }
// }
// export class ChatbotService {
//   private baseUrl = `${environment.apiUrl}/api/chatbot`;

//   constructor(private http: HttpClient) {}

//   sendMessage(message: string): Observable<ApiResponse<string>> {
//     return this.http.post<ApiResponse<string>>(`${this.baseUrl}/message`, {
//       message
//     });
//   }
// }
