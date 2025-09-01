import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '../types';

interface LanguageSelectorProps {
  selectedLanguage: SupportedLanguage;
  onLanguageSelect: (language: SupportedLanguage) => void;
}

const SelectorContainer = styled(motion.div)`
  background: white;
  border-bottom: 1px solid #e0e0e0;
  padding: 16px 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const SelectorTitle = styled.h4`
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const LanguageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
`;

const LanguageButton = styled(motion.button)<{ isSelected: boolean }>`
  padding: 12px 16px;
  border: 2px solid ${props => props.isSelected ? '#1976d2' : '#e0e0e0'};
  border-radius: 12px;
  background: ${props => props.isSelected ? 'rgba(25, 118, 210, 0.1)' : 'white'};
  color: ${props => props.isSelected ? '#1976d2' : '#333'};
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.3s ease;
  text-align: center;

  &:hover {
    border-color: #1976d2;
    background: rgba(25, 118, 210, 0.05);
  }
`;

const LanguageFlag = styled.span`
  font-size: 16px;
`;

const LanguageName = styled.span`
  font-size: 12px;
`;

const languageFlags: Record<SupportedLanguage, string> = {
  en: '🇺🇸',
  es: '🇪🇸',
  ur: '🇵🇰',
  zh: '🇨🇳'
};

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onLanguageSelect
}) => {
  return (
    <AnimatePresence>
      <SelectorContainer
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.3 }}
      >
        <SelectorTitle>
          🌐 Choose Language / Idioma / زبان / 语言
        </SelectorTitle>
        
        <LanguageGrid>
          {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
            <LanguageButton
              key={code}
              isSelected={selectedLanguage === code}
              onClick={() => onLanguageSelect(code as SupportedLanguage)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <LanguageFlag>
                {languageFlags[code as SupportedLanguage]}
              </LanguageFlag>
              <div>
                <LanguageName>{name}</LanguageName>
              </div>
            </LanguageButton>
          ))}
        </LanguageGrid>
      </SelectorContainer>
    </AnimatePresence>
  );
};

export default LanguageSelector;