import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Suppress benign Vite WebSocket errors that occur when HMR is disabled
if (typeof window !== 'undefined') {
  const originalError = console.error;
  console.error = (...args) => {
    if (args[0] && typeof args[0] === 'string' && 
        (args[0].includes('[vite] failed to connect to websocket') || 
         args[0].includes('WebSocket closed without opened'))) {
      return;
    }
    originalError.apply(console, args);
  };

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const message = typeof reason === 'string' ? reason : reason?.message;
    
    if (message && typeof message === 'string' && 
        (message.includes('[vite] failed to connect to websocket') || 
         message.includes('WebSocket closed without opened'))) {
      event.preventDefault();
      event.stopPropagation();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
