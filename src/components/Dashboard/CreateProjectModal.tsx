import React from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SOWDocument } from '../../types/sow';
import { useProjectStore } from '../../store/projectStore';

interface CreateProjectModalProps {
  approvedSows: SOWDocument[];
  onClose: () => void;
}

export default function CreateProjectModal({ approvedSows, onClose }: CreateProjectModalProps) {
  const navigate = useNavigate();
  const [selectedSow, setSelectedSow] = React.useState<SOWDocument | null>(null);
  const { createFromSOW } = useProjectStore();

  const handleCreate = () => {
    if (selectedSow) {
      const projectId = createFromSOW(selectedSow);
      onClose();
      navigate(`/project/${projectId}/manage`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Create New Project</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-500">
            Select an approved SOW to create a new project. The project will inherit the SOW's
            milestones, budget, and requirements.
          </p>
        </div>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {approvedSows.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No approved SOWs available</p>
              <p className="text-sm text-gray-400 mt-2">
                Projects can only be created from approved SOWs
              </p>
            </div>
          ) : (
            approvedSows.map((sow) => (
              <button
                key={sow.id}
                className={`w-full text-left p-4 rounded-lg border ${
                  selectedSow?.id === sow.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedSow(sow)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{sow.title}</h3>
                    <p className="text-sm text-gray-500">{sow.client}</p>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    ${sow.value.toLocaleString()}
                  </span>
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  {sow.milestones.length} milestones • {sow.staffingRequirements.length} roles required
                </div>
              </button>
            ))
          )}
        </div>

        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!selectedSow}
            className={`px-4 py-2 rounded-md ${
              selectedSow
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            Create Project
          </button>
        </div>
      </div>
    </div>
  );
}