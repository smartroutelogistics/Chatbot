import axios from 'axios';
import { ConversationContext, BotResponse } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL 
  || (typeof window !== 'undefined' 
      ? `${window.location.origin.replace(/\/$/, '')}/api`
      : 'http://localhost:5000/api');

interface SendMessageRequest {
  text: string;
  userId: string;
  userType: 'trucker' | 'shipper' | 'visitor';
  language: string;
  context: ConversationContext;
}

interface UserProfile {
  profile?: {
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
  };
  preferences?: {
    language?: string;
    notifications?: boolean;
    saveHistory?: boolean;
    theme?: 'light' | 'dark';
    autoTranslate?: boolean;
  };
  userType?: 'trucker' | 'shipper' | 'visitor';
}

class ChatService {
  private apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  constructor() {
    // Request interceptor
    this.apiClient.interceptors.request.use((config) => {
      const sessionId = this.getSessionId();
      if (sessionId) {
        config.headers['X-Session-ID'] = sessionId;
      }
      
      // Add request timestamp
      config.metadata = { startTime: Date.now() };
      
      return config;
    }, (error) => {
      console.error('Request interceptor error:', error);
      return Promise.reject(error);
    });

    // Response interceptor
    this.apiClient.interceptors.response.use(
      (response) => {
        // Calculate response time
        const responseTime = Date.now() - response.config.metadata?.startTime;
        console.log(`API Response: ${response.config.url} - ${responseTime}ms`);
        
        return response;
      },
      (error) => {
        console.error('API Error:', {
          url: error.config?.url,
          status: error.response?.status,
          message: error.message,
          data: error.response?.data
        });
        
        // Handle specific error cases
        if (error.response?.status === 429) {
          throw new Error('Too many requests. Please wait a moment and try again.');
        }
        
        if (error.response?.status >= 500) {
          throw new Error('Server error. Please try again later.');
        }
        
        if (!error.response) {
          throw new Error('Network error. Please check your connection.');
        }
        
        return Promise.reject(error);
      }
    );
  }

  private getSessionId(): string {
    let sessionId = localStorage.getItem('chatbot-session-id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('chatbot-session-id', sessionId);
      
      // Also set user agent info
      localStorage.setItem('chatbot-user-agent', navigator.userAgent);
      localStorage.setItem('chatbot-screen-size', `${window.screen.width}x${window.screen.height}`);
    }
    return sessionId;
  }

  async sendMessage(request: SendMessageRequest): Promise<BotResponse> {
    try {
      // Add session and device info
      const requestWithContext = {
        ...request,
        sessionId: this.getSessionId(),
        deviceInfo: {
          userAgent: navigator.userAgent,
          screenSize: `${window.screen.width}x${window.screen.height}`,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          timestamp: new Date().toISOString()
        }
      };

      const response = await this.apiClient.post('/chat/message', requestWithContext);
      
      return {
        text: response.data.text,
        language: response.data.language || request.language,
        intent: response.data.intent || 'general',
        confidence: response.data.confidence || 0.8,
        emotion: response.data.emotion,
        suggestedActions: response.data.suggestedActions || [],
        media: response.data.media || []
      };
      
    } catch (error) {
      console.error('Error sending message:', error);
      return this.getFallbackResponse(request.language, error);
    }
  }

