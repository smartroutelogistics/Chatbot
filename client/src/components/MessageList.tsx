import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Message } from '../types';
import { formatDistanceToNow } from 'date-fns';
import ReactMarkdown from 'react-markdown';

interface MessageListProps {
  messages: Message[];
  isTyping?: boolean;
}

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.background.default};
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.border.light};
    border-radius: ${props => props.theme.borderRadius.sm};
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: ${props => props.theme.colors.border.medium};
  }
`;

const MessageBubble = styled(motion.div)<{ isUser: boolean }>`
  display: flex;
  justify-content: ${props => props.isUser ? 'flex-end' : 'flex-start'};
  margin: ${props => props.theme.spacing.md} 0;
`;

const MessageWrapper = styled.div<{ isUser: boolean }>`
  display: flex;
  align-items: flex-end;
  flex-direction: ${props => props.isUser ? 'row-reverse' : 'row'};
  max-width: 85%;
  gap: ${props => props.theme.spacing.sm};

  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    max-width: 95%;
  }
`;

const Avatar = styled(motion.div)<{ isUser: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.isUser 
    ? 'linear-gradient(135deg, #4caf50, #45a049)' 
    : props.theme.colors.background.gradient};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
  box-shadow: ${props => props.theme.colors.shadow.light};
  border: 2px solid ${props => props.theme.colors.background.paper};
`;

const MessageContent = styled(motion.div)<{ isUser: boolean }>`
  background: ${props => props.isUser 
    ? props.theme.colors.background.gradient
    : props.theme.colors.background.paper};
  color: ${props => props.isUser 
    ? props.theme.colors.text.inverse 
    : props.theme.colors.text.primary};
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  border-radius: ${props => props.isUser 
    ? `${props.theme.borderRadius.xl} ${props.theme.borderRadius.xl} ${props.theme.borderRadius.sm} ${props.theme.borderRadius.xl}` 
    : `${props.theme.borderRadius.xl} ${props.theme.borderRadius.xl} ${props.theme.borderRadius.xl} ${props.theme.borderRadius.sm}`};
  box-shadow: ${props => props.theme.colors.shadow.light};
  word-wrap: break-word;
  line-height: ${props => props.theme.typography.lineHeight.relaxed};
  position: relative;
  max-width: 100%;

  /* Markdown styles */
  p {
    margin: 0 0 ${props => props.theme.spacing.sm} 0;
    
    &:last-child {
      margin-bottom: 0;
    }
  }

  strong {
    font-weight: ${props => props.theme.typography.fontWeight.semibold};
  }

  em {
    font-style: italic;
  }

  ul, ol {
    margin: ${props => props.theme.spacing.sm} 0;
    padding-left: ${props => props.theme.spacing.lg};
  }

  li {
    margin: ${props => props.theme.spacing.xs} 0;
  }

  code {
    background: ${props => props.isUser 
      ? 'rgba(255, 255, 255, 0.2)' 
      : props.theme.colors.background.default};
    padding: 2px 4px;
    border-radius: ${props => props.theme.borderRadius.sm};
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 0.9em;
  }

  pre {
    background: ${props => props.isUser 
      ? 'rgba(255, 255, 255, 0.1)' 
      : props.theme.colors.background.default};
    padding: ${props => props.theme.spacing.sm};
    border-radius: ${props => props.theme.borderRadius.md};
    overflow-x: auto;
    margin: ${props => props.theme.spacing.sm} 0;
    
    code {
      background: none;
      padding: 0;
    }
  }
`;

const MessageMeta = styled.div<{ isUser: boolean }>`
  display: flex;
  align-items: center;
  justify-content: ${props => props.isUser ? 'flex-end' : 'flex-start'};
  margin: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm} 0;
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.disabled};
  gap: ${props => props.theme.spacing.xs};
  flex-wrap: wrap;
`;

const MessageTime = styled.span`
  white-space: nowrap;
`;

