interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface AIResponse {
  content: string;
  model: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface SOWContext {
  dealName?: string;
  company?: string;
  value?: number;
  meetingNotes?: string[];
  currentSection?: string;
  existingContent?: string;
}

class AIService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
    this.baseUrl = 'https://api.openai.com/v1';
  }

  async generateContent(
    prompt: string,
    context: SOWContext,
    model: string = 'gpt-4o-mini'
  ): Promise<AIResponse> {
    console.log('AIService.generateContent called');
    console.log('API Key present:', !!this.apiKey);
    console.log('Model:', model);
    
    if (!this.apiKey) {
      console.error('No API key found');
      throw new Error('OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your .env file.');
    }

    console.log('API key found, proceeding...');
    const systemPrompt = this.buildSystemPrompt(context);
    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ];

    try {
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      console.log('Making request to OpenAI API...');
      console.log('URL:', `${this.baseUrl}/chat/completions`);
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.mapModelId(model),
          messages,
          temperature: 0.7,
          max_tokens: 2000,
          stream: false
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      
      console.log('Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || 'Unknown error';
        
        // Handle rate limiting with user-friendly message
        if (response.status === 429) {
          throw new Error(`Rate limit reached. Please wait 20-30 seconds before trying again. To increase limits, add a payment method at https://platform.openai.com/account/billing`);
        }
        
        throw new Error(`AI API Error: ${response.status} - ${errorMessage}`);
      }

      const data = await response.json();
      console.log('OpenAI API response received successfully');
      
      const content = data.choices[0]?.message?.content || 'No response generated';
      console.log('Content generated successfully');
      
      return {
        content,
        model: model,
        usage: data.usage
      };
    } catch (error) {
      console.error('Error in generateContent:', error);
      console.error('AI Service Error:', error);
      
      // Handle timeout/abort errors
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timed out after 30 seconds. This might be due to rate limiting. Please try again in a moment.');
        }
        if (error.message.includes('fetch')) {
          throw new Error('Network error. Please check your internet connection and try again.');
        }
      }
      
      throw error;
    }
  }

  async analyzeMeetingNotes(
    meetingNotes: string[],
    context: SOWContext
  ): Promise<{
    suggestions: string[];
    keyPoints: string[];
    estimatedEffort: string;
    riskFactors: string[];
    recommendedSections: string[];
  }> {
    const prompt = `
    Analyze these meeting notes for SOW generation:
    
    ${meetingNotes.join('\n\n---\n\n')}
    
    Please provide:
    1. Content suggestions for SOW sections
    2. Key technical and business points
    3. Estimated effort assessment
    4. Potential risk factors
    5. Recommended SOW sections to focus on
    
    Format your response as structured recommendations.
    `;

    const response = await this.generateContent(prompt, context);
    
    // Parse the structured response (in a real implementation, you might want to use a more structured approach)
    const content = response.content;
    
    return {
      suggestions: this.extractSection(content, 'suggestions') || [],
      keyPoints: this.extractSection(content, 'key points') || [],
      estimatedEffort: this.extractSection(content, 'effort')?.[0] || 'Unable to estimate from available information',
      riskFactors: this.extractSection(content, 'risk') || [],
      recommendedSections: this.extractSection(content, 'sections') || []
    };
  }

  async generateSOWSection(
    sectionType: string,
    context: SOWContext,
    specificRequirements?: string
  ): Promise<string> {
    const prompt = `
    Generate a detailed ${sectionType} section for a Statement of Work.
    
    Context:
    - Project: ${context.dealName || 'Software Development Project'}
    - Client: ${context.company || 'Client Company'}
    - Budget: ${context.value ? `$${context.value.toLocaleString()}` : 'TBD'}
    ${context.meetingNotes ? `- Meeting insights: ${context.meetingNotes.slice(0, 2).join('; ')}` : ''}
    ${specificRequirements ? `- Specific requirements: ${specificRequirements}` : ''}
    
    Please generate professional, detailed content for the ${sectionType} section that:
    1. Is appropriate for the project scope and budget
    2. Follows industry best practices
    3. Is clear and actionable
    4. Includes relevant technical details when appropriate
    
    Return only the section content, ready to be inserted into the SOW document.
    `;

    const response = await this.generateContent(prompt, context);
    return response.content;
  }

  async generateProjectEstimate(
    requirements: string,
    context: SOWContext
  ): Promise<{
    timeline: string;
    effort: string;
    breakdown: { phase: string; duration: string; description: string }[];
    assumptions: string[];
  }> {
    const prompt = `
    Based on these requirements, generate a project estimate:
    
    Requirements: ${requirements}
    
    Context:
    - Project: ${context.dealName || 'Software Development Project'}
    - Client: ${context.company || 'Client Company'}
    - Budget Range: ${context.value ? `$${context.value.toLocaleString()}` : 'To be determined'}
    ${context.meetingNotes ? `- Meeting insights: ${context.meetingNotes.join('; ')}` : ''}
    
    Please provide:
    1. Overall timeline estimate
    2. Total effort estimate
    3. Phase breakdown with durations
    4. Key assumptions
    
    Format as structured data for project planning.
    `;

    const response = await this.generateContent(prompt, context);
    
    // Parse structured response (simplified parsing - in production, consider using a more robust approach)
    const content = response.content;
    
    return {
      timeline: this.extractSection(content, 'timeline')?.[0] || '12-16 weeks',
      effort: this.extractSection(content, 'effort')?.[0] || 'Medium complexity project',
      breakdown: this.parsePhaseBreakdown(content),
      assumptions: this.extractSection(content, 'assumptions') || []
    };
  }

  async suggestNextActions(
    currentContext: SOWContext,
    conversationHistory: AIMessage[]
  ): Promise<string[]> {
    const prompt = `
    Based on the current SOW context and conversation, suggest the next 3-5 most helpful actions the user could take.
    
    Current context:
    - Section: ${currentContext.currentSection || 'None selected'}
    - Project: ${currentContext.dealName || 'Unnamed project'}
    - Available meeting notes: ${currentContext.meetingNotes?.length || 0}
    
    Recent conversation:
    ${conversationHistory.slice(-3).map(msg => `${msg.role}: ${msg.content}`).join('\n')}
    
    Suggest specific, actionable next steps like:
    - "Generate [specific section] content"
    - "Analyze meeting notes for [specific aspect]"
    - "Create project timeline based on requirements"
    
    Return as a simple list of suggestions.
    `;

    const response = await this.generateContent(prompt, currentContext);
    return response.content.split('\n').filter(line => line.trim() && line.includes('-')).map(line => line.replace(/^-\s*/, '').trim());
  }

  private buildSystemPrompt(context: SOWContext): string {
    return `
    You are an expert SOW (Statement of Work) assistant specializing in software development and technology projects. You help create comprehensive, professional SOW documents.

    Your expertise includes:
    - Software development project planning
    - Technical architecture and implementation
    - Project estimation and timeline planning
    - Risk assessment and mitigation
    - Client communication and requirement gathering

    Current context:
    ${context.dealName ? `- Project: ${context.dealName}` : ''}
    ${context.company ? `- Client: ${context.company}` : ''}
    ${context.value ? `- Budget: $${context.value.toLocaleString()}` : ''}
    ${context.currentSection ? `- Current section: ${context.currentSection}` : ''}
    ${context.meetingNotes?.length ? `- Meeting notes available: ${context.meetingNotes.length} sets` : ''}

    Guidelines:
    1. Always provide professional, detailed responses
    2. Consider the project budget and scope when making recommendations
    3. Include specific, actionable items
    4. Use industry-standard terminology
    5. Be concise but comprehensive
    6. Focus on practical implementation
    `;
  }

  private mapModelId(modelId: string): string {
    const modelMap: Record<string, string> = {
      'gpt-4o-mini': 'gpt-4o-mini',
      'gpt-4o': 'gpt-4o',
      'gpt-4': 'gpt-4o-mini', // Map legacy gpt-4 to gpt-4o-mini
      'gpt-3.5-turbo': 'gpt-3.5-turbo',
      'claude-2': 'gpt-4o-mini', // Fallback to GPT-4o-mini
    };
    return modelMap[modelId] || 'gpt-4o-mini';
  }

  private extractSection(content: string, sectionName: string): string[] | null {
    const regex = new RegExp(`${sectionName}:?\\s*\\n([\\s\\S]*?)(?=\\n\\n|\\n[A-Z]|$)`, 'i');
    const match = content.match(regex);
    if (!match) return null;
    
    return match[1]
      .split('\n')
      .map(line => line.replace(/^[-*]\s*/, '').trim())
      .filter(line => line.length > 0);
  }

  private parsePhaseBreakdown(content: string): { phase: string; duration: string; description: string }[] {
    const phaseSection = this.extractSection(content, 'phase breakdown') || this.extractSection(content, 'breakdown');
    if (!phaseSection) return [];

    return phaseSection.map(line => {
      const parts = line.split(':');
      if (parts.length >= 2) {
        const phase = parts[0].trim();
        const rest = parts.slice(1).join(':').trim();
        const durationMatch = rest.match(/(\d+[-\s]*\d*\s*(?:weeks?|days?|months?))/i);
        const duration = durationMatch ? durationMatch[1] : '2-3 weeks';
        const description = rest.replace(durationMatch?.[0] || '', '').trim();
        
        return { phase, duration, description: description || 'Implementation phase' };
      }
      return { phase: line, duration: '2-3 weeks', description: 'Implementation phase' };
    });
  }
}

export const aiService = new AIService();
export default aiService;
