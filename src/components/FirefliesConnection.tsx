import React, { useState } from 'react';
import { Key, RefreshCw, CheckCircle, AlertTriangle, Users, Calendar, Download } from 'lucide-react';

interface FirefliesConnectionProps {
  onConnectionEstablished: (connectionData: any) => void;
}

export default function FirefliesConnection({ onConnectionEstablished }: FirefliesConnectionProps) {
  const [step, setStep] = useState<'setup' | 'connecting' | 'success' | 'error'>('setup');
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');
  const [connectionData, setConnectionData] = useState<any>(null);

  const handleConnect = async () => {
    if (!apiKey.trim()) {
      setError('Please enter your Fireflies API key');
      return;
    }

    setStep('connecting');
    setError('');

    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockConnectionData = {
        userId: 'user_123',
        name: 'John Doe',
        email: 'john@company.com',
        workspace: 'Company Workspace',
        connectedAt: new Date(),
        meetingsCount: 47,
        lastSync: null
      };

      setConnectionData(mockConnectionData);
      setStep('success');
      onConnectionEstablished(mockConnectionData);
    } catch (err) {
      setError('Failed to connect. Please check your API key and try again.');
      setStep('error');
    }
  };

  const handleRetry = () => {
    setStep('setup');
    setError('');
  };

  const handleSync = async () => {
    // TODO: Implement sync functionality
    console.log('Starting sync...');
  };

  if (step === 'connecting') {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-sm border">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-spin" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Connecting to Fireflies
          </h3>
          <p className="text-gray-600 mb-4">
            Verifying your API key and establishing connection...
          </p>
          <div className="space-y-2 text-sm text-gray-500">
            <div className="flex items-center justify-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              Authenticating with Fireflies API
            </div>
            <div className="flex items-center justify-center">
              <div className="w-2 h-2 bg-gray-300 rounded-full mr-2"></div>
              Fetching user information
            </div>
            <div className="flex items-center justify-center">
              <div className="w-2 h-2 bg-gray-300 rounded-full mr-2"></div>
              Counting available meetings
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-sm border">
        <div className="text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Successfully Connected!
          </h3>
          <p className="text-gray-600 mb-6">
            Your Fireflies account has been connected to ZigOS.
          </p>
          
          {connectionData && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <div className="space-y-3">
                <div className="flex items-center">
                  <Users className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="font-medium">{connectionData.name}</span>
                  <span className="ml-auto text-sm text-gray-500">{connectionData.email}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-sm">Workspace: {connectionData.workspace}</span>
                </div>
                <div className="flex items-center">
                  <Download className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-sm">{connectionData.meetingsCount} meetings available</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleSync}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Import All Meetings
            </button>
            <button
              onClick={() => setStep('setup')}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Disconnect
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'error') {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-sm border">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Connection Failed
          </h3>
          <p className="text-red-600 mb-6">{error}</p>
          
          <div className="flex gap-3">
            <button
              onClick={handleRetry}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

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

      <div className="space-y-4">
        <div>
          <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
            Fireflies API Key
          </label>
          <input
            type="password"
            id="apiKey"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your Fireflies API key"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">How to get your API key:</h4>
          <ol className="text-sm text-blue-800 space-y-1">
            <li>1. Log in to <a href="https://app.fireflies.ai" target="_blank" rel="noopener noreferrer" className="underline">app.fireflies.ai</a></li>
            <li>2. Go to Integrations → Fireflies API</li>
            <li>3. Copy your API key</li>
          </ol>
        </div>

        <button
          onClick={handleConnect}
          disabled={!apiKey.trim()}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Connect Fireflies Account
        </button>
      </div>
    </div>
  );
}