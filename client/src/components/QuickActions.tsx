import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { SupportedLanguage } from '../types';

interface QuickActionsProps {
  onActionSelect: (action: string) => void;
  language: SupportedLanguage;
  userType: 'trucker' | 'shipper' | 'visitor';
  visible: boolean;
}

const QuickActionsContainer = styled(motion.div)`
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.md} 0;
  background: ${props => props.theme.colors.background.paper};
`;

const ActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: ${props => props.theme.spacing.sm};
  margin-bottom: ${props => props.theme.spacing.md};

  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    grid-template-columns: 1fr;
  }
`;

const QuickActionButton = styled(motion.button)`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background: linear-gradient(135deg, 
    rgba(25, 118, 210, 0.1) 0%, 
    rgba(21, 101, 192, 0.1) 100%);
  color: ${props => props.theme.colors.primary};
  border: 1px solid rgba(25, 118, 210, 0.2);
  border-radius: ${props => props.theme.borderRadius.lg};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: all ${props => props.theme.animation.duration.normal} ${props => props.theme.animation.easing.easeInOut};

  &:hover {
    background: linear-gradient(135deg, 
      rgba(25, 118, 210, 0.15) 0%, 
      rgba(21, 101, 192, 0.15) 100%);
    border-color: rgba(25, 118, 210, 0.3);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ActionIcon = styled.span`
  margin-right: ${props => props.theme.spacing.sm};
  font-size: ${props => props.theme.typography.fontSize.md};
  flex-shrink: 0;
`;

const ActionText = styled.span`
  flex: 1;
  text-align: left;
`;

const SectionTitle = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text.disabled};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: ${props => props.theme.spacing.sm};
  padding-left: ${props => props.theme.spacing.sm};
