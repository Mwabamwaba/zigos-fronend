import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// Types
export interface FirefliesConnection {
  connectionId: string;
  userId: string;
  firefliesUserId: string;
  userName: string;
  userEmail: string;
  workspaceName?: string;
  status: 'active' | 'inactive' | 'error';
  connectedAt: string;
  lastSyncAt?: string;
  healthStatus: 'healthy' | 'unhealthy' | 'unknown';
  dailyApiCallsUsed: number;
  dailyApiCallsLimit: number;
  autoSyncEnabled: boolean;
  syncFrequencyHours: number;
  createdAt: string;
  updatedAt: string;
}

export interface FirefliesMeeting {
  meetingId: string;
  connectionId: string;
  firefliesMeetingId: string;
  title: string;
  meetingDate: string;
  durationMinutes?: number;
  meetingUrl?: string;
  platform?: string;
  participants: string[];
  summary: string;
  actionItems: string[];
  tags: string[];
  meetingType?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  confidenceScore?: number;
  usedInSows: boolean;
  sowUsageCount: number;
  lastAccessedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SyncResult {
  syncLogId: string;
  connectionId: string;
  type: 'full' | 'incremental' | 'manual' | 'health_check';
  status: 'started' | 'completed' | 'failed' | 'cancelled';
  startedAt: string;
  completedAt?: string;
  duration?: number;
  meetingsFetched: number;
  meetingsCreated: number;
  meetingsUpdated: number;
  meetingsFailed: number;
  apiCallsMade: number;
  errorMessage?: string;
  triggeredBy?: string;
}

export interface ConnectionStatistics {
  connectionId: string;
  userName: string;
  status: 'active' | 'inactive' | 'error';
  healthStatus: 'healthy' | 'unhealthy' | 'unknown';
  lastSyncAt?: string;
  totalMeetings: number;
  processedMeetings: number;
  meetingsUsedInSows: number;
  totalSowUsages: number;
  latestMeetingDate?: string;
  averageMeetingDuration: number;
  dailyApiCallsUsed: number;
  dailyApiCallsRemaining: number;
  recentMeetings: number;
  recentSyncs: SyncResult[];
}

export interface MeetingFilters {
  searchTerm?: string;
  fromDate?: string;
  toDate?: string;
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  meetingType?: string;
  tags?: string[];
  usedInSows?: boolean;
}

export interface PaginationInfo {
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Store state interface
interface FirefliesState {
  // Connection state
  connection: FirefliesConnection | null;
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;

  // Meetings state
  meetings: FirefliesMeeting[];
  selectedMeeting: FirefliesMeeting | null;
  meetingsLoading: boolean;
  meetingsError: string | null;
  meetingsPagination: PaginationInfo | null;

  // Sync state
  isSync: boolean;
  syncError: string | null;
  syncHistory: SyncResult[];
  lastSync: SyncResult | null;

  // Statistics
  statistics: ConnectionStatistics | null;
  statisticsLoading: boolean;

  // Filters and search
  filters: MeetingFilters;
  
  // UI state
  selectedTab: 'connection' | 'meetings' | 'analytics';
  showConnectionModal: boolean;
  showMeetingDetail: boolean;
  
  // Actions
  setConnection: (connection: FirefliesConnection | null) => void;
  setIsConnecting: (loading: boolean) => void;
  setConnectionError: (error: string | null) => void;
  
  setMeetings: (meetings: FirefliesMeeting[], pagination?: PaginationInfo) => void;
  addMeetings: (meetings: FirefliesMeeting[]) => void;
  updateMeeting: (meeting: FirefliesMeeting) => void;
  setSelectedMeeting: (meeting: FirefliesMeeting | null) => void;
  setMeetingsLoading: (loading: boolean) => void;
  setMeetingsError: (error: string | null) => void;
  
  setIsSyncing: (syncing: boolean) => void;
  setSyncError: (error: string | null) => void;
  addSyncResult: (result: SyncResult) => void;
  setSyncHistory: (history: SyncResult[]) => void;
  
  setStatistics: (stats: ConnectionStatistics | null) => void;
  setStatisticsLoading: (loading: boolean) => void;
  
  setFilters: (filters: Partial<MeetingFilters>) => void;
  clearFilters: () => void;
  
  setSelectedTab: (tab: 'connection' | 'meetings' | 'analytics') => void;
  setShowConnectionModal: (show: boolean) => void;
  setShowMeetingDetail: (show: boolean) => void;
  
