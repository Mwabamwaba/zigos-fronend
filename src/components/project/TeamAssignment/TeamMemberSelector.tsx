import React from 'react';
import { User, Clock, AlertTriangle } from 'lucide-react';
import { availableTeamMembers } from '../../../data/teamMembers';

interface TeamMemberSelectorProps {
  role: {
    title: string;
    hours: number;
    rate: number;
  };
  onAssign: (memberId: string | null, hours: number) => void;
  currentAssignment?: {
    memberId: string;
    hours: number;
  };
}

export default function TeamMemberSelector({ role, onAssign, currentAssignment }: TeamMemberSelectorProps) {
  const [selectedMemberId, setSelectedMemberId] = React.useState(currentAssignment?.memberId || '');
  const [allocatedHours, setAllocatedHours] = React.useState(currentAssignment?.hours || role.hours);
  const [isSkipped, setIsSkipped] = React.useState(false);

  const eligibleMembers = availableTeamMembers.filter(member => 
    member.hourlyRate <= role.rate * 1.2 && // Allow up to 20% higher rate
    member.skills.some(skill => skill.toLowerCase().includes(role.title.toLowerCase()))
  );

  const handleMemberChange = (memberId: string) => {
    setSelectedMemberId(memberId);
    setIsSkipped(false);
    onAssign(memberId || null, allocatedHours);
  };

  const handleHoursChange = (hours: number) => {
    setAllocatedHours(hours);
    if (selectedMemberId) {
      onAssign(selectedMemberId, hours);
    }
  };

  const handleSkip = () => {
    setIsSkipped(true);
    setSelectedMemberId('');
    onAssign(null, 0);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-gray-900">{role.title}</h4>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">Required: {role.hours}h</span>
          <button
            onClick={handleSkip}
            className={`text-sm ${
              isSkipped 
                ? 'text-blue-600 font-medium' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Skip for now
          </button>
        </div>
      </div>

      {isSkipped ? (
        <div className="bg-yellow-50 border border-yellow-100 rounded-md p-3 flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-yellow-500" />
          <span className="text-sm text-yellow-700">
            Assignment skipped - you can come back to assign this role later
          </span>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Team Member
            </label>
            <select
              value={selectedMemberId}
              onChange={(e) => handleMemberChange(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select a team member...</option>
              {eligibleMembers.map(member => (
                <option key={member.id} value={member.id}>
                  {member.name} - ${member.hourlyRate}/h
                </option>
              ))}
            </select>
          </div>

          {selectedMemberId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Allocated Hours
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={allocatedHours}
                  onChange={(e) => handleHoursChange(Number(e.target.value))}
                  className="w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-500">hours</span>
              </div>
            </div>
          )}

          {selectedMemberId && (
            <div className="mt-2">
              <h5 className="text-sm font-medium text-gray-700 mb-2">Member Details</h5>
              <div className="bg-gray-50 rounded-md p-3">
                {(() => {
                  const member = availableTeamMembers.find(m => m.id === selectedMemberId);
                  if (!member) return null;
                  return (
                    <>
                      <div className="flex items-center space-x-2 mb-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{member.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-500">
                          Available: {member.availability}h/week
                        </span>
                      </div>
                      <div className="mt-2">
                        <div className="text-xs text-gray-500">Skills:</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {member.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}