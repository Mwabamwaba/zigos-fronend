export interface Project {
  id: string;
  sowId: string;
  title: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed';
  startDate: string;
  endDate: string;
  budget: {
    total: number;
    allocated: number;
    remaining: number;
  };
  milestones: Milestone[];
  team: TeamMember[];
  risks: Risk[];
  dependencies: Dependency[];
  technicalSpecs: TechnicalSpecs;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'not_started' | 'in_progress' | 'completed';
  deliverables: string[];
  assignedTeam: string[]; // Team member IDs
  estimatedHours: number;
  actualHours: number;
  dependencies: string[]; // Milestone IDs
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  skills: string[];
  availability: {
    weeklyHours: number;
    allocatedHours: number;
  };
  assignments: Array<{
    milestoneId: string;
    hours: number;
  }>;
}

export interface Risk {
  id: string;
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  probability: 'low' | 'medium' | 'high';
  mitigation: string;
  owner: string; // Team member ID
  status: 'identified' | 'mitigated' | 'accepted';
}

export interface Dependency {
  id: string;
  title: string;
  type: 'internal' | 'external';
  description: string;
  status: 'pending' | 'fulfilled' | 'blocked';
  dueDate: string;
  owner: string; // Team member ID
}

export interface TechnicalSpecs {
  stack: string[];
  infrastructure: {
    hosting: string;
    deployment: string;
    monitoring: string;
  };
  security: {
    requirements: string[];
    compliance: string[];
  };
  performance: {
    slas: string[];
    metrics: string[];
  };
}

export interface ChangeRequest {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedBy: string;
  requestedDate: string;
  impact: string;
  hoursImpact: number;
}