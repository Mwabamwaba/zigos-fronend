import React from 'react';
import { Plus, Edit2, Trash2, User } from 'lucide-react';
import { useTeamStore } from '../../store/teamStore';
import TeamMemberModal from './TeamMemberModal';
import { TeamMember } from '../../types/project';

export default function TeamRoster() {
  const { members, deleteMember } = useTeamStore();
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [editingMember, setEditingMember] = React.useState<TeamMember | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Team Members</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          <span>Add Member</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map((member) => (
          <div
            key={member.id}
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{member.name}</h3>
                  <p className="text-sm text-gray-500">{member.role}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setEditingMember(member)}
                  className="p-1 text-gray-400 hover:text-blue-600"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteMember(member.id)}
                  className="p-1 text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Rate:</span>
                <span className="font-medium">${member.hourlyRate}/hr</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Availability:</span>
                <span className="font-medium">{member.availability}h/week</span>
              </div>
            </div>

            <div className="mt-4">
              <div className="text-xs text-gray-500 mb-2">Skills:</div>
              <div className="flex flex-wrap gap-1">
                {member.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {(showAddModal || editingMember) && (
        <TeamMemberModal
          member={editingMember}
          onClose={() => {
            setShowAddModal(false);
            setEditingMember(null);
          }}
        />
      )}
    </div>
  );
}