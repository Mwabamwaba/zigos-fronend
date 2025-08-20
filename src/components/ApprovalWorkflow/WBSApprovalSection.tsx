import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, XCircle, FileSpreadsheet, User, Calendar, DollarSign, MessageSquare, Eye } from 'lucide-react';
import wbsApprovalService, { WBSApprovalRequest } from '../../services/wbsApprovalService';
import { useNotification } from '../../hooks/useNotification';

export default function WBSApprovalSection() {
  const [pendingApprovals, setPendingApprovals] = useState<WBSApprovalRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<WBSApprovalRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [wbsData, setWbsData] = useState<any>(null);
  const { showNotification } = useNotification();

  useEffect(() => {
    loadPendingApprovals();
  }, []);

  useEffect(() => {
    if (selectedRequest) {
      loadWBSData(selectedRequest.wbsId);
    }
  }, [selectedRequest]);

  const loadPendingApprovals = async () => {
    try {
      setLoading(true);
      const requests = await wbsApprovalService.getPendingApprovals();
      setPendingApprovals(requests);
      if (requests.length > 0 && !selectedRequest) {
        setSelectedRequest(requests[0]);
      }
    } catch (error) {
      console.error('Failed to load pending approvals:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWBSData = async (wbsId: string) => {
    try {
      const data = await wbsApprovalService.getWBSData(wbsId);
      setWbsData(data);
    } catch (error) {
      console.error('Failed to load WBS data:', error);
    }
  };

  const handleApproval = async (approvalType: string, status: 'approved' | 'rejected', comments?: string) => {
    if (!selectedRequest) return;

    try {
      await wbsApprovalService.updateApproval(
        selectedRequest.id,
        approvalType,
        status,
        'Current User', // Would be replaced with actual user
        comments
      );

      showNotification({
        type: status === 'approved' ? 'success' : 'info',
        title: `WBS ${status === 'approved' ? 'Approved' : 'Rejected'}`,
        message: `${approvalType} approval has been ${status}`,
        duration: 4000
      });

      // Reload the pending approvals
      await loadPendingApprovals();
    } catch (error: any) {
      showNotification({
        type: 'error',
        title: 'Update Failed',
        message: error.message || 'Failed to update approval',
        duration: 6000
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'approved': return 'text-green-600 bg-green-50';
      case 'rejected': return 'text-red-600 bg-red-50';
      case 'under_review': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-2 text-gray-600">Loading WBS approvals...</span>
        </div>
      </div>
    );
  }

  if (pendingApprovals.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center">
          <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending WBS Approvals</h3>
          <p className="text-gray-600">All Work Breakdown Structures have been reviewed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <FileSpreadsheet className="w-5 h-5 mr-2" />
          WBS Approvals ({pendingApprovals.length})
        </h3>
      </div>

      <div className="flex">
        {/* WBS List */}
        <div className="w-80 border-r border-gray-200 overflow-auto max-h-96">
          {pendingApprovals.map((request) => (
            <button
              key={request.id}
              onClick={() => setSelectedRequest(request)}
              className={`w-full p-4 text-left hover:bg-gray-50 border-b border-gray-100 ${
                selectedRequest?.id === request.id ? 'bg-blue-50 border-blue-200' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-gray-900 text-sm truncate pr-2">
                  {request.wbsTitle}
                </h4>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(request.priority)}`}>
                  {request.priority}
                </span>
              </div>
              
              <div className="flex items-center text-xs text-gray-600 space-x-3 mb-2">
                <div className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {request.totalHours}h
                </div>
                <div className="flex items-center">
                  <DollarSign className="w-3 h-3 mr-1" />
                  ${(request.totalEstimatedValue || 0).toLocaleString()}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                  {request.status.replace('_', ' ')}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(request.requestedAt).toLocaleDateString()}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* WBS Details */}
        <div className="flex-1 p-6">
          {selectedRequest ? (
            <div className="space-y-6">
              {/* Header */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{selectedRequest.wbsTitle}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Requested by {selectedRequest.requestedBy} on {new Date(selectedRequest.requestedAt).toLocaleDateString()}
                </p>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-blue-600 mr-2" />
                    <div>
                      <p className="text-sm text-blue-600">Total Hours</p>
                      <p className="font-semibold text-blue-900">{selectedRequest.totalHours}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <DollarSign className="w-5 h-5 text-green-600 mr-2" />
                    <div>
                      <p className="text-sm text-green-600">Estimated Value</p>
                      <p className="font-semibold text-green-900">
                        ${(selectedRequest.totalEstimatedValue || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <User className="w-5 h-5 text-purple-600 mr-2" />
                    <div>
                      <p className="text-sm text-purple-600">Priority</p>
                      <p className="font-semibold text-purple-900 capitalize">{selectedRequest.priority}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comments */}
              {selectedRequest.comments && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <MessageSquare className="w-5 h-5 text-gray-400 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Comments</p>
                      <p className="text-sm text-gray-600 mt-1">{selectedRequest.comments}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Approval Status */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Approval Progress</h4>
                <div className="space-y-3">
                  {selectedRequest.approvals.map((approval) => (
                    <div
                      key={approval.id}
                      className={`p-4 rounded-lg border ${
                        approval.status === 'pending' 
                          ? 'border-yellow-200 bg-yellow-50' 
                          : approval.status === 'approved'
                          ? 'border-green-200 bg-green-50'
                          : 'border-red-200 bg-red-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {approval.status === 'pending' && <Clock className="w-5 h-5 text-yellow-600 mr-2" />}
                          {approval.status === 'approved' && <CheckCircle2 className="w-5 h-5 text-green-600 mr-2" />}
                          {approval.status === 'rejected' && <XCircle className="w-5 h-5 text-red-600 mr-2" />}
                          <div>
                            <h5 className="font-medium text-gray-900 capitalize">
                              {approval.type} Approval {approval.required && '*'}
                            </h5>
                            {approval.approverName && (
                              <p className="text-sm text-gray-600">
                                {approval.status === 'pending' ? 'Pending' : `${approval.status} by ${approval.approverName}`}
                              </p>
                            )}
                          </div>
                        </div>
                        {approval.status === 'pending' && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleApproval(approval.type, 'approved')}
                              className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleApproval(approval.type, 'rejected')}
                              className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                      {approval.comments && (
                        <p className="text-sm text-gray-600 mt-2">{approval.comments}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* View WBS Button */}
              {wbsData && (
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      // In a real app, this would open a modal or navigate to WBS view
                      console.log('View WBS data:', wbsData);
                      showNotification({
                        type: 'info',
                        title: 'WBS Details',
                        message: `WBS contains ${wbsData.items?.length || 0} items`,
                        duration: 3000
                      });
                    }}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Full WBS
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <p>Select a WBS approval request to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
