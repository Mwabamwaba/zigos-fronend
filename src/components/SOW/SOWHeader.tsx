import React from 'react';
import { Save, Download, Share2, History, Send } from 'lucide-react';
import { useSOWStore } from '../../store/sowStore';
import HistoryModal from './modals/HistoryModal';
import ShareModal from './modals/ShareModal';
import { Template } from '../../types';
import { exportToPDF } from '../../utils/pdfExport';

interface SOWHeaderProps {
  sowId: string;
  template: Template;
}

export default function SOWHeader({ sowId, template }: SOWHeaderProps) {
  const { submitForApproval, documents } = useSOWStore();
  const [showSubmitModal, setShowSubmitModal] = React.useState(false);
  const [showHistoryModal, setShowHistoryModal] = React.useState(false);
  const [showShareModal, setShowShareModal] = React.useState(false);
  const document = documents.find(d => d.id === sowId);

  if (!document) return null;

  const handleSubmit = () => {
    submitForApproval(sowId);
    setShowSubmitModal(false);
  };

  const handleExport = async () => {
    await exportToPDF(template);
  };

  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-semibold text-gray-900">{template.title}</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <span className={`px-2 py-1 rounded ${
            document.status === 'draft' ? 'bg-blue-100 text-blue-700' :
            document.status === 'pending_review' ? 'bg-yellow-100 text-yellow-700' :
            document.status === 'approved' ? 'bg-green-100 text-green-700' :
            'bg-red-100 text-red-700'
          }`}>
            {document.status.replace('_', ' ').charAt(0).toUpperCase() + document.status.slice(1)}
          </span>
          <span>•</span>
          <span>Auto-saved</span>
          {document.origin?.source === 'template' && (
            <span className="ml-2 px-2 py-1 rounded bg-gray-100 text-gray-700">Template origin: {document.origin.name}</span>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <button 
          onClick={() => setShowHistoryModal(true)}
          className="flex items-center space-x-1 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
        >
          <History className="w-4 h-4" />
          <span>History</span>
        </button>
        <button 
          onClick={() => setShowShareModal(true)}
          className="flex items-center space-x-1 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
        >
          <Share2 className="w-4 h-4" />
          <span>Share</span>
        </button>
        <button 
          onClick={() => setShowSubmitModal(true)}
          disabled={document.status !== 'draft'}
          className={`flex items-center space-x-1 px-3 py-2 ${
            document.status === 'draft'
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          } rounded-md`}
        >
          <Send className="w-4 h-4" />
          <span>Submit</span>
        </button>
        <button 
          onClick={handleExport}
          className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Download className="w-4 h-4" />
          <span>Export</span>
        </button>
      </div>

      {showHistoryModal && (
        <HistoryModal
          sowId={sowId}
          onClose={() => setShowHistoryModal(false)}
        />
      )}

      {showShareModal && (
        <ShareModal
          sowId={sowId}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {showSubmitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Submit for Approval</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to submit this SOW for approval? Once submitted, you won't be able to make changes until it's approved or rejected.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}