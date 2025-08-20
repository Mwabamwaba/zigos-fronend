import React from 'react';
import { useParams } from 'react-router-dom';
import { useProjectStore } from '../../store/projectStore';
import MilestoneTimeline from './MilestoneTimeline';
import RiskMatrix from './RiskMatrix';
import ChangeRequests from './ChangeRequests';
import ProjectCalendar from './ProjectCalendar';
import CommunicationHub from './CommunicationHub';
import ArchitectureDiagram from './ArchitectureDiagram';
import WorkBreakdownStructure from './WorkBreakdownStructure';
import TeamManagement from './TeamManagement';

export default function ProjectManagement() {
  const { id } = useParams();
  const { projects, activeProject, setActiveProject } = useProjectStore();

  React.useEffect(() => {
    if (id) {
      setActiveProject(id);
    }
  }, [id]);

  if (!activeProject) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Project not found</p>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 overflow-auto">
      <div className="max-w-7xl mx-auto py-6 px-4">
        {/* Project Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">{activeProject.title}</h1>
          <div className="mt-2 flex items-center space-x-4">
            <span className={`px-2 py-1 text-sm rounded-full ${
              activeProject.status === 'active' ? 'bg-green-100 text-green-800' :
              activeProject.status === 'planning' ? 'bg-blue-100 text-blue-800' :
              activeProject.status === 'completed' ? 'bg-gray-100 text-gray-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {activeProject.status.replace('_', ' ').charAt(0).toUpperCase() + 
               activeProject.status.slice(1)}
            </span>
            <span className="text-gray-500">
              Budget: ${activeProject.budget.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <TeamManagement project={activeProject} />
          <MilestoneTimeline project={activeProject} />
        </div>

        <div className="mb-6">
          <WorkBreakdownStructure project={activeProject} />
        </div>

        <div className="mb-6">
          <ArchitectureDiagram project={activeProject} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <RiskMatrix project={activeProject} />
          <ChangeRequests project={activeProject} />
          <CommunicationHub project={activeProject} />
        </div>

        <div className="bg-white rounded-lg shadow">
          <ProjectCalendar project={activeProject} />
        </div>
      </div>
    </div>
  );
}