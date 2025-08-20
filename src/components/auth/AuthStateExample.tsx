import React from 'react';
import { useAuthStore } from '../../store/authStore';

/**
 * Example component showing how to access auth state directly from Zustand store
 * This demonstrates both the hook approach and direct store access patterns
 */
const AuthStateExample: React.FC = () => {
  // Method 1: Use the custom hook (recommended for most cases)
  // import { useAuth } from '../../providers/AuthProvider';
  // const { user, isAuthenticated, isLoading } = useAuth();

  // Method 2: Access store directly (for advanced use cases)
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  
  // Method 3: Access multiple state properties at once
  const authStatus = useAuthStore((state) => ({
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    needsSetup: state.needsSetup,
  }));

  // Method 4: Access actions directly
  const clearError = useAuthStore((state) => state.clearError);
  const setError = useAuthStore((state) => state.setError);

  if (isLoading) {
    return <div>Loading authentication state...</div>;
  }

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Authentication Status</h3>
      
      <div className="space-y-2">
        <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
        <p><strong>User Email:</strong> {user?.email || 'Not logged in'}</p>
        <p><strong>User Name:</strong> {user?.fullName || 'Not logged in'}</p>
        <p><strong>User Role:</strong> {user?.role || 'None'}</p>
        <p><strong>Needs Setup:</strong> {authStatus.needsSetup ? 'Yes' : 'No'}</p>
        
        {error && (
          <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded">
            <p className="text-red-700"><strong>Error:</strong> {error}</p>
            <button 
              onClick={clearError}
              className="mt-1 text-sm text-red-600 underline"
            >
              Clear Error
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Note:</strong> This component demonstrates different ways to access Zustand auth state:</p>
        <ul className="list-disc list-inside mt-1 space-y-1">
          <li>Direct store access with selectors</li>
          <li>Multiple property selection</li>
          <li>Action access for state updates</li>
        </ul>
      </div>
    </div>
  );
};

export default AuthStateExample;
