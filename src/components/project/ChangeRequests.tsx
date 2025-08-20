import React from 'react';
import { Project, ChangeRequest } from '../../types/project';
import { useProjectStore } from '../../store/projectStore';
import { Plus, FileText, DollarSign, Calendar, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

interface ChangeRequestsProps {
  project: Project;
}

export default function ChangeRequests({ project }: ChangeRequestsProps) {
  const { submitChangeRequest, approveChangeRequest, rejectChangeRequest } = useProjectStore();
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [selectedRequest, setSelectedRequest] = React.useState<ChangeRequest | null>(null);

  const handleSubmit = (request: ChangeRequest) => {
    submitChangeRequest(project.id, request);
    setShowAddModal(false);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Change Requests</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            <span>New Request</span>
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="space-y-4">
          {project.changeRequests.map((request) => (
            <div
              key={request.id}
              className="p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
              onClick={() => setSelectedRequest(request)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{request.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{request.description}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  request.status === 'approved' ? 'bg-green-100 text-green-800' :
                  request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </span>
              </div>
              
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4" />
                  <span>Impact: ${request.impact.cost.toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>{format(new Date(request.requestDate), 'MMM d, yyyy')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Change Request Modal */}
      {showAddModal && (
        <ChangeRequestModal
          onSubmit={handleSubmit}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {/* View/Approve Change Request Modal */}
      {selectedRequest && (
        <ViewChangeRequestModal
          request={selectedRequest}
          onApprove={(id) => {
            approveChangeRequest(project.id, id, 'current-user-id');
            setSelectedRequest(null);
          }}
          onReject={(id) => {
            rejectChangeRequest(project.id, id, 'Rejected by approver');
            setSelectedRequest(null);
          }}
          onClose={() => setSelectedRequest(null)}
        />
      )}
    </div>
  );
}

interface ChangeRequestModalProps {
  onSubmit: (request: ChangeRequest) => void;
  onClose: () => void;
}

function ChangeRequestModal({ onSubmit, onClose }: ChangeRequestModalProps) {
  const [formData, setFormData] = React.useState<Omit<ChangeRequest, 'id' | 'status'>>({
    title: '',
    description: '',
    requestedBy: 'current-user-id',
    requestDate: new Date().toISOString(),
    impact: {
      scope: '',
      schedule: '',
      resources: '',
      cost: 0,
    },
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
        <h3 className="text-lg font-medium text-gray-900 mb-4">New Change Request</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Impact Analysis</label>
            <div className="space-y-4 mt-2">
              <div>
                <label className="block text-sm text-gray-600">Scope Impact</label>
                <textarea
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={2}
                  value={formData.impact.scope}
                  onChange={(e) => setFormData({
                    ...formData,
                    impact: { ...formData.impact, scope: e.target.value }
                  })}
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-600">Schedule Impact</label>
                <textarea
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={2}
                  value={formData.impact.schedule}
                  onChange={(e) => setFormData({
                    ...formData,
                    impact: { ...formData.impact, schedule: e.target.value }
                  })}
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-600">Resource Impact</label>
                <textarea
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={2}
                  value={formData.impact.resources}
                  onChange={(e) => setFormData({
                    ...formData,
                    impact: { ...formData.impact, resources: e.target.value }
                  })}
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-600">Cost Impact ($)</label>
                <input
                  type="number"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={formData.impact.cost}
                  onChange={(e) => setFormData({
                    ...formData,
                    impact: { ...formData.impact, cost: Number(e.target.value) }
                  })}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit({
              ...formData,
              id: Date.now().toString(),
              status: 'pending',
            })}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Submit Request
          </button>
        </div>
      </div>
    </div>
  );
}

interface ViewChangeRequestModalProps {
  request: ChangeRequest;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onClose: () => void;
}

function ViewChangeRequestModal({
  request,
  onApprove,
  onReject,
  onClose,
}: ViewChangeRequestModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">{request.title}</h3>
          <span className={`px-2 py-1 text-xs rounded-full ${
            request.status === 'approved' ? 'bg-green-100 text-green-800' :
            request.status === 'rejected' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
          </span>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700">Description</h4>
            <p className="mt-1 text-sm text-gray-600">{request.description}</p>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Impact Analysis</h4>
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-600">Scope Impact:</span>
                <p className="text-sm text-gray-600">{request.impact.scope}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Schedule Impact:</span>
                <p className="text-sm text-gray-600">{request.impact.schedule}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Resource Impact:</span>
                <p className="text-sm text-gray-600">{request.impact.resources}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Cost Impact:</span>
                <p className="text-sm text-gray-600">${request.impact.cost.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Requested by: {request.requestedBy}</span>
            <span>Date: {format(new Date(request.requestDate), 'MMM d, yyyy')}</span>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
          >
            Close
          </button>
          {request.status === 'pending' && (
            <>
              <button
                onClick={() => onReject(request.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Reject
              </button>
              <button
                onClick={() => onApprove(request.id)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Approve
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}