import React from 'react';
import { format } from 'date-fns';
import { SOWDocument } from '../../types';
import { useApprovalStore } from '../../store/approvalStore';

interface AuditTrailProps {
  document: SOWDocument;
}

export default function AuditTrail({ document }: AuditTrailProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Audit Trail</h3>
      
      <div className="space-y-4">
        {document.history.map((event, index) => (
          <div key={index} className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-sm text-gray-600">
                {event.action.charAt(0).toUpperCase()}
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
        ))}
      </div>
    </div>
  );
}