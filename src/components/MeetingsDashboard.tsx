import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, Clock, Users, FileText, Download, Eye, Plus } from 'lucide-react';

interface Meeting {
  id: string;
  title: string;
  date: string;
  duration: number; // in minutes
  participants: string[];
  summary: string;
  hasTranscript: boolean;
  hasActionItems: boolean;
  tags: string[];
  status: 'processed' | 'processing' | 'failed';
}

interface MeetingsDashboardProps {
  meetings: Meeting[];
  onMeetingSelect: (meeting: Meeting) => void;
  onImportToSOW: (meeting: Meeting) => void;
}

export default function MeetingsDashboard({ meetings, onMeetingSelect, onImportToSOW }: MeetingsDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'recent' | 'processed' | 'with-actions'>('all');
  const [filteredMeetings, setFilteredMeetings] = useState<Meeting[]>(meetings);

  useEffect(() => {
    let filtered = meetings;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(meeting =>
        meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meeting.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meeting.participants.some(p => p.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply status filter
    switch (selectedFilter) {
      case 'recent':
        filtered = filtered.filter(meeting => {
          const meetingDate = new Date(meeting.date);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return meetingDate >= weekAgo;
        });
        break;
      case 'processed':
        filtered = filtered.filter(meeting => meeting.status === 'processed');
        break;
      case 'with-actions':
        filtered = filtered.filter(meeting => meeting.hasActionItems);
        break;
    }

    setFilteredMeetings(filtered);
  }, [meetings, searchTerm, selectedFilter]);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: Meeting['status']) => {
    switch (status) {
      case 'processed':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Processed</span>;
      case 'processing':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Processing</span>;
      case 'failed':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Failed</span>;
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Meeting Library</h2>
          <p className="text-gray-600">{filteredMeetings.length} meetings available</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          Sync Latest
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search meetings, participants, or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Meetings</option>
            <option value="recent">Recent (7 days)</option>
            <option value="processed">Processed</option>
            <option value="with-actions">With Action Items</option>
          </select>
        </div>
      </div>

      {/* Meetings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMeetings.map((meeting) => (
          <div key={meeting.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            {/* Meeting Header */}
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-medium text-gray-900 line-clamp-2">{meeting.title}</h3>
              {getStatusBadge(meeting.status)}
            </div>

            {/* Meeting Meta */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                {formatDate(meeting.date)}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-2" />
                {formatDuration(meeting.duration)}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Users className="h-4 w-4 mr-2" />
                {meeting.participants.length} participants
              </div>
            </div>

            {/* Summary */}
            <p className="text-sm text-gray-600 mb-4 line-clamp-3">{meeting.summary}</p>

            {/* Features */}
            <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
              {meeting.hasTranscript && (
                <div className="flex items-center">
                  <FileText className="h-3 w-3 mr-1" />
                  Transcript
                </div>
              )}
              {meeting.hasActionItems && (
                <div className="flex items-center">
                  <Download className="h-3 w-3 mr-1" />
                  Action Items
                </div>
              )}
            </div>

            {/* Tags */}
            {meeting.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {meeting.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {tag}
                  </span>
                ))}
                {meeting.tags.length > 3 && (
                  <span className="text-xs text-gray-500">+{meeting.tags.length - 3} more</span>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => onMeetingSelect(meeting)}
                className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-200 transition-colors flex items-center justify-center"
              >
                <Eye className="h-3 w-3 mr-1" />
                View
              </button>
              <button
                onClick={() => onImportToSOW(meeting)}
                disabled={meeting.status !== 'processed'}
                className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <Plus className="h-3 w-3 mr-1" />
                Use in SOW
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredMeetings.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No meetings found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || selectedFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Connect your Fireflies account to import meetings'}
          </p>
          {!searchTerm && selectedFilter === 'all' && (
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Connect Fireflies
            </button>
          )}
        </div>
      )}
    </div>
  );
}