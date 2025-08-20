import { httpClient } from './api/httpClient';

export interface SOWTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  filePath: string;
  placeholders: string[];
  sections: string[];
  estimatedHours: number;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
  isActive: boolean;
}

// Backend response interface (with capital letters)
interface SOWTemplateResponse {
  Id: string;
  Name: string;
  Description: string;
  Category: string;
  FilePath: string;
  Placeholders: string[];
  Sections: string[];
  EstimatedHours: number;
  CreatedAt: string;
  UpdatedAt: string;
  UsageCount: number;
  IsActive: boolean;
}

export interface TemplateProcessingRequest {
  templateId: string;
  placeholderValues: Record<string, string>;
  clientId: string;
  projectName: string;
}

export interface ProcessedTemplate {
  templateId: string;
  title: string;
  executiveSummary: string;
  projectScope: string;
  deliverables: string[];
  timeline: ProjectPhase[];
  pricing: PricingItem[];
  termsAndConditions: string;
  assumptions: string[];
  processedAt: string;
}

export interface ProjectPhase {
  phase: string;
  duration: string;
  description: string;
}

export interface PricingItem {
  item: string;
  cost: number;
  description: string;
}

class TemplateService {
  private baseUrl = '/templates';

  // Convert backend response to frontend interface
  private mapTemplateResponse(backendTemplate: SOWTemplateResponse): SOWTemplate {
    return {
      id: backendTemplate.Id,
      name: backendTemplate.Name,
      description: backendTemplate.Description,
      category: backendTemplate.Category,
      filePath: backendTemplate.FilePath,
      placeholders: backendTemplate.Placeholders || [],
      sections: backendTemplate.Sections || [],
      estimatedHours: backendTemplate.EstimatedHours,
      createdAt: backendTemplate.CreatedAt,
      updatedAt: backendTemplate.UpdatedAt,
      usageCount: backendTemplate.UsageCount,
      isActive: backendTemplate.IsActive
    };
  }

  async getAvailableTemplates(): Promise<SOWTemplate[]> {
    const response = await httpClient.get<SOWTemplateResponse[]>(this.baseUrl);
    return response.map(template => this.mapTemplateResponse(template));
  }

  async getTemplate(templateId: string): Promise<SOWTemplate> {
    const response = await httpClient.get<SOWTemplateResponse>(`${this.baseUrl}/${templateId}`);
    return this.mapTemplateResponse(response);
  }

  async getTemplatePreview(templateId: string): Promise<string> {
    // For preview, we need to get the raw text, not JSON
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:7071/api'}${this.baseUrl}/${templateId}/preview`);
    if (!response.ok) {
      throw new Error(`Failed to fetch template preview: ${response.statusText}`);
    }
    return await response.text();
  }

  async processTemplate(request: TemplateProcessingRequest): Promise<ProcessedTemplate> {
    const response = await httpClient.post<ProcessedTemplate>(`${this.baseUrl}/process`, request);
    return response;
  }

  async getTemplatesByCategory(category: string): Promise<SOWTemplate[]> {
    const templates = await this.getAvailableTemplates();
    return templates.filter(template => template.category === category);
  }

  async getRawTemplateContent(request: TemplateProcessingRequest): Promise<string> {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:7071/api'}${this.baseUrl}/${request.templateId}/raw`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch raw template content: ${response.statusText}`);
    }
    
    return await response.text();
  }
}

export const templateService = new TemplateService();