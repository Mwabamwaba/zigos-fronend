import { create } from 'zustand';
import { produce } from 'immer';
import { nanoid } from 'nanoid';
import { Project, Milestone, TeamMember, Risk, Dependency } from '../types/project';
import { SOWDocument } from '../types/sow';

interface ProjectStore {
  projects: Project[];
  
  // Project Actions
  createFromSOW: (sow: SOWDocument) => string;
  updateProject: (id: string, updates: Partial<Project>) => void;
  
  // Team Management
  assignTeamMember: (projectId: string, member: TeamMember) => void;
  updateTeamMember: (projectId: string, memberId: string, updates: Partial<TeamMember>) => void;
  
  // Milestone Management
  updateMilestone: (projectId: string, milestoneId: string, updates: Partial<Milestone>) => void;
  
  // Risk Management
  addRisk: (projectId: string, risk: Omit<Risk, 'id'>) => void;
  updateRisk: (projectId: string, riskId: string, updates: Partial<Risk>) => void;
  
  // Dependency Management
  addDependency: (projectId: string, dependency: Omit<Dependency, 'id'>) => void;
  updateDependency: (projectId: string, dependencyId: string, updates: Partial<Dependency>) => void;
}

export const useProjectStore = create<ProjectStore>((set) => ({
  projects: [],

  createFromSOW: (sow) => {
    const id = nanoid();
    set(produce((state) => {
      // Convert SOW milestones to project milestones
      const milestones = sow.milestones.map(m => ({
        id: nanoid(),
        title: m.title,
        description: m.description,
        startDate: m.startDate,
        endDate: m.endDate,
        status: 'not_started' as const,
        deliverables: m.deliverables,
        assignedTeam: [],
        estimatedHours: m.estimatedHours,
        actualHours: 0,
        dependencies: []
      }));

      state.projects.push({
        id,
        sowId: sow.id,
        title: sow.title,
        status: 'planning',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        budget: {
          total: sow.value,
          allocated: 0,
          remaining: sow.value
        },
        milestones,
        team: [],
        risks: [],
        dependencies: [],
        technicalSpecs: {
          stack: sow.technicalRequirements.stack,
          infrastructure: {
            hosting: '',
            deployment: '',
            monitoring: ''
          },
          security: {
            requirements: [],
            compliance: []
          },
          performance: {
            slas: [],
            metrics: []
          }
        }
      });
    }));
    return id;
  },

  updateProject: (id, updates) => set(produce((state) => {
    const project = state.projects.find(p => p.id === id);
    if (project) {
      Object.assign(project, updates);
    }
  })),

  assignTeamMember: (projectId, member) => set(produce((state) => {
    const project = state.projects.find(p => p.id === projectId);
    if (project) {
      project.team.push(member);
    }
  })),

  updateTeamMember: (projectId, memberId, updates) => set(produce((state) => {
    const project = state.projects.find(p => p.id === projectId);
    if (project) {
      const member = project.team.find(m => m.id === memberId);
      if (member) {
        Object.assign(member, updates);
      }
    }
  })),

  updateMilestone: (projectId, milestoneId, updates) => set(produce((state) => {
    const project = state.projects.find(p => p.id === projectId);
    if (project) {
      const milestone = project.milestones.find(m => m.id === milestoneId);
      if (milestone) {
        Object.assign(milestone, updates);
      }
    }
  })),

  addRisk: (projectId, risk) => set(produce((state) => {
    const project = state.projects.find(p => p.id === projectId);
    if (project) {
      project.risks.push({ ...risk, id: nanoid() });
    }
  })),

  updateRisk: (projectId, riskId, updates) => set(produce((state) => {
    const project = state.projects.find(p => p.id === projectId);
    if (project) {
      const risk = project.risks.find(r => r.id === riskId);
      if (risk) {
        Object.assign(risk, updates);
      }
    }
  })),

  addDependency: (projectId, dependency) => set(produce((state) => {
    const project = state.projects.find(p => p.id === projectId);
    if (project) {
      project.dependencies.push({ ...dependency, id: nanoid() });
    }
  })),

  updateDependency: (projectId, dependencyId, updates) => set(produce((state) => {
    const project = state.projects.find(p => p.id === projectId);
    if (project) {
      const dependency = project.dependencies.find(d => d.id === dependencyId);
      if (dependency) {
        Object.assign(dependency, updates);
      }
    }
  }))
}));