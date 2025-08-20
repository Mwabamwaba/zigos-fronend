import React, { useEffect, ReactNode } from 'react';
import { useMsal, useIsAuthenticated, useAccount } from '@azure/msal-react';
import { useAuthStore } from '../store/authStore';

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider component that initializes and manages authentication state using Zustand
 * This component wraps the app and handles MSAL integration with our Zustand auth store
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { instance, accounts, inProgress } = useMsal();
  const isAuthenticatedMsal = useIsAuthenticated();
  const account = useAccount(accounts[0] || {});

  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    if (inProgress === 'none') {
      initializeAuth(instance, account, isAuthenticatedMsal);
    }
  }, [isAuthenticatedMsal, account, inProgress, initializeAuth, instance]);

  return <>{children}</>;
};

/**
 * Hook to use authentication functionality with Zustand
 * This provides a consistent API similar to the previous React Context approach
 */
export const useAuth = () => {
  const { instance, accounts } = useMsal();
  const account = useAccount(accounts[0] || {});
  
  const authStore = useAuthStore();

  return {
    // State
    user: authStore.user,
    isAuthenticated: authStore.isAuthenticated,
    isLoading: authStore.isLoading,
    error: authStore.error,
    needsSetup: authStore.needsSetup,
    setupData: authStore.setupData,

    // Actions that need MSAL instance/account
    login: (method?: 'redirect' | 'popup') => authStore.login(instance, method),
    logout: () => authStore.logout(instance),
    acquireToken: () => authStore.acquireToken(instance, account),
    verifyUser: () => authStore.verifyUser(instance, account),
    registerUser: (userData: { name: string; email: string }) => 
      authStore.registerUser(userData, account),

    // Direct actions
    clearError: authStore.clearError,
    completeSetup: authStore.completeSetup,
  };
};