`;

const QuickActions: React.FC<QuickActionsProps> = ({
  onActionSelect,
  language,
  userType,
  visible
}) => {
  const quickActionsByType = {
    en: {
      trucker: [
        { icon: '🚚', text: 'Find loads nearby', action: 'I need loads in my area' },
        { icon: '💰', text: 'Factoring info', action: 'Tell me about factoring services' },
        { icon: '📋', text: 'Apply as carrier', action: 'How do I become a carrier?' },
        { icon: '📍', text: 'Track my load', action: 'I want to track my current load' },
        { icon: '📞', text: 'Contact dispatch', action: 'I need to speak with dispatch' },
        { icon: '💳', text: 'Payment status', action: 'Check my payment status' }
      ],
      shipper: [
        { icon: '📦', text: 'Ship freight', action: 'I need to ship freight' },
        { icon: '💲', text: 'Get quote', action: 'I need a shipping quote' },
        { icon: '🚛', text: 'Find carriers', action: 'Help me find reliable carriers' },
        { icon: '📍', text: 'Track shipment', action: 'I want to track my shipment' },
        { icon: '📅', text: 'Schedule pickup', action: 'I need to schedule a pickup' },
        { icon: '📞', text: 'Contact support', action: 'I need to speak with someone' }
      ],
      visitor: [
        { icon: '🔍', text: 'Our services', action: 'What services do you offer?' },
        { icon: '💼', text: 'About us', action: 'Tell me about SmartRoute Logistics' },
        { icon: '📞', text: 'Contact info', action: 'How can I contact you?' },
        { icon: '❓', text: 'Get help', action: 'I need help with something' }
      ]
    },
    es: {
      trucker: [
        { icon: '🚚', text: 'Buscar cargas', action: 'Necesito cargas en mi área' },
        { icon: '💰', text: 'Info factoring', action: 'Cuéntame sobre servicios de factoring' },
        { icon: '📋', text: 'Ser transportista', action: '¿Cómo me convierto en transportista?' },
        { icon: '📍', text: 'Rastrear carga', action: 'Quiero rastrear mi carga actual' },
        { icon: '📞', text: 'Contactar despacho', action: 'Necesito hablar con despacho' },
        { icon: '💳', text: 'Estado de pago', action: 'Verificar mi estado de pago' }
      ],
      shipper: [
        { icon: '📦', text: 'Enviar carga', action: 'Necesito enviar carga' },
        { icon: '💲', text: 'Obtener cotización', action: 'Necesito una cotización de envío' },
        { icon: '🚛', text: 'Buscar transportistas', action: 'Ayúdame a encontrar transportistas confiables' },
        { icon: '📍', text: 'Rastrear envío', action: 'Quiero rastrear mi envío' },
        { icon: '📅', text: 'Programar recogida', action: 'Necesito programar una recogida' },
        { icon: '📞', text: 'Contactar soporte', action: 'Necesito hablar con alguien' }
      ],
      visitor: [
        { icon: '🔍', text: 'Nuestros servicios', action: '¿Qué servicios ofrecen?' },
        { icon: '💼', text: 'Sobre nosotros', action: 'Cuéntame sobre SmartRoute Logistics' },
        { icon: '📞', text: 'Info de contacto', action: '¿Cómo puedo contactarlos?' },
        { icon: '❓', text: 'Obtener ayuda', action: 'Necesito ayuda con algo' }
      ]
    },
    ur: {
      trucker: [
        { icon: '🚚', text: 'لوڈز تلاش کریں', action: 'مجھے اپنے علاقے میں لوڈز چاہیے' },
        { icon: '💰', text: 'فیکٹرنگ معلومات', action: 'مجھے فیکٹرنگ سروسز کے بارے میں بتائیں' },
        { icon: '📋', text: 'کیریئر بنیں', action: 'میں کیریئر کیسے بن سکتا ہوں؟' },
        { icon: '📍', text: 'لوڈ ٹریک کریں', action: 'میں اپنا موجودہ لوڈ ٹریک کرنا چاہتا ہوں' },
        { icon: '📞', text: 'ڈسپیچ سے رابطہ', action: 'مجھے ڈسپیچ سے بات کرنی ہے' },
        { icon: '💳', text: 'پیمنٹ کی صورتحال', action: 'میری پیمنٹ کی صورتحال چیک کریں' }
      ],
      shipper: [
        { icon: '📦', text: 'مال بھیجیں', action: 'مجھے مال بھیجنا ہے' },
        { icon: '💲', text: 'قیمت حاصل کریں', action: 'مجھے شپنگ کا اقتباس چاہیے' },
        { icon: '🚛', text: 'کیریئر تلاش کریں', action: 'قابل اعتماد کیریئرز تلاش کرنے میں مدد کریں' },
        { icon: '📍', text: 'شپمنٹ ٹریک کریں', action: 'میں اپنی شپمنٹ ٹریک کرنا چاہتا ہوں' },
        { icon: '📅', text: 'پک اپ شیڈول کریں', action: 'مجھے پک اپ شیڈول کرنا ہے' },
        { icon: '📞', text: 'سپورٹ سے رابطہ', action: 'مجھے کسی سے بات کرنی ہے' }
      ],
      visitor: [
        { icon: '🔍', text: 'ہماری خدمات', action: 'آپ کیا خدمات پیش کرتے ہیں؟' },
        { icon: '💼', text: 'ہمارے بارے میں', action: 'SmartRoute Logistics کے بارے میں بتائیں' },
        { icon: '📞', text: 'رابطے کی معلومات', action: 'میں آپ سے کیسے رابطہ کر سکتا ہوں؟' },
        { icon: '❓', text: 'مدد حاصل کریں', action: 'مجھے کسی چیز میں مدد چاہیے' }
      ]
    },
    zh: {
      trucker: [
        { icon: '🚚', text: '寻找货物', action: '我需要在我的地区找货物' },
        { icon: '💰', text: '保理信息', action: '告诉我保理服务' },
        { icon: '📋', text: '成为承运商', action: '我如何成为承运商？' },
        { icon: '📍', text: '跟踪货物', action: '我想跟踪我当前的货物' },
        { icon: '📞', text: '联系调度', action: '我需要与调度交谈' },
        { icon: '💳', text: '付款状态', action: '检查我的付款状态' }
      ],
      shipper: [
        { icon: '📦', text: '运输货物', action: '我需要运输货物' },
        { icon: '💲', text: '获取报价', action: '我需要运输报价' },
        { icon: '🚛', text: '寻找承运商', action: '帮我找到可靠的承运商' },
        { icon: '📍', text: '跟踪货物', action: '我想跟踪我的货物' },
        { icon: '📅', text: '安排取货', action: '我需要安排取货' },
        { icon: '📞', text: '联系客服', action: '我需要与某人交谈' }
      ],
      visitor: [
        { icon: '🔍', text: '我们的服务', action: '你们提供什么服务？' },
        { icon: '💼', text: '关于我们', action: '告诉我SmartRoute Logistics的情况' },
        { icon: '📞', text: '联系信息', action: '我如何联系你们？' },
        { icon: '❓', text: '获取帮助', action: '我需要帮助' }
      ]
    }
  };

  const currentActions = quickActionsByType[language]?.[userType] || 
                         quickActionsByType.en[userType] || 
                         quickActionsByType.en.visitor;

  const containerVariants = {
    hidden: { 
      opacity: 0, 
      height: 0,
      transition: { duration: 0.3 }
    },
    visible: {
      opacity: 1,
      height: 'auto',
      transition: {
        duration: 0.3,
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 10,
      scale: 0.9 
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.2,
        ease: 'easeOut'
      }
    }
  };

  const getSectionTitle = () => {
    const titles = {
      en: { 
        trucker: 'Quick actions for truckers',
        shipper: 'Quick actions for shippers',
        visitor: 'How can we help?' 
      },
      es: { 
        trucker: 'Acciones rápidas para camioneros',
        shipper: 'Acciones rápidas para transportistas',
        visitor: '¿Cómo podemos ayudar?' 
      },
      ur: { 
        trucker: 'ٹرکرز کے لیے فوری اعمال',
        shipper: 'شپرز کے لیے فوری اعمال',
        visitor: 'ہم کیسے مدد کر سکتے ہیں؟' 
      },
      zh: { 
        trucker: '卡车司机快捷操作',
        shipper: '货主快捷操作',
        visitor: '我们如何帮助您？' 
      }
    };

    return titles[language]?.[userType] || titles.en[userType] || titles.en.visitor;
  };

  return (
    <AnimatePresence>
      {visible && (
        <QuickActionsContainer
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <SectionTitle>{getSectionTitle()}</SectionTitle>
          <ActionsGrid>
            {currentActions.map((action, index) => (
              <QuickActionButton
                key={index}
                variants={itemVariants}
                onClick={() => onActionSelect(action.action)}
                whileHover={{ 
                  scale: 1.02,
                  y: -2
                }}
                whileTap={{ scale: 0.98 }}
              >
                <ActionIcon>{action.icon}</ActionIcon>
                <ActionText>{action.text}</ActionText>
              </QuickActionButton>
            ))}
          </ActionsGrid>
        </QuickActionsContainer>
      )}
    </AnimatePresence>
  );
};

export default QuickActions;