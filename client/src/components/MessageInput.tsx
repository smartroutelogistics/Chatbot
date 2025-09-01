import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { SupportedLanguage } from '../types';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  language: SupportedLanguage;
}

const InputContainer = styled.div`
  padding: 16px 20px;
  background: white;
  border-top: 1px solid #e0e0e0;
  display: flex;
  align-items: flex-end;
  gap: 12px;
`;

const InputWrapper = styled.div`
  flex: 1;
  position: relative;
`;

const TextArea = styled.textarea<{ isEmpty: boolean }>`
  width: 100%;
  min-height: 20px;
  max-height: 100px;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 20px;
  resize: none;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  line-height: 1.4;
  background: #f8f9fa;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #1976d2;
    background: white;
  }

  &:disabled {
    background: #f0f0f0;
    cursor: not-allowed;
  }

  &::placeholder {
    color: #999;
  }
`;

const SendButton = styled(motion.button)<{ canSend: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: ${props => props.canSend 
    ? 'linear-gradient(135deg, #1976d2, #1565c0)' 
    : '#e0e0e0'};
  color: ${props => props.canSend ? 'white' : '#999'};
  cursor: ${props => props.canSend ? 'pointer' : 'not-allowed'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.3s ease;

  &:hover {
    transform: ${props => props.canSend ? 'scale(1.05)' : 'none'};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const QuickActions = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;
`;

const QuickActionButton = styled(motion.button)`
  padding: 6px 12px;
  background: rgba(25, 118, 210, 0.1);
  color: #1976d2;
  border: 1px solid rgba(25, 118, 210, 0.3);
  border-radius: 16px;
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    background: rgba(25, 118, 210, 0.2);
  }
`;

const CharCount = styled.div<{ isNearLimit: boolean }>`
  position: absolute;
  bottom: -20px;
  right: 0;
  font-size: 11px;
  color: ${props => props.isNearLimit ? '#ff5722' : '#999'};
`;

const MessageInput: React.FC<MessageInputProps> = ({ 
  onSendMessage, 
  disabled = false, 
  language 
}) => {
  const [message, setMessage] = useState('');
  const [showQuickActions, setShowQuickActions] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const maxLength = 500;

  const quickActionsByLanguage = {
    en: [
      "Need dispatching help 🚚",
      "Factoring services 💰",
      "Load tracking 📍",
      "Contact support 📞"
    ],
    es: [
      "Necesito ayuda con despacho 🚚",
      "Servicios de factoring 💰", 
      "Rastreo de carga 📍",
      "Contactar soporte 📞"
    ],
    ur: [
      "ڈسپیچنگ میں مدد چاہیے 🚚",
      "فیکٹرنگ سروسز 💰",
      "لوڈ ٹریکنگ 📍", 
      "سپورٹ سے رابطہ 📞"
    ],
    zh: [
      "需要调度帮助 🚚",
      "保理服务 💰",
      "货物跟踪 📍",
      "联系客服 📞"
    ]
  };

  const placeholders = {
    en: "Type your message here...",
    es: "Escribe tu mensaje aquí...",
    ur: "یہاں اپنا پیغام ٹائپ کریں...",
    zh: "在这里输入您的消息..."
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      setShowQuickActions(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleQuickAction = (action: string) => {
    const actionText = action.split(' ').slice(0, -1).join(' '); // Remove emoji
    onSendMessage(actionText);
    setShowQuickActions(false);
  };

  const canSend = message.trim().length > 0 && message.length <= maxLength && !disabled;
  const isNearLimit = message.length > maxLength * 0.8;

  return (
    <form onSubmit={handleSubmit}>
      {showQuickActions && (
        <QuickActions>
          {quickActionsByLanguage[language].map((action, index) => (
            <QuickActionButton
              key={index}
              onClick={() => handleQuickAction(action)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {action}
            </QuickActionButton>
          ))}
        </QuickActions>
      )}

      <InputContainer>
        <InputWrapper>
          <TextArea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholders[language]}
            disabled={disabled}
            isEmpty={message.length === 0}
            maxLength={maxLength}
            onFocus={() => setShowQuickActions(false)}
          />
          <CharCount isNearLimit={isNearLimit}>
            {message.length}/{maxLength}
          </CharCount>
        </InputWrapper>

        <SendButton
          type="submit"
          canSend={canSend}
          disabled={!canSend}
          whileHover={{ scale: canSend ? 1.05 : 1 }}
          whileTap={{ scale: canSend ? 0.95 : 1 }}
        >
          {disabled ? '⏳' : '🚀'}
        </SendButton>
      </InputContainer>
    </form>
  );
};

export default MessageInput;