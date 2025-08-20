import React from 'react';
import { Project, Milestone } from '../../types/project';
import { useProjectStore } from '../../store/projectStore';
import { Plus, Calendar, Clock, Users, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

interface MilestoneTimelineProps {
  project: Project;
}

export default function MilestoneTimeline({ project }: MilestoneTimelineProps) {
  const { addMilestone, updateMilestone } = useProjectStore();
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [editingMilestone, setEditingMilestone] = React.useState<Milestone | null>(null);

  const handleAddMilestone = (milestone: Milestone) => {
    addMilestone(project.id, milestone);
    setShowAddModal(false);
  };

  const handleUpdateMilestone = (milestone: Milestone) => {
    updateMilestone(project.id, milestone.id, milestone);
    setEditingMilestone(null);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Project Timeline</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            <span>Add Milestone</span>
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="relative">
          {project.milestones.map((milestone, index) => (
            <div key={milestone.id} className="mb-8 relative">
              {/* Timeline connector */}
              {index < project.milestones.length - 1 && (
                <div className="absolute left-6 top-6 bottom-0 w-0.5 bg-gray-200" />
              )}
              
              <div className="flex items-start space-x-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  milestone.status === 'completed' ? 'bg-green-100' :
                  milestone.status === 'in_progress' ? 'bg-blue-100' :
                  'bg-gray-100'
                }`}>
                  <Calendar className={`w-6 h-6 ${
                    milestone.status === 'completed' ? 'text-green-600' :
                    milestone.status === 'in_progress' ? 'text-blue-600' :
                    'text-gray-600'
                  }`} />
                </div>
                
                <div className="flex-1">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{milestone.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">{milestone.description}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        milestone.status === 'completed' ? 'bg-green-100 text-green-800' :
                        milestone.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {milestone.status.replace('_', ' ').charAt(0).toUpperCase() + 
                         milestone.status.slice(1)}
                      </span>
                    </div>
                    
                    <div className="mt-4 flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {format(new Date(milestone.startDate), 'MMM d')} - 
                          {format(new Date(milestone.endDate), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>{milestone.hoursLogged}/{milestone.hoursAllocated}h</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4" />
                        <span>{milestone.assignees.length} assignees</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add/Edit Milestone Modal */}
      {(showAddModal || editingMilestone) && (
        <MilestoneModal
          milestone={editingMilestone}
          onSave={editingMilestone ? handleUpdateMilestone : handleAddMilestone}
          onClose={() => {
            setShowAddModal(false);
            setEditingMilestone(null);
          }}
          team={project.team}
        />
      )}
    </div>
  );
}

interface MilestoneModalProps {
  milestone?: Milestone | null;
  onSave: (milestone: Milestone) => void;
  onClose: () => void;
  team: Project['team'];
}

function MilestoneModal({ milestone, onSave, onClose, team }: MilestoneModalProps) {
  const [formData, setFormData] = React.useState<Milestone>({
    id: milestone?.id || Date.now().toString(),
    title: milestone?.title || '',
    description: milestone?.description || '',
    startDate: milestone?.startDate || new Date().toISOString().split('T')[0],
    endDate: milestone?.endDate || new Date().toISOString().split('T')[0],
    status: milestone?.status || 'not_started',
    assignees: milestone?.assignees || [],
    hoursAllocated: milestone?.hoursAllocated || 0,
    hoursLogged: milestone?.hoursLogged || 0,
    dependencies: milestone?.dependencies || [],
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {milestone ? 'Edit Milestone' : 'Add Milestone'}
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.startDate.split('T')[0]}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Date</label>
              <input
                type="date"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.endDate.split('T')[0]}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Milestone['status'] })}
            >
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Assignees</label>
            <div className="mt-2 space-y-2">
              {team.map((member) => (
                <label key={member.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={formData.assignees.includes(member.id)}
                    onChange={(e) => {
                      const newAssignees = e.target.checked
                        ? [...formData.assignees, member.id]
                        : formData.assignees.filter(id => id !== member.id);
                      setFormData({ ...formData, assignees: newAssignees });
                    }}
                  />
                  <span className="text-sm text-gray-700">{member.name} ({member.role})</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Hours Allocated</label>
            <input
              type="number"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.hoursAllocated}
              onChange={(e) => setFormData({ ...formData, hoursAllocated: Number(e.target.value) })}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(formData)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {milestone ? 'Update' : 'Add'} Milestone
          </button>
        </div>
      </div>
    </div>
  );
}