import { create } from 'zustand';
import { produce } from 'immer';
import { nanoid } from 'nanoid';
import { SOWDocument, ApprovalStep, User, Approval } from '../types';

interface ApprovalStore {
  documents: SOWDocument[];
  approvalSteps: ApprovalStep[];
  currentUser: User | null;
  notifications: Array<{
    id: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    timestamp: string;
  }>;
  
  // Document Actions
  createDocument: (doc: Partial<SOWDocument>) => void;
  updateDocument: (id: string, updates: Partial<SOWDocument>) => void;
  submitForApproval: (id: string) => void;
  approveDocument: (id: string, approval: Omit<Approval, 'id' | 'timestamp'>) => void;
  rejectDocument: (id: string, approval: Omit<Approval, 'id' | 'timestamp'>) => void;
  
  // Workflow Configuration
  setApprovalSteps: (steps: ApprovalStep[]) => void;
  updateApprovalStep: (id: string, updates: Partial<ApprovalStep>) => void;
  
  // Store Management
  setCurrentUser: (user: User) => void;
  
  // Notification Management
  addNotification: (message: string, type: 'info' | 'success' | 'warning' | 'error') => void;
  removeNotification: (id: string) => void;
}

export const useApprovalStore = create<ApprovalStore>((set) => ({
  documents: [
    {
      id: '1',
      title: 'Sample SOW',
      client: 'Test Client',
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
      createdBy: 'user-1',
      approvals: [],
      content: {
        title: 'Sample SOW',
        sections: [
          {
            title: 'Project Overview',
            content: 'This is a sample project overview.',
            required: true,
          }
        ]
      },
      history: [
        {
          timestamp: new Date().toISOString(),
          userId: 'user-1',
          action: 'created',
        }
      ],
    }
  ],
  approvalSteps: [
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
  ],
  currentUser: {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'creator',
    department: 'Sales',
  },
  notifications: [],

  createDocument: (doc) => set(produce((state) => {
    const newDoc: SOWDocument = {
      id: nanoid(),
      title: doc.title || 'Untitled SOW',
      client: doc.client || '',
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
      createdBy: state.currentUser?.id || '',
      approvals: [],
      content: doc.content || { title: '', sections: [] },
      history: [{
        timestamp: new Date().toISOString(),
        userId: state.currentUser?.id || '',
        action: 'created',
      }],
    };
    state.documents.push(newDoc);
  })),

  updateDocument: (id, updates) => set(produce((state) => {
    const doc = state.documents.find(d => d.id === id);
    if (doc) {
      Object.assign(doc, {
        ...updates,
        updatedAt: new Date().toISOString(),
        history: [
          ...doc.history,
          {
            timestamp: new Date().toISOString(),
            userId: state.currentUser?.id || '',
            action: 'updated',
            details: JSON.stringify(updates),
          },
        ],
      });
    }
  })),

  submitForApproval: (id) => set(produce((state) => {
    const doc = state.documents.find(d => d.id === id);
    if (doc) {
      doc.status = 'pending_review';
      doc.currentApprovalStep = 0;
      doc.history.push({
        timestamp: new Date().toISOString(),
        userId: state.currentUser?.id || '',
        action: 'submitted_for_approval',
      });
    }
  })),

  approveDocument: (id, approval) => set(produce((state) => {
    const doc = state.documents.find(d => d.id === id);
    if (doc) {
      doc.approvals.push({
        ...approval,
        id: nanoid(),
        timestamp: new Date().toISOString(),
      });
      
      // Check if all approvals for current step are complete
      const currentStep = state.approvalSteps[doc.currentApprovalStep || 0];
      const stepApprovals = doc.approvals.filter(a => 
        a.status === 'approved' && 
        state.approvalSteps[doc.currentApprovalStep || 0].id === currentStep.id
      );
      
      if (stepApprovals.length >= currentStep.minApprovers) {
        if (doc.currentApprovalStep === state.approvalSteps.length - 1) {
          doc.status = 'approved';
        } else {
          doc.currentApprovalStep = (doc.currentApprovalStep || 0) + 1;
        }
      }
      
      doc.history.push({
        timestamp: new Date().toISOString(),
        userId: state.currentUser?.id || '',
        action: 'approved',
        details: approval.comment,
      });
    }
  })),

  rejectDocument: (id, approval) => set(produce((state) => {
    const doc = state.documents.find(d => d.id === id);
    if (doc) {
      doc.status = 'rejected';
      doc.approvals.push({
        ...approval,
        id: nanoid(),
        timestamp: new Date().toISOString(),
      });
      doc.history.push({
        timestamp: new Date().toISOString(),
        userId: state.currentUser?.id || '',
        action: 'rejected',
        details: approval.comment,
      });
    }
  })),

  setApprovalSteps: (steps) => set({ approvalSteps: steps }),
  
  updateApprovalStep: (id, updates) => set(produce((state) => {
    const step = state.approvalSteps.find(s => s.id === id);
    if (step) {
      Object.assign(step, updates);
    }
  })),

  setCurrentUser: (user) => set({ currentUser: user }),

  addNotification: (message, type) => set(produce((state) => {
    state.notifications.push({
      id: nanoid(),
      message,
      type,
      timestamp: new Date().toISOString(),
    });
  })),

  removeNotification: (id) => set(produce((state) => {
    const index = state.notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      state.notifications.splice(index, 1);
    }
  })),
}));