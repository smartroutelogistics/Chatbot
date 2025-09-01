import React from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';

const bounce = keyframes`
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-10px);
  }
`;

const TypingContainer = styled(motion.div)`
  display: flex;
  align-items: center;
  padding: 20px;
  background: #f8f9fa;
`;

const Avatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1976d2, #1565c0);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  margin-right: 12px;
  flex-shrink: 0;
`;

const TypingBubble = styled.div`
  background: white;
  padding: 16px 20px;
  border-radius: 20px 20px 20px 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 4px;
`;

const TypingDot = styled.div`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #1976d2;
  animation: ${bounce} 1.4s infinite ease-in-out;

  &:nth-child(1) {
    animation-delay: -0.32s;
  }

  &:nth-child(2) {
    animation-delay: -0.16s;
  }

  &:nth-child(3) {
    animation-delay: 0;
  }
`;

const TypingText = styled.span`
  margin-left: 12px;
  font-size: 12px;
  color: #666;
  font-style: italic;
`;

const TypingIndicator: React.FC = () => {
  return (
    <TypingContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Avatar>🤖</Avatar>
      <TypingBubble>
        <TypingDot />
        <TypingDot />
        <TypingDot />
      </TypingBubble>
      <TypingText>SmartRoute Assistant is typing...</TypingText>
    </TypingContainer>
  );
};

export default TypingIndicator;