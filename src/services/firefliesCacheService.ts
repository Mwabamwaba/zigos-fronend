import { FirefliesMeeting } from '../stores/firefliesStore';
import { fetchAllMeetings, FirefliesConnection, FirefliesMeeting as ServiceFirefliesMeeting } from './firefliesService';

export interface CachedFirefliesMeetings {
  meetings: FirefliesMeeting[];
  lastPulledAt: string;
  isStale: boolean;
}

export interface PullResult {
  success: boolean;
  meetingsCount: number;
  error?: string;
  timestamp: string;
}

class FirefliesCacheService {
  private readonly CACHE_KEY = 'fireflies_meetings_cache';
  private readonly LAST_PULL_KEY = 'fireflies_last_pull';
  private readonly CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour
  private autoPullInterval: number | null = null;
  private callbacks: Array<(data: CachedFirefliesMeetings) => void> = [];

  constructor() {
    this.startAutoPull();
  }

  /**
   * Get cached meetings with metadata
   */
  getCachedMeetings(): CachedFirefliesMeetings {
    try {
      const cachedData = localStorage.getItem(this.CACHE_KEY);
      const lastPulled = localStorage.getItem(this.LAST_PULL_KEY);
      
      if (!cachedData || !lastPulled) {
        return {
          meetings: [],
          lastPulledAt: 'never',
          isStale: true
        };
      }

      const meetings: FirefliesMeeting[] = JSON.parse(cachedData);
      const lastPulledTime = new Date(lastPulled);
      const now = new Date();
      const isStale = (now.getTime() - lastPulledTime.getTime()) > this.CACHE_DURATION_MS;

      return {
        meetings,
        lastPulledAt: lastPulled,
        isStale
      };
    } catch (error) {
      console.error('Error reading cached meetings:', error);
      return {
        meetings: [],
        lastPulledAt: 'never',
        isStale: true
      };
    }
  }

  /**
   * Update the cache with new meetings data
   */
  updateCache(meetings: FirefliesMeeting[]): void {
    try {
      const timestamp = new Date().toISOString();
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(meetings));
      localStorage.setItem(this.LAST_PULL_KEY, timestamp);

      // Notify subscribers
      const cachedData = {
        meetings,
        lastPulledAt: timestamp,
        isStale: false
      };
      
      this.callbacks.forEach(callback => callback(cachedData));
    } catch (error) {
      console.error('Error updating cache:', error);
    }
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    localStorage.removeItem(this.CACHE_KEY);
    localStorage.removeItem(this.LAST_PULL_KEY);
    
    const emptyData = {
      meetings: [],
      lastPulledAt: 'never',
      isStale: true
    };
    
