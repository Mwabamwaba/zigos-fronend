import { create } from 'zustand';
import { produce } from 'immer';
import { nanoid } from 'nanoid';
import { useTemplateStore } from './templateStore';
import { SOWDocument, SOWStatus, Approval } from '../types/sow';

interface SOWStore {
  documents: SOWDocument[];
  
  // Document Actions
  createFromDeal: (dealId: string, dealName: string, client: string, value: number, templateId: string) => string;
  createFromTemplateByName: (args: { templateName: string; title: string; clientId: string; generatedBy: string }) => string;
  insertFromTemplate: (args: { id: string; templateName: string; title: string; clientId: string; generatedBy: string }) => void;
  updateDocument: (id: string, updates: Partial<SOWDocument>) => void;
  submitForApproval: (id: string) => void;
  approveDocument: (id: string, approval: Omit<Approval, 'id' | 'timestamp'>) => void;
  rejectDocument: (id: string, approval: Omit<Approval, 'id' | 'timestamp'>) => void;
  updateStatus: (id: string, status: SOWStatus) => void;
  
  // Reminders
  sendApprovalReminder: (id: string, userId: string) => void;
  cancelApprovalReminder: (id: string, userId: string) => void;
}

export const useSOWStore = create<SOWStore>((set) => ({
  documents: [],

  createFromDeal: (dealId, dealName, client, value, templateId) => {
    const id = nanoid();
    // Get templates from the template store
    const templates = useTemplateStore.getState().templates;
    const template = templates.find(t => t.id === templateId);
    
    if (!template) {
      throw new Error('Template not found');
    }
    
    set(produce((state) => {
      state.documents.push({
        id,
        dealId,
        dealName,
        title: dealName,
        client,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        value,
        version: 1,
        createdBy: 'current-user',
        approvals: [],
        content: { ...template, title: dealName },
        history: [{
          timestamp: new Date().toISOString(),
          userId: 'current-user',
          action: 'created_from_deal'
        }],
        milestones: [],
        technicalRequirements: {
          overview: '',
          stack: [],
          infrastructure: '',
          security: '',
          performance: ''
        },
        staffingRequirements: []
      });
    }));
    return id;
  },

  createFromTemplateByName: ({ templateName, title, clientId, generatedBy }) => {
    const id = nanoid();
    const template = useTemplateStore.getState().templates.find(t => t.name === templateName);
    if (!template) {
      throw new Error('Template not found');
    }
    set(produce((state) => {
      state.documents.push({
        id,
        dealId: clientId,
        dealName: title,
        title,
        client: clientId,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        value: 0,
        version: 1,
        createdBy: generatedBy,
        approvals: [],
        content: { ...template, title },
        origin: { source: 'template', name: templateName },
        history: [{
          timestamp: new Date().toISOString(),
          userId: generatedBy,
          action: 'created_from_template',
          details: templateName
        }],
        milestones: [],
        technicalRequirements: { overview: '', stack: [], infrastructure: '', security: '', performance: '' },
        staffingRequirements: []
      });
    }));
    return id;
  },

  insertFromTemplate: ({ id, templateName, title, clientId, generatedBy }) => {
    const template = useTemplateStore.getState().templates.find(t => t.name === templateName);
    if (!template) {
      throw new Error('Template not found');
    }
    set(produce((state) => {
      state.documents.push({
        id,
        dealId: clientId,
        dealName: title,
        title,
        client: clientId,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        value: 0,
        version: 1,
        createdBy: generatedBy,
        approvals: [],
        content: { ...template, title },
        origin: { source: 'template', name: templateName },
        history: [{
          timestamp: new Date().toISOString(),
          userId: generatedBy,
          action: 'created_from_template',
          details: templateName
        }],
        milestones: [],
        technicalRequirements: { overview: '', stack: [], infrastructure: '', security: '', performance: '' },
        staffingRequirements: []
      });
    }));
  },

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
            userId: 'current-user',
            action: 'updated',
            details: JSON.stringify(updates)
          }
        ]
      });
    }
  })),

  submitForApproval: (id) => set(produce((state) => {
    const doc = state.documents.find(d => d.id === id);
    if (doc && doc.status === 'draft') {
      doc.status = 'pending_review';
      doc.currentApprovalStep = 0;
      doc.history.push({
        timestamp: new Date().toISOString(),
        userId: 'current-user',
        action: 'submitted_for_approval'
      });
    }
  })),

  approveDocument: (id, approval) => set(produce((state) => {
    const doc = state.documents.find(d => d.id === id);
    if (doc) {
      doc.approvals.push({
        ...approval,
        id: nanoid(),
        timestamp: new Date().toISOString()
      });
      
      if (doc.status === 'pending_review') {
        doc.status = 'approved';
      }
      
      doc.history.push({
        timestamp: new Date().toISOString(),
        userId: approval.userId,
        action: 'approved',
        details: approval.comment
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
        timestamp: new Date().toISOString()
      });
      doc.history.push({
        timestamp: new Date().toISOString(),
        userId: approval.userId,
        action: 'rejected',
        details: approval.comment
      });
    }
  })),

  updateStatus: (id, status) => set(produce((state) => {
    const doc = state.documents.find(d => d.id === id);
    if (doc) {
      doc.status = status;
      doc.history.push({
        timestamp: new Date().toISOString(),
        userId: 'current-user',
        action: 'status_updated',
        details: `Status changed to ${status}`
      });
    }
  })),

  sendApprovalReminder: (id, userId) => set(produce((state) => {
    const doc = state.documents.find(d => d.id === id);
    if (doc) {
      doc.history.push({
        timestamp: new Date().toISOString(),
        userId: 'current-user',
        action: 'reminder_sent',
        details: `Reminder sent to user ${userId}`
      });
    }
  })),

  cancelApprovalReminder: (id, userId) => set(produce((state) => {
    const doc = state.documents.find(d => d.id === id);
    if (doc) {
      doc.history.push({
        timestamp: new Date().toISOString(),
        userId: 'current-user',
        action: 'reminder_cancelled',
        details: `Reminder cancelled for user ${userId}`
      });
    }
  }))
}));