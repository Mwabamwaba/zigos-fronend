import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { useMsal, useIsAuthenticated, useAccount } from '@azure/msal-react';
import { loginRequest } from '../config/authConfig';
import apiService from '../services/apiService';

interface User {
  id: string;
  email: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}

interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  needsSetup: boolean;
  setupData: { email: string; firstName: string; lastName: string } | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setAuthenticated: (authenticated: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setNeedsSetup: (needsSetup: boolean, setupData?: { email: string; firstName: string; lastName: string } | null) => void;
  clearError: () => void;
  initializeAuth: (msalInstance: any, account: any, isAuthenticatedMsal: boolean) => Promise<void>;
  login: (msalInstance: any, method?: 'redirect' | 'popup') => Promise<void>;
  logout: (msalInstance: any) => void;
  verifyUser: (msalInstance: any, account: any) => Promise<{ exists: boolean; email?: string; name?: string }>;
  registerUser: (userData: { name: string; email: string }, account: any) => Promise<boolean>;
  completeSetup: () => void;
  acquireToken: (msalInstance: any, account: any) => Promise<string | null>;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,
      needsSetup: false,
      setupData: null,

      // Actions
      setUser: (user) => set({ user }),
      setAuthenticated: (authenticated) => set({ isAuthenticated: authenticated }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      setNeedsSetup: (needsSetup, setupData = null) => set({ needsSetup, setupData }),
      clearError: () => set({ error: null }),

      initializeAuth: async (msalInstance, account, isAuthenticatedMsal) => {
        set({ isLoading: true, error: null, needsSetup: false, setupData: null });

        if (isAuthenticatedMsal && account) {
          try {
            const idTokenResult = await msalInstance.acquireTokenSilent({
              ...loginRequest,
              account: account,
            });
            const idToken = idTokenResult.idToken;

            // Send ID token to backend for verification
            const response = await apiService.verifyAuth(idToken) as {
              exists: boolean;
              email?: string;
              name?: string;
            };

            if (response.exists) {
              const user: User = {
                id: account.homeAccountId,
                email: account.username,
                fullName: account.name || account.username,
                firstName: account.name?.split(' ')[0],
                lastName: account.name?.split(' ').slice(1).join(' '),
                role: 'User', // Default role, can be fetched from backend
              };
              set({ 
                user, 
                isAuthenticated: true,
                needsSetup: false 
              });
            } else {
              set({
                needsSetup: true,
                setupData: {
                  email: response.email || account.username,
                  firstName: response.name?.split(' ')[0] || '',
                  lastName: response.name?.split(' ').slice(1).join(' ') || '',
                },
                user: null,
                isAuthenticated: false
              });
            }
          } catch (err) {
            console.error('AuthStore: Error during token acquisition or verification:', err);
            set({ 
              error: 'Failed to verify authentication. Please try again.',
              user: null,
              isAuthenticated: false,
              needsSetup: false 
            });
          }
        } else {
          set({ 
            user: null,
            isAuthenticated: false,
            needsSetup: false 
          });
        }
        set({ isLoading: false });
      },

      login: async (msalInstance, method = 'redirect') => {
        set({ error: null });
        try {
          if (method === 'popup') {
            await msalInstance.loginPopup(loginRequest);
          } else {
            await msalInstance.loginRedirect(loginRequest);
          }
        } catch (err) {
          console.error('AuthStore: Login failed:', err);
          set({ error: 'Login failed. Please try again.' });
        }
      },

      logout: (msalInstance) => {
        msalInstance.logoutRedirect();
        set({
          user: null,
          isAuthenticated: false,
          needsSetup: false,
          setupData: null,
          error: null
        });
      },

      acquireToken: async (msalInstance, account) => {
        if (!account) {
          set({ error: 'No active account found for token acquisition.' });
          return null;
        }
        try {
          const response = await msalInstance.acquireTokenSilent({
            ...loginRequest,
            account: account,
          });
          return response.accessToken;
        } catch (err) {
          console.error('AuthStore: Failed to acquire token silently:', err);
          set({ error: 'Failed to acquire token. Please log in again.' });
          return null;
        }
      },

      verifyUser: async (msalInstance, account) => {
        if (!account) {
          throw new Error('No active account found');
        }

        try {
          const idTokenResult = await msalInstance.acquireTokenSilent({
            ...loginRequest,
            account: account,
          });
          
          const response = await apiService.verifyAuth(idTokenResult.idToken) as {
            exists: boolean;
            email?: string;
            name?: string;
          };
          return response;
        } catch (err) {
          console.error('AuthStore: User verification failed:', err);
          throw err;
        }
      },

      registerUser: async (userData, account) => {
        try {
          const response = await apiService.registerUser({
            name: userData.name,
            email: userData.email,
            azureAdObjectId: account?.localAccountId,
          }) as { success: boolean };
          
          return response.success === true;
        } catch (err) {
          console.error('AuthStore: User registration failed:', err);
          throw err;
        }
      },

      completeSetup: () => {
        set({ needsSetup: false, setupData: null });
        // After setup, user should be able to log in normally
        // Re-initialization will happen through the auth provider
      },
    }),
    {
      name: 'auth-store',
    }
  )
);