    this.callbacks.forEach(callback => callback(emptyData));
  }

  /**
   * Subscribe to cache updates
   */
  subscribe(callback: (data: CachedFirefliesMeetings) => void): () => void {
    this.callbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.callbacks = this.callbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Convert ServiceFirefliesMeeting to store FirefliesMeeting format
   */
  private convertServiceMeetingToStoreMeeting(serviceMeeting: ServiceFirefliesMeeting): FirefliesMeeting {
    return {
      meetingId: serviceMeeting.id,
      connectionId: 'temp-connection', // Will need to get from actual connection
      firefliesMeetingId: serviceMeeting.firefliesId,
      title: serviceMeeting.title,
      meetingDate: serviceMeeting.date,
      durationMinutes: Math.round(serviceMeeting.duration / 60), // Convert seconds to minutes
      participants: serviceMeeting.participants,
      summary: serviceMeeting.summary,
      actionItems: serviceMeeting.actionItems,
      tags: serviceMeeting.tags,
      status: serviceMeeting.status === 'processed' ? 'completed' : 'pending',
      usedInSows: false,
      sowUsageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Note: transcript data would need separate API call to Fireflies
      // The current fetchAllMeetings query doesn't include full transcript text
    };
  }

  /**
   * Manually trigger a pull from Fireflies API
   * This should be called by components when the user clicks "Pull Now"
   */
  async manualPull(): Promise<PullResult> {
    const timestamp = new Date().toISOString();
    
    try {
      // Get the API key from localStorage (same way the existing UI does it)
      const apiKey = localStorage.getItem('fireflies_api_key');
      
      if (!apiKey) {
        throw new Error('Fireflies API key not found. Please configure your API key in Settings.');
      }

      // Create a connection object for the API call
      const connection: FirefliesConnection = {
        id: 'temp-connection',
        userId: 'current-user',
        firefliesUserId: '',
        userName: '',
        userEmail: '',
        workspace: '',
        apiKey,
        connectedAt: new Date(),
        lastSyncAt: null,
        isActive: true
      };

      // Fetch meetings using the real Fireflies API
      console.log('Fetching meetings from Fireflies API...');
      const serviceMeetings = await fetchAllMeetings(connection);
      
      // Convert to store format
      const storeMeetings = serviceMeetings.map(meeting => 
        this.convertServiceMeetingToStoreMeeting(meeting)
      );

      console.log(`Successfully fetched ${storeMeetings.length} meetings from Fireflies`);
      this.updateCache(storeMeetings);

      return {
        success: true,
        meetingsCount: storeMeetings.length,
        timestamp
      };
    } catch (error: any) {
      console.error('Manual pull failed:', error);
      
      // Show the exact error from Fireflies API for debugging
      let errorMessage = error.message || 'Unknown error occurred';
      
      // If there's additional error details, include them
      if (error.response?.data) {
        console.error('Fireflies API response data:', error.response.data);
        
        // Handle GraphQL errors specifically
        if (error.response.data.errors && error.response.data.errors.length > 0) {
          const graphqlError = error.response.data.errors[0];
          errorMessage = `Fireflies API Error: ${graphqlError.message}`;
          
          // Add more context if available
          if (graphqlError.extensions?.code) {
            errorMessage += ` (Code: ${graphqlError.extensions.code})`;
          }
        } else if (error.response.data.message) {
          errorMessage = `Fireflies API Error: ${error.response.data.message}`;
        }
      }
      
      // Add HTTP status code if available
      if (error.response?.status) {
        errorMessage += ` [HTTP ${error.response.status}]`;
      }
      
      // Log the full error object for debugging
      console.error('Full error object:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config ? {
          url: error.config.url,
          method: error.config.method,
          headers: error.config.headers
        } : undefined
      });
      
      return {
        success: false,
        meetingsCount: 0,
        error: errorMessage,
        timestamp
      };
    }
  }

  /**
   * Start automatic pulling every hour
   */
  private startAutoPull(): void {
    // Pull immediately on startup if cache is stale
    const cached = this.getCachedMeetings();
    if (cached.isStale) {
      // Don't await this to avoid blocking initialization
      this.manualPull().catch(error => {
        console.warn('Initial auto-pull failed:', error);
      });
    }

    // Set up interval for future pulls
    this.autoPullInterval = setInterval(async () => {
      try {
        await this.manualPull();
        console.log('Auto-pull completed successfully');
      } catch (error) {
        console.warn('Auto-pull failed:', error);
      }
    }, this.CACHE_DURATION_MS);
  }

  /**
   * Stop automatic pulling (useful for cleanup)
   */
  stopAutoPull(): void {
    if (this.autoPullInterval) {
      clearInterval(this.autoPullInterval);
      this.autoPullInterval = null;
    }
  }

  /**
   * Get time until next auto-pull
   */
  getTimeUntilNextPull(): number {
    const cached = this.getCachedMeetings();
    if (cached.lastPulledAt === 'never') {
      return 0;
    }
    
    const lastPulled = new Date(cached.lastPulledAt);
    const nextPull = new Date(lastPulled.getTime() + this.CACHE_DURATION_MS);
    const now = new Date();
    
    return Math.max(0, nextPull.getTime() - now.getTime());
  }

  /**
   * Format time until next pull in human readable format
   */
  getFormattedTimeUntilNextPull(): string {
    const ms = this.getTimeUntilNextPull();
    const minutes = Math.floor(ms / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    } else {
      return `${remainingMinutes}m`;
    }
  }
}

// Export singleton instance
export const firefliesCacheService = new FirefliesCacheService();
export default firefliesCacheService;
