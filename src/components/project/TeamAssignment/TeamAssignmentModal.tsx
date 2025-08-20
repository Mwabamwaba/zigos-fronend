import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { SOWDocument } from '../../../types';
import RoleRequirements from './RoleRequirements';
import TeamMemberSelector from './TeamMemberSelector';
import { analyzeSOWRoles } from '../../../utils/sowAnalyzer';

interface TeamAssignmentModalProps {
  sow: SOWDocument;
  onClose: () => void;
  onAssign: (assignments: Array<{ role: string; memberId: string | null; hours: number }>) => void;
}

export default function TeamAssignmentModal({ sow, onClose, onAssign }: TeamAssignmentModalProps) {
  const [assignments, setAssignments] = React.useState<Array<{ role: string; memberId: string | null; hours: number }>>([]);
  const [errors, setErrors] = React.useState<string[]>([]);

  const roleRequirements = React.useMemo(() => analyzeSOWRoles(sow), [sow]);

  const handleAssignment = (role: string, memberId: string | null, hours: number) => {
    setAssignments(prev => {
      const existing = prev.findIndex(a => a.role === role);
      if (existing !== -1) {
        const updated = [...prev];
        updated[existing] = { role, memberId, hours };
        return updated;
      }
      return [...prev, { role, memberId, hours }];
    });
  };

  const validateAssignments = () => {
    const newErrors: string[] = [];
    
    // Check if all roles are either assigned or explicitly skipped
    roleRequirements.forEach(role => {
      const assignment = assignments.find(a => a.role === role.title);
      if (!assignment) {
        newErrors.push(`${role.title} role must be assigned or skipped`);
      }
    });

    // Check if hours match requirements for assigned roles
    assignments.forEach(assignment => {
      if (assignment.memberId) { // Only validate hours for assigned roles
        const requirement = roleRequirements.find(r => r.title === assignment.role);
        if (requirement && assignment.hours !== requirement.hours) {
          newErrors.push(`${assignment.role} hours must match the required ${requirement.hours} hours`);
        }
      }
    });

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = () => {
    if (validateAssignments()) {
      onAssign(assignments);
    }
  };

  const getSkippedRolesCount = () => {
    return assignments.filter(a => a.memberId === null).length;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Assign Project Team</h2>
            {getSkippedRolesCount() > 0 && (
              <p className="text-sm text-yellow-600 mt-1">
                {getSkippedRolesCount()} role(s) skipped
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {/* Role Requirements Section */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Role Requirements</h3>
            <RoleRequirements requirements={roleRequirements} />
          </div>

          {/* Team Assignment Section */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Assign Team Members</h3>
            {roleRequirements.map(role => (
              <div key={role.title} className="mb-6">
                <TeamMemberSelector
                  role={role}
                  onAssign={(memberId, hours) => handleAssignment(role.title, memberId, hours)}
                  currentAssignment={assignments.find(a => a.role === role.title && a.memberId)}
                />
              </div>
            ))}
          </div>

          {/* Errors Display */}
          {errors.length > 0 && (
            <div className="mt-4 p-4 bg-red-50 rounded-md">
              <div className="flex items-center mb-2">
                <AlertTriangle className="w-5 h-5 text-red-400 mr-2" />
                <span className="text-sm font-medium text-red-800">Please fix the following errors:</span>
              </div>
              <ul className="list-disc list-inside text-sm text-red-700">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {getSkippedRolesCount() > 0 ? 'Continue with Partial Team' : 'Assign Team'}
          </button>
        </div>
      </div>
    </div>
  );
}