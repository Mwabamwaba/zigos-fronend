import { TeamMember } from '../types/project';

export const availableTeamMembers: TeamMember[] = [
  {
    id: 'tm1',
    name: 'Alice Johnson',
    role: 'Project Manager',
    hourlyRate: 150,
    availability: 40,
    skills: ['Project Management', 'Agile', 'Risk Management', 'Stakeholder Management'],
  },
  {
    id: 'tm2',
    name: 'Bob Smith',
    role: 'Senior Developer',
    hourlyRate: 125,
    availability: 40,
    skills: ['Architecture', 'Technical Leadership', 'Full Stack Development', 'Cloud Infrastructure'],
  },
  {
    id: 'tm3',
    name: 'Carol White',
    role: 'Senior Developer',
    hourlyRate: 125,
    availability: 40,
    skills: ['Technical Leadership', 'Backend Development', 'Database Design', 'System Architecture'],
  },
  {
    id: 'tm4',
    name: 'David Brown',
    role: 'Developer',
    hourlyRate: 100,
    availability: 40,
    skills: ['Frontend Development', 'React', 'TypeScript', 'UI/UX'],
  },
  {
    id: 'tm5',
    name: 'Eve Martinez',
    role: 'Developer',
    hourlyRate: 100,
    availability: 40,
    skills: ['Backend Development', 'Node.js', 'Python', 'API Design'],
  },
];