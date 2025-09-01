import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { SupportedLanguage } from '../types';
import { useChat } from '../contexts/ChatContext';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import LanguageSelector from './LanguageSelector';
import TypingIndicator from './TypingIndicator';
import WelcomeScreen from './WelcomeScreen';
import QuickActions from './QuickActions';
import ChatMetrics from './ChatMetrics';

const ChatContainer = styled(motion.div)<{ isMinimized?: boolean }>`
  position: fixed;
  bottom: ${props => props.isMinimized ? '20px' : '20px'};
  right: 20px;
  width: ${props => props.isMinimized ? '60px' : '380px'};
  height: ${props => props.isMinimized ? '60px' : '600px'};
  background: ${props => props.theme.colors.background.paper};
  border-radius: ${props => props.isMinimized ? '50%' : props.theme.borderRadius.xxl};
  box-shadow: ${props => props.theme.colors.shadow.heavy};
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: ${props => props.theme.zIndex.chatbot};
  font-family: ${props => props.theme.typography.fontFamily};

  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    width: ${props => props.isMinimized ? '60px' : '100%'};
    height: ${props => props.isMinimized ? '60px' : '100%'};
    bottom: ${props => props.isMinimized ? '20px' : '0'};
    right: ${props => props.isMinimized ? '20px' : '0'};
    border-radius: ${props => props.isMinimized ? '50%' : '0'};
  }
`;

const ChatToggle = styled(motion.div)<{ hasNotification?: boolean }>`
  position: relative;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: ${props => props.theme.colors.background.gradient};
  color: ${props => props.theme.colors.text.inverse};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 24px;
  box-shadow: ${props => props.theme.colors.shadow.medium};
  
  &::after {
    content: '';
    position: absolute;
    top: -2px;
    right: -2px;
    width: 12px;
    height: 12px;
    background: ${props => props.theme.colors.error};
    border-radius: 50%;
    opacity: ${props => props.hasNotification ? 1 : 0};
    animation: ${props => props.hasNotification ? 'pulse 2s infinite' : 'none'};
  }

  &:hover {
    transform: scale(1.05);
  }
`;

const ChatBody = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const PoweredBy = styled.div`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  text-align: center;
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.disabled};
  border-top: 1px solid ${props => props.theme.colors.border.light};
  background: ${props => props.theme.colors.background.default};
`;

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const { state, sendMessage, changeLanguage, requestLiveAgent } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
  }, [state.messages]);

  // Show notification when bot sends message while chat is closed
  useEffect(() => {
    if (!isOpen && state.messages.length > 0) {
      const lastMessage = state.messages[state.messages.length - 1];
      if (lastMessage.sender === 'bot') {
        setHasNewMessage(true);
      }
    }
  }, [state.messages, isOpen]);

  const handleToggleChat = () => {
    setIsOpen(!isOpen);
    setHasNewMessage(false);
  };

  const handleUserTypeSelection = async (userType: 'trucker' | 'shipper') => {
    // Update user type in context
    const newUser = {
      ...state.currentUser!,
      userType
    };
    
    // Send welcome message
    const welcomeMessage = getWelcomeMessage(userType, state.selectedLanguage);
    await sendMessage(`I am a ${userType}`);
    
    setShowWelcome(false);
  };

  const handleSendMessage = async (text: string) => {
    await sendMessage(text);
    
    // Hide welcome screen after first message
    if (showWelcome) {
      setShowWelcome(false);
    }
  };

  const handleLanguageChange = (language: SupportedLanguage) => {
    changeLanguage(language);
  };

  const getWelcomeMessage = (userType: 'trucker' | 'shipper', language: string) => {
    const messages = {
      en: {
        trucker: "🚚 Welcome, trucker! I'm here to help with dispatching, load finding, factoring services, and everything you need to keep your business rolling. What can I assist you with today?",
        shipper: "🏢 Welcome, shipper! I'm here to help you find reliable carriers, get competitive rates, and ensure your freight gets delivered safely and on time. How can I help you today?"
      },
      es: {
        trucker: "🚚 ¡Bienvenido, camionero! Estoy aquí para ayudarte con despacho, búsqueda de cargas, servicios de factoring y todo lo que necesitas para mantener tu negocio en marcha. ¿En qué puedo ayudarte hoy?",
        shipper: "🏢 ¡Bienvenido, transportista! Estoy aquí para ayudarte a encontrar transportistas confiables, obtener tarifas competitivas y asegurar que tu carga se entregue de manera segura y a tiempo. ¿Cómo puedo ayudarte hoy?"
      }
    };
    
    return messages[language as keyof typeof messages]?.[userType] || messages.en[userType];
  };

  const chatVariants = {
    closed: {
      width: 60,
      height: 60,
      borderRadius: '50%',
      transition: { duration: 0.3, ease: 'easeInOut' }
    },
    open: {
      width: window.innerWidth <= 768 ? '100vw' : 380,
      height: window.innerWidth <= 768 ? '100vh' : 600,
      borderRadius: window.innerWidth <= 768 ? '0px' : '20px',
      transition: { duration: 0.3, ease: 'easeInOut' }
    }
  };

  return (
    <ChatContainer
      initial="closed"
      animate={isOpen ? "open" : "closed"}
      variants={chatVariants}
      isMinimized={!isOpen}
    >
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <ChatToggle
            key="toggle"
            onClick={handleToggleChat}
            hasNotification={hasNewMessage}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ rotate: 0 }}
            animate={{ rotate: 0 }}
            exit={{ rotate: 45 }}
          >
            💬
          </ChatToggle>
        ) : (
          <motion.div
            key="chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
          >
            <ChatHeader
              onClose={handleToggleChat}
              onLanguageSelect={() => {}}
              onMinimize={() => setIsOpen(false)}
              selectedLanguage={state.selectedLanguage}
              isConnected={state.isConnected}
              messageCount={state.messages.length}
            />

            {state.showLanguageSelector && (
              <LanguageSelector
                selectedLanguage={state.selectedLanguage as SupportedLanguage}
                onLanguageSelect={handleLanguageChange}
              />
            )}

            <ChatBody>
              {showWelcome && !state.messages.length ? (
                <WelcomeScreen
                  onUserTypeSelect={handleUserTypeSelection}
                  selectedLanguage={state.selectedLanguage}
                />
              ) : (
                <>
                  <MessageList 
                    messages={state.messages}
                    isTyping={state.isTyping}
                  />
                  
                  {state.isTyping && <TypingIndicator />}
                  
                  <div ref={messagesEndRef} />
                  
                  <QuickActions
                    onActionSelect={handleSendMessage}
                    language={state.selectedLanguage as SupportedLanguage}
                    userType={state.currentUser?.userType || 'visitor'}
                    visible={state.messages.length < 3}
                  />
                  
                  <MessageInput 
                    onSendMessage={handleSendMessage}
                    disabled={!state.isConnected}
                    language={state.selectedLanguage as SupportedLanguage}
                  />
                </>
              )}
            </ChatBody>

            {process.env.NODE_ENV === 'development' && (
              <ChatMetrics
                messageCount={state.messages.length}
                isConnected={state.isConnected}
                userType={state.currentUser?.userType}
              />
            )}

            <PoweredBy>
              Powered by SmartRoute Intelligence
            </PoweredBy>
          </motion.div>
        )}
      </AnimatePresence>
    </ChatContainer>
  );
};

export default Chatbot;