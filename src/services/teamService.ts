import { httpClient } from './api/httpClient';
import { API_ENDPOINTS } from './api/config';
import { TeamMember } from '../types/project';

export interface TeamMemberAvailability {
  memberId: string;
  availableHours: number;
  assignedProjects: Array<{
    projectId: string;
    projectName: string;
    assignedHours: number;
    startDate: string;
    endDate: string;
  }>;
}

export const teamService = {
  async getAllMembers(): Promise<TeamMember[]> {
    return httpClient.get<TeamMember[]>(API_ENDPOINTS.team.members);
  },

  async getMemberById(id: string): Promise<TeamMember> {
    return httpClient.get<TeamMember>(`${API_ENDPOINTS.team.members}/${id}`);
  },

  async addMember(member: Omit<TeamMember, 'id'>): Promise<TeamMember> {
    return httpClient.post<TeamMember>(API_ENDPOINTS.team.members, member);
  },

  async updateMember(id: string, updates: Partial<TeamMember>): Promise<TeamMember> {
    return httpClient.put<TeamMember>(`${API_ENDPOINTS.team.members}/${id}`, updates);
  },

  async deleteMember(id: string): Promise<void> {
    return httpClient.delete<void>(`${API_ENDPOINTS.team.members}/${id}`);
  },

  async getMemberAvailability(id: string): Promise<TeamMemberAvailability> {
    return httpClient.get<TeamMemberAvailability>(`${API_ENDPOINTS.team.availability}/${id}`);
  },

  async getMemberSchedule(id: string, startDate: string, endDate: string): Promise<Array<{
    projectId: string;
    projectName: string;
    hours: number;
    date: string;
  }>> {
    return httpClient.get<any>(`${API_ENDPOINTS.team.members}/${id}/schedule`, {
      params: { startDate, endDate },
    });
  },
};