import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/apiService';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export function useApi<T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = [],
  options: UseApiOptions = {}
) {
  const { immediate = true, onSuccess, onError } = options;
  
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: immediate,
    error: null,
  });

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await apiCall();
      setState({ data: result, loading: false, error: null });
      onSuccess?.(result);
      return result;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
      setState({ data: null, loading: false, error: errorMessage });
      onError?.(error);
      throw error;
    }
  }, [apiCall, onSuccess, onError]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, dependencies);

  const refetch = useCallback(() => {
    return execute();
  }, [execute]);

  return {
    ...state,
    execute,
    refetch,
  };
}

// Specialized hooks for common API operations
export function useCurrentUser() {
  return useApi(
    () => apiService.getCurrentUser(),
    [],
    { immediate: true }
  );
}

export function useUserPermissions() {
  return useApi(
    () => apiService.getUserPermissions(),
    [],
    { immediate: true }
  );
}

export function useSOWs() {
  return useApi(
    () => apiService.getSOWs(),
    [],
    { immediate: true }
  );
}

export function useProjects() {
  return useApi(
    () => apiService.getProjects(),
    [],
    { immediate: true }
  );
}

// Hook for making authenticated API calls with loading states
export function useApiCall<T>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (apiCall: () => Promise<T>) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiCall();
      setLoading(false);
      return result;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
      setError(errorMessage);
      setLoading(false);
      throw error;
    }
  }, []);

  return {
    execute,
    loading,
    error,
    clearError: () => setError(null),
  };
}

// Hook for handling form submissions with API calls
export function useApiForm<T>() {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async (apiCall: () => Promise<T>) => {
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    
    try {
      const result = await apiCall();
      setSuccess(true);
      setSubmitting(false);
      return result;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
      setError(errorMessage);
      setSubmitting(false);
      setSuccess(false);
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setSubmitting(false);
    setSuccess(false);
    setError(null);
  }, []);

  return {
    submit,
    submitting,
    success,
    error,
    reset,
  };
}

export default useApi;