  async getWelcomeMessage(userType: 'trucker' | 'shipper', language: string): Promise<string> {
    const welcomeMessages = {
      en: {
        trucker: "🚚 Welcome, trucker! I'm your SmartRoute assistant. I'm here to help with dispatching, load finding, factoring services, and everything you need to keep your business rolling. What can I assist you with today?",
        shipper: "🏢 Welcome, shipper! I'm your SmartRoute assistant. I'm here to help you find reliable carriers, get competitive rates, and ensure your freight gets delivered safely and on time. How can I help you today?"
      },
      es: {
        trucker: "🚚 ¡Bienvenido, camionero! Soy tu asistente de SmartRoute. Estoy aquí para ayudarte con despacho, búsqueda de cargas, servicios de factoring y todo lo que necesitas para mantener tu negocio en marcha. ¿En qué puedo ayudarte hoy?",
        shipper: "🏢 ¡Bienvenido, transportista! Soy tu asistente de SmartRoute. Estoy aquí para ayudarte a encontrar transportistas confiables, obtener tarifas competitivas y asegurar que tu carga se entregue de manera segura y a tiempo. ¿Cómo puedo ayudarte hoy?"
      },
      ur: {
        trucker: "🚚 خوش آمدید، ٹرکر! میں آپ کا SmartRoute اسسٹنٹ ہوں۔ میں یہاں ڈسپیچنگ، لوڈ تلاش کرنے، فیکٹرنگ سروسز اور آپ کے کاروبار کو چلانے کے لیے درکار ہر چیز میں مدد کے لیے ہوں۔ آج میں آپ کی کیا مدد کر سکتا ہوں؟",
        shipper: "🏢 خوش آمدید، شپر! میں آپ کا SmartRoute اسسٹنٹ ہوں۔ میں یہاں آپ کو قابل اعتماد کیریئرز تلاش کرنے، مسابقتی ریٹس حاصل کرنے، اور آپ کا مال محفوظ اور وقت پر پہنچانے میں مدد کے لیے ہوں۔ آج میں آپ کی کیا مدد کر سکتا ہوں؟"
      },
      zh: {
        trucker: "🚚 欢迎，卡车司机！我是您的SmartRoute助手。我在这里帮助您处理调度、寻找货物、保理服务以及保持您的业务运转所需的一切。今天我可以为您提供什么帮助？",
        shipper: "🏢 欢迎，托运人！我是您的SmartRoute助手。我在这里帮助您找到可靠的承运商、获得有竞争力的价格，并确保您的货物安全准时送达。今天我可以如何帮助您？"
      }
    };

    const langMessages = welcomeMessages[language as keyof typeof welcomeMessages] || welcomeMessages.en;
    return langMessages[userType];
  }

  private getFallbackResponse(language: string, error?: any): BotResponse {
    const isNetworkError = !error?.response;
    const isServerError = error?.response?.status >= 500;
    
    let fallbackText = '';
    
    if (isNetworkError) {
      const networkMessages = {
        en: "I'm having trouble connecting right now. Please check your internet connection and try again.",
        es: "Tengo problemas de conexión ahora mismo. Por favor verifica tu conexión a internet e intenta de nuevo.",
        ur: "مجھے ابھی کنیکشن میں مسئلہ ہو رہا ہے۔ برائے کرم اپنا انٹرنیٹ کنیکشن چیک کریں اور دوبارہ کوشش کریں۔",
        zh: "我现在连接有问题。请检查您的互联网连接并重试。"
      };
      fallbackText = networkMessages[language as keyof typeof networkMessages] || networkMessages.en;
    } else if (isServerError) {
      const serverMessages = {
        en: "I'm experiencing technical difficulties. Our team has been notified. Please try again in a few moments.",
        es: "Estoy experimentando dificultades técnicas. Nuestro equipo ha sido notificado. Por favor intenta de nuevo en unos momentos.",
        ur: "مجھے تکنیکی مشکلات کا سامنا ہے۔ ہماری ٹیم کو اطلاع دے دی گئی ہے۔ برائے کرم کچھ لمحوں میں دوبارہ کوشش کریں۔",
        zh: "我遇到技术困难。我们的团队已收到通知。请稍后再试。"
      };
      fallbackText = serverMessages[language as keyof typeof serverMessages] || serverMessages.en;
    } else {
      const generalMessages = {
        en: "I apologize, but I encountered an error processing your request. You can try rephrasing your question or contact our support team at support@smartroutelogistics.com.",
        es: "Me disculpo, pero encontré un error al procesar tu solicitud. Puedes intentar reformular tu pregunta o contactar a nuestro equipo de soporte en support@smartroutelogistics.com.",
        ur: "معذرت، لیکن آپ کی درخواست کو پروسیس کرنے میں مجھے خرابی کا سامنا ہوا۔ آپ اپنا سوال دوبارہ بیان کر سکتے ہیں یا ہماری سپورٹ ٹیم سے support@smartroutelogistics.com پر رابطہ کر سکتے ہیں۔",
        zh: "抱歉，处理您的请求时遇到错误。您可以尝试重新表述您的问题或联系我们的支持团队 support@smartroutelogistics.com。"
      };
      fallbackText = generalMessages[language as keyof typeof generalMessages] || generalMessages.en;
    }

    return {
      text: fallbackText,
      language,
      intent: 'error',
      confidence: 1.0,
      emotion: 'apologetic',
      suggestedActions: [
        { type: 'quick_reply', title: 'Try again', payload: 'retry' },
        { type: 'quick_reply', title: 'Contact support', payload: 'support' }
      ]
    };
  }

