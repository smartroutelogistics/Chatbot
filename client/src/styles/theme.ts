export const theme = {
  colors: {
    primary: '#1976d2',
    primaryDark: '#1565c0',
    primaryLight: '#42a5f5',
    secondary: '#ff9800',
    secondaryDark: '#f57c00',
    secondaryLight: '#ffb74d',
    
    success: '#4caf50',
    successDark: '#388e3c',
    successLight: '#81c784',
    
    error: '#f44336',
    errorDark: '#d32f2f',
    errorLight: '#ef5350',
    
    warning: '#ff9800',
    warningDark: '#f57c00',
    warningLight: '#ffb74d',
    
    info: '#2196f3',
    infoDark: '#1976d2',
    infoLight: '#64b5f6',
    
    background: {
      default: '#f5f7fa',
      paper: '#ffffff',
      dark: '#1e1e1e',
      gradient: 'linear-gradient(135deg, #1976d2, #1565c0)'
    },
    
    text: {
      primary: '#333333',
      secondary: '#666666',
      disabled: '#999999',
      inverse: '#ffffff'
    },
    
    border: {
      light: '#e0e0e0',
      medium: '#c0c0c0',
      dark: '#a0a0a0'
    },
    
    shadow: {
      light: '0 2px 8px rgba(0, 0, 0, 0.1)',
      medium: '0 4px 16px rgba(0, 0, 0, 0.15)',
      heavy: '0 8px 30px rgba(0, 0, 0, 0.2)'
    }
  },
  
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px'
  },
  
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontSize: {
      xs: '10px',
      sm: '12px',
      md: '14px',
      lg: '16px',
      xl: '18px',
      xxl: '24px',
      xxxl: '32px'
    },
    fontWeight: {
      light: 300,
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.4,
      relaxed: 1.6,
      loose: 1.8
    }
  },
  
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    xxl: '20px',
    round: '50%'
  },
  
  breakpoints: {
    mobile: '480px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1200px'
  },
  
  animation: {
    duration: {
      fast: '0.2s',
      normal: '0.3s',
      slow: '0.5s'
    },
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)'
    }
  },
  
  zIndex: {
    tooltip: 1500,
    modal: 1400,
    overlay: 1300,
    dropdown: 1200,
    header: 1100,
    chatbot: 1000
  }
};

export type Theme = typeof theme;