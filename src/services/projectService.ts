import { httpClient } from './api/httpClient';
import { API_ENDPOINTS } from './api/config';
import { Project, TeamMember, Milestone, Risk, ChangeRequest } from '../types/project';

export const projectService = {

  async getProject(id: string): Promise<Project> {
    return httpClient.get<Project>(`${API_ENDPOINTS.project.base})/${id}`);
  },

  async getAll(): Promise<Project[]> {
    return httpClient.get<Project[]>(API_ENDPOINTS.project.base);
  },

  async getById(id: string): Promise<Project> {
    return httpClient.get<Project>(`${API_ENDPOINTS.project.base}/${id}`);
  },

  async create(project: Partial<Project>): Promise<Project> {
    return httpClient.post<Project>(API_ENDPOINTS.project.base, project);
  },

  async update(id: string, updates: Partial<Project>): Promise<Project> {
    return httpClient.put<Project>(`${API_ENDPOINTS.project.base}/${id}`, updates);
  },

  // Team Management
  async assignTeam(id: string, assignments: Array<{ role: string; memberId: string; hours: number }>): Promise<Project> {
    return httpClient.post<Project>(API_ENDPOINTS.project.team(id), { assignments });
  },

  async updateTeamMember(id: string, memberId: string, updates: Partial<TeamMember>): Promise<Project> {
    return httpClient.put<Project>(`${API_ENDPOINTS.project.team(id)}/${memberId}`, updates);
  },

  // Milestones
  async addMilestone(id: string, milestone: Omit<Milestone, 'id'>): Promise<Project> {
    return httpClient.post<Project>(API_ENDPOINTS.project.milestones(id), milestone);
  },

  async updateMilestone(id: string, milestoneId: string, updates: Partial<Milestone>): Promise<Project> {
    return httpClient.put<Project>(`${API_ENDPOINTS.project.milestones(id)}/${milestoneId}`, updates);
  },

  // Risks
  async addRisk(id: string, risk: Omit<Risk, 'id'>): Promise<Project> {
    return httpClient.post<Project>(API_ENDPOINTS.project.risks(id), risk);
  },

  async updateRisk(id: string, riskId: string, updates: Partial<Risk>): Promise<Project> {
    return httpClient.put<Project>(`${API_ENDPOINTS.project.risks(id)}/${riskId}`, updates);
  },

  // Change Requests
  async submitChangeRequest(id: string, request: Omit<ChangeRequest, 'id' | 'status'>): Promise<Project> {
    return httpClient.post<Project>(API_ENDPOINTS.project.changes(id), request);
  },

  async updateChangeRequest(id: string, requestId: string, updates: Partial<ChangeRequest>): Promise<Project> {
    return httpClient.put<Project>(`${API_ENDPOINTS.project.changes(id)}/${requestId}`, updates);
  },

  // Communications
  async addCommunication(id: string, message: string, attachments?: string[]): Promise<Project> {
    return httpClient.post<Project>(API_ENDPOINTS.project.communications(id), { message, attachments });
  },
};