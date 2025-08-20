import { SOWDocument } from '../types';
import { mockApprovals } from './mockApprovals';
import { defaultTemplate } from './templates';

export const pastSows: SOWDocument[] = [
  {
    id: '1',
    title: 'E-commerce Platform Development',
    client: 'TechRetail Inc.',
    status: 'completed',
    createdAt: '2024-02-15T10:00:00Z',
    updatedAt: '2024-02-20T15:30:00Z',
    value: 75000,
    version: 1,
    createdBy: '5',
    currentApprovalStep: 2,
    approvals: mockApprovals,
    content: defaultTemplate,
    history: [
      {
        timestamp: '2024-02-15T10:00:00Z',
        userId: '5',
        action: 'created',
      },
      {
        timestamp: '2024-02-16T14:20:00Z',
        userId: '1',
        action: 'approved',
        details: 'Technical review completed',
      },
      {
        timestamp: '2024-02-17T09:45:00Z',
        userId: '2',
        action: 'approved',
        details: 'Financial review completed',
      },
    ],
  },
  {
    id: '2',
    title: 'Mobile App Development Project',
    client: 'HealthTech Solutions',
    status: 'approved',
    createdAt: '2024-02-25T09:00:00Z',
    updatedAt: '2024-02-28T16:45:00Z',
    value: 120000,
    version: 1,
    createdBy: '5',
    currentApprovalStep: 3,
    approvals: [mockApprovals[0], mockApprovals[1]],
    content: defaultTemplate,
    history: [
      {
        timestamp: '2024-02-25T09:00:00Z',
        userId: '5',
        action: 'created',
      },
      {
        timestamp: '2024-02-26T11:30:00Z',
        userId: '1',
        action: 'approved',
        details: 'Technical requirements verified',
      },
    ],
  },
  {
    id: '3',
    title: 'Cloud Migration Services',
    client: 'FinServ Corp',
    status: 'pending_review',
    createdAt: '2024-03-01T08:30:00Z',
    updatedAt: '2024-03-01T14:20:00Z',
    value: 95000,
    version: 1,
    createdBy: '5',
    currentApprovalStep: 1,
    approvals: [],
    content: defaultTemplate,
    history: [
      {
        timestamp: '2024-03-01T08:30:00Z',
        userId: '5',
        action: 'created',
      },
      {
        timestamp: '2024-03-01T14:20:00Z',
        userId: '5',
        action: 'submitted_for_approval',
      },
    ],
  },
  {
    id: '4',
    title: 'AI Implementation Project',
    client: 'DataInsights Ltd',
    status: 'draft',
    createdAt: '2024-03-05T11:15:00Z',
    updatedAt: '2024-03-05T16:30:00Z',
    version: 1,
    createdBy: '5',
    approvals: [],
    content: defaultTemplate,
    history: [
      {
        timestamp: '2024-03-05T11:15:00Z',
        userId: '5',
        action: 'created',
      },
    ],
  },
];