  // Computed properties
  getFilteredMeetings: () => FirefliesMeeting[];
  getRecentMeetings: () => FirefliesMeeting[];
  getMeetingsByStatus: (status: FirefliesMeeting['status']) => FirefliesMeeting[];
  getApiCallsRemaining: () => number;
  
  // Reset functions
  resetConnection: () => void;
  resetMeetings: () => void;
  reset: () => void;
}

// Initial state
const initialState = {
  // Connection state
  connection: null,
  isConnected: false,
  isConnecting: false,
  connectionError: null,

  // Meetings state
  meetings: [],
  selectedMeeting: null,
  meetingsLoading: false,
  meetingsError: null,
  meetingsPagination: null,

  // Sync state
  isSync: false,
  syncError: null,
  syncHistory: [],
  lastSync: null,

  // Statistics
  statistics: null,
  statisticsLoading: false,

  // Filters and search
  filters: {},
  
  // UI state
  selectedTab: 'connection' as const,
  showConnectionModal: false,
  showMeetingDetail: false,
};

// Create the store
export const useFirefliesStore = create<FirefliesState>()(
  devtools(
    persist(
      immer((set, get) => ({
        ...initialState,

        // Connection actions
        setConnection: (connection) =>
          set((state) => {
            state.connection = connection;
            state.isConnected = !!connection;
            state.connectionError = null;
            if (connection) {
              state.selectedTab = 'meetings';
            }
          }),

        setIsConnecting: (loading) =>
          set((state) => {
            state.isConnecting = loading;
            if (loading) {
              state.connectionError = null;
            }
          }),

        setConnectionError: (error) =>
          set((state) => {
            state.connectionError = error;
            state.isConnecting = false;
          }),

        // Meeting actions
        setMeetings: (meetings, pagination) =>
          set((state) => {
            state.meetings = meetings;
            state.meetingsPagination = pagination || null;
            state.meetingsError = null;
          }),

        addMeetings: (meetings) =>
          set((state) => {
            const existingIds = new Set(state.meetings.map(m => m.meetingId));
            const newMeetings = meetings.filter(m => !existingIds.has(m.meetingId));
            state.meetings.push(...newMeetings);
          }),

        updateMeeting: (meeting) =>
          set((state) => {
            const index = state.meetings.findIndex(m => m.meetingId === meeting.meetingId);
            if (index !== -1) {
              state.meetings[index] = meeting;
            }
            if (state.selectedMeeting?.meetingId === meeting.meetingId) {
              state.selectedMeeting = meeting;
            }
          }),

        setSelectedMeeting: (meeting) =>
          set((state) => {
            state.selectedMeeting = meeting;
            state.showMeetingDetail = !!meeting;
          }),

        setMeetingsLoading: (loading) =>
          set((state) => {
            state.meetingsLoading = loading;
            if (loading) {
              state.meetingsError = null;
            }
          }),

        setMeetingsError: (error) =>
          set((state) => {
            state.meetingsError = error;
            state.meetingsLoading = false;
          }),

        // Sync actions
        setIsSyncing: (syncing) =>
          set((state) => {
            state.isSync = syncing;
            if (syncing) {
              state.syncError = null;
            }
          }),

        setSyncError: (error) =>
          set((state) => {
            state.syncError = error;
            state.isSync = false;
          }),

        addSyncResult: (result) =>
          set((state) => {
            state.syncHistory.unshift(result);
            state.lastSync = result;
            // Keep only last 10 sync results
            if (state.syncHistory.length > 10) {
              state.syncHistory = state.syncHistory.slice(0, 10);
            }
          }),

        setSyncHistory: (history) =>
          set((state) => {
            state.syncHistory = history;
            state.lastSync = history[0] || null;
          }),

        // Statistics actions
        setStatistics: (stats) =>
          set((state) => {
            state.statistics = stats;
          }),

        setStatisticsLoading: (loading) =>
          set((state) => {
            state.statisticsLoading = loading;
          }),

        // Filter actions
        setFilters: (filters) =>
          set((state) => {
            state.filters = { ...state.filters, ...filters };
          }),

        clearFilters: () =>
          set((state) => {
            state.filters = {};
          }),

        // UI actions
        setSelectedTab: (tab) =>
          set((state) => {
            state.selectedTab = tab;
          }),

        setShowConnectionModal: (show) =>
          set((state) => {
            state.showConnectionModal = show;
          }),

        setShowMeetingDetail: (show) =>
          set((state) => {
            state.showMeetingDetail = show;
            if (!show) {
              state.selectedMeeting = null;
            }
          }),

        // Computed properties
        getFilteredMeetings: () => {
          const { meetings, filters } = get();
          let filtered = [...meetings];

          if (filters.searchTerm) {
            const term = filters.searchTerm.toLowerCase();
            filtered = filtered.filter(
              (meeting) =>
                meeting.title.toLowerCase().includes(term) ||
                meeting.summary.toLowerCase().includes(term) ||
                meeting.participants.some((p) => p.toLowerCase().includes(term)) ||
                meeting.tags.some((t) => t.toLowerCase().includes(term))
            );
          }

          if (filters.fromDate) {
            filtered = filtered.filter(
              (meeting) => meeting.meetingDate >= filters.fromDate!
            );
          }

          if (filters.toDate) {
            filtered = filtered.filter(
              (meeting) => meeting.meetingDate <= filters.toDate!
            );
          }

          if (filters.status) {
            filtered = filtered.filter((meeting) => meeting.status === filters.status);
          }

          if (filters.meetingType) {
            filtered = filtered.filter(
              (meeting) => meeting.meetingType === filters.meetingType
            );
          }

          if (filters.tags && filters.tags.length > 0) {
            filtered = filtered.filter((meeting) =>
              filters.tags!.some((tag) => meeting.tags.includes(tag))
            );
          }

          if (filters.usedInSows !== undefined) {
            filtered = filtered.filter(
              (meeting) => meeting.usedInSows === filters.usedInSows
            );
          }

          // Sort by date (newest first)
          return filtered.sort(
            (a, b) => new Date(b.meetingDate).getTime() - new Date(a.meetingDate).getTime()
          );
        },

        getRecentMeetings: () => {
          const { meetings } = get();
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

          return meetings
            .filter((meeting) => new Date(meeting.meetingDate) >= sevenDaysAgo)
            .sort(
              (a, b) => new Date(b.meetingDate).getTime() - new Date(a.meetingDate).getTime()
            );
        },

        getMeetingsByStatus: (status) => {
          const { meetings } = get();
          return meetings.filter((meeting) => meeting.status === status);
        },

        getApiCallsRemaining: () => {
          const { connection } = get();
          return connection
            ? connection.dailyApiCallsLimit - connection.dailyApiCallsUsed
            : 0;
        },

        // Reset functions
        resetConnection: () =>
          set((state) => {
            state.connection = null;
            state.isConnected = false;
            state.isConnecting = false;
            state.connectionError = null;
            state.selectedTab = 'connection';
          }),

        resetMeetings: () =>
          set((state) => {
            state.meetings = [];
            state.selectedMeeting = null;
            state.meetingsLoading = false;
            state.meetingsError = null;
            state.meetingsPagination = null;
          }),

        reset: () =>
          set((state) => {
            Object.assign(state, initialState);
          }),
      })),
      {
        name: 'fireflies-store',
        partialize: (state) => ({
          connection: state.connection,
          filters: state.filters,
          selectedTab: state.selectedTab,
        }),
      }
    ),
    {
      name: 'fireflies-store',
    }
  )
);

// Selectors for better performance
export const useConnection = () => useFirefliesStore((state) => state.connection);
export const useIsConnected = () => useFirefliesStore((state) => state.isConnected);
export const useMeetings = () => useFirefliesStore((state) => state.meetings);
export const useFilteredMeetings = () => useFirefliesStore((state) => state.getFilteredMeetings());
export const useRecentMeetings = () => useFirefliesStore((state) => state.getRecentMeetings());
export const useStatistics = () => useFirefliesStore((state) => state.statistics);
export const useSyncHistory = () => useFirefliesStore((state) => state.syncHistory);
export const useFilters = () => useFirefliesStore((state) => state.filters);
export const useSelectedMeeting = () => useFirefliesStore((state) => state.selectedMeeting);

// Helper hooks
export const useFirefliesActions = () => {
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
    setFilters,
    clearFilters,
    setSelectedTab,
    setShowConnectionModal,
    setShowMeetingDetail,
    resetConnection,
    resetMeetings,
    reset,
  } = useFirefliesStore();

  return {
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
    setFilters,
    clearFilters,
    setSelectedTab,
    setShowConnectionModal,
    setShowMeetingDetail,
    resetConnection,
    resetMeetings,
    reset,
  };
};