import { useCallback } from 'react';
import { useFirefliesActions, useFirefliesStore } from '../stores/firefliesStore';
import firefliesApiService, { 
  EstablishConnectionRequest, 
  SyncMeetingsRequest, 
  SearchMeetingsRequest,
  ImportMeetingToSowRequest 
} from '../services/firefliesApiService';

/**
 * Custom hook that provides Fireflies API operations with integrated state management
 */
export const useFirefliesApi = () => {
  const {
    setConnection,
    setIsConnecting,
    setConnectionError,
    setMeetings,
    addMeetings,
    updateMeeting,
    setSelectedMeeting,
    setMeetingsLoading,
    setMeetingsError,
    setIsSyncing,
    setSyncError,
    addSyncResult,
    setSyncHistory,
    setStatistics,
    setStatisticsLoading,
    resetConnection,
    resetMeetings,
  } = useFirefliesActions();

  const connection = useFirefliesStore((state) => state.connection);
  const isConnected = useFirefliesStore((state) => state.isConnected);

  // Connection Management
  const establishConnection = useCallback(async (request: EstablishConnectionRequest) => {
    setIsConnecting(true);
    setConnectionError(null);

    try {
      const newConnection = await firefliesApiService.establishConnection(request);
      setConnection(newConnection);
      return newConnection;
    } catch (error: any) {
      const errorMessage = firefliesApiService.formatError(error);
      setConnectionError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsConnecting(false);
    }
  }, [setConnection, setIsConnecting, setConnectionError]);

  const getConnectionByUser = useCallback(async (userId: string) => {
    setIsConnecting(true);
    setConnectionError(null);

    try {
      const existingConnection = await firefliesApiService.getConnectionByUser(userId);
      setConnection(existingConnection);
      return existingConnection;
    } catch (error: any) {
      const errorMessage = firefliesApiService.formatError(error);
      setConnectionError(errorMessage);
      return null;
    } finally {
      setIsConnecting(false);
    }
  }, [setConnection, setIsConnecting, setConnectionError]);

  const updateConnection = useCallback(async (connectionId: string, request: EstablishConnectionRequest) => {
    if (!connection) return null;

    setIsConnecting(true);
    setConnectionError(null);

    try {
      const updatedConnection = await firefliesApiService.updateConnection(connectionId, request);
      setConnection(updatedConnection);
      return updatedConnection;
    } catch (error: any) {
      const errorMessage = firefliesApiService.formatError(error);
      setConnectionError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsConnecting(false);
    }
  }, [connection, setConnection, setIsConnecting, setConnectionError]);

  const disconnect = useCallback(async () => {
    if (!connection) return false;

    setIsConnecting(true);

    try {
      const success = await firefliesApiService.disconnect(connection.connectionId);
      if (success) {
        resetConnection();
        resetMeetings();
      }
      return success;
    } catch (error: any) {
      const errorMessage = firefliesApiService.formatError(error);
      setConnectionError(errorMessage);
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, [connection, resetConnection, resetMeetings, setIsConnecting, setConnectionError]);

  const testConnection = useCallback(async () => {
    if (!connection) return null;

    try {
      const healthResult = await firefliesApiService.testConnection(connection.connectionId);
      
      // Update connection health status in store
      const updatedConnection = {
        ...connection,
        healthStatus: healthResult.status,
        dailyApiCallsUsed: connection.dailyApiCallsLimit - healthResult.apiCallsRemaining,
      };
      setConnection(updatedConnection);
      
      return healthResult;
    } catch (error: any) {
      const errorMessage = firefliesApiService.formatError(error);
      setConnectionError(errorMessage);
      return null;
    }
  }, [connection, setConnection, setConnectionError]);

  const getConnectionStatistics = useCallback(async () => {
    if (!connection) return null;

    setStatisticsLoading(true);

    try {
      const stats = await firefliesApiService.getConnectionStatistics(connection.connectionId);
      setStatistics(stats);
      return stats;
    } catch (error: any) {
      console.error('Failed to get connection statistics:', error);
      return null;
    } finally {
      setStatisticsLoading(false);
    }
  }, [connection, setStatistics, setStatisticsLoading]);

  const validateApiKey = useCallback(async (apiKey: string) => {
    try {
      const result = await firefliesApiService.validateApiKey(apiKey);
      return result;
    } catch (error: any) {
      const errorMessage = firefliesApiService.formatError(error);
      throw new Error(errorMessage);
    }
  }, []);

  // Meeting Management
  const syncMeetings = useCallback(async (request?: Partial<SyncMeetingsRequest>) => {
    if (!connection) return null;

    setIsSyncing(true);
    setSyncError(null);

    try {
      const syncRequest: SyncMeetingsRequest = {
        connectionId: connection.connectionId,
        type: 'manual',
        ...request,
      };

      const syncResult = await firefliesApiService.syncMeetings(syncRequest);
      addSyncResult(syncResult);

      // Update connection's last sync time
      const updatedConnection = {
        ...connection,
        lastSyncAt: new Date().toISOString(),
      };
      setConnection(updatedConnection);

      return syncResult;
    } catch (error: any) {
      const errorMessage = firefliesApiService.formatError(error);
      setSyncError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsSyncing(false);
    }
  }, [connection, setIsSyncing, setSyncError, addSyncResult, setConnection]);

  const loadMeetings = useCallback(async (skip: number = 0, take: number = 50) => {
    if (!connection) return null;

    setMeetingsLoading(true);
    setMeetingsError(null);

    try {
      const result = await firefliesApiService.getMeetings(connection.connectionId, skip, take);
      
      if (skip === 0) {
        // First page - replace all meetings
        setMeetings(result.meetings, result.pagination);
      } else {
        // Additional pages - add to existing meetings
        addMeetings(result.meetings);
      }

      return result;
    } catch (error: any) {
      const errorMessage = firefliesApiService.formatError(error);
      setMeetingsError(errorMessage);
      return null;
    } finally {
      setMeetingsLoading(false);
    }
  }, [connection, setMeetings, addMeetings, setMeetingsLoading, setMeetingsError]);

  const searchMeetings = useCallback(async (request: Omit<SearchMeetingsRequest, 'connectionId'>) => {
    if (!connection) return null;

    setMeetingsLoading(true);
    setMeetingsError(null);

    try {
      const searchRequest: SearchMeetingsRequest = {
        connectionId: connection.connectionId,
        ...request,
      };

      const result = await firefliesApiService.searchMeetings(searchRequest);
      setMeetings(result.meetings, result.pagination);
      return result;
    } catch (error: any) {
      const errorMessage = firefliesApiService.formatError(error);
      setMeetingsError(errorMessage);
      return null;
    } finally {
      setMeetingsLoading(false);
    }
  }, [connection, setMeetings, setMeetingsLoading, setMeetingsError]);

  const loadMeeting = useCallback(async (meetingId: string) => {
    try {
      const meeting = await firefliesApiService.getMeeting(meetingId);
      if (meeting) {
        updateMeeting(meeting);
        setSelectedMeeting(meeting);
      }
      return meeting;
    } catch (error: any) {
      const errorMessage = firefliesApiService.formatError(error);
      setMeetingsError(errorMessage);
      return null;
    }
  }, [updateMeeting, setSelectedMeeting, setMeetingsError]);

  const loadRecentMeetings = useCallback(async () => {
    if (!connection) return [];

    try {
      const meetings = await firefliesApiService.getRecentMeetings(connection.connectionId);
      return meetings;
    } catch (error: any) {
      console.error('Failed to load recent meetings:', error);
      return [];
    }
  }, [connection]);

  // SOW Integration
  const importMeetingToSow = useCallback(async (request: ImportMeetingToSowRequest) => {
    try {
      const result = await firefliesApiService.importMeetingToSow(request);
      
      // Update meeting usage statistics
      const meeting = useFirefliesStore.getState().meetings.find(m => m.meetingId === request.meetingId);
      if (meeting) {
        const updatedMeeting = {
          ...meeting,
          usedInSows: true,
          sowUsageCount: meeting.sowUsageCount + 1,
        };
        updateMeeting(updatedMeeting);
      }

      return result;
    } catch (error: any) {
      const errorMessage = firefliesApiService.formatError(error);
      throw new Error(errorMessage);
    }
  }, [updateMeeting]);

  const getMeetingSowUsage = useCallback(async (meetingId: string) => {
    try {
      const usage = await firefliesApiService.getMeetingSowUsage(meetingId);
      return usage;
    } catch (error: any) {
      console.error('Failed to get meeting SOW usage:', error);
      return [];
    }
  }, []);

  const getSowMeetings = useCallback(async (sowId: string) => {
    try {
      const meetings = await firefliesApiService.getSowMeetings(sowId);
      return meetings;
    } catch (error: any) {
      console.error('Failed to get SOW meetings:', error);
      return [];
    }
  }, []);

  const removeMeetingFromSow = useCallback(async (usageId: string, meetingId: string) => {
    try {
      const success = await firefliesApiService.removeMeetingFromSow(usageId);
      
      if (success) {
        // Update meeting usage statistics
        const meeting = useFirefliesStore.getState().meetings.find(m => m.meetingId === meetingId);
        if (meeting && meeting.sowUsageCount > 0) {
          const updatedMeeting = {
            ...meeting,
            sowUsageCount: meeting.sowUsageCount - 1,
            usedInSows: meeting.sowUsageCount > 1,
          };
          updateMeeting(updatedMeeting);
        }
      }

      return success;
    } catch (error: any) {
      const errorMessage = firefliesApiService.formatError(error);
      throw new Error(errorMessage);
    }
  }, [updateMeeting]);

  // Analytics
  const getMeetingAnalytics = useCallback(async (fromDate: string, toDate: string) => {
    if (!connection) return null;

    try {
      const analytics = await firefliesApiService.getMeetingAnalytics(connection.connectionId, fromDate, toDate);
      return analytics;
    } catch (error: any) {
      console.error('Failed to get meeting analytics:', error);
      return null;
    }
  }, [connection]);

  const getSyncHistory = useCallback(async (take: number = 10) => {
    if (!connection) return [];

    try {
      const history = await firefliesApiService.getSyncHistory(connection.connectionId, take);
      setSyncHistory(history);
      return history;
    } catch (error: any) {
      console.error('Failed to get sync history:', error);
      return [];
    }
  }, [connection, setSyncHistory]);

  // Utility functions
  const isOnline = useCallback(() => {
    return navigator.onLine;
  }, []);

  const canMakeApiCall = useCallback(() => {
    if (!connection) return false;
    return connection.dailyApiCallsLimit - connection.dailyApiCallsUsed > 0;
  }, [connection]);

  const getApiCallsRemaining = useCallback(() => {
    if (!connection) return 0;
    return connection.dailyApiCallsLimit - connection.dailyApiCallsUsed;
  }, [connection]);

  return {
    // Connection management
    establishConnection,
    getConnectionByUser,
    updateConnection,
    disconnect,
    testConnection,
    getConnectionStatistics,
    validateApiKey,

    // Meeting management
    syncMeetings,
    loadMeetings,
    searchMeetings,
    loadMeeting,
    loadRecentMeetings,

    // SOW integration
    importMeetingToSow,
    getMeetingSowUsage,
    getSowMeetings,
    removeMeetingFromSow,

    // Analytics
    getMeetingAnalytics,
    getSyncHistory,

    // Utilities
    isOnline,
    canMakeApiCall,
    getApiCallsRemaining,
    
    // State getters
    connection,
    isConnected,
  };
};

export default useFirefliesApi;