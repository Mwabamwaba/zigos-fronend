import { create } from 'zustand';
import { Template } from '../types';

interface TemplateStore {
  templates: Template[];
  getTemplateByName: (name: string) => Template | undefined;
  addTemplate: (template: Template) => void;
  updateTemplate: (id: string, updates: Partial<Template>) => void;
  deleteTemplate: (id: string) => void;
}

export const useTemplateStore = create<TemplateStore>((set, get) => ({
  templates: [
    {
      id: 'default',
      name: 'Default Template',
      content: '',
      contactInformation: {
        contractor: {
          companyName: 'The Zig Group, Inc',
          contact: 'Christopher Chileshe',
          title: 'CEO',
          address: '450 Alaskan Way South\nSuite 200 - #9887\nSeattle, Washington, USA\n98104',
          email: 'chris@thezig.io',
          phone: '206-822-3804'
        },
        client: {
          companyName: '',
          contact: '',
          title: '',
          address: '',
          email: '',
          phone: ''
        },
        summary: {
          services: 'Custom software engineering',
          effectiveDate: 'TBC',
          termination: 'Upon completion.'
        },
        scopeDescription: 'The scope of this SOW is limited to creating a fully functional solution with the features detailed further in the SOW. Any functionality listed beyond the scope of the work breakdown sheet is purely for documentation and completeness. This SOW will outline the phases involved in developing such a solution, capture high-level client requirements, and provide details necessary for the successful delivery of the solution.',
        introduction: {
          introduction: 'Company bio & project overview',
          background: 'Project information'
        },
        scopeOfServices: {
          introduction: '',
          service: ''
        },
        milestones: {
          milestones: ''
        },
        architecture: {
          overview: '',
          components: [],
          technologies: []
        },
        activities: {
          activities: ''
        },
        authorization: {
          contractorName: 'Christopher Chileshe',
          contractorTitle: 'CEO',
          clientName: '',
          clientTitle: ''
        }
      },
      sections: [
        {
          title: 'Header',
          required: true,
          allowedComponents: ['company-info', 'project-details'],
          validationRules: ['required'],
        },
        {
          title: 'Scope',
          required: true,
          allowedComponents: ['scope-description', 'deliverables', 'timeline'],
          validationRules: ['required', 'min-length:100'],
        },
        {
          title: 'Terms',
          required: true,
          allowedComponents: ['terms-conditions', 'signatures'],
          validationRules: ['required'],
        },
      ],
    },
    {
      id: 'sow-template',
      name: 'SOW Template',
      content: '',
      contactInformation: {
        contractor: {
          companyName: 'The Zig Group, Inc',
          contact: 'Christopher Chileshe',
          title: 'CEO',
          address: '450 Alaskan Way South\nSuite 200 - #9887\nSeattle, Washington, USA\n98104',
          email: 'chris@thezig.io',
          phone: '206-822-3804'
        },
        client: {
          companyName: '',
          contact: '',
          title: '',
          address: '',
          email: '',
          phone: ''
        },
        summary: {
          services: 'Custom software engineering',
          effectiveDate: 'TBC',
          termination: 'Upon completion.'
        },
        scopeDescription: 'The scope of this SOW is limited to creating a fully functional solution with the features detailed further in the SOW. Any functionality listed beyond the scope of the work breakdown sheet is purely for documentation and completeness. This SOW will outline the phases involved in developing such a solution, capture high-level client requirements, and provide details necessary for the successful delivery of the solution.',
        introduction: {
          introduction: 'Company bio & project overview',
          background: 'Project information'
        },
        scopeOfServices: {
          introduction: '',
          service: ''
        },
        milestones: {
          milestones: ''
        },
        architecture: {
          overview: '',
          components: [],
          technologies: []
        },
        activities: {
          activities: ''
        },
        authorization: {
          contractorName: 'Christopher Chileshe',
          contractorTitle: 'CEO',
          clientName: '',
          clientTitle: ''
        }
      },
      sections: [
        { title: 'Executive Summary', required: true, allowedComponents: [], validationRules: [] },
        { title: 'Project Scope', required: true, allowedComponents: [], validationRules: [] },
        { title: 'Deliverables', required: false, allowedComponents: [], validationRules: [] },
        { title: 'Timeline', required: false, allowedComponents: [], validationRules: [] },
        { title: 'Pricing', required: false, allowedComponents: [], validationRules: [] },
        { title: 'Terms and Conditions', required: true, allowedComponents: [], validationRules: [] },
      ],
    },
  ],
  getTemplateByName: (name: string) => {
    const templates = get().templates;
    return templates.find((t: Template) => t.name.toLowerCase() === name.toLowerCase());
  },
  
  addTemplate: (template) => set((state) => ({
    templates: [...state.templates, template],
  })),
  
  updateTemplate: (id, updates) => set((state) => ({
    templates: state.templates.map((template) =>
      template.id === id ? { ...template, ...updates } : template
    ),
  })),
  
  deleteTemplate: (id) => set((state) => ({
    templates: state.templates.filter((template) => template.id !== id),
  })),
}));