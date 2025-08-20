import React from 'react';
import { CheckCircle2, Clock, AlertCircle, UserCheck, FileCheck } from 'lucide-react';
import { SOWDocument, ApprovalStep } from '../../types';
import { useApprovalStore } from '../../store/approvalStore';

interface ApprovalStatusProps {
  document: SOWDocument;
}

export default function ApprovalStatus({ document }: ApprovalStatusProps) {
  const approvalSteps = useApprovalStore(state => state.approvalSteps);
  
  const getStepStatus = (stepIndex: number) => {
    if (!document.currentApprovalStep && document.currentApprovalStep !== 0) return 'pending';
    if (stepIndex < document.currentApprovalStep) return 'completed';
    if (stepIndex === document.currentApprovalStep) return 'current';
    return 'upcoming';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-6 h-6 text-green-500" />;
      case 'current':
        return <Clock className="w-6 h-6 text-blue-500 animate-pulse" />;
      case 'rejected':
        return <AlertCircle className="w-6 h-6 text-red-500" />;
      default:
        return <UserCheck className="w-6 h-6 text-gray-300" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Approval Status</h3>
      
      <div className="space-y-4">
        {approvalSteps.map((step, index) => {
          const status = getStepStatus(index);
          const stepApprovals = document.approvals.filter(a => 
            a.status === 'approved' && 
            approvalSteps[document.currentApprovalStep || 0].id === step.id
          );
          
          return (
            <div 
              key={step.id}
              className={`flex items-center space-x-4 p-4 rounded-lg ${
                status === 'current' ? 'bg-blue-50 border border-blue-200' : ''
              }`}
            >
              {getStatusIcon(status)}
              
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">
                    {step.role.charAt(0).toUpperCase() + step.role.slice(1)} Approval
                    {step.department && ` - ${step.department}`}
                  </h4>
                  {status === 'current' && (
                    <span className="text-sm text-blue-600">
                      {stepApprovals.length}/{step.minApprovers} approvals
                    </span>
                  )}
                </div>
                
                {step.threshold && (
                  <p className="text-sm text-gray-500">
                    Required for SOWs over ${step.threshold.toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          );
        })}
        
        {document.status === 'approved' && (
          <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
            <FileCheck className="w-6 h-6 text-green-500" />
            <div>
              <h4 className="font-medium text-green-800">Final Approval Complete</h4>
              <p className="text-sm text-green-600">
                Ready for client signature
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}