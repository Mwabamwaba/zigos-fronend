import React, { useState } from 'react';
import { useFirefliesStore } from '../../stores/firefliesStore';
import useFirefliesApi from '../../hooks/useFirefliesApi';
import FirefliesConnectionSetup from './FirefliesConnectionSetup';
import FirefliesMeetingList from './FirefliesMeetingList';

const FirefliesTestPage: React.FC = () => {
  const [testUserId] = useState('test-user-123');
  const { connection, isConnected, meetings } = useFirefliesStore();
  const { testConnection, syncMeetings } = useFirefliesApi();

  const handleConnectionEstablished = () => {
    console.log('Connection established successfully!');
  };

  const handleTestConnection = async () => {
    if (connection) {
      const result = await testConnection();
      console.log('Connection test result:', result);
    }
  };

  const handleSyncTest = async () => {
    if (connection) {
      try {
        const result = await syncMeetings({ type: 'manual' });
        console.log('Sync result:', result);
      } catch (error) {
        console.error('Sync failed:', error);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Fireflies Integration Test Page
        </h1>
        <p className="text-gray-600">
          Test the complete Fireflies integration workflow
        </p>
      </div>

      {/* Connection Status */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded">
            <div className={`text-2xl font-bold ${isConnected ? 'text-green-600' : 'text-gray-400'}`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </div>
            <p className="text-sm text-gray-600">
              {isConnected ? 'Connected' : 'Not Connected'}
            </p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded">
            <div className="text-2xl font-bold text-blue-600">{meetings.length}</div>
            <p className="text-sm text-gray-600">Meetings Loaded</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded">
            <div className="text-2xl font-bold text-purple-600">
              {connection?.dailyApiCallsUsed || 0}
            </div>
            <p className="text-sm text-gray-600">API Calls Used</p>
          </div>
        </div>

        {isConnected && (
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleTestConnection}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Test Connection
            </button>
            <button
              onClick={handleSyncTest}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Test Sync
            </button>
          </div>
        )}
      </div>

      {/* Connection Setup */}
      {!isConnected && (
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-xl font-semibold mb-4">Step 1: Connect to Fireflies</h2>
          <FirefliesConnectionSetup
            userId={testUserId}
            onConnectionEstablished={handleConnectionEstablished}
          />
        </div>
      )}

      {/* Meeting List */}
      {isConnected && (
        <div className="bg-white rounded-lg shadow border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Step 2: Browse Meetings</h2>
            <p className="text-gray-600">View and manage your Fireflies meetings</p>
          </div>
          <FirefliesMeetingList
            onMeetingSelect={(meeting) => {
              console.log('Selected meeting:', meeting);
            }}
            onImportToSow={(meeting) => {
              console.log('Import to SOW:', meeting);
              alert(`Would import "${meeting.title}" to SOW`);
            }}
          />
        </div>
      )}

      {/* Debug Information */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Debug Information</h3>
        <details className="cursor-pointer">
          <summary className="text-sm font-medium text-gray-700 mb-2">
            Click to view store state
          </summary>
          <pre className="text-xs bg-white p-4 rounded border overflow-auto max-h-96">
            {JSON.stringify(
              {
                connection: connection ? {
                  ...connection,
                  // Don't show sensitive data in debug
                  apiKeyEncrypted: '[HIDDEN]'
                } : null,
                isConnected,
                meetingsCount: meetings.length,
                sampleMeeting: meetings[0] || null
              },
              null,
              2
            )}
          </pre>
        </details>
      </div>

      {/* Test Instructions */}
      <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Testing Checklist</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center">
            <input type="checkbox" className="mr-2" />
            <span>Backend is running (Azure Functions on port 7071)</span>
          </div>
          <div className="flex items-center">
            <input type="checkbox" className="mr-2" />
            <span>Frontend is running (Vite dev server on port 5173)</span>
          </div>
          <div className="flex items-center">
            <input type="checkbox" className="mr-2" />
            <span>Database is connected and tables are created</span>
          </div>
          <div className="flex items-center">
            <input type="checkbox" className="mr-2" />
            <span>Fireflies API key is valid and working</span>
          </div>
          <div className="flex items-center">
            <input type="checkbox" className="mr-2" />
            <span>Connection can be established successfully</span>
          </div>
          <div className="flex items-center">
            <input type="checkbox" className="mr-2" />
            <span>Meetings can be synced and displayed</span>
          </div>
          <div className="flex items-center">
            <input type="checkbox" className="mr-2" />
            <span>Search and filtering works correctly</span>
          </div>
          <div className="flex items-center">
            <input type="checkbox" className="mr-2" />
            <span>SOW import workflow is functional</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirefliesTestPage;