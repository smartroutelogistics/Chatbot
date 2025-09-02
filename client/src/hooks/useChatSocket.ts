import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Message } from '../types';

interface UseChatSocketReturn {
  sendMessage: (message: string) => void;
  isConnected: boolean;
  onMessage: (callback: (message: Message) => void) => void;
  onTyping: (callback: (isTyping: boolean) => void) => void;
  disconnect: () => void;
}

export const useChatSocket = (): UseChatSocketReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const messageCallbackRef = useRef<((message: Message) => void) | null>(null);
  const typingCallbackRef = useRef<((isTyping: boolean) => void) | null>(null);

  useEffect(() => {
    const serverUrl = process.env.REACT_APP_SOCKET_URL 
      || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5000');
    
    const socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    // Connection event handlers
    socket.on('connect', () => {
      console.log('Connected to chat server');
      setIsConnected(true);
    });

    socket.on('disconnect', (reason) => {
      console.log('Disconnected from chat server:', reason);
      setIsConnected(false);
    });

    socket.on('reconnect', () => {
      console.log('Reconnected to chat server');
      setIsConnected(true);
    });

    // Message handlers
    socket.on('bot_message', (data) => {
      if (messageCallbackRef.current) {
        const message: Message = {
          id: data.id || Date.now().toString(),
          text: data.text,
          sender: 'bot',
          timestamp: new Date(data.timestamp || Date.now()),
          language: data.language,
          intent: data.intent,
          confidence: data.confidence,
          emotion: data.emotion
        };
        messageCallbackRef.current(message);
      }
    });

    socket.on('typing', (data) => {
      if (typingCallbackRef.current) {
        typingCallbackRef.current(data.isTyping);
      }
    });

    socket.on('agent_joined', (data) => {
      if (messageCallbackRef.current) {
        const message: Message = {
          id: Date.now().toString(),
          text: `${data.agentName} has joined the conversation. How can I help you today?`,
          sender: 'bot',
          timestamp: new Date(),
          language: 'en'
        };
        messageCallbackRef.current(message);
      }
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  const sendMessage = (message: string) => {
    if (socketRef.current && isConnected) {
      const sessionId = localStorage.getItem('chatbot-session-id') || 'anonymous';
      
      socketRef.current.emit('user_message', {
        text: message,
        sessionId,
        timestamp: Date.now()
      });
    }
  };

  const onMessage = (callback: (message: Message) => void) => {
    messageCallbackRef.current = callback;
  };

  const onTyping = (callback: (isTyping: boolean) => void) => {
    typingCallbackRef.current = callback;
  };

  const disconnect = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
  };

  return {
    sendMessage,
    isConnected,
    onMessage,
    onTyping,
    disconnect
  };
};
