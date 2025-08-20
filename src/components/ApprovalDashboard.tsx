import React from 'react';
import { useApprovalStore } from '../store/approvalStore';
import ApprovalStatus from './ApprovalWorkflow/ApprovalStatus';
import ApprovalActions from './ApprovalWorkflow/ApprovalActions';
import AuditTrail from './ApprovalWorkflow/AuditTrail';
import WBSApprovalSection from './ApprovalWorkflow/WBSApprovalSection';
import { Clock, CheckCircle2, XCircle } from 'lucide-react';
import NotificationContainer from './ui/NotificationContainer';
import { useNotification } from '../hooks/useNotification';

export default function ApprovalDashboard() {
  const { documents } = useApprovalStore();
  const [selectedDoc, setSelectedDoc] = React.useState(documents[0]);
  const [activeTab, setActiveTab] = React.useState<'sow' | 'wbs'>('sow');
  const { notifications, hideNotification } = useNotification();

  return (
    <div className="h-full flex flex-col">
      {/* Header with Tabs */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Pending Approvals</h1>
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('sow')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'sow' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              SOW Approvals
            </button>
            <button
              onClick={() => setActiveTab('wbs')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'wbs' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              WBS Approvals
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'sow' ? (
          <div className="h-full flex">
            {/* Document List */}
            <div className="w-80 border-r border-gray-200 bg-white overflow-auto">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">SOW Documents</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {documents.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc)}
                    className={`w-full p-4 text-left hover:bg-gray-50 ${
                      selectedDoc?.id === doc.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{doc.title}</h3>
                        <p className="text-sm text-gray-500">{doc.client}</p>
                      </div>
                      {doc.status === 'pending_review' && (
                        <Clock className="w-5 h-5 text-yellow-500" />
                      )}
                      {doc.status === 'approved' && (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      )}
                      {doc.status === 'rejected' && (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Document Details */}
            {selectedDoc ? (
              <div className="flex-1 overflow-auto">
                <div className="max-w-4xl mx-auto py-6 px-4">
                  <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow p-6">
                      <h2 className="text-xl font-medium text-gray-900 mb-4">{selectedDoc.title}</h2>
                      <dl className="grid grid-cols-2 gap-4">
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Client</dt>
                          <dd className="text-sm text-gray-900">{selectedDoc.client}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Value</dt>
                          <dd className="text-sm text-gray-900">
                            {selectedDoc.value ? `$${selectedDoc.value.toLocaleString()}` : '-'}
                          </dd>
                        </div>
                      </dl>
                    </div>
                    
                    <ApprovalStatus document={selectedDoc} />
                    <ApprovalActions document={selectedDoc} />
                    <AuditTrail document={selectedDoc} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-gray-500">Select a SOW document to view details</p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6">
            <WBSApprovalSection />
          </div>
        )}
      </div>

      {/* Notifications */}
      <NotificationContainer 
        notifications={notifications} 
        onDismiss={hideNotification} 
      />
    </div>
  );
}