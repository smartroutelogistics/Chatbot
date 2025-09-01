import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatMetricsProps {
  messageCount: number;
  isConnected: boolean;
  userType?: string;
}

const MetricsContainer = styled(motion.div)`
  background: ${props => props.theme.colors.background.default};
  border-top: 1px solid ${props => props.theme.colors.border.light};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.disabled};
`;

const MetricsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  user-select: none;
`;

const MetricsTitle = styled.div`
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const ToggleIcon = styled(motion.div)`
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MetricsGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: ${props => props.theme.spacing.sm};
  margin-top: ${props => props.theme.spacing.sm};
`;

const MetricItem = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.sm};
  background: ${props => props.theme.colors.background.paper};
  border-radius: ${props => props.theme.borderRadius.md};
  border: 1px solid ${props => props.theme.colors.border.light};
`;

const MetricValue = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.primary};
  margin-bottom: 2px;
`;

const MetricLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.text.disabled};
`;

const ChatMetrics: React.FC<ChatMetricsProps> = ({
  messageCount,
  isConnected,
  userType
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const metrics = [
    {
      value: messageCount,
      label: 'Messages',
      color: '#1976d2'
    },
    {
      value: isConnected ? 'Online' : 'Offline',
      label: 'Status',
      color: isConnected ? '#4caf50' : '#f44336'
    },
    {
      value: userType || 'Unknown',
      label: 'User Type',
      color: '#ff9800'
    },
    {
      value: `${Math.floor(Math.random() * 100)}ms`,
      label: 'Response Time',
      color: '#9c27b0'
    }
  ];

  return (
    <MetricsContainer>
      <MetricsHeader onClick={() => setIsExpanded(!isExpanded)}>
        <MetricsTitle>
          🔧 Debug Info
        </MetricsTitle>
        <ToggleIcon
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          ▼
        </ToggleIcon>
      </MetricsHeader>

      <AnimatePresence>
        {isExpanded && (
          <MetricsGrid
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {metrics.map((metric, index) => (
              <MetricItem key={index}>
                <MetricValue style={{ color: metric.color }}>
                  {metric.value}
                </MetricValue>
                <MetricLabel>{metric.label}</MetricLabel>
              </MetricItem>
            ))}
          </MetricsGrid>
        )}
      </AnimatePresence>
    </MetricsContainer>
  );
};

export default ChatMetrics;