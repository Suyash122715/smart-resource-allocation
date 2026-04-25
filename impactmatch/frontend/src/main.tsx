import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#e2e8f0',
            border: '1px solid rgba(20,184,166,0.2)',
            fontFamily: '"DM Sans", sans-serif',
          },
          success: { iconTheme: { primary: '#14b8a6', secondary: '#0a0f1e' } },
          error: { iconTheme: { primary: '#f97316', secondary: '#0a0f1e' } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);
