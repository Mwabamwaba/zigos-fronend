import { useState, useCallback } from 'react';
import { 
  FirefliesConnection, 
  FirefliesMeeting,
  establishFirefliesConnection,
  fetchAllMeetings,
  syncLatestMeetings,
  testConnection,
  getConnectionStats
} from '../services/firefliesService';

interface UseFirefliesConnectionReturn {
  // Connection state
  connection: FirefliesConnection | null;
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;
  
  // Meetings state
  meetings: FirefliesMeeting[];
  isSyncing: boolean;
  syncError: string | null;
  lastSyncAt: Date | null;
  
  // Connection stats
  stats: {
    totalMeetings: number;
    processedMeetings: number;
    recentMeetings: number;
  } | null;
  
  // Actions
  connect: (apiKey: string) => Promise<void>;
  disconnect: () => void;
  syncMeetings: () => Promise<void>;
  refreshStats: () => Promise<void>;
  testConnectionStatus: () => Promise<boolean>;
}

export function useFirefliesConnection(userId: string): UseFirefliesConnectionReturn {
  // Connection state
  const [connection, setConnection] = useState<FirefliesConnection | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  // Meetings state
  const [meetings, setMeetings] = useState<FirefliesMeeting[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null);
  
  // Stats state
  const [stats, setStats] = useState<{
    totalMeetings: number;
    processedMeetings: number;
    recentMeetings: number;
  } | null>(null);

  // Establish connection with Fireflies
  const connect = useCallback(async (apiKey: string) => {
    setIsConnecting(true);
    setConnectionError(null);
    
    try {
      const newConnection = await establishFirefliesConnection(apiKey, userId);
      setConnection(newConnection);
      
      // Initial sync of meetings
      await syncMeetings();
      
      // Get initial stats
      await refreshStats();
      
    } catch (error: any) {
      setConnectionError(error.message);
      console.error('Failed to connect to Fireflies:', error);
    } finally {
      setIsConnecting(false);
    }
  }, [userId]);

  // Disconnect from Fireflies
  const disconnect = useCallback(() => {
    setConnection(null);
    setMeetings([]);
    setStats(null);
    setLastSyncAt(null);
    setConnectionError(null);
    setSyncError(null);
  }, []);

  // Sync meetings from Fireflies
  const syncMeetings = useCallback(async () => {
    if (!connection) return;
    
    setIsSyncing(true);
    setSyncError(null);
    
    try {
      const syncResult = await syncLatestMeetings(connection);
      
      // In a real app, you would merge with existing meetings
      // For now, we'll replace all meetings
      const allMeetings = await fetchAllMeetings(connection);
      setMeetings(allMeetings);
      setLastSyncAt(new Date());
      
      console.log(`Synced ${syncResult.newMeetings.length} new meetings out of ${syncResult.totalCount} total`);
      
    } catch (error: any) {
      setSyncError(error.message);
      console.error('Failed to sync meetings:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [connection]);

  // Refresh connection statistics
  const refreshStats = useCallback(async () => {
    if (!connection) return;
    
    try {
      const connectionStats = await getConnectionStats(connection);
      setStats({
        totalMeetings: connectionStats.totalMeetings,
        processedMeetings: connectionStats.processedMeetings,
        recentMeetings: connectionStats.recentMeetings
      });
      setLastSyncAt(connectionStats.lastSyncAt);
      
    } catch (error: any) {
      console.error('Failed to refresh stats:', error);
    }
  }, [connection]);

  // Test connection status
  const testConnectionStatus = useCallback(async (): Promise<boolean> => {
    if (!connection) return false;
    
    try {
      return await testConnection(connection);
    } catch (error: any) {
      console.error('Failed to test connection:', error);
      return false;
    }
  }, [connection]);

  return {
    // Connection state
    connection,
    isConnected: !!connection,
    isConnecting,
    connectionError,
    
    // Meetings state
    meetings,
    isSyncing,
    syncError,
    lastSyncAt,
    
    // Stats
    stats,
    
    // Actions
    connect,
    disconnect,
    syncMeetings,
    refreshStats,
    testConnectionStatus
  };
}