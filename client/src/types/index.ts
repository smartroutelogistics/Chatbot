export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  language?: string;
  emotion?: string;
  intent?: string;
  confidence?: number;
}

export interface User {
  id: string;
  name?: string;
  email?: string;
  userType: 'trucker' | 'shipper' | 'visitor';
  language: 'en' | 'es' | 'ur' | 'zh';
  preferences: UserPreferences;
  conversationHistory: Message[];
}

export interface UserPreferences {
  notifications: boolean;
  saveHistory: boolean;
  theme: 'light' | 'dark';
  autoTranslate: boolean;
}

export interface ChatState {
  messages: Message[];
  isTyping: boolean;
  isConnected: boolean;
  currentUser: User | null;
  selectedLanguage: string;
  showLanguageSelector: boolean;
}

export interface BotResponse {
  text: string;
  language: string;
  intent: string;
  confidence: number;
  suggestedActions?: SuggestedAction[];
  media?: MediaContent[];
}

export interface SuggestedAction {
  type: 'quick_reply' | 'url' | 'phone' | 'email';
  title: string;
  payload: string;
}

export interface MediaContent {
  type: 'image' | 'video' | 'document';
  url: string;
  title?: string;
  description?: string;
}

export interface LiveChatAgent {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
  specializations: string[];
}

export interface ConversationContext {
  topic: string;
  userType: 'trucker' | 'shipper' | 'visitor';
  leadQualified: boolean;
  previousInteractions: number;
  lastContactDate?: Date;
}

export const SUPPORTED_LANGUAGES = {
  en: 'English',
  es: 'Español',
  ur: 'اردو',
  zh: '中文'
} as const;

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES;