import { Configuration, PopupRequest } from '@azure/msal-browser';

// Environment variables for Azure AD configuration
const clientId = import.meta.env.VITE_AZURE_AD_CLIENT_ID || '';
const tenantId = import.meta.env.VITE_AZURE_AD_TENANT_ID || '';
const redirectUri = import.meta.env.VITE_AZURE_AD_REDIRECT_URI || window.location.origin;

// MSAL configuration
export const msalConfig: Configuration = {
  auth: {
    clientId: clientId,
    authority: `https://login.microsoftonline.com/${tenantId}`,
    redirectUri: redirectUri,
    postLogoutRedirectUri: window.location.origin,
    navigateToLoginRequestUrl: false, // Recommended for SPAs
  },
  cache: {
    cacheLocation: 'sessionStorage', // Recommended for security
    storeAuthStateInCookie: false, // Set to true for IE11 or Edge
  },
  system: {
    loggerOptions: {
      loggerCallback: (level: any, message: string, containsPii: boolean) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case 0: // Error
            console.error('[MSAL]', message);
            break;
          case 1: // Warning
            console.warn('[MSAL]', message);
            break;
          case 2: // Info
            console.info('[MSAL]', message);
            break;
          case 3: // Verbose
            console.debug('[MSAL]', message);
            break;
        }
      }
    }
  }
};

// Login request configuration
export const loginRequest: PopupRequest = {
  scopes: ['openid', 'profile', 'email', 'User.Read'],
  prompt: 'select_account',
};

// Silent token request configuration
export const silentRequest = {
  scopes: ['openid', 'profile', 'email', 'User.Read'],
  account: null as any, // Will be set dynamically
};

// Graph API scopes
export const graphConfig = {
  graphMeEndpoint: 'https://graph.microsoft.com/v1.0/me',
};

// API configuration
export const apiConfig = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:7071/api',
  endpoints: {
    verify: '/auth/verify',
    register: '/auth/register',
  },
};
