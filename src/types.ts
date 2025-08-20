export interface Section {
  title: string;
  content: string;
  required: boolean;
}

export interface ContactInfo {
  companyName: string;
  contact: string;
  title: string;
  address: string;
  email: string;
  phone: string;
}

export interface ContactInformationData {
  contractor: ContactInfo;
  client: ContactInfo;
  summary?: {
    services: string;
    effectiveDate: string;
    termination: string;
  };
  scopeDescription?: string;
  introduction?: {
    introduction: string;
    background: string;
  };
  scopeOfServices?: {
    introduction: string;
    service: string;
    planningApproach: string;
    phasesDescription: string;
    auditDescription: string;
    analyzeDescription: string;
    implementationDescription: string;
    validationDescription: string;
    feedbackNote: string;
  };
  milestones?: {
    description: string;
    wbsNote: string;
  };
  architecture?: {
    diagramNote: string;
    descriptionNote: string;
    costEstimateNote: string;
    costItems: Array<{
      serviceCategory: string;
      serviceType: string;
      region: string;
      description: string;
      estimatedMonthlyCost: string;
    }>;
  };
  activities?: {
    executionNote: string;
    stageDescription: string;
    discoveryItems: string;
    executeItems: string;
    deployItems: string;
    breakdownNote: string;
    deliverables: {
      discovery: string;
      implement: string;
      validate: string;
    };
  };
  rolesAndResponsibilities?: {
    projectManager: {
      responsibilities: string[];
    };
    softwareEngineers: {
      responsibilities: string[];
    };
    designer: {
      responsibilities: string[];
    };
    clientProjectSponsor: {
      responsibilities: string[];
      additionalResponsibilities: string[];
    };
    projectManagerResponsibilities: string;
    softwareEngineersResponsibilities: string;
    designerResponsibilities: string;
    clientResponsibilities: string;
    mutualResponsibilities: string;
    changes: string;
    additionalStaff: string;
  };
  deliverables?: {
    agreedDeliverables: string;
    reviewAndRevision: string;
    nativeFiles: string;
    expenses: string;
  };
  riskAssessment?: {
    projectScore: string;
    riskItems: Array<{
      risk: string;
      riskLevel: string;
      description: string;
    }>;
  };
  masterServicesAgreement?: {
    agreementText: string;
  };
  authorization?: {
    clientSignature: string;
    clientDate: string;
    clientName: string;
    clientTitle: string;
    contractorSignature: string;
    contractorDate: string;
    contractorName: string;
    contractorTitle: string;
  };
}

export interface Template {
  id: string;
  name: string;
  content: string;
  contactInformation?: ContactInformationData;
  sections: Array<{
    title: string;
    required: boolean;
    allowedComponents: string[];
    validationRules: string[];
  }>;
}

export interface AIModel {
  id: string;
  name: string;
  description: string;
  isDefault?: boolean;
}

export interface Message {
  type: 'user' | 'assistant';
  content: string;
  model?: string;
}

export type ApprovalStatus = 'draft' | 'pending_review' | 'in_review' | 'approved' | 'rejected' | 'pending_signature' | 'completed';
export type UserRole = 'admin' | 'approver' | 'creator' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
}

export interface ApprovalStep {
  id: string;
  role: UserRole;
  department?: string;
  minApprovers: number;
  threshold?: number;
  order: number;
}

export interface Approval {
  id: string;
  userId: string;
  status: 'pending' | 'approved' | 'rejected';
  comment?: string;
  timestamp: string;
}

export interface SOWDocument {
  id: string;
  title: string;
  client: string;
  status: ApprovalStatus;
  createdAt: string;
  updatedAt: string;
  value?: number;
  version: number;
  createdBy: string;
  currentApprovalStep?: number;
  approvals: Approval[];
  content: Template;
  history: Array<{
    timestamp: string;
    userId: string;
    action: string;
    details?: string;
  }>;
}