import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '../types';

interface ChatHeaderProps {
  onClose: () => void;
  onLanguageSelect: () => void;
  onMinimize?: () => void;
  selectedLanguage: string;
  isConnected: boolean;
  messageCount?: number;
}

const HeaderContainer = styled.div`
  background: ${props => props.theme.colors.background.gradient};
  color: ${props => props.theme.colors.text.inverse};
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.md};
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  overflow: hidden;
  min-height: 70px;
`;

const HeaderBackground = styled.div`
  position: absolute;
  top: -50%;
  right: -10%;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  z-index: 0;
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  z-index: 1;
  position: relative;
`;

const BotAvatar = styled(motion.div)`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin-right: ${props => props.theme.spacing.md};
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  cursor: pointer;
`;

const BotInfo = styled.div`
  flex: 1;
`;

const BotName = styled.h3`
  margin: 0;
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  line-height: ${props => props.theme.typography.lineHeight.tight};
`;

const BotStatus = styled.div`
  display: flex;
  align-items: center;
  font-size: ${props => props.theme.typography.fontSize.sm};
  margin-top: 2px;
  opacity: 0.9;
  gap: ${props => props.theme.spacing.sm};
`;

const StatusDot = styled.div<{ isConnected: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.isConnected 
    ? props.theme.colors.success 
    : props.theme.colors.warning};
  animation: ${props => props.isConnected ? 'pulse 2s infinite' : 'none'};

  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.6; }
    100% { opacity: 1; }
  }
`;

const MessageCounter = styled.div`
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 6px;
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  z-index: 1;
  position: relative;
`;

const ActionButton = styled(motion.button)<{ variant?: 'primary' | 'secondary' }>`
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: ${props => props.variant === 'primary' 
    ? 'rgba(255, 255, 255, 0.3)' 
    : 'rgba(255, 255, 255, 0.2)'};
  color: ${props => props.theme.colors.text.inverse};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${props => props.theme.typography.fontSize.md};
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);

  &:hover {
    background: ${props => props.variant === 'primary' 
      ? 'rgba(255, 255, 255, 0.4)' 
      : 'rgba(255, 255, 255, 0.3)'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const LanguageIndicator = styled(motion.div)`
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 8px;
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  text-transform: uppercase;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  cursor: pointer;
  min-width: 32px;
  text-align: center;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const VoicePulse = styled(motion.div)`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${props => props.theme.colors.success};
  margin-left: 4px;
`;

const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  onClose, 
  onLanguageSelect,
  onMinimize,
  selectedLanguage, 
  isConnected,
  messageCount = 0
}) => {
  const getLanguageCode = (lang: string): string => {
    const langMap: Record<string, string> = {
      'en': 'EN',
      'es': 'ES', 
      'ur': 'اردو',
      'zh': '中'
    };
    return langMap[lang] || 'EN';
  };

  const getStatusText = () => {
    if (!isConnected) return 'Connecting...';
    return 'Online & Ready';
  };

  const avatarVariants = {
    idle: { scale: 1 },
    talking: {
      scale: [1, 1.1, 1],
      transition: { repeat: Infinity, duration: 1.5 }
    }
  };

  const pulseVariants = {
    pulse: {
      scale: [1, 1.2, 1],
      opacity: [1, 0.5, 1],
      transition: { repeat: Infinity, duration: 1.5 }
    }
  };

  return (
    <HeaderContainer>
      <HeaderBackground />
      
      <HeaderContent>
        <BotAvatar
          variants={avatarVariants}
          animate={isConnected ? 'talking' : 'idle'}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          🤖
        </BotAvatar>
        
        <BotInfo>
          <BotName>SmartRoute Assistant</BotName>
          <BotStatus>
            <StatusDot isConnected={isConnected} />
            <span>{getStatusText()}</span>
            {isConnected && (
              <VoicePulse
                variants={pulseVariants}
                animate="pulse"
              />
            )}
            {messageCount > 0 && (
              <MessageCounter>
                {messageCount} messages
              </MessageCounter>
            )}
          </BotStatus>
        </BotInfo>
      </HeaderContent>
      
      <HeaderActions>
        <LanguageIndicator
          onClick={onLanguageSelect}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Change Language"
        >
          {getLanguageCode(selectedLanguage)}
        </LanguageIndicator>
        
        <ActionButton
          onClick={onLanguageSelect}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title="Language Settings"
        >
          🌐
        </ActionButton>
        
        {onMinimize && (
          <ActionButton
            onClick={onMinimize}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Minimize Chat"
          >
            ➖
          </ActionButton>
        )}
        
        <ActionButton
          onClick={onClose}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title="Close Chat"
          variant="primary"
        >
          ✕
        </ActionButton>
      </HeaderActions>
    </HeaderContainer>
  );
};

export default ChatHeader;