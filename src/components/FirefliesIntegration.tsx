import React, { useState } from 'react';
import { Mic, Upload, Loader2, CheckCircle, XCircle, Copy, Save, Edit3, Zap, ExternalLink, ArrowLeft, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFireflies } from '../hooks/useFireflies';
import { meetingNotesService } from '../services/meetingNotesService';
import { lucidChartsService, LucidShape, LucidChartsResponse } from '../services/lucidChartsService';

export default function FirefliesIntegration() {
  const navigate = useNavigate();
  const [meetingUrl, setMeetingUrl] = useState('');
  const [meetingTitle, setMeetingTitle] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [generatingArchitecture, setGeneratingArchitecture] = useState(false);
  const [showArchitectureModal, setShowArchitectureModal] = useState(false);
  const [architectureData, setArchitectureData] = useState<LucidChartsResponse | null>(null);
  
  // Save form state
  const [saveForm, setSaveForm] = useState({
    title: '',
    description: '',
    tags: '',
    participants: ''
  });
  
  const { transcribeAudio, reset, isTranscribing, progress, result, error } = useFireflies();

  const handleTranscribe = async () => {
    if (!meetingUrl.trim()) {
      alert('Please enter a Fireflies meeting URL');
      return;
    }

    // Validate that it's a Fireflies URL
    if (!meetingUrl.includes('fireflies.ai')) {
      alert('Please enter a valid Fireflies meeting URL (e.g., https://app.fireflies.ai/view/meeting-id)');
      return;
    }

    try {
      await transcribeAudio({
        meeting_url: meetingUrl,
        title: meetingTitle || 'Fireflies Meeting',
      });
    } catch (err) {
      // Error is already handled in the hook
      console.error('Failed to get transcription:', err);
    }
  };



  const copyTranscript = () => {
    if (result?.transcript) {
      navigator.clipboard.writeText(result.transcript);
      alert('Transcript copied to clipboard!');
    }
  };

  const openSaveModal = () => {
    if (result) {
      setSaveForm({
        title: result.title || 'Fireflies Meeting',
        description: 'Imported from Fireflies',
        tags: 'fireflies,imported',
        participants: ''
      });
      setShowSaveModal(true);
      setSaveSuccess(false);
    }
  };

  const saveMeetingNotes = async () => {
    if (!result) return;

    try {
      setSaving(true);
      
      // Validate title before saving
      const cleanTitle = saveForm.title?.trim();
      if (!cleanTitle || cleanTitle.length === 0) {
        throw new Error('Meeting title is required');
      }
      
      if (cleanTitle.length > 180) {
        throw new Error('Meeting title is too long (max 180 characters)');
      }
      
      // Prepare transcript data
      let transcriptData = '';
      if (typeof result.transcript === 'string') {
        transcriptData = result.transcript;
      } else if (result.sentences && Array.isArray(result.sentences)) {
        transcriptData = result.sentences.map(s => `${s.speaker_name}: ${s.text}`).join('\n');
      } else {
        transcriptData = 'Fireflies meeting data imported';
      }
      
      await meetingNotesService.saveMeeting({
        title: cleanTitle,
        description: saveForm.description?.trim() || 'Meeting imported from Fireflies',
        transcript: transcriptData,
        summary: result.summary?.short_summary || result.summary?.overview || '',
        sourceUrl: result.source_url || meetingUrl || '',
        sourceType: 'fireflies',
        participants: saveForm.participants ? 
          saveForm.participants.split(',').map(p => p.trim()).filter(p => p.length > 0).slice(0, 10) : 
          [],
        tags: saveForm.tags ? 
          saveForm.tags.split(',').map(t => t.trim()).filter(t => t.length > 0).slice(0, 10) : 
          ['fireflies'],
        meetingDate: new Date().toISOString()
      });

      setSaveSuccess(true);
      setTimeout(() => {
        setShowSaveModal(false);
        setSaveSuccess(false);
      }, 2000);
    } catch (error: any) {
      console.error('Failed to save meeting:', error);
      alert('Failed to save meeting: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const extractOverview = (transcript: string, title: string) => {
    if (!transcript) {
      return {
        summary: 'No content available',
        wordCount: 0,
        readingTime: 0,
        hasActionItems: false,
        mentionedTech: [] as string[],
        totalLength: 0
      };
    }
    
    // Simple extraction of key information for overview
    const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const firstSentences = sentences.slice(0, 3).join('. ').trim();
    
    // Count words and estimate reading time
    const wordCount = transcript.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200); // ~200 words per minute
    
    // Extract potential action items (simple keyword detection)
    const actionKeywords = ['action item', 'todo', 'follow up', 'next step', 'assign', 'deadline', 'due'];
    const hasActionItems = actionKeywords.some(keyword => 
      transcript.toLowerCase().includes(keyword)
    );
    
    // Extract mentioned technologies/tools
    const techKeywords = ['api', 'database', 'frontend', 'backend', 'system', 'application', 'service'];
    const mentionedTech = techKeywords.filter(tech => 
      transcript.toLowerCase().includes(tech)
    );

    return {
      summary: firstSentences || 'Meeting discussion captured',
      wordCount,
      readingTime,
      hasActionItems,
      mentionedTech: mentionedTech.slice(0, 5), // Limit to 5
      totalLength: transcript.length
    };
  };

  const generateArchitecture = async () => {
    if (!result) return;

    try {
      setGeneratingArchitecture(true);
      
      // Use the enhanced Fireflies data analysis to generate embedded diagram
      const architectureResponse = await lucidChartsService.generateFromFirefliesData(result);
      
      // Show the generated diagram in a modal or embed it directly
      setShowArchitectureModal(true);
      setArchitectureData(architectureResponse);

      // Optional: Also save to meeting notes with architecture tag (non-blocking)
      if (architectureResponse.title && architectureResponse.status === 'completed') {
        try {
          // Enhanced title validation with multiple fallbacks
          let baseTitle = result.title?.trim();
          if (!baseTitle || baseTitle.length === 0) {
            baseTitle = meetingTitle?.trim();
          }
          if (!baseTitle || baseTitle.length === 0) {
            baseTitle = `Fireflies-Meeting-${Date.now()}`;
          }
          
          // Clean title of any problematic characters
          baseTitle = baseTitle.replace(/[^\w\s\-\.]/g, '').trim();
          if (baseTitle.length === 0) {
            baseTitle = `Architecture-Session-${Date.now()}`;
          }
          
          const architectureTitle = `${baseTitle} - Architecture`;
          
          // Ensure title is valid (not empty and reasonable length)
          if (architectureTitle.length < 5 || architectureTitle.length > 180) {
            throw new Error(`Generated title length invalid: ${architectureTitle.length} chars`);
          }
          
          console.log('Auto-saving architecture session with title:', architectureTitle);
          
          // Prepare transcript data carefully
          let transcriptData = '';
          if (typeof result.transcript === 'string') {
            transcriptData = result.transcript;
          } else if (result.sentences && Array.isArray(result.sentences)) {
            transcriptData = result.sentences.map(s => `${s.speaker_name}: ${s.text}`).join('\n');
          } else {
            transcriptData = 'Architecture session based on Fireflies meeting analysis';
          }
          
          const meetingData = {
            title: architectureTitle,
            description: `Architecture diagram automatically generated from Fireflies meeting analysis. Components identified: ${architectureResponse.title}`,
            transcript: transcriptData,
            summary: `Architecture diagram: ${architectureResponse.title}`,
            sourceUrl: result.source_url || meetingUrl || '',
            sourceType: 'fireflies' as const,
            participants: result.meeting_attendees?.slice(0, 10).map(attendee => 
              (attendee.displayName || attendee.name || attendee.email || 'Participant').substring(0, 50)
            ) || [],
            tags: ['architecture', 'fireflies', 'auto-generated'],
            meetingDate: new Date().toISOString()
          };
          
          // Validate the final meeting data
          if (!meetingData.title || meetingData.title.trim().length === 0) {
            throw new Error('Final title validation failed');
          }
          
          await meetingNotesService.saveMeeting(meetingData);
          console.log('Architecture session auto-saved to meeting notes');
        } catch (saveError: any) {
          console.warn('Auto-save skipped (non-critical):', saveError?.message || saveError);
          // This is completely optional - don't let it affect the main flow
        }
      }

    } catch (error: any) {
      console.error('Failed to generate architecture:', error);
      alert(`Failed to generate architecture: ${error.message}`);
    } finally {
      setGeneratingArchitecture(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg my-4">
      {/* Navigation Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <button
             onClick={() => navigate('/settings?tab=integrations')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <div className="flex items-center space-x-2">
            {/* Test API Button - Commented out for production */}
            {/* 
            <button
              onClick={async () => {
                const success = await meetingNotesService.testConnection();
                alert(success ? 'API Test Successful' : 'API Test Failed - Check console for details');
              }}
              className="text-xs text-gray-600 hover:text-gray-800 bg-gray-100 px-2 py-1 rounded"
            >
              Test API
            </button>
            <span className="text-gray-300">|</span>
            */}
            <button
              onClick={() => navigate('/settings?tab=integrations')}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Settings
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={() => navigate('/meetings')}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Meeting Library
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={() => navigate('/architecture')}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Architecture Generator
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Mic className="w-8 h-8 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Fireflies.ai Meeting Import</h2>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
          <p className="text-blue-800 text-sm">
            <strong>Import & Transform Meeting Notes:</strong> Enter a Fireflies meeting URL to get a smart overview of the meeting content. 
            See key highlights, technologies mentioned, and action items - then choose to save or generate architecture diagrams.
          </p>
          <div className="mt-2 flex items-center space-x-4 text-xs text-blue-600">
            <span className="flex items-center">
              <Save className="w-3 h-3 mr-1" />
              Save to Library
            </span>
            <span className="flex items-center">
              <Zap className="w-3 h-3 mr-1" />
              Generate Architecture
            </span>
          </div>
        </div>


      

      {/* Input Form */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fireflies Meeting URL
          </label>
          <div className="relative">
            <Mic className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="url"
              value={meetingUrl}
              onChange={(e) => setMeetingUrl(e.target.value)}
              placeholder="https://app.fireflies.ai/view/your-meeting-id"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isTranscribing}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Find this URL in your Fireflies dashboard by opening any meeting and copying the browser URL
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Meeting Title (Optional)
          </label>
          <input
            type="text"
            value={meetingTitle}
            onChange={(e) => setMeetingTitle(e.target.value)}
            placeholder="e.g., Weekly Team Standup (will use original title if empty)"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isTranscribing}
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
              onClick={reset}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Progress Status */}
      {isTranscribing && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
          <div className="flex items-center space-x-3">
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            <span className="text-blue-800">{progress}</span>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="flex items-center space-x-3">
            <XCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-800">Error: {error}</span>
          </div>
        </div>
      )}

      {/* Success Result */}
      {result && (
        <div className="bg-green-50 border border-green-200 rounded-md p-6">
          <div className="flex items-center space-x-3 mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-semibold text-green-800">Transcription Retrieved!</h3>
          </div>

          {/* Job Info */}
          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Job ID:</span>
              <span className="ml-2 text-gray-600">{result.id}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Status:</span>
              <span className="ml-2 text-green-600 capitalize">{result.status}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Title:</span>
              <span className="ml-2 text-gray-600">{result.title}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Retrieved:</span>
              <span className="ml-2 text-gray-600">
                {result.created_at ? new Date(result.created_at).toLocaleString() : 'Unknown'}
              </span>
            </div>
            {result.source_url && (
              <div className="col-span-2">
                <span className="font-medium text-gray-700">Source:</span>
                <a 
                  href={result.source_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-2 text-blue-600 hover:underline text-sm"
                >
                  View in Fireflies →
                </a>
              </div>
            )}
          </div>

          {/* Meeting Overview */}
          {result.transcript && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-700">Meeting Overview:</h4>
                <button
                  onClick={copyTranscript}
                  className="flex items-center space-x-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy Full Transcript</span>
                </button>
              </div>
              
              {(() => {
                const overview = extractOverview(result.transcript, result.title || '');
                return (
                  <div className="bg-white border border-gray-200 rounded-md p-4">
                    <div className="space-y-3">
                      {/* Summary */}
                      <div>
                        <h5 className="text-sm font-medium text-gray-900 mb-1">Summary</h5>
                        <p className="text-sm text-gray-700">
                          {typeof overview.summary === 'string' 
                            ? overview.summary 
                            : (overview.summary as any)?.short_summary || (overview.summary as any)?.overview || 'No summary available'
                          }
                        </p>
                      </div>
                      
                      {/* Meeting Stats */}
                      <div className="grid grid-cols-2 gap-4 py-2 border-t border-gray-100">
                        <div className="text-center">
                          <p className="text-lg font-semibold text-blue-600">{overview.wordCount}</p>
                          <p className="text-xs text-gray-500">Words</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-semibold text-green-600">{overview.readingTime} min</p>
                          <p className="text-xs text-gray-500">Read Time</p>
                        </div>
                      </div>
                      
                      {/* Technologies Mentioned */}
                      {overview.mentionedTech.length > 0 && (
                        <div className="border-t border-gray-100 pt-2">
                          <h5 className="text-sm font-medium text-gray-900 mb-1">Technologies Mentioned</h5>
                          <div className="flex flex-wrap gap-1">
                                                       {overview.mentionedTech.map((tech: string, index: number) => (
                             <span key={index} className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                               {tech}
                             </span>
                           ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Action Items Indicator */}
                      {overview.hasActionItems && (
                        <div className="border-t border-gray-100 pt-2">
                          <div className="flex items-center text-sm text-amber-700">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            <span>Action items detected in transcript</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Action Options */}
          <div className="mt-4 space-y-3">
            {/* Save to Meeting Notes */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-blue-800 mb-1">Save to Library</h4>
                  <p className="text-xs text-blue-600">
                    Save this transcription to your meeting notes library for future reference
                  </p>
                </div>
                <button
                  onClick={openSaveModal}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                >
                  <Save className="w-4 h-4" />
                  <span>Save to Notes</span>
                </button>
              </div>
            </div>

            {/* Generate Architecture */}
            <div className="bg-purple-50 border border-purple-200 rounded-md p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-purple-800 mb-1">Generate Architecture</h4>
                  <p className="text-xs text-purple-600">
                    Analyze meeting content and generate interactive architecture diagrams with Mermaid code and Lucidchart integration
                  </p>
                </div>
                <button
                  onClick={generateArchitecture}
                  disabled={generatingArchitecture}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generatingArchitecture ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>Create Diagram</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Summary */}
          {result.summary && (
            <div className="mt-4">
              <h4 className="font-medium text-gray-700 mb-2">Summary:</h4>
              <div className="bg-white border border-gray-200 rounded-md p-4">
                <p className="text-gray-800">
                  {typeof result.summary === 'string' 
                    ? result.summary 
                    : (result.summary as any)?.short_summary || (result.summary as any)?.overview || 'No summary available'
                  }
                </p>
              </div>
            </div>
          )}

          {/* Speakers */}
          {result.speakers && result.speakers.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium text-gray-700 mb-2">Speakers:</h4>
              <div className="flex flex-wrap gap-2">
                {result.speakers.map((speaker) => (
                  <span
                    key={speaker.id}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {speaker.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* API Key Warning */}
      {!import.meta.env.VITE_FIREFLIES_API_KEY && !localStorage.getItem('fireflies_api_key') && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mt-6">
          <p className="text-yellow-800">
            <strong>API Key Required:</strong> Please set your Fireflies API key in Settings → Integrations
          </p>
        </div>
      )}

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Save to Meeting Notes</h3>
              <button
                onClick={() => setShowSaveModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {saveSuccess ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <h4 className="text-lg font-medium text-green-800 mb-2">Saved Successfully!</h4>
                <p className="text-sm text-green-600">
                  Meeting notes have been saved to your library
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meeting Title *
                  </label>
                  <input
                    type="text"
                    value={saveForm.title}
                    onChange={(e) => setSaveForm({ ...saveForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter meeting title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={saveForm.description}
                    onChange={(e) => setSaveForm({ ...saveForm, description: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Brief description of the meeting"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Participants
                  </label>
                  <input
                    type="text"
                    value={saveForm.participants}
                    onChange={(e) => setSaveForm({ ...saveForm, participants: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="John Doe, Jane Smith (comma separated)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags
                  </label>
                  <input
                    type="text"
                    value={saveForm.tags}
                    onChange={(e) => setSaveForm({ ...saveForm, tags: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="fireflies, planning, review (comma separated)"
                  />
                </div>

                <div className="flex space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowSaveModal(false)}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveMeetingNotes}
                    disabled={!saveForm.title.trim() || saving}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Meeting
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      </div>

      {/* Embedded Architecture Diagram Modal */}
      {showArchitectureModal && architectureData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-medium text-gray-900">{architectureData.title}</h2>
                <p className="text-sm text-gray-600 mt-1">{architectureData.message}</p>
                {architectureData.status === 'completed' && architectureData.shapes?.length > 0 && (
                  <div className="text-xs text-green-600 mt-1">
                    {architectureData.shapes.length} components, {architectureData.lines?.length || 0} connections created
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {architectureData.mermaidCode && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(architectureData.mermaidCode!);
                      alert('Mermaid diagram code copied to clipboard!');
                    }}
                    className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Copy Mermaid Code
                  </button>
                )}
                {architectureData.editUrl && (
                  <button
                    onClick={() => window.open(architectureData.editUrl, '_blank')}
                    className="px-3 py-2 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700"
                  >
                    Edit in Lucidchart
                  </button>
                )}
                <button
                  onClick={() => setShowArchitectureModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="flex h-[70vh]">
              {/* Left Panel - Lucid Diagram or Mermaid Preview */}
              <div className="flex-1 p-4 overflow-auto">
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Architecture Diagram</h3>
                  
                  {/* Lucid Document Embed */}
                  {architectureData.embedUrl && architectureData.status === 'completed' && (
                    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">
                            Live Lucidchart Document
                          </span>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-green-600">
                              {architectureData.shapes?.length || 0} components
                            </span>
                            <button
                              onClick={() => window.open(architectureData.documentUrl, '_blank')}
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              View Full Page →
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="aspect-video">
                        <iframe
                          src={architectureData.embedUrl}
                          width="100%"
                          height="100%"
                          frameBorder="0"
                          allowFullScreen
                          title="Architecture Diagram"
                          className="w-full h-full"
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Mermaid Diagram Fallback/Preview */}
                  {architectureData.mermaidCode && (
                    <div className="mt-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700">
                          Mermaid Diagram Code
                        </span>
                        <span className="text-xs text-gray-500">
                          Copy for GitHub/GitLab documentation
                        </span>
                      </div>
                      <div className="bg-white p-4 rounded border overflow-auto max-h-64">
                        <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                          {architectureData.mermaidCode}
                        </pre>
                      </div>
                    </div>
                  )}
                  
                  {/* Component Summary */}
                  {architectureData.shapes && architectureData.shapes.length > 0 && (
                    <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-blue-800 mb-2">
                        Generated Components
                      </h4>
                                             <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                         {architectureData.shapes.map((shape: LucidShape, index: number) => (
                           <div
                             key={shape.id || index}
                             className="bg-white px-2 py-1 rounded text-xs border"
                             style={{
                               borderLeftColor: shape.style?.stroke || '#666',
                               borderLeftWidth: '3px'
                             }}
                           >
                             <div className="font-medium">{shape.label}</div>
                             <div className="text-gray-500 capitalize">{shape.type}</div>
                           </div>
                         ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Error State */}
                  {architectureData.status === 'failed' && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-red-800 mb-2">
                        Diagram Generation Failed
                      </h4>
                      <p className="text-sm text-red-700 mb-3">
                        {architectureData.message || 'An error occurred while generating the diagram'}
                      </p>
                      {architectureData.mermaidCode && (
                        <p className="text-xs text-red-600">
                          Mermaid code is available as a fallback option.
                        </p>
                      )}
                    </div>
                  )}
                  
                  {/* API Key Missing Warning */}
                  {!import.meta.env.VITE_LUCIDCHART_API_KEY && (
                    <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-yellow-800 mb-2">
                        Lucidchart API Integration
                      </h4>
                      <p className="text-sm text-yellow-700 mb-2">
                        To create live diagrams in Lucidchart, add your API key to the environment:
                      </p>
                      <code className="text-xs bg-yellow-100 px-2 py-1 rounded">
                        VITE_LUCIDCHART_API_KEY=your_api_key
                      </code>
                      <p className="text-xs text-yellow-600 mt-2">
                        Get your API key from the Lucidchart developer portal.
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Right Panel - Meeting Analysis & Actions */}
              <div className="w-80 border-l border-gray-200 p-4 overflow-auto bg-gray-50">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Meeting Analysis</h3>
                
                {/* Meeting Info */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Source Meeting</h4>
                  <div className="text-sm text-gray-600">
                    <div><strong>Title:</strong> {result?.title}</div>
                    <div><strong>Duration:</strong> {result?.duration ? `${Math.round(result.duration)} minutes` : 'Unknown'}</div>
                    <div><strong>Attendees:</strong> {result?.meeting_attendees?.length || 0}</div>
                  </div>
                </div>
                
                {/* Architecture Stats */}
                {architectureData.shapes && architectureData.shapes.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Architecture Stats</h4>
                    <div className="bg-white p-3 rounded border text-sm">
                      <div className="flex justify-between mb-1">
                        <span>Components:</span>
                        <span className="font-medium">{architectureData.shapes.length}</span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span>Connections:</span>
                        <span className="font-medium">{architectureData.lines?.length || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span className={`font-medium ${
                          architectureData.status === 'completed' ? 'text-green-600' :
                          architectureData.status === 'failed' ? 'text-red-600' : 'text-yellow-600'
                        }`}>
                          {architectureData.status}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Identified Components by Type */}
                {architectureData.shapes && architectureData.shapes.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Component Types</h4>
                                         <div className="space-y-1">
                       {Array.from(new Set(architectureData.shapes.map((s: LucidShape) => s.type))).map((type: string) => {
                         const count = architectureData.shapes!.filter((s: LucidShape) => s.type === type).length;
                         return (
                           <div key={type} className="flex justify-between text-xs bg-white px-2 py-1 rounded">
                             <span className="capitalize">{type}</span>
                             <span className="font-medium">{count}</span>
                           </div>
                         );
                       })}
                    </div>
                  </div>
                )}
                
                {/* Tech Keywords */}
                {result?.summary?.keywords && result.summary.keywords.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Tech Keywords</h4>
                    <div className="flex flex-wrap gap-1">
                      {result.summary.keywords.slice(0, 8).map((keyword, index) => (
                        <span
                          key={index}
                          className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Action Items for Architecture */}
                {result?.summary?.action_items && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Architecture Tasks</h4>
                    <div className="text-xs text-gray-600 bg-white p-3 rounded border max-h-32 overflow-y-auto">
                      {typeof result.summary.action_items === 'string' 
                        ? result.summary.action_items.split('\n').slice(0, 5).map((item, index) => (
                            <div key={index} className="mb-1">• {item.replace(/^\*\*.*?\*\*/, '').trim()}</div>
                          ))
                        : 'No action items found'
                      }
                    </div>
                  </div>
                )}
                
                {/* Collaboration Actions */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-green-800 mb-2">Next Steps</h4>
                  <div className="space-y-2">
                    {architectureData.editUrl && (
                      <button
                        onClick={() => window.open(architectureData.editUrl, '_blank')}
                        className="w-full px-3 py-2 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
                      >
                        Edit & Collaborate →
                      </button>
                    )}
                    {architectureData.mermaidCode && (
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(architectureData.mermaidCode!);
                          alert('Mermaid code copied to clipboard!');
                        }}
                        className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Copy for Docs →
                      </button>
                    )}
                    {architectureData.documentUrl && (
                      <button
                        onClick={() => window.open(architectureData.documentUrl, '_blank')}
                        className="w-full px-3 py-2 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
                      >
                        View Full Diagram →
                      </button>
                    )}
                  </div>
                  <div className="mt-3 text-xs text-green-700">
                    <div>• Share with your development team</div>
                    <div>• Include in project documentation</div>
                    <div>• Add to SOW technical specifications</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 