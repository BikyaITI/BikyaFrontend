// models/chat.model.ts
export interface ChatMessage {
  message: string;
  userId: string;
  isAuthenticated: boolean;
  timestamp?: Date;
  isFromUser?: boolean;
}

export interface ChatResponse {
  response: string;
  responseType: string; // 'text', 'categories', 'orders', 'login', 'shipping'
  data?: any;
  requiresAuth: boolean;
}

export interface Msg {
  role: 'user' | 'assistant';
  text: string;
}

