import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { pastSows } from '../../data/pastSows';
import { approvalSteps } from '../../data/approvalProcess';
import { mockUsers } from '../../data/mockUsers';
import { Clock, Send, UserCheck, AlertTriangle, Calendar, Users } from 'lucide-react';
import { format } from 'date-fns';
import TeamAssignmentModal from './TeamAssignment/TeamAssignmentModal';
import { useProjectStore } from '../../store/projectStore';

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showTeamAssignment, setShowTeamAssignment] = React.useState(false);
  const { createProject } = useProjectStore();
  const sow = pastSows.find(s => s.id === id);

  if (!sow) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Project not found</p>
      </div>
    );
  }

  const handleTeamAssignment = (assignments: Array<{ role: string; memberId: string; hours: number }>) => {
    // Create a new project based on the SOW
    createProject({
      sowId: sow.id,
      title: sow.title,
      status: 'planning',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days from now
      budget: sow.value || 0,
      team: assignments.map(assignment => ({
        id: assignment.memberId,
        role: assignment.role,
        hours: assignment.hours,
      })),
    });
    
    setShowTeamAssignment(false);
    // Navigate to the project management view
    navigate(`/project/${sow.id}/manage`);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      pending_review: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || colors.draft;
  };

  const getCurrentApprover = () => {
    if (!sow.currentApprovalStep && sow.currentApprovalStep !== 0) return null;
    const currentStep = approvalSteps[sow.currentApprovalStep];
    return mockUsers.find(user => 
      user.role === currentStep.role && 
      user.department === currentStep.department
    );
  };

  const currentApprover = getCurrentApprover();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">{sow.title}</h1>
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(sow.status)}`}>
                {sow.status.replace('_', ' ').charAt(0).toUpperCase() + sow.status.slice(1)}
              </span>
              {sow.value && (
                <span className="text-gray-600">
                  ${sow.value.toLocaleString()}
                </span>
              )}
            </div>
          </div>
          <p className="mt-2 text-gray-600">{sow.client}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Project Overview */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Project Overview</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="text-sm font-medium text-gray-900">
                    {format(new Date(sow.createdAt), 'MMM d, yyyy')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="text-sm font-medium text-gray-900">
                    {format(new Date(sow.updatedAt), 'MMM d, yyyy')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Version</p>
                  <p className="text-sm font-medium text-gray-900">{sow.version}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Created By</p>
                  <p className="text-sm font-medium text-gray-900">
                    {mockUsers.find(u => u.id === sow.createdBy)?.name || 'Unknown'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                {sow.status === 'draft' && (
                  <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    <Send className="w-4 h-4" />
                    <span>Submit for Approval</span>
                  </button>
                )}
                {sow.status === 'pending_review' && currentApprover && (
                  <div className="text-sm text-gray-600">
                    <p>Waiting for approval from:</p>
                    <p className="font-medium">{currentApprover.name}</p>
                    <p className="text-gray-500">{currentApprover.department}</p>
                  </div>
                )}
                {sow.status === 'approved' && (
                  <button 
                    onClick={() => setShowTeamAssignment(true)}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    <Users className="w-4 h-4" />
                    <span>Assign Team</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Approval Timeline */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Approval Timeline</h2>
            <div className="relative">
              {approvalSteps.map((step, index) => {
                const isCompleted = sow.currentApprovalStep > index;
                const isCurrent = sow.currentApprovalStep === index;
                const stepApprovals = sow.approvals.filter(a => 
                  a.status === 'approved' && 
                  mockUsers.find(u => u.id === a.userId)?.department === step.department
                );
                
                return (
                  <div key={step.id} className="mb-8 relative">
                    {index < approvalSteps.length - 1 && (
                      <div className={`absolute left-6 top-6 bottom-0 w-0.5 ${
                        isCompleted ? 'bg-green-500' : 'bg-gray-200'
                      }`} />
                    )}
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        isCompleted ? 'bg-green-100' :
                        isCurrent ? 'bg-blue-100' :
                        'bg-gray-100'
                      }`}>
                        {isCompleted ? (
                          <UserCheck className={`w-6 h-6 ${
                            isCompleted ? 'text-green-600' :
                            isCurrent ? 'text-blue-600' :
                            'text-gray-400'
                          }`} />
                        ) : (
                          <Clock className={`w-6 h-6 ${
                            isCurrent ? 'text-blue-600' : 'text-gray-400'
                          }`} />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-gray-900">
                              {step.department} Approval
                            </h3>
                            {step.threshold && (
                              <span className="text-sm text-gray-500">
                                Required for SOWs over ${step.threshold.toLocaleString()}
                              </span>
                            )}
                          </div>
                          {stepApprovals.length > 0 && (
                            <div className="mt-2 space-y-2">
                              {stepApprovals.map(approval => {
                                const approver = mockUsers.find(u => u.id === approval.userId);
                                return (
                                  <div key={approval.id} className="text-sm">
                                    <p className="text-gray-900">{approver?.name}</p>
                                    {approval.comment && (
                                      <p className="text-gray-500">{approval.comment}</p>
                                    )}
                                    <p className="text-xs text-gray-400">
                                      {format(new Date(approval.timestamp), 'MMM d, yyyy h:mm a')}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action History */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Action History</h2>
            <div className="space-y-4">
              {sow.history.map((event, index) => {
                const user = mockUsers.find(u => u.id === event.userId);
                return (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-sm text-gray-600">
                        {user?.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {event.action.split('_').join(' ').charAt(0).toUpperCase() + 
                         event.action.split('_').join(' ').slice(1)}
                      </p>
                      {event.details && (
                        <p className="text-sm text-gray-500">{event.details}</p>
                      )}
                      <p className="text-xs text-gray-400">
                        {format(new Date(event.timestamp), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Team Assignment Modal */}
        {showTeamAssignment && (
          <TeamAssignmentModal
            sow={sow}
            onClose={() => setShowTeamAssignment(false)}
            onAssign={handleTeamAssignment}
          />
        )}
      </div>
    </div>
  );
}