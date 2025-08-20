import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  FirefliesConnection,
  FirefliesMeeting,
  SyncResult,
  ConnectionStatistics,
  MeetingFilters,
  PaginationInfo
} from '../stores/firefliesStore';

// API Response types
interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
  timestamp: string;
}

interface PagedApiResponse<T> {
  items: T[];
  totalCount: number;
  pageSize: number;
  pageNumber: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Request types
export interface EstablishConnectionRequest {
  apiKey: string;
  userId: string;
  autoSyncEnabled?: boolean;
  syncFrequencyHours?: number;
  includeRecordings?: boolean;
}

export interface SyncMeetingsRequest {
  connectionId: string;
  type?: 'full' | 'incremental' | 'manual' | 'health_check';
  sinceDate?: string;
  forceFullSync?: boolean;
  triggeredByUserId?: string;
}

export interface SearchMeetingsRequest {
  connectionId: string;
  searchTerm?: string;
  fromDate?: string;
  toDate?: string;
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  meetingType?: string;
  tags?: string[];
  skip?: number;
  take?: number;
}

export interface ImportMeetingToSowRequest {
  meetingId: string;
  sowId: string;
  usageType: 'summary' | 'action_items' | 'transcript' | 'analytics' | 'participants' | 'full_meeting';
  sectionName?: string;
  addedByUserId: string;
}

export interface ApiKeyValidationResult {
  isValid: boolean;
  user?: {
    user_id: string;
    name: string;
    email: string;
  };
  errorMessage?: string;
  validationDuration: number;
}

export interface ConnectionHealthResult {
  connectionId: string;
  isHealthy: boolean;
  status: 'healthy' | 'unhealthy' | 'unknown';
  errorMessage?: string;
  checkedAt: string;
  responseTime: number;
  apiCallsRemaining: number;
}

export interface MeetingImportResult {
  usageId: string;
  meetingId: string;
  sowId: string;
  usageType: string;
  sectionName?: string;
  contentExtracted: string;
  importedAt: string;
  success: boolean;
  errorMessage?: string;
}

/**
 * Service for interacting with Fireflies backend API
 */
export class FirefliesApiService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE || 'http://localhost:7071/api';
    
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for logging
    this.api.interceptors.request.use(
      (config) => {
        console.log(`Fireflies API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('Fireflies API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => {
        console.log(`Fireflies API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('Fireflies API Response Error:', error.response?.data || error.message);
        
        // Handle common error scenarios
        if (error.response?.status === 401) {
          // Could trigger auth flow here
          console.warn('Unauthorized access to Fireflies API');
        } else if (error.response?.status >= 500) {
          console.error('Server error in Fireflies API');
        }
        
        return Promise.reject(error);
      }
    );
  }

  // Connection Management
  async establishConnection(request: EstablishConnectionRequest): Promise<FirefliesConnection> {
    const response = await this.api.post<FirefliesConnection>('/fireflies/connections', request);
    return response.data;
  }

