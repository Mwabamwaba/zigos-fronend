import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../providers/AuthProvider';

const AuthGate: React.FC = () => {
  const { isAuthenticated, isLoading, verifyUser } = useAuth();
  const [verificationStatus, setVerificationStatus] = useState<'checking' | 'exists' | 'not-exists' | 'error'>('checking');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkUserStatus = async () => {
      if (!isAuthenticated) {
        return; // Will be handled by the redirect below
      }

      try {
        setVerificationStatus('checking');
        const result = await verifyUser();
        
        if (result.exists) {
          setVerificationStatus('exists');
        } else {
          setVerificationStatus('not-exists');
        }
      } catch (err: any) {
        console.error('User verification failed:', err);
        setError(err.message || 'Failed to verify user');
        setVerificationStatus('error');
      }
    };

    if (!isLoading && isAuthenticated) {
      checkUserStatus();
    }
  }, [isAuthenticated, isLoading, verifyUser]);

  // Redirect based on authentication status
  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect based on verification status
  if (verificationStatus === 'exists') {
    return <Navigate to="/dashboard" replace />;
  }

  if (verificationStatus === 'not-exists') {
    return <Navigate to="/signup" replace />;
  }

  // Show loading state
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-16 w-16 bg-indigo-600 rounded-xl flex items-center justify-center mb-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {verificationStatus === 'checking' ? 'Verifying your account...' : 'Setting up your workspace...'}
        </h2>
        
        <p className="text-gray-600 mb-8">
          {verificationStatus === 'checking' 
            ? 'Please wait while we check your account status.'
            : 'We\'re preparing your ZigOS experience.'
          }
        </p>

        {error && (
          <div className="max-w-md mx-auto bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Verification Error</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Progress dots */}
        <div className="flex justify-center space-x-2 mt-8">
          <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default AuthGate;
