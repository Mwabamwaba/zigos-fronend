import React, { useState, useEffect } from 'react';
import { Key, RefreshCw, CheckCircle, AlertTriangle, ExternalLink, Shield } from 'lucide-react';
import { useFirefliesStore, useFirefliesActions } from '../../stores/firefliesStore';
import useFirefliesApi from '../../hooks/useFirefliesApi';

interface FirefliesConnectionSetupProps {
  userId: string;
  onConnectionEstablished?: () => void;
}

export const FirefliesConnectionSetup: React.FC<FirefliesConnectionSetupProps> = ({
  userId,
  onConnectionEstablished,
}) => {
  const [apiKey, setApiKey] = useState('');
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [syncFrequencyHours, setSyncFrequencyHours] = useState(24);
  const [includeRecordings, setIncludeRecordings] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);

  const { isConnecting, connectionError } = useFirefliesStore();
  const { setConnectionError } = useFirefliesActions();
  const { establishConnection, validateApiKey } = useFirefliesApi();

  // Clear error when component mounts or API key changes
  useEffect(() => {
    setConnectionError(null);
    setValidationResult(null);
  }, [apiKey, setConnectionError]);

  const handleValidateApiKey = async () => {
    if (!apiKey.trim()) {
      setValidationResult({ isValid: false, errorMessage: 'Please enter an API key' });
      return;
    }

    setIsValidating(true);
    setValidationResult(null);

    try {
      const result = await validateApiKey(apiKey);
      setValidationResult(result);
    } catch (error: any) {
      setValidationResult({
        isValid: false,
        errorMessage: error.message || 'Failed to validate API key',
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleConnect = async () => {
    if (!apiKey.trim()) {
      setConnectionError('Please enter your Fireflies API key');
      return;
    }

    if (validationResult && !validationResult.isValid) {
      setConnectionError('Please provide a valid API key');
      return;
    }

    try {
      await establishConnection({
        apiKey,
        userId,
        autoSyncEnabled,
        syncFrequencyHours,
        includeRecordings,
      });

      onConnectionEstablished?.();
    } catch (error: any) {
      // Error is already handled in the hook
      console.error('Connection failed:', error);
    }
  };

  const getValidationIcon = () => {
    if (isValidating) {
      return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
    }
    if (validationResult?.isValid) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    if (validationResult && !validationResult.isValid) {
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-sm border">
      <div className="text-center mb-6">
        <Key className="h-12 w-12 text-blue-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Connect Your Fireflies Account
        </h3>
        <p className="text-gray-600">
          Import all your meeting recordings and transcripts to enhance your SOWs
        </p>
      </div>

      <div className="space-y-6">
        {/* API Key Input */}
        <div>
          <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
            Fireflies API Key
          </label>
          <div className="relative">
            <input
              type="password"
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Fireflies API key"
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isConnecting || isValidating}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {getValidationIcon()}
            </div>
          </div>
          
          {/* Validation Button */}
          {apiKey.trim() && !validationResult && (
            <button
              onClick={handleValidateApiKey}
              disabled={isValidating}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
            >
              {isValidating ? 'Validating...' : 'Validate API Key'}
            </button>
          )}

          {/* Validation Result */}
          {validationResult && (
            <div className={`mt-2 p-2 rounded text-sm ${
              validationResult.isValid 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {validationResult.isValid ? (
                <div>
                  <p className="font-medium">Valid API Key</p>
                  {validationResult.user && (
                    <p className="text-xs mt-1">
                      Connected as: {validationResult.user.name} ({validationResult.user.email})
                    </p>
                  )}
                </div>
              ) : (
                <p>{validationResult.errorMessage}</p>
              )}
            </div>
          )}
        </div>

        {/* Setup Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2 flex items-center">
            <ExternalLink className="h-4 w-4 mr-1" />
            How to get your API key:
          </h4>
          <ol className="text-sm text-blue-800 space-y-1">
            <li>1. Log in to <a href="https://app.fireflies.ai" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-900">app.fireflies.ai</a></li>
            <li>2. Go to Integrations → Fireflies API</li>
            <li>3. Copy your API key</li>
          </ol>
        </div>

        {/* Advanced Settings */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Sync Settings</h4>
          
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={autoSyncEnabled}
                onChange={(e) => setAutoSyncEnabled(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                disabled={isConnecting}
              />
              <span className="ml-2 text-sm text-gray-700">Enable automatic sync</span>
            </label>

            {autoSyncEnabled && (
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Sync frequency: {syncFrequencyHours} hours
                </label>
                <input
                  type="range"
                  min="1"
                  max="168"
                  value={syncFrequencyHours}
                  onChange={(e) => setSyncFrequencyHours(Number(e.target.value))}
                  className="w-full"
                  disabled={isConnecting}
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>1h</span>
                  <span>24h</span>
                  <span>168h (1 week)</span>
                </div>
              </div>
            )}

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={includeRecordings}
                onChange={(e) => setIncludeRecordings(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                disabled={isConnecting}
              />
              <span className="ml-2 text-sm text-gray-700">Include video recordings (requires more storage)</span>
            </label>
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div className="flex items-start">
            <Shield className="h-4 w-4 text-gray-500 mt-0.5 mr-2 flex-shrink-0" />
            <div className="text-xs text-gray-600">
              <p className="font-medium mb-1">Security & Privacy</p>
              <p>Your API key is encrypted and stored securely. We never access your meeting content without your explicit permission.</p>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {connectionError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800">{connectionError}</p>
          </div>
        )}

        {/* Connect Button */}
        <button
          onClick={handleConnect}
          disabled={!apiKey.trim() || isConnecting || isValidating || (validationResult && !validationResult.isValid)}
          className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isConnecting ? (
            <>
              <RefreshCw className="h-4 w-4 inline mr-2 animate-spin" />
              Connecting...
            </>
          ) : (
            'Connect Fireflies Account'
          )}
        </button>
      </div>
    </div>
  );
};

export default FirefliesConnectionSetup;