import axios from 'axios';
import { FirefliesTranscriptionResponse } from './firefliesService';

// TypeScript interfaces for Lucid REST API integration
export interface LucidChartsRequest {
  title: string;
  transcript: string;
  description?: string;
  participants?: string[];
  tags?: string[];
  sourceUrl?: string;
}

export interface LucidDocument {
  id: string;
  title: string;
  folderId?: string;
  createdDate: string;
  lastModifiedDate: string;
  embedUrl: string;
  editUrl: string;
  viewUrl: string;
  product: 'lucidchart' | 'lucidspark';
}

export interface LucidShape {
  id: string;
  type: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  style?: LucidShapeStyle;
  data?: Record<string, any>;
}

export interface LucidShapeStyle {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  textColor?: string;
  fontSize?: number;
  fontFamily?: string;
}

export interface LucidLine {
  id: string;
  startShapeId: string;
  endShapeId: string;
  label?: string;
  style?: LucidLineStyle;
}

export interface LucidLineStyle {
  stroke?: string;
  strokeWidth?: number;
  lineType?: 'solid' | 'dashed' | 'dotted';
  arrowStart?: boolean;
  arrowEnd?: boolean;
}

export interface LucidChartsResponse {
  documentId: string;
  documentUrl: string;
  embedUrl: string;
  editUrl: string;
  title: string;
  status: 'generating' | 'completed' | 'failed';
  message?: string;
  mermaidCode?: string;
  shapes: LucidShape[];
  lines: LucidLine[];
}

export interface DiagramComponent {
  id: string;
  name: string;
  type: 'frontend' | 'backend' | 'database' | 'api' | 'service' | 'external';
  description?: string;
  technology?: string;
  position?: { x: number; y: number };
}

export interface DiagramConnection {
  from: string;
  to: string;
  label: string;
  type: 'data' | 'api' | 'dependency' | 'flow';
}

class LucidChartsService {
  private readonly baseURL: string;
  private readonly apiKey: string;

