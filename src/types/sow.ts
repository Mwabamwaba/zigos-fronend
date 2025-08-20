export type SOWStatus = 
  | 'draft'
  | 'pending_review'
  | 'in_review'
  | 'approved'
  | 'the_zig_signed'
  | 'client_signed'
  | 'fully_executed'
  | 'cancelled';

import type { Template } from '../types';

export interface SOWDocument {
  id: string;
  dealId: string;
  dealName: string;
  title: string;
  client: string;
  status: SOWStatus;
  createdAt: string;
  updatedAt: string;
  value: number;
  version: number;
  createdBy: string;
  currentApprovalStep?: number;
  approvals: Approval[];
  content: Template;
  origin?: {
    source: 'template' | 'ai';
    name?: string;
  };
  history: Array<{
    timestamp: string;
    userId: string;
    action: string;
    details?: string;
  }>;
  milestones: Array<{
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    deliverables: string[];
    estimatedHours: number;
  }>;
  technicalRequirements: {
    overview: string;
    stack: string[];
    infrastructure: string;
    security: string;
    performance: string;
  };
  staffingRequirements: Array<{
    role: string;
    count: number;
    requiredSkills: string[];
    estimatedHours: number;
  }>;
}

export interface Approval {
  id: string;
  userId: string;
  status: 'pending' | 'approved' | 'rejected';
  comment?: string;
  timestamp: string;
}