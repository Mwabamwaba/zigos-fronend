import React from 'react';
import { CheckCircle2, XCircle, MessageSquare } from 'lucide-react';
import { useApprovalStore } from '../../store/approvalStore';
import { SOWDocument } from '../../types';

interface ApprovalActionsProps {
  document: SOWDocument;
}

export default function ApprovalActions({ document }: ApprovalActionsProps) {
  const [comment, setComment] = React.useState('');
  const { currentUser, approveDocument, rejectDocument } = useApprovalStore();

  const canApprove = React.useMemo(() => {
    if (!currentUser || document.status !== 'in_review') return false;
    const currentStep = document.currentApprovalStep || 0;
    return currentUser.role === 'approver' || currentUser.role === 'admin';
  }, [currentUser, document]);

  const handleApprove = () => {
    if (!currentUser) return;
    approveDocument(document.id, {
      userId: currentUser.id,
      status: 'approved',
      comment,
    });
  };

  const handleReject = () => {
    if (!currentUser) return;
    rejectDocument(document.id, {
      userId: currentUser.id,
      status: 'rejected',
      comment,
    });
  };

  if (!canApprove) return null;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Approval Actions</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Comments (optional)
          </label>
          <div className="relative">
            <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <textarea
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Add your comments here..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={handleApprove}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>Approve</span>
          </button>
          
          <button
            onClick={handleReject}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            <XCircle className="w-5 h-5" />
            <span>Reject</span>
          </button>
        </div>
      </div>
    </div>
  );
}