import React from 'react';
import { Clock, DollarSign } from 'lucide-react';

interface RoleRequirement {
  title: string;
  description: string;
  hours: number;
  rate: number;
}

interface RoleRequirementsProps {
  requirements: RoleRequirement[];
}

export default function RoleRequirements({ requirements }: RoleRequirementsProps) {
  const totalCost = requirements.reduce((sum, role) => sum + (role.hours * role.rate), 0);
  
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {requirements.map(role => (
          <div key={role.title} className="bg-white p-4 rounded-lg shadow-sm">
            <h4 className="font-medium text-gray-900 mb-2">{role.title}</h4>
            <p className="text-sm text-gray-500 mb-3">{role.description}</p>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-gray-600">
                <Clock className="w-4 h-4 mr-1" />
                <span>{role.hours}h</span>
              </div>
              <div className="flex items-center text-gray-600">
                <DollarSign className="w-4 h-4 mr-1" />
                <span>${role.rate}/h</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
        <div className="text-right">
          <span className="text-sm text-gray-500">Total Estimated Cost:</span>
          <span className="ml-2 text-lg font-medium text-gray-900">
            ${totalCost.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}