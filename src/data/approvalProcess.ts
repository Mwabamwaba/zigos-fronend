import { ApprovalStep } from '../types';

export const approvalSteps: ApprovalStep[] = [
  {
    id: '1',
    role: 'approver',
    department: 'Technical',
    minApprovers: 1,
    order: 1,
  },
  {
    id: '2',
    role: 'approver',
    department: 'Finance',
    minApprovers: 1,
    threshold: 50000,
    order: 2,
  },
  {
    id: '3',
    role: 'approver',
    department: 'Legal',
    minApprovers: 1,
    threshold: 100000,
    order: 3,
  },
  {
    id: '4',
    role: 'admin',
    department: 'Executive',
    minApprovers: 1,
    threshold: 250000,
    order: 4,
  },
];