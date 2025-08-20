import { httpClient } from './api/httpClient';
import { API_ENDPOINTS } from './api/config';
import { SOWDocument, Approval } from '../types';

export const sowService = {
  async getAll(): Promise<SOWDocument[]> {
    return httpClient.get<SOWDocument[]>(API_ENDPOINTS.sow.base);
  },

  async getById(id: string): Promise<SOWDocument> {
    return httpClient.get<SOWDocument>(`${API_ENDPOINTS.sow.base}/${id}`);
  },

  async create(sow: Partial<SOWDocument>): Promise<SOWDocument> {
    return httpClient.post<SOWDocument>(API_ENDPOINTS.sow.base, sow);
  },

  async createFromTemplate(args: { templateName: string; title: string; clientId: string; generatedBy: string }): Promise<{ id: string; status: string }> {
    return httpClient.post<{ id: string; status: string }>(API_ENDPOINTS.sow.createFromTemplate, args);
  },

  async update(id: string, updates: Partial<SOWDocument>): Promise<SOWDocument> {
    return httpClient.put<SOWDocument>(`${API_ENDPOINTS.sow.base}/${id}`, updates);
  },

  async submit(id: string): Promise<SOWDocument> {
    return httpClient.post<SOWDocument>(API_ENDPOINTS.sow.submit(id), {});
  },

  async approve(id: string, approval: Omit<Approval, 'id' | 'timestamp'>): Promise<SOWDocument> {
    return httpClient.post<SOWDocument>(API_ENDPOINTS.sow.approve(id), approval);
  },

  async reject(id: string, approval: Omit<Approval, 'id' | 'timestamp'>): Promise<SOWDocument> {
    return httpClient.post<SOWDocument>(API_ENDPOINTS.sow.reject(id), approval);
  },
};