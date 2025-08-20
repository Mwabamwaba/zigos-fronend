import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  Users, 
  FileText, 
  Plus, 
  Eye, 
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { useFirefliesStore, useFirefliesActions, FirefliesMeeting } from '../../stores/firefliesStore';
import useFirefliesApi from '../../hooks/useFirefliesApi';

interface FirefliesMeetingListProps {
  onMeetingSelect?: (meeting: FirefliesMeeting) => void;
  onImportToSow?: (meeting: FirefliesMeeting) => void;
}

export const FirefliesMeetingList: React.FC<FirefliesMeetingListProps> = ({
  onMeetingSelect,
  onImportToSow,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'recent' | 'processed' | 'with-actions'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMeetings, setSelectedMeetings] = useState<Set<string>>(new Set());

  const {
    meetings,
    meetingsLoading,
    meetingsError,
    meetingsPagination,
    connection,
    filters,
  } = useFirefliesStore();

  const {
    setFilters,
    setMeetingsError,
  } = useFirefliesActions();

  const {
    loadMeetings,
    searchMeetings,
    loadRecentMeetings,
    syncMeetings,
  } = useFirefliesApi();

  // Load initial meetings when component mounts
  useEffect(() => {
    if (connection && meetings.length === 0) {
      loadMeetings(0, 50);
    }
  }, [connection, meetings.length, loadMeetings]);

  // Filter meetings based on current filters
  const filteredMeetings = useMemo(() => {
    let filtered = [...meetings];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(meeting =>
        meeting.title.toLowerCase().includes(term) ||
        meeting.summary.toLowerCase().includes(term) ||
        meeting.participants.some(p => p.toLowerCase().includes(term)) ||
        meeting.tags.some(t => t.toLowerCase().includes(term))
      );
    }

    // Apply status filter
    switch (selectedFilter) {
      case 'recent':
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        filtered = filtered.filter(meeting => new Date(meeting.meetingDate) >= weekAgo);
        break;
      case 'processed':
        filtered = filtered.filter(meeting => meeting.status === 'completed');
        break;
      case 'with-actions':
        filtered = filtered.filter(meeting => meeting.actionItems.length > 0);
        break;
    }

    return filtered.sort((a, b) => 
      new Date(b.meetingDate).getTime() - new Date(a.meetingDate).getTime()
    );
  }, [meetings, searchTerm, selectedFilter]);

  const handleSearch = async () => {
    if (!connection) return;

    const searchRequest = {
      searchTerm: searchTerm || undefined,
      status: selectedFilter === 'processed' ? 'completed' as const : undefined,
      fromDate: selectedFilter === 'recent' ? 
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      skip: 0,
      take: 50,
    };

    try {
      await searchMeetings(searchRequest);
      setCurrentPage(1);
    } catch (error: any) {
      console.error('Search failed:', error);
    }
  };

  const handleSyncMeetings = async () => {
    if (!connection) return;

    try {
      await syncMeetings({ type: 'manual' });
      // Reload meetings after sync
      await loadMeetings(0, 50);
    } catch (error: any) {
      console.error('Sync failed:', error);
    }
  };

  const handleLoadMore = async () => {
    if (!connection || !meetingsPagination?.hasNextPage) return;

    const skip = (currentPage) * (meetingsPagination.pageSize || 50);
    await loadMeetings(skip, meetingsPagination.pageSize || 50);
    setCurrentPage(currentPage + 1);
  };

  const handleMeetingAction = (meeting: FirefliesMeeting, action: 'view' | 'import') => {
    if (action === 'view') {
      onMeetingSelect?.(meeting);
    } else if (action === 'import') {
      onImportToSow?.(meeting);
    }
  };

  const handleBulkAction = (action: 'import' | 'export') => {
    const selectedMeetingObjects = meetings.filter(m => selectedMeetings.has(m.meetingId));
    console.log(`Bulk ${action} for ${selectedMeetingObjects.length} meetings:`, selectedMeetingObjects);
    // Implement bulk actions here
  };

  const toggleMeetingSelection = (meetingId: string) => {
    const newSelection = new Set(selectedMeetings);
    if (newSelection.has(meetingId)) {
      newSelection.delete(meetingId);
    } else {
      newSelection.add(meetingId);
    }
    setSelectedMeetings(newSelection);
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'Unknown';
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

  const getStatusBadge = (status: FirefliesMeeting['status']) => {
    const configs = {
      completed: { color: 'bg-green-100 text-green-800', label: 'Processed' },
      processing: { color: 'bg-yellow-100 text-yellow-800', label: 'Processing' },
      failed: { color: 'bg-red-100 text-red-800', label: 'Failed' },
      pending: { color: 'bg-gray-100 text-gray-800', label: 'Pending' },
    };

    const config = configs[status] || configs.pending;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (!connection) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Connection</h3>
        <p className="text-gray-600">Please connect your Fireflies account first.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Meeting Library</h2>
          <p className="text-gray-600">
            {filteredMeetings.length} meetings available
            {selectedMeetings.size > 0 && ` (${selectedMeetings.size} selected)`}
          </p>
        </div>
        <div className="flex gap-2">
          {selectedMeetings.size > 0 && (
            <>
              <button
                onClick={() => handleBulkAction('import')}
                className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Import Selected ({selectedMeetings.size})
              </button>
              <button
                onClick={() => setSelectedMeetings(new Set())}
                className="text-gray-600 hover:text-gray-800 px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-sm"
              >
                Clear Selection
              </button>
            </>
          )}
          <button
            onClick={handleSyncMeetings}
            disabled={meetingsLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:bg-gray-300"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${meetingsLoading ? 'animate-spin' : ''}`} />
            Sync Latest
          </button>
        </div>
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
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
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
          <button
            onClick={handleSearch}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Search
          </button>
        </div>
      </div>

      {/* Error State */}
      {meetingsError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{meetingsError}</p>
          <button
            onClick={() => setMeetingsError(null)}
            className="text-sm text-red-600 hover:text-red-800 mt-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Loading State */}
      {meetingsLoading && filteredMeetings.length === 0 && (
        <div className="text-center py-12">
          <RefreshCw className="h-8 w-8 text-blue-500 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading meetings...</p>
        </div>
      )}

      {/* Meetings Grid */}
      {!meetingsLoading && filteredMeetings.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {filteredMeetings.map((meeting) => (
            <div 
              key={meeting.meetingId} 
              className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                selectedMeetings.has(meeting.meetingId) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
            >
              {/* Meeting Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    checked={selectedMeetings.has(meeting.meetingId)}
                    onChange={() => toggleMeetingSelection(meeting.meetingId)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1 mr-3"
                  />
                  <h3 className="font-medium text-gray-900 line-clamp-2 flex-1">{meeting.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(meeting.status)}
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Meeting Meta */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  {formatDate(meeting.meetingDate)}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  {formatDuration(meeting.durationMinutes)}
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
                {meeting.actionItems.length > 0 && (
                  <div className="flex items-center">
                    <FileText className="h-3 w-3 mr-1" />
                    {meeting.actionItems.length} action items
                  </div>
                )}
                {meeting.usedInSows && (
                  <div className="flex items-center text-blue-600">
                    <Plus className="h-3 w-3 mr-1" />
                    Used in {meeting.sowUsageCount} SOW{meeting.sowUsageCount > 1 ? 's' : ''}
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
                  onClick={() => handleMeetingAction(meeting, 'view')}
                  className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-200 transition-colors flex items-center justify-center"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </button>
                <button
                  onClick={() => handleMeetingAction(meeting, 'import')}
                  disabled={meeting.status !== 'completed'}
                  className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Use in SOW
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!meetingsLoading && filteredMeetings.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No meetings found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || selectedFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'No meetings have been synced yet'}
          </p>
          {!searchTerm && selectedFilter === 'all' && (
            <button
              onClick={handleSyncMeetings}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sync Meetings
            </button>
          )}
        </div>
      )}

      {/* Pagination */}
      {meetingsPagination && meetingsPagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {((meetingsPagination.pageNumber - 1) * meetingsPagination.pageSize) + 1} to{' '}
            {Math.min(meetingsPagination.pageNumber * meetingsPagination.pageSize, meetingsPagination.totalCount)} of{' '}
            {meetingsPagination.totalCount} meetings
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={!meetingsPagination.hasPreviousPage}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-3 py-2 text-sm">
              Page {meetingsPagination.pageNumber} of {meetingsPagination.totalPages}
            </span>
            <button
              onClick={handleLoadMore}
              disabled={!meetingsPagination.hasNextPage || meetingsLoading}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FirefliesMeetingList;