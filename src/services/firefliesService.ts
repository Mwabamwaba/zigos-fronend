import axios from 'axios';

// Connection and authentication types
export interface FirefliesConnection {
  id: string;
  userId: string;
  firefliesUserId: string;
  userName: string;
  userEmail: string;
  workspace: string;
  apiKey: string; // encrypted
  connectedAt: Date;
  lastSyncAt: Date | null;
  isActive: boolean;
}

export interface FirefliesMeeting {
  id: string;
  firefliesId: string;
  title: string;
  date: string;
  duration: number;
  participants: string[];
  summary: string;
  transcript?: string;
  actionItems: string[];
  tags: string[];
  status: 'processed' | 'processing' | 'failed';
}

// TypeScript interfaces for Fireflies API - Updated to match official API structure
export interface FirefliesTranscriptionRequest {
  meeting_url: string;
  title?: string;
}

export interface FirefliesSentiment {
  negative_pct: number;
  neutral_pct: number;
  positive_pct: number;
}

export interface FirefliesCategories {
  questions: number;
  date_times: number;
  metrics: number;
  tasks: number;
}

export interface FirefliesSpeakerAnalytics {
  speaker_id: string;
  name: string;
  duration: number;
  word_count: number;
  longest_monologue: number;
  monologues_count: number;
  filler_words: number;
  questions: number;
  duration_pct: number;
  words_per_minute: number;
}

export interface FirefliesAnalytics {
  sentiments: FirefliesSentiment;
  categories: FirefliesCategories;
  speakers: FirefliesSpeakerAnalytics[];
}

export interface FirefliesSpeaker {
  id: string;
  name: string;
}

export interface FirefliesAIFilters {
  task: boolean;
  pricing: boolean;
  metric: boolean;
  question: boolean;
  date_and_time: boolean;
  text_cleanup: boolean;
  sentiment: string;
}

export interface FirefliesSentence {
  index: number;
  speaker_name: string;
  speaker_id: string;
  text: string;
  raw_text: string;
  start_time: number;
  end_time: number;
  ai_filters: FirefliesAIFilters;
}

export interface FirefliesUser {
  user_id: string;
  email: string;
  name: string;
  num_transcripts: number;
  recent_meeting: string;
  minutes_consumed: number;
  is_admin: boolean;
  integrations: string[];
}

export interface FirefliesMeetingAttendee {
  displayName: string;
  email: string;
  phoneNumber: string;
  name: string;
  location: string;
}

export interface FirefliesSummary {
  keywords: string[];
  action_items: string;
  outline: string;
  shorthand_bullet: string[];
  overview: string;
  bullet_gist: string;
  gist: string;
  short_summary: string;
  short_overview: string;
  meeting_type: string;
  topics_discussed: string[];
  transcript_chapters: string[];
}

export interface FirefliesMeetingInfo {
  fred_joined: boolean;
  silent_meeting: boolean;
  summary_status: string;
}

export interface FirefliesAppOutput {
  transcript_id: string;
  user_id: string;
  app_id: string;
  created_at: string;
  title: string;
  prompt: string;
  response: string;
}

export interface FirefliesAppsPreview {
  outputs: FirefliesAppOutput[];
}

export interface FirefliesTranscriptionResponse {
  id: string;
  dateString: string;
  privacy: string;
  analytics: FirefliesAnalytics;
  speakers: FirefliesSpeaker[];
  sentences: FirefliesSentence[];
  title: string;
  host_email: string;
  organizer_email: string;
  calendar_id: string;
  user: FirefliesUser;
  fireflies_users: string[];
  participants: string[];
  date: string;
  transcript_url: string;
  audio_url: string;
  video_url: string;
  duration: number;
  meeting_attendees: FirefliesMeetingAttendee[];
  summary: FirefliesSummary;
  cal_id: string;
  calendar_type: string;
  meeting_info: FirefliesMeetingInfo;
  apps_preview: FirefliesAppsPreview;
  meeting_link: string;
  
  // Legacy fields for backward compatibility
  status?: 'completed' | 'failed';
  source_url?: string;
  meeting_url?: string;
  transcript?: string;
  created_at?: string;
  updated_at?: string;
  note?: string;
  endpoint_used?: string;
}

export interface FirefliesJobStatus {
  id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress?: number;
  error?: string;
}



class FirefliesService {
  private readonly baseURL: string;

  constructor() {
    this.baseURL = this.getBaseURL();
  }

