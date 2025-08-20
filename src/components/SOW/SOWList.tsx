import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Search, Filter } from 'lucide-react';
import { useSOWStore } from '../../store/sowStore';
import ClientSelectionModal from '../ClientSelectionModal';

export default function SOWList() {
  const navigate = useNavigate();
  const { documents } = useSOWStore();
  const [showClientModal, setShowClientModal] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.client.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  return (
    <div className="h-full bg-gray-50 overflow-auto">
      <div className="max-w-7xl mx-auto py-6 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Statements of Work</h1>
            <p className="mt-2 text-gray-600">Create and manage your SOW documents</p>
          </div>
          <button
            onClick={() => setShowClientModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            <span>New SOW</span>
          </button>
        </div>

        <div className="mb-6 flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search SOWs..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
        </div>

        {documents.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-lg font-medium text-gray-900 mb-2">No SOWs Created Yet</h2>
            <p className="text-gray-600 mb-6">
              Create your first Statement of Work to get started
            </p>
            <button
              onClick={() => setShowClientModal(true)}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              <span>Create New SOW</span>
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="min-w-full divide-y divide-gray-200">
              {filteredDocuments.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => navigate(`/sow/${doc.id}`)}
                  className="p-6 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{doc.title}</h3>
                      <p className="text-sm text-gray-500">{doc.client}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(doc.status)}`}>
                        {doc.status.replace('_', ' ').charAt(0).toUpperCase() + doc.status.slice(1)}
                      </span>
                      {doc.value && (
                        <span className="text-sm text-gray-600">
                          ${doc.value.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                    <span>Created: {new Date(doc.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>Last updated: {new Date(doc.updatedAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>Version {doc.version}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {showClientModal && (
          <ClientSelectionModal onClose={() => setShowClientModal(false)} />
        )}
      </div>
    </div>
  );
}