import { Approval } from '../types';

export const mockApprovals: Approval[] = [
  {
    id: '1',
    userId: '1',
    status: 'approved',
    comment: 'Technical requirements look good',
    timestamp: '2024-03-10T14:30:00Z',
  },
  {
    id: '2',
    userId: '2',
    status: 'approved',
    comment: 'Budget and financials approved',
    timestamp: '2024-03-11T09:15:00Z',
  },
  {
    id: '3',
    userId: '3',
    status: 'pending',
    timestamp: '2024-03-11T10:00:00Z',
  },
];