  private getBaseURL(): string {
    // Always use backend API by default (since proxy is disabled)
    const useBackend = import.meta.env.VITE_USE_BACKEND_FOR_FIREFLIES !== 'false';
    
    if (useBackend) {
      return `${import.meta.env.VITE_API_URL || 'http://localhost:7071/api'}/fireflies`;
    }
    
    // Fallback: Use proxy in development, direct API in production
    return import.meta.env.DEV ? '/api/fireflies' : 'https://api.fireflies.ai/v1';
  }

  private getApiKey(): string {
    // Try localStorage first (from Settings), then environment variable
    const storedKey = localStorage.getItem('fireflies_api_key');
    return storedKey || import.meta.env.VITE_FIREFLIES_API_KEY || '';
  }

  private getHeaders() {
    const currentApiKey = this.getApiKey(); // Always get the latest key
    
    if (!currentApiKey) {
      throw new Error('Fireflies API key not found. Please configure it in Settings or set VITE_FIREFLIES_API_KEY environment variable.');
    }

    const useBackend = import.meta.env.VITE_USE_BACKEND_FOR_FIREFLIES !== 'false';
    
    if (useBackend) {
      // When using backend, send API key in custom header
      return {
        'X-Fireflies-API-Key': currentApiKey,
        'Content-Type': 'application/json',
      };
    } else {
      // When calling directly or via proxy, use Bearer token
      return {
        'Authorization': `Bearer ${currentApiKey}`,
        'Content-Type': 'application/json',
      };
    }
  }

  /**
   * Backward compatibility alias
   */
  async transcribeAudio(request: FirefliesTranscriptionRequest): Promise<FirefliesTranscriptionResponse> {
    return this.getExistingTranscription(request);
  }

