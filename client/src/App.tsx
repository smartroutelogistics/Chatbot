import React from 'react';
import { createGlobalStyle, ThemeProvider } from 'styled-components';
import Chatbot from './components/Chatbot';
import { ChatProvider } from './contexts/ChatContext';
import { theme } from './styles/theme';

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: #f5f7fa;
    line-height: 1.6;
  }

  code {
    font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace;
  }

  button {
    border: none;
    background: none;
    cursor: pointer;
    font-family: inherit;
  }

  input, textarea {
    font-family: inherit;
    outline: none;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  ::-webkit-scrollbar {
    width: 6px;
  }

  ::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  ::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }

  /* RTL support for Urdu */
  .rtl {
    direction: rtl;
    text-align: right;
  }

  /* Animation classes */
  .fade-in {
    animation: fadeIn 0.3s ease-in-out;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .pulse {
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.7; }
    100% { opacity: 1; }
  }

  /* Mobile responsive */
  @media (max-width: 768px) {
    body {
      font-size: 14px;
    }
  }
`;

const DemoPage = () => (
  <div style={{ 
    minHeight: '100vh', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    color: '#666',
    fontSize: '18px',
    textAlign: 'center',
    padding: '20px'
  }}>
    <div>
      <div style={{ 
        background: 'linear-gradient(135deg, #1976d2, #1565c0)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        fontSize: '32px',
        fontWeight: 'bold',
        marginBottom: '16px'
      }}>
        SmartRoute Logistics
      </div>
      <div style={{ marginBottom: '8px' }}>
        Welcome to our logistics platform
      </div>
      <div style={{ fontSize: '14px', opacity: 0.7 }}>
        The intelligent chatbot will appear in the bottom-right corner
      </div>
    </div>
  </div>
);

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <ChatProvider>
        <GlobalStyle />
        <div className="App">
          {/* Demo page content */}
          <DemoPage />
          
          {/* Chatbot Component - will render as floating widget */}
          <Chatbot />
        </div>
      </ChatProvider>
    </ThemeProvider>
  );
};

export default App;