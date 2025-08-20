import { useState, useEffect } from 'react';
import { MessageSquare, Search, Calendar, Users, Clock, Download, CheckCircle, XCircle, Loader2, Upload, Copy, Save, Mic, Zap, ArrowDownFromLine, AlertCircle, FileSpreadsheet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFireflies } from '../../../hooks/useFireflies';
import firefliesCacheService, { CachedFirefliesMeetings } from '../../../services/firefliesCacheService';
import { FirefliesMeeting } from '../../../stores/firefliesStore';
import wbsGenerationService from '../../../services/wbsGenerationService';
import { NotificationType } from '../../../hooks/useNotification';

interface Meeting {
  id: string;
  title: string;
  date: string;
  duration: string;
  participants: string[];
  transcript?: string;
  summary?: string;
  firefliesId?: string;
}

interface MeetingNotesTabProps {
  onMeetingSelect?: (meeting: Meeting | null) => void;
  showNotification: (notification: {
    type: NotificationType;
    title: string;
    message?: string;
    duration?: number;
    actions?: Array<{
      label: string;
      action: () => void;
      primary?: boolean;
    }>;
  }) => string;
  switchToTab: (tab: string) => void;
}

export default function MeetingNotesTab({ onMeetingSelect, showNotification, switchToTab }: MeetingNotesTabProps) {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [firefliesConnectionStatus, setFirefliesConnectionStatus] = useState<'idle' | 'connected' | 'failed'>('idle');
  const [showImportTool, setShowImportTool] = useState(false);
  
  // Cache and manual pull state
  const [cachedData, setCachedData] = useState<CachedFirefliesMeetings>({ meetings: [], lastPulledAt: 'never', isStale: true });
  const [isManualPulling, setIsManualPulling] = useState(false);
  const [pullError, setPullError] = useState<string | null>(null);
  const [lastPullResult, setLastPullResult] = useState<{ success: boolean; count: number; timestamp: string } | null>(null);
  
  // WBS generation state
  const [selectedMeetingIds, setSelectedMeetingIds] = useState<Set<string>>(new Set());
  const [isGeneratingWBS, setIsGeneratingWBS] = useState(false);
  
  // Fireflies import state
  const [meetingUrl, setMeetingUrl] = useState('');
  const [meetingTitle, setMeetingTitle] = useState('');
  const { transcribeAudio, reset, isTranscribing, progress, result, error } = useFireflies();

  // Initialize component with cached data
  useEffect(() => {
    // Load initial cached data
    const initialData = firefliesCacheService.getCachedMeetings();
    setCachedData(initialData);
    convertAndSetMeetings(initialData.meetings);

    // Subscribe to cache updates
    const unsubscribe = firefliesCacheService.subscribe((data) => {
      setCachedData(data);
      convertAndSetMeetings(data.meetings);
    });

    // Check Fireflies connection status
    checkFirefliesConnection();

    return () => {
      unsubscribe();
    };
  }, []);

  // Convert FirefliesMeeting[] to Meeting[]
  const convertAndSetMeetings = (firefliesMeetings: FirefliesMeeting[]) => {
    const convertedMeetings: Meeting[] = firefliesMeetings.map((fm) => ({
      id: fm.meetingId,
      title: fm.title,
      date: new Date(fm.meetingDate).toISOString().split('T')[0],
      duration: formatDuration(fm.durationMinutes),
      participants: fm.participants || [],
      transcript: '', // Full transcript needs to be fetched separately from Fireflies API
      summary: fm.summary,
      firefliesId: fm.firefliesMeetingId
    }));
    setMeetings(convertedMeetings);
  };

  // Handle manual pull from Fireflies API
  const handleManualPull = async () => {
    setIsManualPulling(true);
    setPullError(null);
    
    try {
      const result = await firefliesCacheService.manualPull();
      setLastPullResult({
        success: result.success,
        count: result.meetingsCount,
        timestamp: result.timestamp
      });
      
      if (!result.success && result.error) {
        setPullError(result.error);
      }
    } catch (error: any) {
      setPullError(error.message || 'Failed to pull meetings');
      setLastPullResult({
        success: false,
        count: 0,
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsManualPulling(false);
    }
  };

  // Format last pulled time for display
  const formatLastPulledTime = (timestamp: string): string => {
    if (timestamp === 'never') return 'Never';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffHours < 1) {
      return `${diffMinutes} min ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Helper function to format duration consistently
  const formatDuration = (duration: number | undefined): string => {
    if (!duration || duration <= 0) return 'Unknown';
    
    // Handle both minutes and seconds intelligently
    // If duration > 300, assume it's in seconds (5+ minutes = 300+ seconds)
    // If duration <= 300, assume it's in minutes
    if (duration > 300) {
      return `${Math.round(duration / 60)} min`; // Convert seconds to minutes
    } else {
      return `${Math.round(duration)} min`; // Already in minutes
    }
  };

  const checkFirefliesConnection = async () => {
    try {
      // Check if Fireflies API key exists in localStorage or session
      const apiKey = localStorage.getItem('fireflies_api_key');
      if (apiKey) {
        setFirefliesConnectionStatus('connected');
        return true;
      } else {
        setFirefliesConnectionStatus('idle');
        return false;
      }
    } catch (error) {
      setFirefliesConnectionStatus('failed');
      return false;
    }
  };

  const handleOpenTranscriptionTool = () => {
    setShowImportTool(!showImportTool);
  };

  const handleTranscribe = async () => {
    if (!meetingUrl.trim()) return;
    
    try {
      await transcribeAudio({
        meeting_url: meetingUrl,
        title: meetingTitle || undefined
      });
    } catch (error) {
      console.error('Transcription failed:', error);
    }
  };

  const handleGoToSettings = () => {
    navigate('/settings');
  };

  const handleMeetingSelect = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    onMeetingSelect?.(meeting);
  };

  // Convert FirefliesTranscriptionResponse to Meeting format for consistency
  const convertTranscriptionResponseToMeeting = (response: any): Meeting => {
    return {
      id: response.id,
      title: response.title,
      date: new Date(response.date).toISOString().split('T')[0],
      duration: formatDuration(response.duration),
      participants: response.participants || [],
      transcript: response.transcript,
      summary: response.summary?.overview || response.summary?.short_summary,
      firefliesId: response.id
    };
  };

  // Handle meeting selection for WBS generation
  const handleMeetingSelection = (meetingId: string, selected: boolean) => {
    const newSelectedIds = new Set(selectedMeetingIds);
    if (selected) {
      newSelectedIds.add(meetingId);
    } else {
      newSelectedIds.delete(meetingId);
    }
    setSelectedMeetingIds(newSelectedIds);
  };

  const handleSelectAllMeetings = (selected: boolean) => {
    if (selected) {
      setSelectedMeetingIds(new Set(filteredMeetings.map(m => m.id)));
    } else {
      setSelectedMeetingIds(new Set());
    }
  };

  const handleGenerateWBS = async () => {
    if (selectedMeetingIds.size === 0) return;
    
    setIsGeneratingWBS(true);
    try {
      const selectedMeetings = meetings.filter(m => selectedMeetingIds.has(m.id));
      
      // Prepare meeting data for WBS generation
      const meetingData = selectedMeetings.map(meeting => ({
        id: meeting.id,
        title: meeting.title,
        summary: meeting.summary || '',
        participants: meeting.participants,
        date: meeting.date
      }));

      console.log('Generating WBS for meetings:', meetingData);
      
      // Generate WBS using the service
      const generatedWBS = await wbsGenerationService.generateWBS(meetingData);
      
      console.log('Generated WBS:', generatedWBS);
      
      // Store the WBS in localStorage for now (later we can use a proper store)
      localStorage.setItem('generated_wbs', JSON.stringify(generatedWBS));
      
      // Show success notification and navigate to WBS tab
      showNotification({
        type: 'success',
        title: 'WBS Generated Successfully!',
        message: `${generatedWBS.items.length} items • ${generatedWBS.totalEstimate.hours} hours estimated`,
        duration: 4000,
        actions: [
          {
            label: 'View WBS',
            action: () => switchToTab('wbs'),
            primary: true
          }
        ]
      });
      
      // Clear selections
      setSelectedMeetingIds(new Set());
      
      // Automatically navigate to Work Breakdown tab after a short delay
      setTimeout(() => {
        switchToTab('wbs');
      }, 1500);
      
    } catch (error: any) {
      console.error('WBS generation failed:', error);
      
      // Show error notification
      showNotification({
        type: 'error',
        title: 'WBS Generation Failed',
        message: error.message || 'Please check your AI service configuration and try again.',
        duration: 6000
      });
    } finally {
      setIsGeneratingWBS(false);
    }
  };

  const filteredMeetings = meetings.filter(meeting =>
    meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    meeting.participants.some(p => p.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Show connection prompt if not connected
  if (firefliesConnectionStatus !== 'connected') {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center">
          <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Connect Fireflies.ai</h3>
          <p className="text-gray-600 mb-6">
            Connect your Fireflies.ai account to automatically load all your meeting transcripts and notes directly into the SOW builder.
          </p>
          <button
            onClick={handleGoToSettings}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go to Settings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <MessageSquare className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-medium text-gray-900">Meeting Notes</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleManualPull}
              disabled={isManualPulling}
              className="flex items-center space-x-2 px-3 py-2 border border-blue-300 text-blue-700 rounded-md hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Pull latest meetings from Fireflies"
            >
              <ArrowDownFromLine className={`w-4 h-4 ${isManualPulling ? 'animate-bounce' : ''}`} />
              <span>
                {isManualPulling ? 'Pulling...' : 'Pull Now'}
              </span>
            </button>
            <button
              onClick={handleOpenTranscriptionTool}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md ${
                showImportTool 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'border border-blue-600 text-blue-600 hover:bg-blue-50'
              }`}
            >
              <Mic className="w-4 h-4" />
              <span>{showImportTool ? 'Hide Import Tool' : 'Import Meeting'}</span>
            </button>
          </div>
        </div>

        {/* Cache Status */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <span>Last updated: {formatLastPulledTime(cachedData.lastPulledAt)}</span>
              {cachedData.isStale && (
                <span className="inline-flex items-center space-x-1 text-amber-600">
                  <AlertCircle className="w-4 h-4" />
                  <span>Data may be outdated</span>
                </span>
              )}
            </div>
            <span>{meetings.length} meetings</span>
          </div>
          {cachedData.lastPulledAt !== 'never' && (
            <div className="text-xs text-gray-500">
              Next auto-pull: {firefliesCacheService.getFormattedTimeUntilNextPull()}
            </div>
          )}
        </div>

        {/* Pull Status */}
        {pullError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-start space-x-2">
              <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-700">Failed to pull meetings:</p>
                <p className="text-xs text-red-600 mt-1">{pullError}</p>
              </div>
            </div>
          </div>
        )}

        {lastPullResult && lastPullResult.success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <p className="text-sm text-green-700">
                Successfully pulled {lastPullResult.count} meetings
              </p>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search meetings..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* WBS Generation Controls */}
        {filteredMeetings.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                <div>
                  <h4 className="text-sm font-medium text-blue-900">Generate Work Breakdown Structure</h4>
                  <p className="text-xs text-blue-700">Select meetings to analyze and generate a structured WBS</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <label className="flex items-center space-x-2 text-sm text-blue-700">
                  <input
                    type="checkbox"
                    checked={selectedMeetingIds.size === filteredMeetings.length && filteredMeetings.length > 0}
                    onChange={(e) => handleSelectAllMeetings(e.target.checked)}
                    className="rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Select All ({filteredMeetings.length})</span>
                </label>
                <button
                  onClick={handleGenerateWBS}
                  disabled={selectedMeetingIds.size === 0 || isGeneratingWBS}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGeneratingWBS ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="w-4 h-4" />
                  )}
                  <span>
                    {isGeneratingWBS 
                      ? 'Generating...' 
                      : `Generate WBS (${selectedMeetingIds.size} selected)`
                    }
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Fireflies Import Tool */}
        {showImportTool && (
          <div className="border-t border-gray-200 bg-white p-6 mt-4">
            <div className="max-w-4xl mx-auto">
              {/* Header */}
              <div className="flex items-center space-x-3 mb-6">
                <Mic className="w-8 h-8 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Fireflies.ai Meeting Import</h2>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <div className="flex-1">
                    <p className="text-blue-800">
                      <strong>Import & Transform Meeting Notes:</strong> Enter a Fireflies meeting URL to get a smart overview of the meeting content. See key highlights, technologies mentioned, and action items - then choose to save or generate architecture diagrams.
                    </p>
                    <div className="flex items-center space-x-4 mt-3">
                      <div className="flex items-center space-x-2 text-blue-700">
                        <Save className="w-4 h-4" />
                        <span className="text-sm">Save to Library</span>
                      </div>
                      <div className="flex items-center space-x-2 text-blue-700">
                        <Zap className="w-4 h-4" />
                        <span className="text-sm">Generate Architecture</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Input Form */}
              <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fireflies Meeting URL
                    </label>
                    <div className="relative">
                      <Mic className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="url"
                        placeholder="https://app.fireflies.ai/view/your-meeting-id"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                        value={meetingUrl}
                        onChange={(e) => setMeetingUrl(e.target.value)}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Find this URL in your Fireflies dashboard by opening any meeting and copying the browser URL
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meeting Title (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Weekly Team Standup (will use original title if empty)"
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                      value={meetingTitle}
                      onChange={(e) => setMeetingTitle(e.target.value)}
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={handleTranscribe}
                      disabled={isTranscribing || !meetingUrl.trim()}
                      className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isTranscribing ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Upload className="w-5 h-5" />
                      )}
                      <span>{isTranscribing ? 'Retrieving...' : 'Get Transcription'}</span>
                    </button>

                    {(result || error) && (
                      <button
                        onClick={() => {
                          reset();
                          setMeetingUrl('');
                          setMeetingTitle('');
                        }}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                      >
                        Reset
                      </button>
                    )}
                  </div>

                  {/* Progress indicator */}
                  {isTranscribing && progress && (
                    <div className="bg-gray-50 p-4 rounded-md">
                      <div className="flex items-center space-x-3">
                        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                        <span className="text-sm text-gray-700">{progress}</span>
                      </div>
                    </div>
                  )}

                  {/* Error display */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                      <div className="flex items-start space-x-3">
                        <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                        <div>
                          <h4 className="text-sm font-medium text-red-800">Import Failed</h4>
                          <p className="text-sm text-red-700 mt-1">{error}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Success result */}
                  {result && (
                    <div className="bg-green-50 border border-green-200 rounded-md p-6">
                      <div className="flex items-start space-x-3 mb-4">
                        <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="text-lg font-medium text-green-800">Import Successful!</h4>
                          <p className="text-sm text-green-700 mt-1">
                            Meeting content has been processed and is ready for review.
                          </p>
                        </div>
                      </div>

                      {/* Display processed result */}
                      <div className="bg-white rounded-md p-4 border border-green-200">
                        <h5 className="font-medium text-gray-900 mb-2">{result.title}</h5>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                          <div>
                            <span className="text-gray-500">Date:</span>
                            <span className="ml-2 text-gray-900">{result.date}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Duration:</span>
                            <span className="ml-2 text-gray-900">{result.duration}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Participants:</span>
                            <span className="ml-2 text-gray-900">{result.participants.join(', ')}</span>
                          </div>
                        </div>
                        
                        {(result.summary?.overview || result.summary?.short_summary) && (
                          <div className="mb-4">
                            <h6 className="font-medium text-gray-900 mb-2">Summary</h6>
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {result.summary.overview || result.summary.short_summary}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex space-x-3 mt-4">
                        <button
                          onClick={() => navigate('/architecture-generator')}
                          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          <Zap className="w-4 h-4" />
                          <span>Generate Architecture</span>
                        </button>
                        <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
                          <Save className="w-4 h-4" />
                          <span>Save to Library</span>
                        </button>
                        <button 
                          onClick={() => handleMeetingSelect(convertTranscriptionResponseToMeeting(result))}
                          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                        >
                          <Copy className="w-4 h-4" />
                          <span>Use in SOW</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {filteredMeetings.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No meetings found</h3>
              <p className="text-gray-600">
                {cachedData.lastPulledAt === 'never' 
                  ? "Click 'Pull Now' to load meetings from Fireflies"
                  : searchTerm 
                    ? "Try adjusting your search terms"
                    : "No meetings available in cache"
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="h-full flex">
            {/* Meetings List */}
            <div className={`${selectedMeeting ? 'w-1/3' : 'w-full'} border-r border-gray-200 overflow-y-auto`}>
              <div className="p-4 space-y-2">
                {filteredMeetings.map((meeting) => (
                  <div
                    key={meeting.id}
                    className={`p-4 border border-gray-200 rounded-lg transition-colors ${
                      selectedMeeting?.id === meeting.id ? 'bg-blue-50 border-blue-300' : ''
                    } ${
                      selectedMeetingIds.has(meeting.id) ? 'ring-2 ring-blue-200' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Selection Checkbox */}
                      <div className="pt-1">
                        <input
                          type="checkbox"
                          checked={selectedMeetingIds.has(meeting.id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleMeetingSelection(meeting.id, e.target.checked);
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </div>

                      {/* Meeting Content */}
                      <div 
                        className="flex-1 cursor-pointer"
                        onClick={() => handleMeetingSelect(meeting)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900 flex-1">{meeting.title}</h4>
                          <span className="text-xs text-gray-500 ml-2">{meeting.date}</span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{meeting.duration}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>{meeting.participants.length}</span>
                          </div>
                          {selectedMeetingIds.has(meeting.id) && (
                            <div className="flex items-center space-x-1 text-blue-600">
                              <CheckCircle className="w-4 h-4" />
                              <span className="text-xs">Selected</span>
                            </div>
                          )}
                        </div>
                        {meeting.summary && (
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                            {meeting.summary}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Meeting Details */}
            {selectedMeeting && (
              <div className="flex-1 overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedMeeting.title}</h2>
                      <div className="flex items-center space-x-4 mt-2 text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{selectedMeeting.date}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{selectedMeeting.duration}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>{selectedMeeting.participants.length} participants</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedMeeting(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <XCircle className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Participants */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Participants</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedMeeting.participants.map((participant, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700"
                          >
                            {participant}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Summary */}
                    {selectedMeeting.summary && (
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Summary</h3>
                        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                          <p className="text-gray-800 leading-relaxed">{selectedMeeting.summary}</p>
                        </div>
                      </div>
                    )}

                    {/* Transcript */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-medium text-gray-900">Full Transcript</h3>
                        {selectedMeeting.transcript && (
                          <button className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800">
                            <Download className="w-4 h-4" />
                            <span>Download</span>
                          </button>
                        )}
                      </div>
                      <div className="bg-gray-50 p-4 rounded-md border border-gray-200 min-h-[200px]">
                        {selectedMeeting.transcript ? (
                          <pre className="whitespace-pre-wrap text-sm text-gray-800 leading-relaxed">{selectedMeeting.transcript}</pre>
                        ) : (
                          <div className="flex items-center justify-center h-32 text-gray-500">
                            <div className="text-center">
                              <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                              <p className="text-sm">Full transcript not loaded</p>
                              <p className="text-xs">Transcripts are fetched separately to reduce API calls and improve performance</p>
                              <p className="text-xs mt-1">Use the "Import Meeting" tool above to get the full transcript if needed</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}