  async getConnectionByUser(userId: string): Promise<FirefliesConnection | null> {
    try {
      const response = await this.api.get<FirefliesConnection>(`/fireflies/connections/user/${userId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async getConnection(connectionId: string): Promise<FirefliesConnection | null> {
    try {
      const response = await this.api.get<FirefliesConnection>(`/fireflies/connections/${connectionId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async updateConnection(connectionId: string, request: EstablishConnectionRequest): Promise<FirefliesConnection> {
    const response = await this.api.put<FirefliesConnection>(`/fireflies/connections/${connectionId}`, request);
    return response.data;
  }

  async disconnect(connectionId: string): Promise<boolean> {
    try {
      await this.api.delete(`/fireflies/connections/${connectionId}`);
      return true;
    } catch (error) {
      console.error('Failed to disconnect:', error);
      return false;
    }
  }

  async testConnection(connectionId: string): Promise<ConnectionHealthResult> {
    const response = await this.api.post<ConnectionHealthResult>(`/fireflies/connections/${connectionId}/test`);
    return response.data;
  }

  async getConnectionStatistics(connectionId: string): Promise<ConnectionStatistics> {
    const response = await this.api.get<ConnectionStatistics>(`/fireflies/connections/${connectionId}/statistics`);
    return response.data;
  }

  async validateApiKey(apiKey: string): Promise<ApiKeyValidationResult> {
    const response = await this.api.post<ApiKeyValidationResult>('/fireflies/validate-api-key', { apiKey });
    return response.data;
  }

  // Meeting Management
  async syncMeetings(request: SyncMeetingsRequest): Promise<SyncResult> {
    const response = await this.api.post<SyncResult>('/fireflies/meetings/sync', request);
    return response.data;
  }

  async getMeetings(
    connectionId: string,
    skip: number = 0,
    take: number = 50
  ): Promise<{ meetings: FirefliesMeeting[]; pagination: PaginationInfo }> {
    const response = await this.api.get<PagedApiResponse<FirefliesMeeting>>(
      `/fireflies/meetings/connection/${connectionId}?skip=${skip}&take=${take}`
    );
    
    return {
      meetings: response.data.items,
      pagination: {
        pageNumber: response.data.pageNumber,
        pageSize: response.data.pageSize,
        totalCount: response.data.totalCount,
        totalPages: response.data.totalPages,
        hasNextPage: response.data.hasNextPage,
        hasPreviousPage: response.data.hasPreviousPage,
      },
    };
  }

  async searchMeetings(request: SearchMeetingsRequest): Promise<{ meetings: FirefliesMeeting[]; pagination: PaginationInfo }> {
    const response = await this.api.post<PagedApiResponse<FirefliesMeeting>>('/fireflies/meetings/search', request);
    
    return {
      meetings: response.data.items,
      pagination: {
        pageNumber: response.data.pageNumber,
        pageSize: response.data.pageSize,
        totalCount: response.data.totalCount,
        totalPages: response.data.totalPages,
        hasNextPage: response.data.hasNextPage,
        hasPreviousPage: response.data.hasPreviousPage,
      },
    };
  }

  async getMeeting(meetingId: string): Promise<FirefliesMeeting | null> {
    try {
      const response = await this.api.get<FirefliesMeeting>(`/fireflies/meetings/${meetingId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async getRecentMeetings(connectionId: string): Promise<FirefliesMeeting[]> {
    const response = await this.api.get<FirefliesMeeting[]>(`/fireflies/meetings/connection/${connectionId}/recent`);
    return response.data;
  }

  // SOW Integration
  async importMeetingToSow(request: ImportMeetingToSowRequest): Promise<MeetingImportResult> {
    const response = await this.api.post<MeetingImportResult>('/fireflies/meetings/import-to-sow', request);
    return response.data;
  }

  async getMeetingSowUsage(meetingId: string): Promise<MeetingImportResult[]> {
    const response = await this.api.get<MeetingImportResult[]>(`/fireflies/meetings/${meetingId}/sow-usage`);
    return response.data;
  }

  async getSowMeetings(sowId: string): Promise<FirefliesMeeting[]> {
    const response = await this.api.get<FirefliesMeeting[]>(`/fireflies/sows/${sowId}/meetings`);
    return response.data;
  }

  async removeMeetingFromSow(usageId: string): Promise<boolean> {
    try {
      await this.api.delete(`/fireflies/sow-usage/${usageId}`);
      return true;
    } catch (error) {
      console.error('Failed to remove meeting from SOW:', error);
      return false;
    }
  }

  // Analytics
  async getMeetingAnalytics(connectionId: string, fromDate: string, toDate: string): Promise<any> {
    const response = await this.api.get(
      `/fireflies/meetings/connection/${connectionId}/analytics?fromDate=${fromDate}&toDate=${toDate}`
    );
    return response.data;
  }

  async getSyncHistory(connectionId: string, take: number = 10): Promise<SyncResult[]> {
    const response = await this.api.get<SyncResult[]>(
      `/fireflies/meetings/connection/${connectionId}/sync-history?take=${take}`
    );
    return response.data;
  }

  // Utility methods
  formatError(error: any): string {
    if (error.response?.data?.error) {
      return error.response.data.error;
    }
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.message) {
      return error.message;
    }
    return 'An unexpected error occurred';
  }

  isNetworkError(error: any): boolean {
    return !error.response && error.code === 'NETWORK_ERROR';
  }

  isTimeoutError(error: any): boolean {
    return error.code === 'ECONNABORTED' || error.message?.includes('timeout');
  }

  isRateLimitError(error: any): boolean {
    return error.response?.status === 429;
  }

  isAuthError(error: any): boolean {
    return error.response?.status === 401 || error.response?.status === 403;
  }

  isServerError(error: any): boolean {
    return error.response?.status >= 500;
  }

  // Configuration
  setBaseURL(url: string): void {
    this.baseURL = url;
    this.api.defaults.baseURL = url;
  }

  setTimeout(timeout: number): void {
    this.api.defaults.timeout = timeout;
  }

  setFirefliesApiKey(apiKey: string): void {
    this.api.defaults.headers.common['Authorization'] = `Bearer ${apiKey}`;
  }

  removeFirefliesApiKey(): void {
    delete this.api.defaults.headers.common['Authorization'];
  }
}

// Create singleton instance
export const firefliesApiService = new FirefliesApiService();

// Export default for convenience
export default firefliesApiService;