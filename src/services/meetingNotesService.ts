import axios from 'axios';
import { API_BASE_URL } from './api/config';

// TypeScript interfaces for meeting notes
export interface StoredMeeting {
  id: string;
  title: string;
  description?: string;
  transcript?: string;
  summary?: string;
  sourceUrl?: string;
  sourceType: string;
  participants: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  duration?: number;
  meetingDate: string;
}

export interface MeetingListItem {
  id: string;
  title: string;
  source: string;
  created_at: string;
  last_modified: string;
  size: number;
}

export interface MeetingListResponse {
  meetings: MeetingListItem[];
  total: number;
}

export interface SaveMeetingRequest {
  title: string;
  description?: string;
  transcript?: string;
  summary?: string;
  sourceUrl?: string;
  sourceType?: string;
  participants?: string[];
  tags?: string[];
  duration?: number;
  meetingDate?: string;
}

class MeetingNotesService {
  private readonly baseURL: string;

  constructor() {
    this.baseURL = `${API_BASE_URL}/meetings`;
  }

  /**
   * Save meeting notes to storage
   */
  async saveMeeting(request: SaveMeetingRequest): Promise<{ id: string; title: string; created_at: string; message: string }> {
    try {
      // Validate required fields before sending
      if (!request.title || typeof request.title !== 'string' || request.title.trim().length === 0) {
        throw new Error('Meeting title is required and must be a non-empty string');
      }
      
      if (request.title.length > 200) {
        throw new Error('Meeting title is too long (max 200 characters)');
      }
      
      console.log('Saving meeting notes:', {
        title: request.title,
        titleLength: request.title.length,
        hasDescription: !!request.description,
        hasTranscript: !!request.transcript,
        transcriptType: typeof request.transcript,
        transcriptLength: typeof request.transcript === 'string' ? request.transcript.length : 0,
        participantsCount: request.participants?.length || 0,
        tagsCount: request.tags?.length || 0,
        sourceType: request.sourceType,
        hasSourceUrl: !!request.sourceUrl
      });
      
      // Additional validation to match backend expectations
      if (!request.description) {
        request.description = 'Meeting notes';
      }
      
      if (!request.summary) {
        request.summary = '';
      }
      
      if (!request.participants) {
        request.participants = [];
      }
      
      if (!request.tags) {
        request.tags = [];
      }
      
      const response = await axios.post(`${this.baseURL}/save`, request, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log(' Meeting notes saved:', response.data);
      return response.data;
    } catch (error) {
      console.error(' Failed to save meeting notes:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get a specific meeting by ID
   */
  async getMeeting(meetingId: string): Promise<StoredMeeting> {
    try {
      console.log('📖 Retrieving meeting:', meetingId);
      
      const response = await axios.get<StoredMeeting>(`${this.baseURL}/${meetingId}`);

      console.log(' Meeting retrieved:', response.data);
      return response.data;
    } catch (error) {
      console.error(' Failed to retrieve meeting:', error);
      throw this.handleError(error);
    }
  }

  /**
   * List all stored meetings
   */
  async listMeetings(): Promise<MeetingListResponse> {
    try {
      console.log(' Listing all meetings');
      
      const response = await axios.get<MeetingListResponse>(this.baseURL);

      console.log(' Meetings listed:', response.data.total, 'meetings found');
      return response.data;
    } catch (error) {
      console.error(' Failed to list meetings:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Delete a meeting
   */
  async deleteMeeting(meetingId: string): Promise<{ message: string }> {
    try {
      console.log(' Deleting meeting:', meetingId);
      
      const response = await axios.delete(`${this.baseURL}/${meetingId}`);

      console.log(' Meeting deleted:', response.data);
      return response.data;
    } catch (error) {
      console.error(' Failed to delete meeting:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Search meetings by title or content
   */
  async searchMeetings(query: string): Promise<MeetingListItem[]> {
    try {
      const allMeetings = await this.listMeetings();
      
      // Simple client-side search - could be enhanced with server-side search
      const filteredMeetings = allMeetings.meetings.filter(meeting =>
        meeting.title.toLowerCase().includes(query.toLowerCase()) ||
        meeting.source.toLowerCase().includes(query.toLowerCase())
      );

      return filteredMeetings;
    } catch (error) {
      console.error(' Failed to search meetings:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Export meeting to PDF (placeholder for future implementation)
   */
  async exportToPdf(meetingId: string): Promise<Blob> {
    try {
      const meeting = await this.getMeeting(meetingId);
      
      // For now, create a simple text file
      const content = `
MEETING NOTES
=============

Title: ${meeting.title}
Date: ${new Date(meeting.meetingDate).toLocaleDateString()}
Source: ${meeting.sourceType}
${meeting.sourceUrl ? `URL: ${meeting.sourceUrl}` : ''}

Description:
${meeting.description || 'No description'}

Participants:
${meeting.participants.length > 0 ? meeting.participants.join(', ') : 'No participants listed'}

Tags:
${meeting.tags.length > 0 ? meeting.tags.join(', ') : 'No tags'}

Transcript:
${meeting.transcript || 'No transcript available'}

Summary:
${meeting.summary || 'No summary available'}
      `;

      return new Blob([content], { type: 'text/plain' });
    } catch (error) {
      console.error(' Failed to export meeting:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Test the API connection with a simple request
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log('Testing meeting notes API connection...');
      
      const testMeeting = {
        title: `Test-Connection-${Date.now()}`,
        description: 'API connection test',
        transcript: 'Test transcript content',
        summary: 'Test summary',
        sourceUrl: '',
        sourceType: 'test' as const,
        participants: ['Test User'],
        tags: ['test'],
        meetingDate: new Date().toISOString()
      };
      
      const response = await axios.post(`${this.baseURL}/save`, testMeeting, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log(' API connection test successful:', response.data);
      return true;
    } catch (error) {
      console.error(' API connection test failed:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response status:', error.response?.status);
        console.error('Response data:', error.response?.data);
        console.error('Request config:', error.config);
      }
      return false;
    }
  }

  /**
   * Handle API errors consistently
   */
  private handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const data = error.response?.data;
      
      let message = 'API request failed';
      
      if (status === 400) {
        message = data?.error || data?.message || 'Bad request - check your input data';
        console.error(' 400 Error Details:', {
          status,
          data,
          url: error.config?.url,
          method: error.config?.method,
          requestData: typeof error.config?.data === 'string' ? 
            error.config.data.substring(0, 500) + '...' : 
            error.config?.data
        });
      } else if (status === 401) {
        message = 'Unauthorized - check your API credentials';
      } else if (status === 403) {
        message = 'Forbidden - insufficient permissions';
      } else if (status === 404) {
        message = 'Resource not found';
      } else if (status === 500) {
        message = 'Server error - please try again later';
      } else {
        message = data?.error || data?.message || error.message;
      }
      
      return new Error(`Meeting Notes API Error: ${message}`);
    }
    return new Error(`Unexpected error: ${error.message || 'Unknown error'}`);
  }
}

// Export singleton instance
export const meetingNotesService = new MeetingNotesService();
export default meetingNotesService; 