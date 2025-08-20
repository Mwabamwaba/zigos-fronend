import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/Tabs';
import FirefliesConnection from './FirefliesConnection';
import MeetingsDashboard from './MeetingsDashboard';
import { useFirefliesConnection } from '../hooks/useFirefliesConnection';
import { FirefliesMeeting } from '../services/firefliesService';

interface FirefliesIntegrationHubProps {
  userId: string;
  onMeetingImport?: (meeting: FirefliesMeeting) => void;
}

export default function FirefliesIntegrationHub({ userId, onMeetingImport }: FirefliesIntegrationHubProps) {
  const [activeTab, setActiveTab] = useState<'connect' | 'meetings'>('connect');
  const [selectedMeeting, setSelectedMeeting] = useState<FirefliesMeeting | null>(null);
  
  const {
    connection,
    isConnected,
    isConnecting,
    connectionError,
    meetings,
    isSyncing,
    syncError,
    lastSyncAt,
    stats,
    connect,
    disconnect,
    syncMeetings,
    refreshStats,
    testConnectionStatus
  } = useFirefliesConnection(userId);

  const handleConnectionEstablished = (connectionData: any) => {
    console.log('Connection established:', connectionData);
    setActiveTab('meetings');
  };

  const handleMeetingSelect = (meeting: FirefliesMeeting) => {
    setSelectedMeeting(meeting);
    // Could open a modal or navigate to a detailed view
    console.log('Selected meeting:', meeting);
  };

  const handleImportToSOW = (meeting: FirefliesMeeting) => {
    if (onMeetingImport) {
      onMeetingImport(meeting);
    }
    console.log('Importing meeting to SOW:', meeting);
  };

  // Auto-switch to meetings tab when connected
  React.useEffect(() => {
    if (isConnected && activeTab === 'connect') {
      setActiveTab('meetings');
    }
  }, [isConnected, activeTab]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Fireflies Integration
          </h1>
          <p className="text-gray-600">
            Connect your Fireflies account to import meeting recordings and enhance your SOWs
          </p>
        </div>

        {/* Connection Status Bar */}
        {isConnected && connection && (
          <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="font-medium text-gray-900">Connected as {connection.userName}</span>
                </div>
                {stats && (
                  <div className="text-sm text-gray-600">
                    {stats.totalMeetings} meetings • {stats.recentMeetings} recent
                    {lastSyncAt && (
                      <span className="ml-2">
                        • Last sync: {lastSyncAt.toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={syncMeetings}
                  disabled={isSyncing}
                  className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
                >
                  {isSyncing ? 'Syncing...' : 'Sync Now'}
                </button>
                <button
                  onClick={disconnect}
                  className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Disconnect
                </button>
              </div>
            </div>
            {syncError && (
              <div className="mt-2 text-sm text-red-600">
                Sync error: {syncError}
              </div>
            )}
          </div>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'connect' | 'meetings')}>
          <TabsList className="mb-6">
            <TabsTrigger value="connect" disabled={isConnecting}>
              {isConnected ? 'Connection' : 'Connect Account'}
            </TabsTrigger>
            <TabsTrigger value="meetings" disabled={!isConnected}>
              Meeting Library
              {stats && (
                <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {stats.totalMeetings}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="connect">
            {!isConnected ? (
              <FirefliesConnection onConnectionEstablished={handleConnectionEstablished} />
            ) : (
              <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Successfully Connected
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Your Fireflies account is connected and ready to use. Switch to the Meeting Library to browse your meetings.
                  </p>
                  <button
                    onClick={() => setActiveTab('meetings')}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View Meetings
                  </button>
                </div>
              </div>
            )}
            {connectionError && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800">{connectionError}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="meetings">
            {isConnected ? (
              <MeetingsDashboard
                meetings={meetings}
                onMeetingSelect={handleMeetingSelect}
                onImportToSOW={handleImportToSOW}
              />
            ) : (
              <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                <p className="text-gray-600">Please connect your Fireflies account first.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Meeting Detail Modal (if needed) */}
        {selectedMeeting && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedMeeting.title}
                  </h3>
                  <button
                    onClick={() => setSelectedMeeting(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Summary</h4>
                    <p className="text-gray-600">{selectedMeeting.summary}</p>
                  </div>
                  
                  {selectedMeeting.actionItems.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Action Items</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {selectedMeeting.actionItems.map((item, index) => (
                          <li key={index} className="text-gray-600">{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Participants</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedMeeting.participants.map((participant, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {participant}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setSelectedMeeting(null)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      handleImportToSOW(selectedMeeting);
                      setSelectedMeeting(null);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Import to SOW
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}