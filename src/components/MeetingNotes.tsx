import React, { useState, useEffect } from 'react';
import { 
  FolderOpen, 
  Plus, 
  Search, 
  Calendar, 
  ExternalLink, 
  Download, 
  Trash2, 
  Eye,
  Tag,
  Users,
  Clock,
  Loader2,
  Zap,
  TrendingUp,
  MessageCircle,
  Target,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Star,
  Lightbulb
} from 'lucide-react';
import { meetingNotesService, MeetingListItem, StoredMeeting } from '../services/meetingNotesService';
import { lucidChartsService } from '../services/lucidChartsService';
import firefliesService from '../services/firefliesService';

export default function MeetingNotes() {
  const [meetings, setMeetings] = useState<MeetingListItem[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<StoredMeeting | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadMeetings();
  }, []);

  const loadMeetings = async () => {
    try {
      setLoading(true);
      const response = await meetingNotesService.listMeetings();
      setMeetings(response.meetings);
      setError('');
    } catch (err: any) {
      setError(err.message);
      console.error('Failed to load meetings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadMeetings();
      return;
    }

    try {
      setLoading(true);
      const filteredMeetings = await meetingNotesService.searchMeetings(searchQuery);
      setMeetings(filteredMeetings);
      setError('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const viewMeeting = async (meetingId: string) => {
    try {
      setViewing(true);
      const meeting = await meetingNotesService.getMeeting(meetingId);
      setSelectedMeeting(meeting);
      setError('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setViewing(false);
    }
  };

  const deleteMeeting = async (meetingId: string) => {
    if (!confirm('Are you sure you want to delete this meeting? This action cannot be undone.')) {
      return;
    }

    try {
      await meetingNotesService.deleteMeeting(meetingId);
      setMeetings(meetings.filter(m => m.id !== meetingId));
      if (selectedMeeting?.id === meetingId) {
        setSelectedMeeting(null);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const exportMeeting = async (meetingId: string) => {
    try {
      const blob = await meetingNotesService.exportToPdf(meetingId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `meeting-${meetingId}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return Math.round(bytes / 1024) + ' KB';
    return Math.round(bytes / 1048576) + ' MB';
  };

  const generateArchitecture = async (meeting: StoredMeeting) => {
    try {
      // If it's a Fireflies meeting with rich data, use the enhanced service
      if (meeting.sourceType === 'fireflies' && typeof meeting.transcript === 'object') {
        const response = await lucidChartsService.generateFromFirefliesData(meeting.transcript as any);
        alert(`Architecture generated: ${response.title}\n\nMermaid code and Lucidchart link are ready!\n\nCheck the Architecture Generator page for more details.`);
      } else {
        // For other meetings, use the legacy method
        await lucidChartsService.generateArchitectureFromMeeting({
          title: meeting.title,
          transcript: meeting.transcript || '',
          description: meeting.description || '',
          participants: meeting.participants,
          tags: meeting.tags,
          sourceUrl: meeting.sourceUrl
        });
      }
    } catch (error: any) {
      console.error('Failed to generate architecture:', error);
      alert(`Failed to generate architecture: ${error.message}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <FolderOpen className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Meeting Notes</h1>
        </div>
                  <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">
              {meetings.length} meeting{meetings.length !== 1 ? 's' : ''} stored
            </span>
            {selectedMeeting && (
              <button
                onClick={() => generateArchitecture(selectedMeeting)}
                className="inline-flex items-center px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200"
              >
                <Zap className="w-4 h-4 mr-1" />
                Create Diagram
              </button>
            )}
            <a
              href="/architecture"
              className="inline-flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
            >
              <Zap className="w-4 h-4 mr-1" />
              Architecture Generator
            </a>
          </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center space-x-3">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search meetings by title or source..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Search
          </button>
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                loadMeetings();
              }}
              className="px-3 py-2 text-gray-600 hover:text-gray-800"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Meeting List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Stored Meetings</h2>
            </div>
            
            {loading ? (
              <div className="p-8 text-center">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                <p className="text-gray-600">Loading meetings...</p>
              </div>
            ) : meetings.length === 0 ? (
              <div className="p-8 text-center">
                <FolderOpen className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-600 mb-2">No meetings found</p>
                <p className="text-sm text-gray-500">
                  {searchQuery ? 'Try adjusting your search terms' : 'Import your first meeting from Fireflies'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {meetings.map((meeting) => (
                  <div 
                    key={meeting.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer ${
                      selectedMeeting?.id === meeting.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    }`}
                    onClick={() => viewMeeting(meeting.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {meeting.title}
                        </h3>
                        <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center">
                            <Tag className="w-3 h-3 mr-1" />
                            {meeting.source}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatDate(meeting.created_at)}
                          </span>
                          <span>{formatFileSize(meeting.size)}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            exportMeeting(meeting.id);
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600"
                          title="Export"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteMeeting(meeting.id);
                          }}
                          className="p-1 text-gray-400 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Meeting Detail View */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-6">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Meeting Details</h2>
            </div>
            
            {viewing ? (
              <div className="p-4 text-center">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                <p className="text-gray-600">Loading meeting...</p>
              </div>
            ) : selectedMeeting ? (
              <div className="p-4 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                {/* Basic Meeting Info */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {selectedMeeting.title}
                  </h3>
                  {selectedMeeting.description && (
                    <p className="text-sm text-gray-600 mb-3">
                      {selectedMeeting.description}
                    </p>
                  )}
                </div>

                {/* Meeting Metadata */}
                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-gray-600">
                      {formatDate(selectedMeeting.meetingDate)}
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    <Tag className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-gray-600">
                      {selectedMeeting.sourceType}
                    </span>
                  </div>

                  {selectedMeeting.duration && (
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">
                        {selectedMeeting.duration} minutes
                      </span>
                    </div>
                  )}
                </div>

                {/* Fireflies Analytics Section */}
                {selectedMeeting.sourceType === 'fireflies' && renderFirefliesAnalytics(selectedMeeting)}

                {/* Action Items (prioritized for SOW generation) */}
                {renderActionItems(selectedMeeting)}

                {/* Key Insights for SOW */}
                {renderSOWInsights(selectedMeeting)}

                {/* Participants */}
                {selectedMeeting.participants.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      Participants
                    </h4>
                    <div className="text-sm text-gray-600">
                      {selectedMeeting.participants.join(', ')}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {selectedMeeting.tags.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedMeeting.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Overview Summary (user preference) */}
                {renderMeetingOverview(selectedMeeting)}

                {/* Original Source Link */}
                {selectedMeeting.sourceUrl && (
                  <div>
                    <a
                      href={selectedMeeting.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      View Original
                    </a>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => exportMeeting(selectedMeeting.id)}
                    className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Export
                  </button>
                  <button
                    onClick={() => deleteMeeting(selectedMeeting.id)}
                    className="flex-1 flex items-center justify-center px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center">
                <Eye className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-600 mb-2">Select a meeting</p>
                <p className="text-sm text-gray-500">
                  Click on a meeting from the list to view its details and analytics
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Helper Functions */}
      {renderHelperFunctions()}
    </div>
  );

  // Helper function to render Fireflies analytics
  function renderFirefliesAnalytics(meeting: StoredMeeting) {
    // Try to parse Fireflies data from the meeting
    let firefliesData: any = null;
    try {
      if (typeof meeting.transcript === 'string') {
        // Try to parse if transcript contains JSON data
        firefliesData = JSON.parse(meeting.transcript);
      } else if (typeof meeting.transcript === 'object') {
        firefliesData = meeting.transcript;
      }
    } catch {
      // Not JSON data, skip analytics
      return null;
    }

    if (!firefliesData?.analytics) return null;

    const { analytics } = firefliesData;

    return (
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-900 flex items-center">
          <BarChart3 className="w-4 h-4 mr-1" />
          Meeting Analytics
        </h4>
        
        {/* Sentiment Analysis */}
        {analytics.sentiments && (
          <div className="bg-gray-50 p-3 rounded-md">
            <div className="text-xs font-medium text-gray-700 mb-2">Sentiment</div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center">
                <div className="text-green-600 font-medium">{Math.round(analytics.sentiments.positive_pct)}%</div>
                <div className="text-gray-500">Positive</div>
              </div>
              <div className="text-center">
                <div className="text-gray-600 font-medium">{Math.round(analytics.sentiments.neutral_pct)}%</div>
                <div className="text-gray-500">Neutral</div>
              </div>
              <div className="text-center">
                <div className="text-red-600 font-medium">{Math.round(analytics.sentiments.negative_pct)}%</div>
                <div className="text-gray-500">Negative</div>
              </div>
            </div>
          </div>
        )}

        {/* Top Speaker Contributions */}
        {analytics.speakers && analytics.speakers.length > 0 && (
          <div className="bg-blue-50 p-3 rounded-md">
            <div className="text-xs font-medium text-blue-800 mb-2">Speaker Participation</div>
            <div className="space-y-1">
              {analytics.speakers.slice(0, 3).map((speaker: any, index: number) => (
                <div key={index} className="flex justify-between text-xs">
                  <span className="text-blue-700 truncate">{speaker.name}</span>
                  <span className="text-blue-600 font-medium">{Math.round(speaker.duration_pct)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content Categories */}
        {analytics.categories && (
          <div className="bg-purple-50 p-3 rounded-md">
            <div className="text-xs font-medium text-purple-800 mb-2">Content Analysis</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-purple-700">Tasks:</span>
                <span className="font-medium">{analytics.categories.tasks}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-700">Questions:</span>
                <span className="font-medium">{analytics.categories.questions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-700">Metrics:</span>
                <span className="font-medium">{analytics.categories.metrics}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-700">Dates:</span>
                <span className="font-medium">{analytics.categories.date_times}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Helper function to render action items
  function renderActionItems(meeting: StoredMeeting) {
    let actionItems: string[] = [];
    
    try {
      const firefliesData = typeof meeting.transcript === 'string' ? 
        JSON.parse(meeting.transcript) : meeting.transcript;
      
      // Parse action items from string format to array
      if (firefliesData?.summary?.action_items) {
        const actionItemsText = firefliesData.summary.action_items;
        if (typeof actionItemsText === 'string') {
          // Parse the Fireflies action items format
          const lines = actionItemsText.split('\n').filter(line => line.trim());
          for (const line of lines) {
            if (!line.startsWith('**') && line.trim()) {
              actionItems.push(line.trim());
            }
          }
        } else if (Array.isArray(actionItemsText)) {
          actionItems = actionItemsText;
        }
      }
    } catch {
      // Not Fireflies data
    }

    if (actionItems.length === 0) return null;

    return (
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
          <CheckCircle2 className="w-4 h-4 mr-1 text-green-600" />
          Action Items
        </h4>
        <div className="bg-green-50 p-3 rounded-md space-y-2">
          {actionItems.slice(0, 5).map((item, index) => (
            <div key={index} className="flex items-start text-sm">
              <Target className="w-3 h-3 mr-2 mt-0.5 text-green-600 flex-shrink-0" />
              <span className="text-green-800">{item}</span>
            </div>
          ))}
          {actionItems.length > 5 && (
            <div className="text-xs text-green-600 font-medium">
              +{actionItems.length - 5} more action items
            </div>
          )}
        </div>
      </div>
    );
  }

  // Helper function to render SOW insights
  function renderSOWInsights(meeting: StoredMeeting) {
    let insights: string[] = [];
    let hasTaskDiscussions = false;
    let hasPricingDiscussions = false;
    
    try {
      const firefliesData = typeof meeting.transcript === 'string' ? 
        JSON.parse(meeting.transcript) : meeting.transcript;
      
      if (firefliesData?.sentences) {
        hasTaskDiscussions = firefliesData.sentences.some((s: any) => s.ai_filters?.task);
        hasPricingDiscussions = firefliesData.sentences.some((s: any) => s.ai_filters?.pricing);
      }
      
      if (firefliesData?.summary?.topics_discussed) {
        insights = firefliesData.summary.topics_discussed.slice(0, 3);
      }
    } catch {
      // Not Fireflies data
    }

    if (insights.length === 0 && !hasTaskDiscussions && !hasPricingDiscussions) return null;

    return (
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
          <Lightbulb className="w-4 h-4 mr-1 text-yellow-600" />
          SOW Insights
        </h4>
        <div className="bg-yellow-50 p-3 rounded-md space-y-2">
          {hasTaskDiscussions && (
            <div className="flex items-center text-sm text-yellow-800">
              <Star className="w-3 h-3 mr-2 text-yellow-600" />
              Task definitions discussed
            </div>
          )}
          {hasPricingDiscussions && (
            <div className="flex items-center text-sm text-yellow-800">
              <TrendingUp className="w-3 h-3 mr-2 text-yellow-600" />
              Pricing topics mentioned
            </div>
          )}
          {insights.map((topic, index) => (
            <div key={index} className="flex items-start text-sm">
              <MessageCircle className="w-3 h-3 mr-2 mt-0.5 text-yellow-600 flex-shrink-0" />
              <span className="text-yellow-800">{topic}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Helper function to render meeting overview (user preference)
  function renderMeetingOverview(meeting: StoredMeeting) {
    try {
      const firefliesData = typeof meeting.transcript === 'string' ? 
        JSON.parse(meeting.transcript) : meeting.transcript;
      
      if (firefliesData && meeting.sourceType === 'fireflies') {
        const overview = firefliesService.extractMeetingOverview(firefliesData);
        if (overview && overview !== 'No meeting overview available.') {
          return (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Overview Summary</h4>
              <div className="bg-blue-50 p-3 rounded text-sm text-blue-900 max-h-48 overflow-y-auto whitespace-pre-wrap">
                {overview}
              </div>
            </div>
          );
        }
      }
    } catch {
      // Fall back to regular summary or transcript
    }

    // Fallback to existing summary display
    if (meeting.summary) {
      // Handle case where summary might be a Fireflies object or a string
      let summaryText = '';
      if (typeof meeting.summary === 'string') {
        summaryText = meeting.summary;
      } else if (typeof meeting.summary === 'object' && meeting.summary !== null) {
        // If it's a Fireflies summary object, try to use short_summary first
        const summaryObj = meeting.summary as any;
        if (summaryObj.short_summary) {
          summaryText = summaryObj.short_summary;
        } else if (summaryObj.overview) {
          summaryText = summaryObj.overview;
        } else {
          // Convert object to readable format
          summaryText = JSON.stringify(meeting.summary, null, 2);
        }
      } else {
        summaryText = 'No summary available';
      }

      return (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">Summary</h4>
          <div className="bg-blue-50 p-3 rounded text-sm text-blue-900 whitespace-pre-wrap">
            {summaryText}
          </div>
        </div>
      );
    }

    return null;
  }

  // Helper function placeholder (will be replaced by build system)
  function renderHelperFunctions() {
    return null;
  }
} 