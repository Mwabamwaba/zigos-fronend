import React from 'react';
import { X, Clock, ArrowLeft } from 'lucide-react';
import { useApprovalStore } from '../../../store/approvalStore';
import { format } from 'date-fns';

interface HistoryModalProps {
  sowId: string;
  onClose: () => void;
}

export default function HistoryModal({ sowId, onClose }: HistoryModalProps) {
  const { documents } = useApprovalStore();
  const document = documents.find(d => d.id === sowId);
  const [selectedVersion, setSelectedVersion] = React.useState<null | {
    timestamp: string;
    content: string;
  }>(null);

  if (!document) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl h-[80vh] flex flex-col">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {selectedVersion ? (
              <button
                onClick={() => setSelectedVersion(null)}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to History</span>
              </button>
            ) : (
              <h2 className="text-lg font-medium text-gray-900">Document History</h2>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {selectedVersion ? (
            <div className="prose max-w-none">
              <div dangerouslySetInnerHTML={{ __html: selectedVersion.content }} />
            </div>
          ) : (
            <div className="space-y-4">
              {document.history.map((event, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                  onClick={() => setSelectedVersion({
                    timestamp: event.timestamp,
                    content: 'Historical content would be loaded here',
                  })}
                >
                  <div className="flex-shrink-0">
                    <Clock className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {event.action.split('_').join(' ').charAt(0).toUpperCase() + 
                         event.action.split('_').join(' ').slice(1)}
                      </p>
                      <span className="text-sm text-gray-500">
                        {format(new Date(event.timestamp), 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>
                    {event.details && (
                      <p className="mt-1 text-sm text-gray-600">{event.details}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedVersion && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                Version from {format(new Date(selectedVersion.timestamp), 'MMM d, yyyy h:mm a')}
              </span>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Restore This Version
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}