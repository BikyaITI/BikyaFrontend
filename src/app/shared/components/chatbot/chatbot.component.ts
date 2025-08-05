import { Component, signal } from '@angular/core';
import { ChatMessage } from '../../../core/models/chat-message.model';
import { ChatbotService } from '../../../core/services/chatbot.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chatbot',
  imports: [CommonModule , FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.scss'
})
export class ChatbotComponent {
  messages = signal<ChatMessage[]>([]);
  inputMessage = '';
  loading = signal(false);
  chatOpen = false;

  constructor(private chatbotService: ChatbotService) {}

  sendMessage() {
    const trimmed = this.inputMessage.trim();
    if (!trimmed) return;

    // أضف رسالة المستخدم
    this.messages.update(msgs => [...msgs, { sender: 'user', content: trimmed }]);
    this.loading.set(true);

    // استدعاء الخدمة
    this.chatbotService.sendMessage(trimmed).subscribe({
      next: res => {
        this.messages.update(msgs => [...msgs, { sender: 'bot', content: res.data }]);
        this.loading.set(false);
      },
      error: _ => {
        this.messages.update(msgs => [...msgs, { sender: 'bot', content: "❌Erorr...try again later" }]);
        this.loading.set(false);
      }
    });

    this.inputMessage = '';
  }

  toggleChat() {
    this.chatOpen = !this.chatOpen;
  }

  isChatOpen() {
    return this.chatOpen;
  }

  closeChat() {
    this.chatOpen = false;
  }
}
