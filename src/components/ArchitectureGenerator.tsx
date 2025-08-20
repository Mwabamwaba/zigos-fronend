import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  FileText, 
  ExternalLink, 
  Loader2, 
  CheckCircle,
  Download,
  Users,
  Tag
} from 'lucide-react';
import { meetingNotesService, MeetingListItem, StoredMeeting } from '../services/meetingNotesService';
import { lucidChartsService } from '../services/lucidChartsService';

export default function ArchitectureGenerator() {
  const [meetings, setMeetings] = useState<MeetingListItem[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<StoredMeeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadMeetings();
  }, []);

  const loadMeetings = async () => {
    try {
      setLoading(true);
      const response = await meetingNotesService.listMeetings();
      setMeetings(response.meetings);
    } catch (err) {
      console.error('Failed to load meetings:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectMeeting = async (meetingId: string) => {
    try {
      const meeting = await meetingNotesService.getMeeting(meetingId);
      setSelectedMeeting(meeting);
    } catch (err) {
      console.error('Failed to load meeting:', err);
    }
  };

  const generateArchitecture = async () => {
    if (!selectedMeeting) return;

    try {
      setGenerating(true);
      
      await lucidChartsService.openInLucidCharts({
        title: selectedMeeting.title,
        transcript: selectedMeeting.transcript || '',
        description: selectedMeeting.description || '',
        participants: selectedMeeting.participants,
        tags: selectedMeeting.tags,
        sourceUrl: selectedMeeting.sourceUrl
      });

    } catch (error: any) {
      console.error('Failed to generate architecture:', error);
      
      // More user-friendly error messages
      let errorMessage = 'Failed to generate architecture';
      if (error.message?.includes('Meeting title is required')) {
        errorMessage = 'Could not generate architecture: Meeting title is missing. Please try refreshing and selecting the meeting again.';
      } else if (error.message?.includes('API Error')) {
        errorMessage = 'There was an issue connecting to the service. Please try again.';
      } else {
        errorMessage = `Failed to generate architecture: ${error.message}`;
      }
      
      alert(errorMessage);
    } finally {
      setGenerating(false);
    }
  };

  const exportContext = () => {
    if (!selectedMeeting) return;

    const context = lucidChartsService.exportArchitectureContext({
      title: selectedMeeting.title,
      transcript: selectedMeeting.transcript || '',
      description: selectedMeeting.description || '',
      participants: selectedMeeting.participants,
      tags: selectedMeeting.tags,
      sourceUrl: selectedMeeting.sourceUrl
    });

    const blob = new Blob([context], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedMeeting.title}-architecture-context.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredMeetings = meetings.filter(meeting =>
    meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    meeting.source.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <Zap className="w-8 h-8 text-blue-600" />
            <h1 className="text-xl font-semibold text-gray-900">Architecture Generator</h1>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
            <p className="text-sm text-gray-600 leading-relaxed">
              <strong>Transform Meetings into Architecture:</strong> Select any stored meeting notes to automatically generate 
              architecture diagrams in Lucid Charts. The system analyzes your meeting content to identify components, relationships, and tech stack.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Meeting Selection */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Meeting</h2>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search meetings..."
              className="w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-3"
            />
          </div>
          
          {loading ? (
            <div className="bg-gray-50 rounded-2xl p-8 text-center">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
              <p className="text-sm text-gray-600 leading-relaxed">Loading meetings...</p>
            </div>
          ) : filteredMeetings.length === 0 ? (
            <div className="bg-gray-50 rounded-2xl p-8 text-center">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-sm text-gray-600 leading-relaxed mb-2">No meetings found</p>
              <p className="text-sm text-gray-600 leading-relaxed">
                {searchQuery ? 'Try adjusting your search' : 'Import meetings from Fireflies first'}
              </p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto space-y-2">
              {filteredMeetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className={`p-4 rounded-lg border cursor-pointer transition ${
                    selectedMeeting?.id === meeting.id 
                      ? 'bg-blue-50 border-blue-600' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => selectMeeting(meeting.id)}
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{meeting.title}</h3>
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <span className="flex items-center">
                      <Tag className="w-3 h-3 mr-1" />
                      {meeting.source}
                    </span>
                    <span>{new Date(meeting.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Architecture Preview & Actions */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Architecture Preview</h2>
          
          {selectedMeeting ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {selectedMeeting.title}
                </h3>
                {selectedMeeting.description && (
                  <p className="text-sm text-gray-600 leading-relaxed mb-3">
                    {selectedMeeting.description}
                  </p>
                )}
              </div>

              {selectedMeeting.participants.length > 0 && (
                <div className="bg-gray-50 rounded-2xl p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Participants</h4>
                  <div className="flex items-center text-sm text-gray-600 leading-relaxed">
                    <Users className="w-4 h-4 mr-2" />
                    {selectedMeeting.participants.join(', ')}
                  </div>
                </div>
              )}

              {selectedMeeting.tags.length > 0 && (
                <div className="bg-gray-50 rounded-2xl p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedMeeting.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-block px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedMeeting.transcript && (
                <div className="bg-gray-50 rounded-2xl p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Content Preview</h4>
                  <div className="bg-white p-4 rounded-lg text-sm text-gray-600 leading-relaxed max-h-32 overflow-y-auto border border-gray-200">
                    {selectedMeeting.transcript.substring(0, 300)}
                    {selectedMeeting.transcript.length > 300 && '...'}
                  </div>
                </div>
              )}

              <div className="flex space-x-4 pt-4">
                <button
                  onClick={generateArchitecture}
                  disabled={generating}
                  className={`flex-1 flex items-center justify-center px-4 py-2 rounded-lg transition ${
                    generating
                      ? 'bg-blue-400 text-white cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Opening...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Generate in Lucid
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </>
                  )}
                </button>
                <button
                  onClick={exportContext}
                  className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                  title="Export context for manual use"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
                <p className="text-lg font-semibold text-gray-900 mb-2">What will be generated:</p>
                <ul className="space-y-1 text-sm text-gray-600 leading-relaxed">
                  <li>• Architectural components identified from meeting content</li>
                  <li>• System relationships and data flows</li>
                  <li>• Technology stack recommendations</li>
                  <li>• Appropriate diagram template selection</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-2xl p-8 text-center">
              <Zap className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-sm text-gray-600 leading-relaxed mb-2">Select a meeting</p>
              <p className="text-sm text-gray-600 leading-relaxed">
                Choose a meeting from the list to preview its architecture potential
              </p>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
} 