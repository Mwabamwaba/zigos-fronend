import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import { msalConfig } from './config/authConfig';
import { AuthProvider } from './providers/AuthProvider';
import { ErrorBoundary } from './components/ErrorBoundary';
import App from './App.tsx';
import './index.css';

// Create MSAL instance
const msalInstance = new PublicClientApplication(msalConfig);

// Initialize MSAL instance
msalInstance.initialize().then(() => {
  // Handle the redirect promise to process any pending authentication
  msalInstance.handleRedirectPromise()
    .then((response) => {
      if (response) {
        console.log('MSAL: Redirect authentication successful:', response);
      }
    })
    .catch((error) => {
      console.error('MSAL: Redirect authentication failed:', error);
    });

  createRoot(document.getElementById('root')!).render(
    <ErrorBoundary>
      <BrowserRouter>
        <MsalProvider instance={msalInstance}>
          <AuthProvider>
            <App />
          </AuthProvider>
        </MsalProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}).catch((error) => {
  console.error('MSAL: Failed to initialize:', error);
});