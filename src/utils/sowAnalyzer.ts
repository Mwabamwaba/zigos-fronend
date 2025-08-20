import { SOWDocument } from '../types';

export function analyzeSOWRoles(sow: SOWDocument) {
  // This is a simplified analysis - in a real application, this would use
  // more sophisticated parsing of the SOW content to determine roles
  const defaultRoles = [
    {
      title: 'Project Manager',
      description: 'Oversees project execution and client communication',
      hours: 120,
      rate: 150,
    },
    {
      title: 'Senior Developer',
      description: 'Technical leadership and architecture',
      hours: 240,
      rate: 125,
    },
    {
      title: 'Developer',
      description: 'Implementation and testing',
      hours: 480,
      rate: 100,
    },
  ];

  // In a real application, we would analyze the SOW content to adjust these values
  return defaultRoles;
}