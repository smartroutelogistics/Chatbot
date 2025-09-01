import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

interface WelcomeScreenProps {
  onUserTypeSelect: (userType: 'trucker' | 'shipper') => void;
  selectedLanguage: string;
}

const WelcomeContainer = styled.div`
  padding: ${props => props.theme.spacing.xl} ${props => props.theme.spacing.md};
  text-align: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -20%;
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(25, 118, 210, 0.1) 0%, transparent 70%);
    border-radius: 50%;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -30%;
    left: -10%;
    width: 200px;
    height: 200px;
    background: radial-gradient(circle, rgba(255, 152, 0, 0.1) 0%, transparent 70%);
    border-radius: 50%;
  }
`;

const LogoContainer = styled(motion.div)`
  margin-bottom: ${props => props.theme.spacing.lg};
  position: relative;
  z-index: 1;
`;

const LogoIcon = styled.div`
  width: 80px;
  height: 80px;
  background: ${props => props.theme.colors.background.gradient};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  margin: 0 auto ${props => props.theme.spacing.md};
  box-shadow: ${props => props.theme.colors.shadow.medium};
`;

const WelcomeTitle = styled(motion.h2)`
  color: ${props => props.theme.colors.primary};
  margin-bottom: ${props => props.theme.spacing.sm};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  font-size: ${props => props.theme.typography.fontSize.xxl};
  position: relative;
  z-index: 1;

  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    font-size: ${props => props.theme.typography.fontSize.xl};
  }
`;

const WelcomeSubtitle = styled(motion.p)`
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: ${props => props.theme.spacing.xl};
  line-height: ${props => props.theme.typography.lineHeight.relaxed};
  font-size: ${props => props.theme.typography.fontSize.lg};
  max-width: 300px;
  position: relative;
  z-index: 1;

  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    font-size: ${props => props.theme.typography.fontSize.md};
  }
`;

const UserTypeButtonsContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
  width: 100%;
  max-width: 280px;
  position: relative;
  z-index: 1;
`;

const UserTypeButton = styled(motion.button)`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  padding: ${props => props.theme.spacing.lg} ${props => props.theme.spacing.md};
  border: 2px solid ${props => props.theme.colors.primary};
  border-radius: ${props => props.theme.borderRadius.lg};
  background: ${props => props.theme.colors.background.paper};
  color: ${props => props.theme.colors.primary};
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${props => props.theme.animation.duration.normal} ${props => props.theme.animation.easing.easeInOut};
  box-shadow: ${props => props.theme.colors.shadow.light};

  &:hover {
    background: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.text.inverse};
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.colors.shadow.medium};
  }

  &:active {
    transform: translateY(0);
  }
`;

const ButtonIcon = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xxl};
  margin-right: ${props => props.theme.spacing.md};
  min-width: 40px;
  text-align: center;
`;

const ButtonContent = styled.div`
  text-align: left;
  flex: 1;
`;

const ButtonTitle = styled.div`
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  margin-bottom: 2px;
`;

const ButtonDescription = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  opacity: 0.8;
  line-height: ${props => props.theme.typography.lineHeight.normal};
`;

const OrDivider = styled.div`
  display: flex;
  align-items: center;
  margin: ${props => props.theme.spacing.md} 0;
  color: ${props => props.theme.colors.text.disabled};
  font-size: ${props => props.theme.typography.fontSize.sm};

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${props => props.theme.colors.border.light};
    margin: 0 ${props => props.theme.spacing.sm};
  }
`;

const SkipButton = styled(motion.button)`
  margin-top: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background: transparent;
  color: ${props => props.theme.colors.text.disabled};
  border: 1px solid ${props => props.theme.colors.border.light};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.sm};
  cursor: pointer;
  transition: all ${props => props.theme.animation.duration.normal} ${props => props.theme.animation.easing.easeInOut};

  &:hover {
    color: ${props => props.theme.colors.text.secondary};
    border-color: ${props => props.theme.colors.border.medium};
  }
