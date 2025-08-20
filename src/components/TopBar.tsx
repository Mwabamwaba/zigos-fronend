import React from 'react';
import { Save, Download, Share2, History, Send } from 'lucide-react';
import { useApprovalStore } from '../store/approvalStore';

export default function TopBar() {
  const { submitForApproval } = useApprovalStore();
  const [showSubmitModal, setShowSubmitModal] = React.useState(false);

  const handleSubmit = () => {
    submitForApproval('current-doc-id');
    setShowSubmitModal(false);
  };

  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-semibold text-gray-900">Statement of Work Builder</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">Draft</span>
          <span>•</span>
          <span>Last saved 2 minutes ago</span>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <button className="flex items-center space-x-1 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
          <History className="w-4 h-4" />
          <span>History</span>
        </button>
        <button className="flex items-center space-x-1 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
          <Share2 className="w-4 h-4" />
          <span>Share</span>
        </button>
        <button className="flex items-center space-x-1 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
          <Save className="w-4 h-4" />
          <span>Save</span>
        </button>
        <button 
          onClick={() => setShowSubmitModal(true)}
          className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          <Send className="w-4 h-4" />
          <span>Submit</span>
        </button>
        <button className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          <Download className="w-4 h-4" />
          <span>Export</span>
        </button>
      </div>

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