const ConfidenceIndicator = styled.span<{ confidence: number }>`
  background: ${props => {
    if (props.confidence >= 0.8) return props.theme.colors.success;
    if (props.confidence >= 0.6) return props.theme.colors.warning;
    return props.theme.colors.error;
  }};
  color: ${props => props.theme.colors.text.inverse};
  padding: 2px 6px;
  border-radius: ${props => props.theme.borderRadius.lg};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  white-space: nowrap;
`;

const IntentTag = styled.span`
  background: rgba(25, 118, 210, 0.1);
  color: ${props => props.theme.colors.primary};
  padding: 2px 6px;
  border-radius: ${props => props.theme.borderRadius.lg};
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  text-transform: capitalize;
  white-space: nowrap;
`;

const EmotionIndicator = styled.span`
  font-size: ${props => props.theme.typography.fontSize.sm};
  margin-right: ${props => props.theme.spacing.xs};
`;

const SystemMessage = styled(motion.div)`
  text-align: center;
  margin: ${props => props.theme.spacing.lg} 0;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background: rgba(25, 118, 210, 0.1);
  color: ${props => props.theme.colors.primary};
  border-radius: ${props => props.theme.borderRadius.lg};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  border: 1px solid rgba(25, 118, 210, 0.2);
`;

const MessageList: React.FC<MessageListProps> = ({ messages, isTyping }) => {
  const getEmotionEmoji = (emotion?: string) => {
    const emotionMap: Record<string, string> = {
      'positive': '😊',
      'negative': '😔',
      'neutral': '😐',
      'angry': '😠',
      'happy': '😄',
      'sad': '😢',
      'frustrated': '😤',
      'excited': '🤩',
      'surprised': '😲',
      'confused': '🤔'
    };
    return emotion ? emotionMap[emotion] || '😐' : '';
  };

  const formatTimestamp = (date: Date) => {
    try {
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return 'just now';
    }
  };

  const messageVariants = {
    initial: { 
      opacity: 0, 
      y: 20,
      scale: 0.9 
    },
    animate: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: 'easeOut'
      }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      scale: 0.9,
      transition: {
        duration: 0.2
      }
    }
  };

  const avatarVariants = {
    initial: { scale: 0 },
    animate: { 
      scale: 1,
      transition: {
        delay: 0.1,
        type: 'spring',
        stiffness: 500,
        damping: 25
      }
    }
  };

  if (!messages.length && !isTyping) {
    return (
      <MessagesContainer>
        <SystemMessage
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          👋 Start a conversation! Ask me anything about SmartRoute Logistics.
        </SystemMessage>
      </MessagesContainer>
    );
  }

  return (
    <MessagesContainer>
      <AnimatePresence mode="popLayout">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            isUser={message.sender === 'user'}
            variants={messageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            layout
          >
            <MessageWrapper isUser={message.sender === 'user'}>
              <Avatar 
                isUser={message.sender === 'user'}
                variants={avatarVariants}
                initial="initial"
                animate="animate"
                whileHover={{ scale: 1.1 }}
              >
                {message.sender === 'user' ? '👤' : '🤖'}
              </Avatar>
              
              <div style={{ flex: 1, minWidth: 0 }}>
                <MessageContent 
                  isUser={message.sender === 'user'}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <ReactMarkdown>{message.text}</ReactMarkdown>
                </MessageContent>
                
                <MessageMeta isUser={message.sender === 'user'}>
                  {message.emotion && (
                    <EmotionIndicator>
                      {getEmotionEmoji(message.emotion)}
                    </EmotionIndicator>
                  )}
                  
                  <MessageTime>
                    {formatTimestamp(message.timestamp)}
                  </MessageTime>
                  
                  {message.intent && message.sender === 'bot' && (
                    <IntentTag>{message.intent.replace('_', ' ')}</IntentTag>
                  )}
                  
                  {message.confidence && message.confidence < 1 && (
                    <ConfidenceIndicator confidence={message.confidence}>
                      {Math.round(message.confidence * 100)}%
                    </ConfidenceIndicator>
                  )}
                </MessageMeta>
              </div>
            </MessageWrapper>
          </MessageBubble>
        ))}
      </AnimatePresence>
    </MessagesContainer>
  );
};

export default MessageList;