  async translateMessage(text: string, targetLanguage: string): Promise<string> {
    try {
      const response = await this.apiClient.post('/translate', {
        text,
        targetLanguage,
        sessionId: this.getSessionId()
      });
      
      return response.data.translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      return text; // Return original text if translation fails
    }
  }

  async detectLanguage(text: string): Promise<string> {
    try {
      const response = await this.apiClient.post('/translate/detect-language', {
        text,
        sessionId: this.getSessionId()
      });
      
      return response.data.language;
    } catch (error) {
      console.error('Language detection error:', error);
      return 'en'; // Default to English if detection fails
    }
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const response = await this.apiClient.get('/user/profile', {
        headers: { 'X-Session-ID': userId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  async updateUserProfile(userId: string, profile: UserProfile): Promise<UserProfile | null> {
    try {
      const response = await this.apiClient.put('/user/profile', profile, {
        headers: { 'X-Session-ID': userId }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return null;
    }
  }

  async requestLiveAgent(userId: string, reason: string): Promise<any> {
    try {
      const response = await this.apiClient.post('/live-chat/request', {
        userId,
        reason,
        sessionId: this.getSessionId(),
        timestamp: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      console.error('Error requesting live agent:', error);
      return null;
    }
  }

  async submitFeedback(userId: string, rating: number, feedback: string, category?: string): Promise<any> {
    try {
      const response = await this.apiClient.post('/feedback', {
        rating,
        comment: feedback,
        category: category || 'general',
        sessionId: this.getSessionId(),
        timestamp: new Date().toISOString()
      }, {
        headers: { 'X-Session-ID': userId }
      });
      return response.data;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      return null;
    }
  }

  async getQuickActions(language: string, userType: string): Promise<string[]> {
    try {
      const response = await this.apiClient.get('/chat/suggestions', {
        params: { language, userType }
      });
      return response.data.suggestions || [];
    } catch (error) {
      console.error('Error fetching quick actions:', error);
      return [];
    }
  }

  async getChatHistory(limit: number = 50, offset: number = 0): Promise<any> {
    try {
      const response = await this.apiClient.get('/chat/history', {
        params: { limit, offset }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching chat history:', error);
      return { messages: [], total: 0, hasMore: false };
    }
  }

  async clearHistory(userId: string): Promise<boolean> {
    try {
      await this.apiClient.post('/chat/clear-history', {}, {
        headers: { 'X-Session-ID': userId }
      });
      return true;
    } catch (error) {
      console.error('Error clearing history:', error);
      return false;
    }
  }

  // Analytics and performance tracking
  trackEvent(eventName: string, properties: Record<string, any> = {}) {
    try {
      // In production, integrate with analytics service (Google Analytics, Mixpanel, etc.)
      console.log('Analytics Event:', eventName, properties);
      
      // Store local analytics for development
      const analytics = JSON.parse(localStorage.getItem('chatbot-analytics') || '[]');
      analytics.push({
        event: eventName,
        properties,
        timestamp: new Date().toISOString(),
        sessionId: this.getSessionId()
      });
      
      // Keep only last 100 events
      if (analytics.length > 100) {
        analytics.splice(0, analytics.length - 100);
      }
      
      localStorage.setItem('chatbot-analytics', JSON.stringify(analytics));
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }

  // Performance monitoring
  getPerformanceMetrics() {
    try {
      const analytics = JSON.parse(localStorage.getItem('chatbot-analytics') || '[]');
      const responseTimeEvents = analytics.filter((event: any) => event.event === 'message_response_time');
      
      if (responseTimeEvents.length === 0) {
        return { averageResponseTime: 0, totalMessages: 0 };
      }

      const totalTime = responseTimeEvents.reduce((sum: number, event: any) => 
        sum + (event.properties.responseTime || 0), 0
      );
      
      return {
        averageResponseTime: totalTime / responseTimeEvents.length,
        totalMessages: responseTimeEvents.length,
        lastUpdate: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting performance metrics:', error);
      return { averageResponseTime: 0, totalMessages: 0 };
    }
  }
}

export const chatService = new ChatService();
