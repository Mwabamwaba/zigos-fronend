import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, FolderOpen, ArrowRight } from 'lucide-react';
import SOWAnalytics from './SOWAnalytics';
import ProjectAnalytics from './ProjectAnalytics';
import ClientSelectionModal from '../ClientSelectionModal';
import CreateProjectModal from './CreateProjectModal';
import { useSOWStore } from '../../store/sowStore';
import { useProjectStore } from '../../store/projectStore';
import { SOWStatus } from '../../types/sow';

export default function Dashboard() {
  const navigate = useNavigate();
  const [view, setView] = React.useState<'sows' | 'projects'>('sows');
  const [showClientModal, setShowClientModal] = React.useState(false);
  const [showProjectModal, setShowProjectModal] = React.useState(false);
  
  const { documents: sows, updateStatus } = useSOWStore();
  const { projects } = useProjectStore();

  const approvedSows = sows.filter(sow => 
    sow.status === 'approved' || 
    sow.status === 'the_zig_signed' || 
    sow.status === 'client_signed' || 
    sow.status === 'fully_executed'
  );

  const handleStatusUpdate = (sowId: string, status: SOWStatus) => {
    updateStatus(sowId, status);
  };

  return (
    <div className="h-full bg-gray-50 overflow-auto">
      <div className="max-w-7xl mx-auto py-6 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-gray-600">
              {view === 'sows' 
                ? 'Track and manage pre-project Statements of Work'
                : 'Monitor active project execution and delivery'
              }
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex rounded-lg border border-gray-200 p-1 bg-white">
              <button
                onClick={() => setView('sows')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md ${
                  view === 'sows'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>SOWs</span>
              </button>
              <button
                onClick={() => setView('projects')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md ${
                  view === 'projects'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <FolderOpen className="w-4 h-4" />
                <span>Projects</span>
              </button>
            </div>
            <button
              onClick={() => view === 'sows' ? setShowClientModal(true) : setShowProjectModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              <span>New {view === 'sows' ? 'SOW' : 'Project'}</span>
            </button>
          </div>
        </div>

        {view === 'sows' ? (
          <SOWAnalytics 
            sows={sows} 
            onCreateNew={() => setShowClientModal(true)}
            onUpdateStatus={handleStatusUpdate}
          />
        ) : (
          <ProjectAnalytics 
            projects={projects} 
            approvedSows={approvedSows}
            onCreateNew={() => setShowProjectModal(true)} 
          />
        )}
        {/* Empty State for Projects */}
        {view === 'projects' && approvedSows.length === 0 && (
          <div className="mt-8 text-center">
            <div className="inline-flex items-center space-x-2 text-gray-500">
              <ArrowRight className="w-5 h-5" />
              <span>Projects can only be created from approved SOWs</span>
            </div>
          </div>
        )}
      </div>

      {showClientModal && (
        <ClientSelectionModal onClose={() => setShowClientModal(false)} />
      )}

      {showProjectModal && (
        <CreateProjectModal 
          approvedSows={approvedSows}
          onClose={() => setShowProjectModal(false)} 
        />
      )}
    </div>
  );
}