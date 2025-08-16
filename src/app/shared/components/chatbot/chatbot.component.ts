import { Component, ElementRef, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { ChatbotService } from '../../../core/services/chatbot.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Msg } from '../../../core/models/chat-message.model';

@Component({
  selector: 'app-chatbot',
  imports: [CommonModule , FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.scss'
})
export class ChatWidgetComponent {
  api = inject(ChatbotService);
  messages = signal<Msg[]>([]);
  draft = '';

  constructor() {
    // رسالة ترحيب
    this.messages.update(a => [...a, { role: 'assistant', text: 'أهلاً 👋 أنا هنا أساعدك في مستلزمات الأطفال. اسألني عن المنتجات، الأسعار، أو تتبع الطلب.' }]);
  }

  async onSend() {
    const text = this.draft.trim();
    if (!text) return;
    this.messages.update(a => [...a, { role: 'user', text }]);
    this.draft = '';
    const reply = await this.api.send(text);
    this.messages.update(a => [...a, { role: 'assistant', text: reply || '...' }]);
  }
}
// export class ChatbotComponent implements OnInit, OnDestroy, AfterViewChecked {
//   private chatbotService = inject(ChatbotService);
  
//   @ViewChild('messagesContainer') messagesContainer!: ElementRef;
//   @ViewChild('messageInput') messageInput!: ElementRef;

//   conversations: ChatConversation[] = [];
//   currentMessage: string = '';
//   isTyping: boolean = false;
//   isMinimized: boolean = false;
//   isAuthenticated: boolean = false;
  
//   private subscriptions = new Subscription();
//   private shouldScrollToBottom = true;

//   ngOnInit(): void {
//     // الاشتراك في المحادثات
//     this.subscriptions.add(
//       this.chatbotService.conversations$.subscribe(conversations => {
//         this.conversations = conversations;
//         this.shouldScrollToBottom = true;
//       })
//     );

//     // الاشتراك في حالة الكتابة
//     this.subscriptions.add(
//       this.chatbotService.isTyping$.subscribe(isTyping => {
//         this.isTyping = isTyping;
//         if (isTyping) {
//           this.shouldScrollToBottom = true;
//         }
//       })
//     );

//     // التحقق من حالة المصادقة
//     this.checkAuthenticationStatus();
//   }

//   ngOnDestroy(): void {
//     this.subscriptions.unsubscribe();
//   }

//   ngAfterViewChecked(): void {
//     if (this.shouldScrollToBottom) {
//       this.scrollToBottom();
//       this.shouldScrollToBottom = false;
//     }
//   }

//   sendMessage(): void {
//     if (!this.currentMessage.trim() || this.isTyping) {
//       return;
//     }

//     const message = this.currentMessage.trim();
//     this.currentMessage = '';

//     this.chatbotService.sendMessage(message).subscribe({
//       next: (response) => {
//         // التعامل مع الاستجابات الخاصة
//         this.handleSpecialResponses(response);
//       },
//       error: (error) => {
//         console.error('Error:', error);
//       }
//     });
//   }

//   sendQuickMessage(message: string): void {
//     this.currentMessage = message;
//     this.sendMessage();
//   }

//   toggleMinimize(): void {
//     this.isMinimized = !this.isMinimized;
//     if (!this.isMinimized) {
//       setTimeout(() => {
//         this.scrollToBottom();
//         if (this.messageInput) {
//           this.messageInput.nativeElement.focus();
//         }
//       }, 300);
//     }
//   }

//   clearChat(): void {
//     if (confirm('هل أنت متأكد من مسح جميع المحادثات؟')) {
//       this.chatbotService.clearConversations();
//     }
//   }

//   onCategoryClick(category: any): void {
//     this.sendQuickMessage(`أريد رؤية منتجات قسم ${category.nameAr || category.name}`);
//   }

//   goToLogin(): void {
//     // توجيه المستخدم لصفحة تسجيل الدخول
//     window.location.href = '/login';
//   }

//   goToRegister(): void {
//     // توجيه المستخدم لصفحة التسجيل
//     window.location.href = '/register';
//   }

//   formatMessage(text: string): string {
//     return this.chatbotService.formatMessage(text);
//   }

//   private checkAuthenticationStatus(): void {
//     // فحص حالة المصادقة من التوكن
//     const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
//     this.isAuthenticated = !!token && !this.isTokenExpired(token);
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

//   private handleSpecialResponses(response: ChatResponse): void {
//     if (response.requiresAuth && !this.isAuthenticated) {
//       // إظهار رسالة تسجيل الدخول
//       setTimeout(() => {
//         if (confirm('تحتاج لتسجيل الدخول للوصول لهذه الخدمة. هل تريد تسجيل الدخول الآن؟')) {
//           this.goToLogin();
//         }
//       }, 1000);
//     }
//   }

//   private scrollToBottom(): void {
//     if (this.messagesContainer) {
//       try {
//         const element = this.messagesContainer.nativeElement;
//         element.scrollTop = element.scrollHeight;
//       } catch (err) {
//         console.error('Error scrolling to bottom:', err);
//       }
//     }
//   }
// }
// export class ChatbotComponent {
//   messages = signal<ChatMessage[]>([]);
//   inputMessage = '';
//   loading = signal(false);
//   chatOpen = false;

//   constructor(private chatbotService: ChatbotService) {}

//   sendMessage() {
//     const trimmed = this.inputMessage.trim();
//     if (!trimmed) return;

//     // أضف رسالة المستخدم
//     this.messages.update(msgs => [...msgs, { sender: 'user', content: trimmed }]);
//     this.loading.set(true);

//     // استدعاء الخدمة
//     this.chatbotService.sendMessage(trimmed).subscribe({
//       next: res => {
//         this.messages.update(msgs => [...msgs, { sender: 'bot', content: res.data }]);
//         this.loading.set(false);
//       },
//       error: _ => {
//         this.messages.update(msgs => [...msgs, { sender: 'bot', content: "❌Erorr...try again later" }]);
//         this.loading.set(false);
//       }
//     });

//     this.inputMessage = '';
//   }

//   toggleChat() {
//     this.chatOpen = !this.chatOpen;
//   }

//   isChatOpen() {
//     return this.chatOpen;
//   }

//   closeChat() {
//     this.chatOpen = false;
//   }
// }
