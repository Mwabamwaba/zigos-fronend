import { aiService } from './aiService';

// Backend API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:7071/api';

export interface WBSItem {
  id: string;
  number: string; // e.g., "1.1", "2.11"
  component: string;
  description: string;
  complexityRating: 'Low' | 'Medium' | 'High';
  hoursEstimate: number;
  platform?: string;
  isCategory?: boolean; // For main categories like "1.0 Infrastructure"
  totalHours?: number; // For categories - sum of sub-items
  parentId?: string;
  level: number; // 0 for main categories, 1 for sub-categories, 2 for items
}

export interface GeneratedWBS {
  title: string;
  items: WBSItem[];
  totalEstimate: {
    hours: number;
    daysWithOneDev: number;
    daysWithTwoDevs: number;
  };
  summary: string;
}

interface MeetingData {
  id: string;
  title: string;
  summary: string;
  participants: string[];
  date: string;
}

class WBSGenerationService {
  /**
   * Generate Work Breakdown Structure from selected meeting notes and store in backend
   */
  async generateWBS(meetings: MeetingData[]): Promise<GeneratedWBS> {
    try {
      console.log('Starting WBS generation for', meetings.length, 'meetings');
      
      // Try to generate WBS using AI with better error handling
      let generatedWBS: GeneratedWBS;
      
      try {
        // Combine all meeting content
        const combinedContent = this.extractMeetingContent(meetings);
        
        // Generate WBS using AI with timeout handling
        const wbsPrompt = this.createWBSPrompt(combinedContent);
        
        console.log('Calling AI service for WBS generation...');
        const aiResponse = await Promise.race([
          aiService.generateContent(wbsPrompt, {
            dealName: 'Software Development Project',
            company: 'ZigOS'
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('WBS generation timeout - using fallback')), 25000)
          )
        ]);

        // Parse AI response into structured WBS
        generatedWBS = this.parseWBSResponse((aiResponse as any).content);
        console.log('AI WBS generation successful');
        
      } catch (aiError) {
        console.warn('AI WBS generation failed, using fallback:', aiError);
        // Use fallback WBS if AI fails
        generatedWBS = this.createFallbackWBS();
      }
      
      // Try to store WBS in backend, but don't fail if storage fails
      try {
        const storedWBS = await this.storeWBSInBackend(generatedWBS, meetings);
        console.log('✅ WBS stored in backend successfully:', storedWBS);
        
        // Add storage info to the WBS for reference
        (generatedWBS as any).blobInfo = {
          blobId: storedWBS.blobId,
          blobUrl: storedWBS.blobUrl,
          expiresAt: storedWBS.expiresAt,
          stored: true
        };
        
      } catch (backendError) {
        console.warn('⚠️ Backend storage failed, continuing without storage:', backendError);
        
        // Add info that storage failed
        (generatedWBS as any).blobInfo = {
          stored: false,
          error: backendError instanceof Error ? backendError.message : 'Storage failed'
        };
      }
      
      // Always return the generated WBS, regardless of storage success
      return generatedWBS;
      
    } catch (error) {
      console.error('WBS generation failed completely:', error);
      // Return fallback WBS as last resort
      return this.createFallbackWBS();
    }
  }

  /**
   * Store generated WBS in backend blob storage
   */
  private async storeWBSInBackend(wbsData: GeneratedWBS, meetings: MeetingData[]): Promise<any> {
    const projectName = this.extractProjectName(meetings);
    
    // Ensure total estimate is properly calculated
    const totalHours = wbsData.items
      .filter(item => !item.isCategory)
      .reduce((sum, item) => sum + item.hoursEstimate, 0);
    
    // Fix total estimate if it's incorrect
    if (wbsData.totalEstimate.hours !== totalHours || totalHours === 0) {
      wbsData.totalEstimate = {
        hours: Math.max(totalHours, 1), // Ensure at least 1 hour
        daysWithOneDev: Math.ceil(Math.max(totalHours, 1) / 8),
        daysWithTwoDevs: Math.ceil(Math.max(totalHours, 1) / 16)
      };
    }
    
    const requestPayload = {
      wbsData: {
        ...wbsData,
        generatedAt: new Date().toISOString(),
        generatedBy: '00000000-0000-0000-0000-000000000000' // TODO: Get actual user ID
      },
      projectName: projectName,
      expirationHours: 24
    };

    console.log('Storing WBS in backend:', requestPayload);

    const response = await fetch(`${API_BASE_URL}/wbs/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestPayload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Backend storage failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(`Backend storage failed: ${result.message || 'Unknown error'}`);
    }

    return result.data;
  }

  /**
   * Extract project name from meetings
   */
  private extractProjectName(meetings: MeetingData[]): string {
    if (meetings.length === 0) return 'Unknown Project';
    
    // Try to find a common theme in meeting titles
    const titles = meetings.map(m => m.title);
    const firstTitle = titles[0];
    
    // If there's only one meeting, use its title
    if (meetings.length === 1) {
      return firstTitle.substring(0, 50); // Limit length
    }
    
    // For multiple meetings, create a descriptive name
    return `Project from ${meetings.length} meetings`;
  }

  /**
   * Retrieve WBS from backend blob storage
   */
  async retrieveWBSFromBackend(blobId: string): Promise<GeneratedWBS | null> {
    try {
      console.log('Retrieving WBS from backend:', blobId);

      const response = await fetch(`${API_BASE_URL}/wbs/${blobId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.warn('WBS not found in backend storage');
          return null;
        }
        throw new Error(`Failed to retrieve WBS: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success || !result.data?.wbsData) {
        throw new Error('Invalid response from backend');
      }

      console.log('WBS retrieved from backend successfully');
      return result.data.wbsData;
      
    } catch (error) {
      console.error('Failed to retrieve WBS from backend:', error);
      return null;
    }
  }

  /**
   * Get WBS blob URL from backend
   */
  async getWBSUrl(blobId: string): Promise<string | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/wbs/${blobId}/url`, {
        method: 'GET'
      });

      if (!response.ok) {
        return null;
      }

      const result = await response.json();
      return result.success ? result.blobUrl : null;
      
    } catch (error) {
      console.error('Failed to get WBS URL:', error);
      return null;
    }
  }

  /**
   * Extract and combine content from all selected meetings
   */
  private extractMeetingContent(meetings: MeetingData[]): string {
    let content = "PROJECT INFORMATION FROM MEETINGS:\n\n";
    
    meetings.forEach((meeting, index) => {
      content += `MEETING ${index + 1}: ${meeting.title} (${meeting.date})\n`;
      content += `Participants: ${meeting.participants.join(', ')}\n`;
      content += `Summary: ${meeting.summary}\n\n`;
    });

    return content;
  }

  /**
   * Create prompt for AI to generate WBS
   */
  private createWBSPrompt(meetingContent: string): string {
    return `
Based on the following meeting notes, generate a detailed Work Breakdown Structure (WBS) for a software development project.

${meetingContent}

Please create a WBS with the following structure:
- Use hierarchical numbering (1.0, 1.1, 1.2, 2.0, 2.1, 2.11, etc.)
- Include main categories like: Infrastructure, Front-End, Back-End, Data Acquisition, AI & Machine Learning
- For each item, provide:
  - Component name
  - Brief description
  - Complexity rating (Low/Medium/High)
  - Hours estimate
  - Platform if applicable (e.g., "Custom", "No code")

Example format:
1.0 Infrastructure (Total: 150 hours)
1.1 Development environment setup | Medium | 20 hours | Setting up staging environment
1.2 CI/CD pipeline implementation | Medium | 15 hours | Implementation of CI/CD pipeline for deployment
2.0 Front-End (Total: 200 hours)
2.1 Admin - Functionality
2.11 View and manage courses | Medium | 48 hours | No code | UI for viewing and managing courses

Please respond with a structured JSON format that includes:
- title: Project title derived from meetings
- categories: Array of main categories with sub-items
- Each item should have: number, component, description, complexity, hours, platform (optional)
- Total project estimate in hours

Focus on realistic estimates based on the project scope discussed in the meetings.
`;
  }

  /**
   * Parse AI response into structured WBS format
   */
  private parseWBSResponse(aiResponse: string): GeneratedWBS {
    try {
      // Try to extract JSON from response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedData = JSON.parse(jsonMatch[0]);
        return this.convertToWBSFormat(parsedData);
      }
      
      // Fallback: parse text format
      return this.parseTextWBS(aiResponse);
    } catch (error) {
      console.error('Failed to parse WBS response:', error);
      return this.createFallbackWBS();
    }
  }

  /**
   * Convert parsed data to standardized WBS format
   */
  private convertToWBSFormat(data: any): GeneratedWBS {
    const items: WBSItem[] = [];
    let totalHours = 0;

    if (data.categories) {
      data.categories.forEach((category: any, categoryIndex: number) => {
        const categoryNumber = `${categoryIndex + 1}.0`;
        let categoryHours = 0;

        // Add category header
        items.push({
          id: `category-${categoryIndex}`,
          number: categoryNumber,
          component: category.name || `Category ${categoryIndex + 1}`,
          description: category.description || '',
          complexityRating: 'Medium',
          hoursEstimate: 0,
          isCategory: true,
          level: 0
        });

        // Add sub-items
        if (category.items) {
          category.items.forEach((item: any, itemIndex: number) => {
            const itemNumber = `${categoryIndex + 1}.${itemIndex + 1}`;
            const hours = item.hours || item.hoursEstimate || 20;
            categoryHours += hours;

            items.push({
              id: `item-${categoryIndex}-${itemIndex}`,
              number: itemNumber,
              component: item.component || item.name || 'Component',
              description: item.description || '',
              complexityRating: item.complexity || item.complexityRating || 'Medium',
              hoursEstimate: hours,
              platform: item.platform,
              parentId: `category-${categoryIndex}`,
              level: 1
            });
          });
        }

        // Update category with total hours
        const categoryItem = items.find(i => i.id === `category-${categoryIndex}`);
        if (categoryItem) {
          categoryItem.totalHours = categoryHours;
          categoryItem.hoursEstimate = categoryHours;
        }

        totalHours += categoryHours;
      });
    }

    // Ensure we have a valid total
    const validTotalHours = Math.max(totalHours, 1); // Minimum 1 hour

    return {
      title: data.title || 'Generated Work Breakdown Structure',
      items,
      totalEstimate: {
        hours: validTotalHours,
        daysWithOneDev: Math.ceil(validTotalHours / 8),
        daysWithTwoDevs: Math.ceil(validTotalHours / 16)
      },
      summary: data.summary || 'Work breakdown structure generated from meeting analysis'
    };
  }

  /**
   * Parse text-based WBS response
   */
  private parseTextWBS(textResponse: string): GeneratedWBS {
    const lines = textResponse.split('\n').filter(line => line.trim());
    const items: WBSItem[] = [];
    let totalHours = 0;

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;

      // Try to extract WBS item from line
      const numberMatch = trimmedLine.match(/^(\d+\.\d+|\d+\.0)/);
      if (numberMatch) {
        const number = numberMatch[1];
        const isCategory = number.endsWith('.0');
        
        // Parse the rest of the line
        const restOfLine = trimmedLine.substring(number.length).trim();
        const parts = restOfLine.split('|').map(p => p.trim());
        
        const component = parts[0] || 'Component';
        const complexity = (parts[1] as 'Low' | 'Medium' | 'High') || 'Medium';
        const hoursMatch = parts[2]?.match(/(\d+)/);
        const hours = hoursMatch ? parseInt(hoursMatch[1]) : (isCategory ? 0 : 20);
        const platform = parts[3];
        const description = parts[4] || parts[3] || '';

        items.push({
          id: `item-${index}`,
          number,
          component,
          description,
          complexityRating: complexity,
          hoursEstimate: hours,
          platform,
          isCategory,
          level: isCategory ? 0 : 1
        });

        if (!isCategory) {
          totalHours += hours;
        }
      }
    });

    // Ensure we have a valid total
    const validTotalHours = Math.max(totalHours, 1); // Minimum 1 hour

    return {
      title: 'Generated Work Breakdown Structure',
      items,
      totalEstimate: {
        hours: validTotalHours,
        daysWithOneDev: Math.ceil(validTotalHours / 8),
        daysWithTwoDevs: Math.ceil(validTotalHours / 16)
      },
      summary: 'Work breakdown structure generated from meeting analysis'
    };
  }

  /**
   * Create fallback WBS when parsing fails
   */
  private createFallbackWBS(): GeneratedWBS {
    const items: WBSItem[] = [
      {
        id: 'infrastructure',
        number: '1.0',
        component: 'Infrastructure',
        description: 'Development environment and deployment setup',
        complexityRating: 'Medium',
        hoursEstimate: 0, // Category items have 0 hours
        totalHours: 56, // Sum of child items
        isCategory: true,
        level: 0
      },
      {
        id: 'dev-env',
        number: '1.1',
        component: 'Development environment setup',
        description: 'Setting up staging and development environments',
        complexityRating: 'Medium',
        hoursEstimate: 24,
        parentId: 'infrastructure',
        level: 1
      },
      {
        id: 'ci-cd',
        number: '1.2',
        component: 'CI/CD pipeline',
        description: 'Continuous integration and deployment setup',
        complexityRating: 'Medium',
        hoursEstimate: 32,
        parentId: 'infrastructure',
        level: 1
      },
      {
        id: 'frontend',
        number: '2.0',
        component: 'Front-End Development',
        description: 'User interface and user experience development',
        complexityRating: 'Medium',
        hoursEstimate: 0, // Category items have 0 hours
        totalHours: 80, // Sum of child items
        isCategory: true,
        level: 0
      },
      {
        id: 'admin-ui',
        number: '2.1',
        component: 'Admin Interface',
        description: 'Administrative dashboard and controls',
        complexityRating: 'Medium',
        hoursEstimate: 80,
        platform: 'Custom',
        parentId: 'frontend',
        level: 1
      }
    ];

    // Calculate total hours from non-category items
    const totalHours = items
      .filter(item => !item.isCategory)
      .reduce((sum, item) => sum + item.hoursEstimate, 0);

    return {
      title: 'Software Development Project WBS',
      items,
      totalEstimate: {
        hours: totalHours,
        daysWithOneDev: Math.ceil(totalHours / 8),
        daysWithTwoDevs: Math.ceil(totalHours / 16)
      },
      summary: 'Basic work breakdown structure template'
    };
  }
}

// Export singleton instance
export const wbsGenerationService = new WBSGenerationService();
export default wbsGenerationService;