`;

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ 
  onUserTypeSelect, 
  selectedLanguage 
}) => {
  const content = {
    en: {
      title: 'Welcome to SmartRoute!',
      subtitle: 'I\'m your intelligent logistics assistant. Let me know how I can help you today.',
      truckerTitle: 'I\'m a Trucker/Driver',
      truckerDesc: 'Get help with dispatching, loads, and factoring',
      shipperTitle: 'I\'m a Shipper/Client', 
      shipperDesc: 'Find carriers and manage your freight',
      skip: 'Just browse services',
      or: 'or'
    },
    es: {
      title: '¡Bienvenido a SmartRoute!',
      subtitle: 'Soy tu asistente inteligente de logística. Déjame saber cómo puedo ayudarte hoy.',
      truckerTitle: 'Soy Camionero/Conductor',
      truckerDesc: 'Obtén ayuda con despacho, cargas y factoring',
      shipperTitle: 'Soy Transportista/Cliente',
      shipperDesc: 'Encuentra transportistas y gestiona tu carga',
      skip: 'Solo explorar servicios',
      or: 'o'
    },
    ur: {
      title: 'SmartRoute میں خوش آمدید!',
      subtitle: 'میں آپ کا ذہین لاجسٹکس اسسٹنٹ ہوں۔ مجھے بتائیں کہ آج میں آپ کی کیسے مدد کر سکتا ہوں۔',
      truckerTitle: 'میں ٹرکر/ڈرائیور ہوں',
      truckerDesc: 'ڈسپیچنگ، لوڈز، اور فیکٹرنگ میں مدد حاصل کریں',
      shipperTitle: 'میں شپر/کلائنٹ ہوں',
      shipperDesc: 'کیریئرز تلاش کریں اور اپنا مال منظم کریں',
      skip: 'صرف سروسز دیکھیں',
      or: 'یا'
    },
    zh: {
      title: '欢迎来到 SmartRoute！',
      subtitle: '我是您的智能物流助手。请告诉我今天我能为您提供什么帮助。',
      truckerTitle: '我是卡车司机',
      truckerDesc: '获得调度、货物和保理方面的帮助',
      shipperTitle: '我是货主/客户',
      shipperDesc: '寻找承运商并管理您的货物',
      skip: '只是浏览服务',
      or: '或者'
    }
  };

  const currentContent = content[selectedLanguage as keyof typeof content] || content.en;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut'
      }
    }
  };

  return (
    <WelcomeContainer>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <LogoContainer variants={itemVariants}>
          <LogoIcon>🚚</LogoIcon>
        </LogoContainer>

        <WelcomeTitle variants={itemVariants}>
          {currentContent.title}
        </WelcomeTitle>

        <WelcomeSubtitle variants={itemVariants}>
          {currentContent.subtitle}
        </WelcomeSubtitle>

        <UserTypeButtonsContainer variants={itemVariants}>
          <UserTypeButton
            onClick={() => onUserTypeSelect('trucker')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ButtonIcon>🚛</ButtonIcon>
            <ButtonContent>
              <ButtonTitle>{currentContent.truckerTitle}</ButtonTitle>
              <ButtonDescription>{currentContent.truckerDesc}</ButtonDescription>
            </ButtonContent>
          </UserTypeButton>

          <UserTypeButton
            onClick={() => onUserTypeSelect('shipper')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ButtonIcon>🏢</ButtonIcon>
            <ButtonContent>
              <ButtonTitle>{currentContent.shipperTitle}</ButtonTitle>
              <ButtonDescription>{currentContent.shipperDesc}</ButtonDescription>
            </ButtonContent>
          </UserTypeButton>

          <OrDivider>{currentContent.or}</OrDivider>

          <SkipButton
            onClick={() => onUserTypeSelect('shipper')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {currentContent.skip}
          </SkipButton>
        </UserTypeButtonsContainer>
      </motion.div>
    </WelcomeContainer>
  );
};

export default WelcomeScreen;