  /**
   * Get existing transcription from Fireflies meeting URL
   */
  async getExistingTranscription(request: FirefliesTranscriptionRequest): Promise<FirefliesTranscriptionResponse> {
    try {
      
      const useBackend = import.meta.env.VITE_USE_BACKEND_FOR_FIREFLIES !== 'false';
      const endpoint = useBackend ? `${this.baseURL}/get-transcription` : `${this.baseURL}/get-transcription`;
      
      const requestBody = useBackend ? {
        MeetingUrl: request.meeting_url,
        Title: request.title || 'Fireflies Meeting',
      } : {
        meeting_url: request.meeting_url,
        title: request.title || 'Fireflies Meeting',
      };

      const response = await axios.post<FirefliesTranscriptionResponse>(
        endpoint,
        requestBody,
        {
          headers: this.getHeaders(),
        }
      );

      console.log(' Fireflies overview:', response.data.summary.overview);
      console.log(' Fireflies action items:', response.data.summary.action_items);
      console.log(' Fireflies topics discussed:', response.data.summary.topics_discussed);
      console.log(' Fireflies bullet gist:', response.data.summary.bullet_gist);
      console.log(' Fireflies gist:', response.data.summary.gist);
      console.log(' Fireflies short summary:', response.data.summary.short_summary);
      console.log(' Fireflies short overview:', response.data.summary.short_overview);
      console.log(' Fireflies meeting type:', response.data.summary.meeting_type);
      console.log(' Fireflies transcript chapters:', response.data.summary.transcript_chapters);
      console.log(' Fireflies keywords:', response.data.summary.keywords);
      console.log(' Fireflies outline:', response.data.summary.outline);
      console.log(' Fireflies shorthand bullet:', response.data.summary.shorthand_bullet);
      return response.data;
    } catch (error) {
      console.error('Failed to get Fireflies transcription:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get status of transcription job
   */
  async getJobStatus(jobId: string): Promise<FirefliesJobStatus> {
    try {
      const useBackend = import.meta.env.VITE_USE_BACKEND_FOR_FIREFLIES !== 'false';
      const endpoint = useBackend ? `${this.baseURL}/jobs/${jobId}` : `${this.baseURL}/transcribe/${jobId}`;
      
      const response = await axios.get<FirefliesJobStatus>(
        endpoint,
        {
          headers: this.getHeaders(),
        }
      );

      console.log(' Fireflies job status:', response.data);
      return response.data;
    } catch (error) {
      console.error(' Failed to get Fireflies job status:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get completed transcription
   */
      async getTranscription(jobId: string): Promise<FirefliesTranscriptionResponse> {
    try {
      const useBackend = import.meta.env.VITE_USE_BACKEND_FOR_FIREFLIES !== 'false';
      const endpoint = useBackend ? `${this.baseURL}/jobs/${jobId}/result` : `${this.baseURL}/transcribe/${jobId}/result`;
      
      const response = await axios.get<FirefliesTranscriptionResponse>(
        endpoint,
        {
          headers: this.getHeaders(),
        }
      );

      console.log(' Fireflies transcription result:', response.data);
      return response.data;
    } catch (error) {
      console.error(' Failed to get Fireflies transcription:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Alias for backward compatibility - now directly returns the transcription
   */
  async waitForCompletion(
    transcriptionResponse: FirefliesTranscriptionResponse, 
    _maxAttempts: number = 1, 
    _intervalMs: number = 0
  ): Promise<FirefliesTranscriptionResponse> {
    console.log(' Transcription already available from Fireflies URL');
    return transcriptionResponse;
  }

  /**
   * Extract meeting overview summary for SOW generation
   * Follows user preference for overview summaries when processing Fireflies data
   */
  extractMeetingOverview(transcript: FirefliesTranscriptionResponse): string {
    const parts: string[] = [];

    // Add short summary if available (more concise)
    if (transcript.summary?.short_summary) {
      parts.push(`## Meeting Summary\n${transcript.summary.short_summary}`);
    } else if (transcript.summary?.overview) {
      parts.push(`## Meeting Overview\n${transcript.summary.overview}`);
    }

    // Add key topics discussed
    if (transcript.summary?.topics_discussed?.length > 0) {
      parts.push(`## Topics Discussed\n${transcript.summary.topics_discussed.map(topic => `- ${topic}`).join('\n')}`);
    }

    // Add action items if available
    if (transcript.summary?.action_items) {
      parts.push(`## Action Items\n${transcript.summary.action_items}`);
    }

    // Add meeting metrics for context
    if (transcript.analytics?.speakers?.length > 0) {
      const speakerSummary = transcript.analytics.speakers
        .map(speaker => `${speaker.name} (${Math.round(speaker.duration_pct)}% participation)`)
        .join(', ');
      parts.push(`## Participants\n${speakerSummary}`);
    }

    return parts.join('\n\n') || 'No meeting overview available.';
  }

  /**
   * Extract key insights from meeting analytics for SOW planning
   */
  extractMeetingInsights(transcript: FirefliesTranscriptionResponse): {
    sentiment: string;
    keyMetrics: Record<string, number>;
    recommendedFocus: string[];
  } {
    const insights = {
      sentiment: 'neutral',
      keyMetrics: {} as Record<string, number>,
      recommendedFocus: [] as string[]
    };

    // Analyze sentiment
    if (transcript.analytics?.sentiments) {
      const { positive_pct, negative_pct, neutral_pct } = transcript.analytics.sentiments;
      if (positive_pct > 50) insights.sentiment = 'positive';
      else if (negative_pct > 30) insights.sentiment = 'negative';
      
      insights.keyMetrics = {
        positive_sentiment: positive_pct,
        negative_sentiment: negative_pct,
        neutral_sentiment: neutral_pct
      };
    }

    // Extract category metrics
    if (transcript.analytics?.categories) {
      Object.assign(insights.keyMetrics, {
        questions_count: transcript.analytics.categories.questions,
        tasks_mentioned: transcript.analytics.categories.tasks,
        metrics_discussed: transcript.analytics.categories.metrics,
        dates_mentioned: transcript.analytics.categories.date_times
      });
    }

    // Generate recommendations based on AI filters and content
    if (transcript.sentences) {
      const taskSentences = transcript.sentences.filter(s => s.ai_filters?.task);
      const pricingSentences = transcript.sentences.filter(s => s.ai_filters?.pricing);
      const questionSentences = transcript.sentences.filter(s => s.ai_filters?.question);

      if (taskSentences.length > 0) insights.recommendedFocus.push('Task Definition');
      if (pricingSentences.length > 0) insights.recommendedFocus.push('Pricing Discussion');
      if (questionSentences.length > 0) insights.recommendedFocus.push('Requirements Clarification');
    }

    return insights;
  }

  /**
   * Format transcript for SOW integration with proper structure
   */
  formatForSOW(transcript: FirefliesTranscriptionResponse): {
    overview: string;
    actionItems: string[];
    keyQuotes: string[];
    participantInsights: Array<{
      name: string;
      participationLevel: string;
      keyContributions: string[];
    }>;
    meetingMetadata: {
      date: string;
      duration: string;
      type: string;
      attendeeCount: number;
    };
  } {
    const overview = this.extractMeetingOverview(transcript);
    
    const actionItems = this.parseActionItems(transcript.summary?.action_items || '');
    
    // Extract key quotes from high-impact sentences
    const keyQuotes = transcript.sentences
      ?.filter(s => s.ai_filters?.task || s.ai_filters?.pricing || s.ai_filters?.metric)
      ?.slice(0, 5) // Limit to top 5
      ?.map(s => `"${s.text}" - ${s.speaker_name}`) || [];

    // Analyze participant contributions
    const participantInsights = transcript.analytics?.speakers?.map(speaker => {
      const participationLevel = speaker.duration_pct > 30 ? 'High' : 
                                speaker.duration_pct > 15 ? 'Medium' : 'Low';
      
      // Find key contributions from this speaker
      const speakerSentences = transcript.sentences?.filter(s => s.speaker_id === speaker.speaker_id) || [];
      const keyContributions = speakerSentences
        .filter(s => s.ai_filters?.task || s.ai_filters?.question)
        .slice(0, 3)
        .map(s => s.text);

      return {
        name: speaker.name,
        participationLevel,
        keyContributions
      };
    }) || [];

    const meetingMetadata = {
      date: transcript.date || transcript.dateString || new Date().toISOString(),
      duration: `${Math.round((transcript.duration || 0) / 60)} minutes`,
      type: transcript.summary?.meeting_type || 'Meeting',
      attendeeCount: transcript.meeting_attendees?.length || transcript.participants?.length || 0
    };

    return {
      overview,
      actionItems,
      keyQuotes,
      participantInsights,
      meetingMetadata
    };
  }

  /**
   * Extract simplified meeting data - just attendees/speakers and summary
   * Perfect for quick SOW reference without overwhelming detail
   */
  extractSimplifiedMeetingData(transcript: FirefliesTranscriptionResponse): {
    attendees: Array<{
      name: string;
      email: string;
      role?: string;
    }>;
    speakers: Array<{
      name: string;
      id: string | number;
    }>;
    summary: {
      overview: string;
      actionItems: string[];
      keywords: string[];
      keyPoints: string;
    };
    meetingInfo: {
      title: string;
      date: string;
      duration: string;
    };
  } {
    // Extract attendees from meeting_attendees
    const attendees = transcript.meeting_attendees?.map(attendee => ({
      name: attendee.displayName || attendee.name || 'Unknown',
      email: attendee.email || '',
      role: attendee.location || undefined // Sometimes role is in location field
    })) || [];

    // Extract speakers
    const speakers = transcript.speakers?.map(speaker => ({
      name: speaker.name,
      id: speaker.id
    })) || [];

    // Extract summary information
    const summary = {
      overview: transcript.summary?.short_summary || transcript.summary?.overview || '',
      actionItems: this.parseActionItems(transcript.summary?.action_items || ''),
      keywords: transcript.summary?.keywords || [],
      keyPoints: transcript.summary?.bullet_gist || transcript.summary?.gist || ''
    };

    // Basic meeting info
    const meetingInfo = {
      title: transcript.title || 'Meeting',
      date: transcript.dateString || transcript.date?.toString() || '',
      duration: transcript.duration ? `${Math.round(transcript.duration)} minutes` : 'Unknown'
    };

    return {
      attendees,
      speakers,
      summary,
      meetingInfo
    };
  }

  /**
   * Parse action items from Fireflies text format into array
   */
  private parseActionItems(actionItemsText: string): string[] {
    if (!actionItemsText) return [];
    
    // Split by person sections and extract action items
    const actionItems: string[] = [];
    const lines = actionItemsText.split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      // Skip person headers (lines starting with **)
      if (line.startsWith('**')) continue;
      
      // Clean up and add action items
      const cleanLine = line.trim();
      if (cleanLine && !cleanLine.startsWith('**')) {
        actionItems.push(cleanLine);
      }
    }
    
    return actionItems;
  }

  private handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.message;
      const status = error.response?.status;
      return new Error(`Fireflies API Error ${status}: ${message}`);
    }
    return error instanceof Error ? error : new Error('Unknown error occurred');
  }
}

// Export singleton instance
export const firefliesService = new FirefliesService();
export default firefliesService;

/**
 * Usage Example for Simplified Meeting Data Extraction:
 * 
 * const transcript = await firefliesService.getExistingTranscription({
 *   meeting_url: 'https://app.fireflies.ai/view/meeting-id'
 * });
 * 
 * // Get just attendees and summary
 * const simplified = firefliesService.extractSimplifiedMeetingData(transcript);
 * 
 * console.log('Meeting:', simplified.meetingInfo.title);
 * console.log('Attendees:', simplified.attendees.map(a => a.name).join(', '));
 * console.log('Action Items:', simplified.summary.actionItems);
 * console.log('Summary:', simplified.summary.overview); // Now contains short_summary
 */

// ===== NEW: CONNECTION MANAGEMENT FUNCTIONS =====

/**
 * Establish a new Fireflies connection using API key
 */
export async function establishFirefliesConnection(apiKey: string, userId: string): Promise<FirefliesConnection> {
  try {
    // First, verify the API key by making a simple GraphQL query
    const verificationQuery = `
      query {
        user {
          user_id
          name
          email
        }
      }
    `;

    const response = await axios.post(
      'https://api.fireflies.ai/graphql',
      { query: verificationQuery },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }

    const userData = response.data.data.user;
    
    // Create connection object
    const connection: FirefliesConnection = {
      id: `conn_${Date.now()}`, // In real app, this would be from database
      userId,
      firefliesUserId: userData.user_id,
      userName: userData.name,
      userEmail: userData.email,
      workspace: 'Default Workspace', // Fireflies doesn't seem to have workspace concept in their API
      apiKey, // In real app, this would be encrypted
      connectedAt: new Date(),
      lastSyncAt: null,
      isActive: true
    };

    // In a real app, save this to the database here
    console.log('Connection established:', connection);

    return connection;
  } catch (error: any) {
    throw new Error(`Failed to establish Fireflies connection: ${error.message}`);
  }
}

/**
 * Fetch all meetings for a connected user
 */
export async function fetchAllMeetings(connection: FirefliesConnection): Promise<FirefliesMeeting[]> {
  try {
    const query = `
      query {
        transcripts {
          id
          title
          date
          duration
          summary {
            overview
            action_items
            keywords
          }
          speakers {
            name
          }
        }
      }
    `;

    const response = await axios.post(
      'https://api.fireflies.ai/graphql',
      { query },
      {
        headers: {
          'Authorization': `Bearer ${connection.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }

    const transcripts = response.data.data.transcripts || [];
    
    return transcripts.map((transcript: any): FirefliesMeeting => ({
      id: `meeting_${transcript.id}`,
      firefliesId: transcript.id,
      title: transcript.title || 'Untitled Meeting',
      date: transcript.date,
      duration: transcript.duration || 0,
      participants: transcript.speakers?.map((s: any) => s.name) || [],
      summary: transcript.summary?.overview || '',
      actionItems: transcript.summary?.action_items || [],
      tags: transcript.summary?.keywords || [],
      status: 'processed' as const
    }));
  } catch (error: any) {
    throw new Error(`Failed to fetch meetings: ${error.message}`);
  }
}

/**
 * Sync latest meetings for a connection
 */
export async function syncLatestMeetings(connection: FirefliesConnection): Promise<{
  newMeetings: FirefliesMeeting[];
  totalCount: number;
}> {
  try {
    // Fetch all meetings
    const allMeetings = await fetchAllMeetings(connection);
    
    // In a real app, you would:
    // 1. Compare with existing meetings in database
    // 2. Only return new meetings since lastSyncAt
    // 3. Update the lastSyncAt timestamp
    
    // For now, simulate getting "new" meetings from last week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const newMeetings = allMeetings.filter(meeting => 
      new Date(meeting.date) >= oneWeekAgo
    );

    return {
      newMeetings,
      totalCount: allMeetings.length
    };
  } catch (error: any) {
    throw new Error(`Failed to sync meetings: ${error.message}`);
  }
}

/**
 * Test connection status
 */
export async function testConnection(connection: FirefliesConnection): Promise<boolean> {
  try {
    const query = `
      query {
        user {
          user_id
        }
      }
    `;

    const response = await axios.post(
      'https://api.fireflies.ai/graphql',
      { query },
      {
        headers: {
          'Authorization': `Bearer ${connection.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return !response.data.errors;
  } catch {
    return false;
  }
}

/**
 * Get connection statistics
 */
export async function getConnectionStats(connection: FirefliesConnection): Promise<{
  totalMeetings: number;
  processedMeetings: number;
  recentMeetings: number;
  lastSyncAt: Date | null;
}> {
  try {
    const allMeetings = await fetchAllMeetings(connection);
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const recentMeetings = allMeetings.filter(meeting => 
      new Date(meeting.date) >= oneWeekAgo
    ).length;

    return {
      totalMeetings: allMeetings.length,
      processedMeetings: allMeetings.filter(m => m.status === 'processed').length,
      recentMeetings,
      lastSyncAt: connection.lastSyncAt
    };
  } catch (error: any) {
    throw new Error(`Failed to get connection stats: ${error.message}`);
  }
} 