  constructor() {
    this.baseURL = 'https://api.lucid.co/v1';
    this.apiKey = import.meta.env.VITE_LUCIDCHART_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('Lucid API key not found. Set VITE_LUCIDCHART_API_KEY environment variable.');
    }
  }

  /**
   * Generate actual Lucid document from Fireflies meeting data
   */
  async generateFromFirefliesData(firefliesData: FirefliesTranscriptionResponse): Promise<LucidChartsResponse> {
    try {
      console.log('Creating actual Lucid document from Fireflies data:', firefliesData.title);
      
      if (!this.apiKey) {
        throw new Error('Lucid API key is required. Please set VITE_LUCIDCHART_API_KEY in your environment variables.');
      }

      // 1. Extract architecture information from Fireflies data
      const architecture = this.extractArchitectureFromFireflies(firefliesData);
      
      // 2. Create new Lucid document
      const document = await this.createDocument({
        title: `${firefliesData.title} - Architecture`,
        description: `Architecture diagram generated from meeting: ${firefliesData.title}`
      });
      
      // 3. Add shapes for each component
      const shapes = await this.addComponentShapes(document.id, architecture.components);
      
      // 4. Add connections between components
      const lines = await this.addComponentConnections(document.id, shapes, architecture.relationships);
      
      // 5. Auto-layout the diagram
      await this.autoLayoutDiagram(document.id);
      
      const response: LucidChartsResponse = {
        documentId: document.id,
        documentUrl: document.viewUrl,
        embedUrl: document.embedUrl,
        editUrl: document.editUrl,
        title: document.title,
        status: 'completed',
        message: 'Architecture diagram created successfully in Lucidchart',
        mermaidCode: architecture.mermaidDiagram,
        shapes,
        lines
      };

      console.log('Lucid document created successfully:', response);
      return response;
    } catch (error) {
      console.error('Failed to create Lucid document:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Create new Lucid document using REST API
   */
  private async createDocument(params: { title: string; description?: string }): Promise<LucidDocument> {
    try {
      const response = await axios.post(`${this.baseURL}/documents`, {
        title: params.title,
        description: params.description,
        product: 'lucidchart'
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const document = response.data;
      
      return {
        id: document.id,
        title: document.title,
        folderId: document.folderId,
        createdDate: document.createdDate,
        lastModifiedDate: document.lastModifiedDate,
        embedUrl: `https://lucid.app/lucidchart/embed/${document.id}`,
        editUrl: `https://lucid.app/lucidchart/${document.id}/edit`,
        viewUrl: `https://lucid.app/lucidchart/${document.id}/view`,
        product: 'lucidchart'
      };
    } catch (error) {
      console.error('Failed to create Lucid document:', error);
      throw new Error('Failed to create Lucid document: ' + (error as any).message);
    }
  }

  /**
   * Add component shapes to the document
   */
  private async addComponentShapes(documentId: string, components: DiagramComponent[]): Promise<LucidShape[]> {
    const shapes: LucidShape[] = [];
    const gridSize = 200;
    const startX = 100;
    const startY = 100;

    for (let i = 0; i < components.length; i++) {
      const component = components[i];
      const position = component.position || {
        x: startX + (i % 3) * gridSize,
        y: startY + Math.floor(i / 3) * gridSize
      };

      try {
        const shapeResponse = await axios.post(`${this.baseURL}/documents/${documentId}/shapes`, {
          type: this.getLucidShapeType(component.type),
          label: component.name,
          x: position.x,
          y: position.y,
          width: 120,
          height: 80,
          style: this.getComponentStyle(component.type),
          data: {
            componentType: component.type,
            description: component.description,
            technology: component.technology,
            sourceType: 'fireflies-generated'
          }
        }, {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        });

        const shape: LucidShape = {
          id: shapeResponse.data.id,
          type: component.type,
          label: component.name,
          x: position.x,
          y: position.y,
          width: 120,
          height: 80,
          style: this.getComponentStyle(component.type),
          data: {
            componentType: component.type,
            originalName: component.name
          }
        };

        shapes.push(shape);
        console.log(`Added shape: ${component.name} (${component.type})`);

        // Small delay to avoid rate limiting
        await this.delay(100);
      } catch (error) {
        console.warn(`Failed to add shape ${component.name}:`, error);
      }
    }

    return shapes;
  }

  /**
   * Add connections between components
   */
  private async addComponentConnections(
    documentId: string, 
    shapes: LucidShape[], 
    relationships: DiagramConnection[]
  ): Promise<LucidLine[]> {
    const lines: LucidLine[] = [];

    for (const relationship of relationships) {
      const fromShape = shapes.find(s => 
        s.label.toLowerCase().includes(relationship.from.toLowerCase()) ||
        relationship.from.toLowerCase().includes(s.label.toLowerCase())
      );
      
      const toShape = shapes.find(s => 
        s.label.toLowerCase().includes(relationship.to.toLowerCase()) ||
        relationship.to.toLowerCase().includes(s.label.toLowerCase())
      );

      if (fromShape && toShape && fromShape.id !== toShape.id) {
        try {
          const lineResponse = await axios.post(`${this.baseURL}/documents/${documentId}/lines`, {
            startShapeId: fromShape.id,
            endShapeId: toShape.id,
            label: relationship.label,
            style: this.getConnectionStyle(relationship.type)
          }, {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json'
            }
          });

          const line: LucidLine = {
            id: lineResponse.data.id,
            startShapeId: fromShape.id,
            endShapeId: toShape.id,
            label: relationship.label,
            style: this.getConnectionStyle(relationship.type)
          };

          lines.push(line);
          console.log(`Added connection: ${relationship.from} → ${relationship.to}`);

          // Small delay to avoid rate limiting
          await this.delay(100);
        } catch (error) {
          console.warn(`Failed to add connection ${relationship.from} → ${relationship.to}:`, error);
        }
      }
    }

    return lines;
  }

  /**
   * Auto-layout the diagram for better visual appearance
   */
  private async autoLayoutDiagram(documentId: string): Promise<void> {
    try {
      await axios.post(`${this.baseURL}/documents/${documentId}/layout`, {
        algorithm: 'hierarchical',
        direction: 'top-to-bottom'
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Applied auto-layout to diagram');
    } catch (error) {
      console.warn('Auto-layout failed (non-critical):', error);
      // Auto-layout failure is not critical, continue without it
    }
  }

  /**
   * Get Lucid shape type based on component type
   */
  private getLucidShapeType(componentType: string): string {
    const shapeTypeMap: Record<string, string> = {
      'frontend': 'flowchart-process',
      'backend': 'flowchart-process', 
      'database': 'flowchart-database',
      'api': 'flowchart-data',
      'service': 'flowchart-process',
      'external': 'flowchart-terminator'
    };
    
    return shapeTypeMap[componentType] || 'flowchart-process';
  }

  /**
   * Get component styling based on type
   */
  private getComponentStyle(componentType: string): LucidShapeStyle {
    const styleMap: Record<string, LucidShapeStyle> = {
      'frontend': {
        fill: '#E3F2FD',
        stroke: '#1976D2',
        strokeWidth: 2,
        textColor: '#1976D2',
        fontSize: 12,
        fontFamily: 'Arial'
      },
      'backend': {
        fill: '#F3E5F5',
        stroke: '#7B1FA2',
        strokeWidth: 2,
        textColor: '#7B1FA2',
        fontSize: 12,
        fontFamily: 'Arial'
      },
      'database': {
        fill: '#E8F5E8',
        stroke: '#388E3C',
        strokeWidth: 2,
        textColor: '#388E3C',
        fontSize: 12,
        fontFamily: 'Arial'
      },
      'api': {
        fill: '#FFF3E0',
        stroke: '#F57C00',
        strokeWidth: 2,
        textColor: '#F57C00',
        fontSize: 12,
        fontFamily: 'Arial'
      },
      'service': {
        fill: '#FCE4EC',
        stroke: '#C2185B',
        strokeWidth: 2,
        textColor: '#C2185B',
        fontSize: 12,
        fontFamily: 'Arial'
      },
      'external': {
        fill: '#F5F5F5',
        stroke: '#616161',
        strokeWidth: 2,
        textColor: '#616161',
        fontSize: 12,
        fontFamily: 'Arial'
      }
    };
    
    return styleMap[componentType] || styleMap['service'];
  }

  /**
   * Get connection styling based on relationship type
   */
  private getConnectionStyle(connectionType: string): LucidLineStyle {
    const styleMap: Record<string, LucidLineStyle> = {
      'data': {
        stroke: '#2196F3',
        strokeWidth: 2,
        lineType: 'solid',
        arrowEnd: true
      },
      'api': {
        stroke: '#FF9800',
        strokeWidth: 2,
        lineType: 'dashed',
        arrowEnd: true
      },
      'dependency': {
        stroke: '#4CAF50',
        strokeWidth: 1,
        lineType: 'dotted',
        arrowEnd: true
      },
      'flow': {
        stroke: '#9C27B0',
        strokeWidth: 2,
        lineType: 'solid',
        arrowEnd: true
      }
    };
    
    return styleMap[connectionType] || styleMap['flow'];
  }

  /**
   * Extract architecture information from Fireflies data
   */
  private extractArchitectureFromFireflies(data: FirefliesTranscriptionResponse): {
    components: DiagramComponent[];
    relationships: DiagramConnection[];
    mermaidDiagram: string;
  } {
    const transcript = data.sentences?.map(s => s.text).join(' ') || '';
    const actionItems = data.summary?.action_items || '';
    const keywords = data.summary?.keywords || [];
    
    // Enhanced component detection using AI filters and keywords
    const components = this.identifyComponents(transcript, keywords, data.sentences || []);
    const relationships = this.identifyRelationships(transcript, data.sentences || []);
    
    // Generate Mermaid diagram code for backup/documentation
    const mermaidDiagram = this.generateMermaidDiagram(components, relationships);
    
    return {
      components,
      relationships,
      mermaidDiagram
    };
  }

  /**
   * Identify system components using AI filters and keywords
   */
  private identifyComponents(transcript: string, keywords: string[], sentences: any[]): DiagramComponent[] {
    const components: DiagramComponent[] = [];
    const text = transcript.toLowerCase();
    
    // Use Fireflies AI filters to find task-related sentences
    const taskSentences = sentences.filter(s => s.ai_filters?.task);
    const techSentences = taskSentences.map(s => s.text.toLowerCase()).join(' ');
    
    // Enhanced component patterns with technology detection
    const componentPatterns = [
      { pattern: /\b(frontend|ui|user interface|client|web app|mobile app|react|vue|angular)\b/g, type: 'frontend' as const },
      { pattern: /\b(backend|server|api|service|microservice|endpoint|node|express|django)\b/g, type: 'backend' as const },
      { pattern: /\b(database|db|storage|repository|data store|mongodb|postgresql|mysql|redis)\b/g, type: 'database' as const },
      { pattern: /\b(authentication|auth|login|user management|security|oauth)\b/g, type: 'service' as const },
      { pattern: /\b(payment|billing|stripe|paypal|checkout|transaction)\b/g, type: 'external' as const },
      { pattern: /\b(notification|email|sms|messaging|alerts|webhook)\b/g, type: 'service' as const },
      { pattern: /\b(analytics|reporting|dashboard|metrics|tracking|monitoring)\b/g, type: 'service' as const },
      { pattern: /\b(file upload|storage|s3|blob|cdn|media|assets)\b/g, type: 'service' as const }
    ];

    let componentId = 1;
    const addedComponents = new Set<string>();

    componentPatterns.forEach(({ pattern, type }) => {
      const matches = [...(text + ' ' + techSentences).matchAll(pattern)];
      matches.forEach(match => {
        const name = this.formatComponentName(match[1]);
        const nameKey = name.toLowerCase();
        
        if (!addedComponents.has(nameKey)) {
          addedComponents.add(nameKey);
          components.push({
            id: `comp_${componentId++}`,
            name,
            type,
            description: `${name} component identified from meeting discussion`,
            technology: this.detectTechnology(match[1], keywords)
          });
        }
      });
    });

    // Add components from keywords if not already added
    keywords.forEach(keyword => {
      const keywordLower = keyword.toLowerCase();
      if (['api', 'database', 'frontend', 'backend', 'service'].some(tech => keywordLower.includes(tech))) {
        const name = this.formatComponentName(keyword);
        const nameKey = name.toLowerCase();
        
        if (!addedComponents.has(nameKey)) {
          addedComponents.add(nameKey);
          components.push({
            id: `comp_${componentId++}`,
            name,
            type: this.inferComponentType(keywordLower),
            description: `Component from meeting keywords`
          });
        }
      }
    });

    return components;
  }

  /**
   * Identify relationships from sentence analysis
   */
  private identifyRelationships(transcript: string, sentences: any[]): DiagramConnection[] {
    const relationships: DiagramConnection[] = [];
    const text = transcript.toLowerCase();
    
    // Find sentences that mention connections or data flow
    const relationshipPatterns = [
      { pattern: /(.+?)\s+(connects to|sends to|calls|integrates with)\s+(.+?)[\.\,]/g, type: 'api' as const },
      { pattern: /(.+?)\s+(stores|saves|retrieves|gets)\s+(.+?)[\.\,]/g, type: 'data' as const },
      { pattern: /(.+?)\s+(depends on|requires|uses)\s+(.+?)[\.\,]/g, type: 'dependency' as const },
      { pattern: /(.+?)\s+(flows to|triggers|notifies)\s+(.+?)[\.\,]/g, type: 'flow' as const }
    ];

    relationshipPatterns.forEach(({ pattern, type }) => {
      const matches = [...text.matchAll(pattern)];
      matches.forEach(match => {
        const from = this.formatComponentName(match[1]);
        const to = this.formatComponentName(match[3]);
        const verb = match[2];
        
        if (from !== to && from.length > 2 && to.length > 2) {
          relationships.push({
            from,
            to,
            label: verb,
            type
          });
        }
      });
    });

    return relationships;
  }

  /**
   * Generate Mermaid diagram code for documentation/backup
   */
  private generateMermaidDiagram(components: DiagramComponent[], relationships: DiagramConnection[]): string {
    let mermaid = 'graph TD\n';
    
    // Add components
    components.forEach(comp => {
      mermaid += `    ${comp.id}[${comp.name}]\n`;
    });
    
    // Add relationships
    relationships.forEach(rel => {
      const fromComp = components.find(c => c.name === rel.from);
      const toComp = components.find(c => c.name === rel.to);
      if (fromComp && toComp) {
        mermaid += `    ${fromComp.id} --> ${toComp.id}\n`;
      }
    });
    
    // Add styling
    mermaid += `
    classDef frontend fill:#e1f5fe
    classDef backend fill:#f3e5f5
    classDef database fill:#e8f5e8
    classDef api fill:#fff3e0
    classDef service fill:#fce4ec
    classDef external fill:#f5f5f5
`;
    
    return mermaid;
  }

  // ... Helper methods (keeping existing ones)
  private formatComponentName(name: string): string {
    return name.trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private detectTechnology(component: string, keywords: string[]): string | undefined {
    const techMap: Record<string, string> = {
      'react': 'React',
      'vue': 'Vue.js',
      'angular': 'Angular',
      'node': 'Node.js',
      'express': 'Express.js',
      'mongodb': 'MongoDB',
      'postgresql': 'PostgreSQL',
      'mysql': 'MySQL'
    };

    const lowerComponent = component.toLowerCase();
    for (const [tech, display] of Object.entries(techMap)) {
      if (lowerComponent.includes(tech) || keywords.some(k => k.toLowerCase().includes(tech))) {
        return display;
      }
    }
    return undefined;
  }

  private inferComponentType(keyword: string): DiagramComponent['type'] {
    if (keyword.includes('frontend') || keyword.includes('ui')) return 'frontend';
    if (keyword.includes('backend') || keyword.includes('server')) return 'backend';
    if (keyword.includes('database') || keyword.includes('db')) return 'database';
    if (keyword.includes('api')) return 'api';
    if (keyword.includes('service')) return 'service';
    return 'service';
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Legacy method for backward compatibility
   */
  async generateArchitectureFromMeeting(meetingData: LucidChartsRequest): Promise<LucidChartsResponse> {
    // For non-Fireflies data, create a basic Lucid document
    console.log('Creating Lucid document from legacy meeting data:', meetingData.title);
    
    if (!this.apiKey) {
      // Fallback to previous behavior if no API key
      const mermaidDiagram = this.generateBasicMermaidDiagram(meetingData.transcript);
      return {
        documentId: `legacy_${Date.now()}`,
        documentUrl: 'https://lucid.app/lucidchart',
        embedUrl: 'https://lucid.app/lucidchart',
        editUrl: 'https://lucid.app/lucidchart',
        title: `${meetingData.title} - Architecture`,
        status: 'completed',
        message: 'Mermaid diagram generated (Lucid API key required for full integration)',
        mermaidCode: mermaidDiagram,
        shapes: [],
        lines: []
      };
    }

    // Create document with basic analysis
    const document = await this.createDocument({
      title: `${meetingData.title} - Architecture`,
      description: meetingData.description || 'Architecture from meeting transcript'
    });

    return {
      documentId: document.id,
      documentUrl: document.viewUrl,
      embedUrl: document.embedUrl,
      editUrl: document.editUrl,
      title: document.title,
      status: 'completed',
      message: 'Basic Lucid document created',
      mermaidCode: this.generateBasicMermaidDiagram(meetingData.transcript),
      shapes: [],
      lines: []
    };
  }

  private generateBasicMermaidDiagram(transcript: string): string {
    // Simple Mermaid generation for legacy support
    return `graph TD
    A[System] --> B[Components]
    B --> C[Analysis]
    C --> D[Architecture]`;
  }

  /**
   * Handle API errors consistently
   */
  private handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const data = error.response?.data;
      
      let message = 'Lucid API request failed';
      
      if (status === 401) {
        message = 'Unauthorized - check your Lucid API key';
      } else if (status === 403) {
        message = 'Forbidden - insufficient Lucid API permissions';
      } else if (status === 404) {
        message = 'Lucid resource not found';
      } else if (status === 429) {
        message = 'Rate limit exceeded - please try again later';
      } else if (status === 500) {
        message = 'Lucid server error - please try again later';
      } else {
        message = data?.error || data?.message || error.message;
      }
      
      return new Error(`Lucid Charts API Error: ${message}`);
    }
    return new Error(`Unexpected error: ${error.message || 'Unknown error'}`);
  }
}

// Export singleton instance
export const lucidChartsService = new LucidChartsService();
export default lucidChartsService; 