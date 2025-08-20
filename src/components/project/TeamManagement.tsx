import React from 'react';
import { Project, TeamMember } from '../../types/project';
import { useProjectStore } from '../../store/projectStore';
import { Plus, Edit2, Trash2 } from 'lucide-react';

interface TeamManagementProps {
  project: Project;
}

export default function TeamManagement({ project }: TeamManagementProps) {
  const { addTeamMember, updateTeamMember, removeTeamMember } = useProjectStore();
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [editingMember, setEditingMember] = React.useState<TeamMember | null>(null);

  const handleAddMember = (member: TeamMember) => {
    addTeamMember(project.id, member);
    setShowAddModal(false);
  };

  const handleUpdateMember = (member: TeamMember) => {
    updateTeamMember(project.id, member.id, member);
    setEditingMember(null);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Team Members</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="space-y-4">
          {project.team.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div>
                <h3 className="font-medium text-gray-900">{member.name}</h3>
                <p className="text-sm text-gray-500">{member.role}</p>
                <div className="mt-1 flex items-center space-x-2">
                  <span className="text-xs text-gray-500">
                    Availability: {member.availability}h/week
                  </span>
                  <span className="text-xs text-gray-500">
                    Rate: ${member.hourlyRate}/h
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setEditingMember(member)}
                  className="p-2 text-gray-400 hover:text-blue-600"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => removeTeamMember(project.id, member.id)}
                  className="p-2 text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add/Edit Member Modal */}
      {(showAddModal || editingMember) && (
        <TeamMemberModal
          member={editingMember}
          onSave={editingMember ? handleUpdateMember : handleAddMember}
          onClose={() => {
            setShowAddModal(false);
            setEditingMember(null);
          }}
        />
      )}
    </div>
  );
}

interface TeamMemberModalProps {
  member?: TeamMember | null;
  onSave: (member: TeamMember) => void;
  onClose: () => void;
}

function TeamMemberModal({ member, onSave, onClose }: TeamMemberModalProps) {
  const [formData, setFormData] = React.useState<TeamMember>({
    id: member?.id || Date.now().toString(),
    name: member?.name || '',
    role: member?.role || '',
    hourlyRate: member?.hourlyRate || 0,
    availability: member?.availability || 40,
    skills: member?.skills || [],
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {member ? 'Edit Team Member' : 'Add Team Member'}
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Hourly Rate ($)
            </label>
            <input
              type="number"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.hourlyRate}
              onChange={(e) => setFormData({ ...formData, hourlyRate: Number(e.target.value) })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Availability (hours/week)
            </label>
            <input
              type="number"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.availability}
              onChange={(e) => setFormData({ ...formData, availability: Number(e.target.value) })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Skills</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.skills.join(', ')}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value.split(',').map(s => s.trim()) })}
              placeholder="Enter skills separated by commas"
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
            {member ? 'Update' : 'Add'} Member
          </button>
        </div>
      </div>
    </div>
  );
}