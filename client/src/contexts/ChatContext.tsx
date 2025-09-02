import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Message, User, ChatState, SupportedLanguage } from '../types';
import { chatService } from '../services/chatService';

interface ChatContextType {
  state: ChatState;
  dispatch: React.Dispatch<ChatAction>;
  sendMessage: (text: string) => Promise<void>;
  changeLanguage: (language: SupportedLanguage) => void;
  clearHistory: () => void;
  requestLiveAgent: (reason: string) => void;
}

type ChatAction = 
  | { type: 'SET_MESSAGES'; payload: Message[] }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'SET_TYPING'; payload: boolean }
  | { type: 'SET_CONNECTED'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_LANGUAGE'; payload: SupportedLanguage }
  | { type: 'TOGGLE_LANGUAGE_SELECTOR' }
  | { type: 'CLEAR_MESSAGES' }
  | { type: 'SET_LIVE_AGENT_CONNECTED'; payload: boolean }
  | { type: 'UPDATE_USER_PREFERENCES'; payload: Partial<User['preferences']> };

const initialState: ChatState = {
  messages: [],
  isTyping: false,
  isConnected: false,
  currentUser: null,
  selectedLanguage: 'en',
  showLanguageSelector: false
};

const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
  switch (action.type) {
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload };
    
    case 'ADD_MESSAGE':
      return { 
        ...state, 
        messages: [...state.messages, action.payload],
        isTyping: false 
      };
    
    case 'SET_TYPING':
      return { ...state, isTyping: action.payload };
    
    case 'SET_CONNECTED':
      return { ...state, isConnected: action.payload };
    
    case 'SET_USER':
      return { ...state, currentUser: action.payload };
    
    case 'SET_LANGUAGE':
      return { 
        ...state, 
        selectedLanguage: action.payload,
        showLanguageSelector: false,
        currentUser: state.currentUser ? {
          ...state.currentUser,
          language: action.payload
        } : null
      };
    
    case 'TOGGLE_LANGUAGE_SELECTOR':
      return { 
        ...state, 
        showLanguageSelector: !state.showLanguageSelector 
      };
    
    case 'CLEAR_MESSAGES':
      return { ...state, messages: [] };
    
    case 'SET_LIVE_AGENT_CONNECTED':
      return { ...state, isLiveAgentConnected: action.payload };
    
    case 'UPDATE_USER_PREFERENCES':
      return {
        ...state,
        currentUser: state.currentUser ? {
          ...state.currentUser,
          preferences: {
            ...state.currentUser.preferences,
            ...action.payload
          }
        } : null
      };
    
    default:
      return state;
  }
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  // Initialize user session on mount
  useEffect(() => {
    const initializeChat = async () => {
      try {
        const sessionId = localStorage.getItem('chatbot-session-id') || 
          `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        localStorage.setItem('chatbot-session-id', sessionId);
        
        // Try to load existing user profile
        const userProfile = await chatService.getUserProfile(sessionId);
        
        if (userProfile) {
          const user: User = {
            id: sessionId,
            userType: userProfile.userType || 'visitor',
            language: userProfile.preferences?.language || 'en',
            preferences: {
              notifications: userProfile.preferences?.notifications ?? true,
              saveHistory: userProfile.preferences?.saveHistory ?? true,
              theme: userProfile.preferences?.theme || 'light',
              autoTranslate: userProfile.preferences?.autoTranslate ?? false
            },
            conversationHistory: []
          };
          
          dispatch({ type: 'SET_USER', payload: user });
          dispatch({ type: 'SET_LANGUAGE', payload: user.language });
          dispatch({ type: 'SET_CONNECTED', payload: true });
        }
        
        dispatch({ type: 'SET_CONNECTED', payload: true });
      } catch (error) {
        console.error('Failed to initialize chat:', error);
        dispatch({ type: 'SET_CONNECTED', payload: false });
      }
    };

    initializeChat();
  }, []);

  // Auto-save user preferences
  useEffect(() => {
    if (state.currentUser) {
      const savePreferences = async () => {
        try {
          await chatService.updateUserProfile(state.currentUser!.id, {
            preferences: state.currentUser!.preferences,
            userType: state.currentUser!.userType
          });
        } catch (error) {
          console.error('Failed to save user preferences:', error);
        }
      };

      const debounceTimer = setTimeout(savePreferences, 1000);
      return () => clearTimeout(debounceTimer);
    }
  }, [state.currentUser?.preferences, state.currentUser?.userType]);

  const sendMessage = async (text: string): Promise<void> => {
    if (!text.trim() || !state.currentUser) return;

    // Add user message immediately
    const userMessage: Message = {
      id: `msg_${Date.now()}_user`,
      text,
      sender: 'user',
      timestamp: new Date(),
      language: state.selectedLanguage
    };

    dispatch({ type: 'ADD_MESSAGE', payload: userMessage });
    dispatch({ type: 'SET_TYPING', payload: true });

    try {
      const response = await chatService.sendMessage({
        text,
        userId: state.currentUser.id,
        userType: state.currentUser.userType,
        language: state.selectedLanguage,
        context: {
          topic: 'general',
          userType: state.currentUser.userType,
          leadQualified: false,
          previousInteractions: state.messages.length / 2
        }
      });

      // Add bot response with delay for natural feel
      setTimeout(() => {
        const botMessage: Message = {
          id: `msg_${Date.now()}_bot`,
          text: response.text,
          sender: 'bot',
          timestamp: new Date(),
          language: response.language,
          intent: response.intent,
          confidence: response.confidence,
          emotion: response.emotion
        };

        dispatch({ type: 'ADD_MESSAGE', payload: botMessage });
      }, 1000 + Math.random() * 1000);

    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: `msg_${Date.now()}_error`,
        text: 'Sorry, I encountered an error. Please try again or contact our support team.',
        sender: 'bot',
        timestamp: new Date(),
        language: state.selectedLanguage
      };

      dispatch({ type: 'ADD_MESSAGE', payload: errorMessage });
      dispatch({ type: 'SET_TYPING', payload: false });
    }
  };

  const changeLanguage = (language: SupportedLanguage) => {
    dispatch({ type: 'SET_LANGUAGE', payload: language });
    
    // Update user preferences
    if (state.currentUser) {
      dispatch({ 
        type: 'UPDATE_USER_PREFERENCES', 
        payload: { language } 
      });
    }
  };

  const clearHistory = async () => {
    try {
      dispatch({ type: 'CLEAR_MESSAGES' });
      
      if (state.currentUser) {
        // Clear history on server
        await chatService.clearHistory?.(state.currentUser.id);
      }
    } catch (error) {
      console.error('Failed to clear history:', error);
    }
  };

  const requestLiveAgent = async (reason: string) => {
    if (!state.currentUser) return;

    try {
      const response = await chatService.requestLiveAgent(state.currentUser.id, reason);
      
      if (response?.status === 'connected' || response?.status === 'success') {
        dispatch({ type: 'SET_LIVE_AGENT_CONNECTED', payload: true });
        
        // Add agent connection message
        const agentMessage: Message = {
          id: `msg_${Date.now()}_agent`,
          text: `${response.agent?.name || 'A live agent'} has joined the conversation. How can I help you today?`,
          sender: 'bot',
          timestamp: new Date(),
          language: state.selectedLanguage
        };
        
        dispatch({ type: 'ADD_MESSAGE', payload: agentMessage });
      } else {
        // Agent unavailable
        const unavailableMessage: Message = {
          id: `msg_${Date.now()}_unavailable`,
          text: 'All our agents are currently busy. You can continue chatting with me, or try again later.',
          sender: 'bot',
          timestamp: new Date(),
          language: state.selectedLanguage
        };
        
        dispatch({ type: 'ADD_MESSAGE', payload: unavailableMessage });
      }
    } catch (error) {
      console.error('Failed to request live agent:', error);
    }
  };

  const contextValue: ChatContextType = {
    state,
    dispatch,
    sendMessage,
    changeLanguage,
    clearHistory,
    requestLiveAgent
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
