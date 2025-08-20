import { create } from 'zustand';
import { AIModel, Message } from '../types';
import aiService from '../services/aiService';

interface Step {
  id: string;
  question: string;
  type: 'text' | 'select' | 'multiselect';
  placeholder?: string;
  options?: Array<{ label: string; value: string }>;
  warnings: string[];
}

interface AIStore {
  activeStep: Step;
  responses: Record<string, string>;
  suggestions: Array<{ text: string; action: () => void }>;
  messages: Message[];
  selectedModel: string;
  isLoading: boolean;
  error: string | null;
  dealContext: {
    dealId?: string;
    dealName?: string;
    company?: string;
    value?: number;
    transcripts?: string[];
    notes?: string[];
    meetingNotes?: string[];
  };
  meetingAnalysis: {
    suggestions: string[];
    keyPoints: string[];
    estimatedEffort: string;
    riskFactors: string[];
    recommendedSections: string[];
  } | null;
  updateResponse: (stepId: string, value: string) => void;
  addMessage: (message: Message) => void;
  sendMessage: (content: string, currentSection?: string) => Promise<void>;
  analyzeMeetingNotes: (meetingNotes: string[]) => Promise<void>;
  generateContent: (sectionType: string, requirements?: string) => Promise<string>;
  generateEstimate: (requirements: string) => Promise<void>;
  setSuggestions: (suggestions: Array<{ text: string; action: () => void }>) => void;
  setSelectedModel: (modelId: string) => void;
  setDealContext: (context: any) => void;
  setMeetingNotes: (notes: string[]) => void;
  clearError: () => void;
}

const INITIAL_STEP: Step = {
  id: 'company_profile',
  question: "Let's start with your company's profile. What's your company's main business focus and industry?",
  type: 'text',
  placeholder: 'E.g., We are a software development company specializing in...',
  warnings: [],
};

export const useAIStore = create<AIStore>((set, get) => ({
  activeStep: INITIAL_STEP,
  responses: {},
  suggestions: [],
  messages: [],
  selectedModel: 'gpt-4o-mini',
  isLoading: false,
  error: null,
  dealContext: {},
  meetingAnalysis: null,
  
  updateResponse: (stepId, value) => {
    set((state) => ({
      responses: { ...state.responses, [stepId]: value },
    }));
  },
  
  addMessage: (message) => {
    set((state) => ({
      messages: [...state.messages, message],
    }));
  },

  sendMessage: async (content: string, currentSection?: string) => {
    const state = get();
    
    // Add user message
    const userMessage: Message = {
      type: 'user',
      content,
    };
    
    console.log('Adding user message to chat');
    
    set((s) => ({
      messages: [...s.messages, userMessage],
      isLoading: true,
      error: null,
    }));
    
    console.log('Message added successfully');

    // Test mode - if message starts with "test:", return a mock response
    if (content.toLowerCase().startsWith('test:')) {
      console.log('Test mode activated');
      setTimeout(() => {
        const testResponse: Message = {
          type: 'assistant',
          content: `This is a test response to: "${content}". The AI Assistant is working!`,
          model: state.selectedModel,
        };
        
        set((s) => ({
          messages: [...s.messages, testResponse],
          isLoading: false,
        }));
      }, 1000);
      return;
    }

    try {
      const context = {
        dealName: state.dealContext.dealName,
        company: state.dealContext.company,
        value: state.dealContext.value,
        meetingNotes: state.dealContext.meetingNotes || [],
        currentSection,
      };

      const response = await aiService.generateContent(content, context, state.selectedModel);
      
      const assistantMessage: Message = {
        type: 'assistant',
        content: response.content,
        model: state.selectedModel,
      };

      set((s) => ({
        messages: [...s.messages, assistantMessage],
        isLoading: false,
      }));

      // Generate new suggestions based on context (optional - don't let this block the main response)
      try {
        const suggestions = await aiService.suggestNextActions(context, [
          { role: 'user', content },
          { role: 'assistant', content: response.content }
        ]);

        const actionSuggestions = suggestions.map(suggestion => ({
          text: suggestion,
          action: () => get().sendMessage(suggestion, currentSection)
        }));

        set({ suggestions: actionSuggestions });
      } catch (suggestionError) {
        console.log('Could not generate suggestions (likely rate limited):', suggestionError);
        // Don't show error for suggestions - just skip them
      }

    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message to chat instead of just setting error state
      const errorMessage: Message = {
        type: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Failed to send message'}`,
      };
      
      set((s) => ({
        messages: [...s.messages, errorMessage],
        isLoading: false,
        error: null // Clear error since we're showing it in chat
      }));
    }
  },

  analyzeMeetingNotes: async (meetingNotes: string[]) => {
    set({ isLoading: true, error: null });
    
    try {
      const context = {
        dealName: get().dealContext.dealName,
        company: get().dealContext.company,
        value: get().dealContext.value,
      };

      const analysis = await aiService.analyzeMeetingNotes(meetingNotes, context);
      
      set((state) => ({
        meetingAnalysis: analysis,
        isLoading: false,
        dealContext: {
          ...state.dealContext,
          meetingNotes,
        },
        messages: [
          ...state.messages,
          {
            type: 'assistant',
            content: `I've analyzed your meeting notes and found ${analysis.keyPoints.length} key points. Here are my recommendations for your SOW: ${analysis.suggestions.slice(0, 2).join(', ')}.`,
          }
        ]
      }));

      // Generate suggestions based on analysis
      const suggestions = [
        ...analysis.suggestions.slice(0, 3).map(suggestion => ({
          text: `Generate content: ${suggestion}`,
          action: () => get().sendMessage(`Generate content for: ${suggestion}`)
        })),
        {
          text: 'Create project estimate based on meeting insights',
          action: () => get().generateEstimate(analysis.keyPoints.join('; '))
        }
      ];

      set({ suggestions });

    } catch (error) {
      console.error('Error analyzing meeting notes:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to analyze meeting notes'
      });
    }
  },

  generateContent: async (sectionType: string, requirements?: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const context = {
        dealName: get().dealContext.dealName,
        company: get().dealContext.company,
        value: get().dealContext.value,
        meetingNotes: get().dealContext.meetingNotes || [],
        currentSection: sectionType,
      };

      const content = await aiService.generateSOWSection(sectionType, context, requirements);
      
      set((state) => ({
        isLoading: false,
        messages: [
          ...state.messages,
          {
            type: 'assistant',
            content: `I've generated content for the ${sectionType} section. Here it is:\n\n${content}`,
            model: state.selectedModel,
          }
        ]
      }));

      return content;
    } catch (error) {
      console.error('Error generating content:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to generate content'
      });
      throw error;
    }
  },

  generateEstimate: async (requirements: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const context = {
        dealName: get().dealContext.dealName,
        company: get().dealContext.company,
        value: get().dealContext.value,
        meetingNotes: get().dealContext.meetingNotes || [],
      };

      const estimate = await aiService.generateProjectEstimate(requirements, context);
      
      const estimateText = `
**Project Estimate:**

**Timeline:** ${estimate.timeline}
**Effort:** ${estimate.effort}

**Phase Breakdown:**
${estimate.breakdown.map(phase => `• ${phase.phase}: ${phase.duration} - ${phase.description}`).join('\n')}

**Key Assumptions:**
${estimate.assumptions.map(assumption => `• ${assumption}`).join('\n')}
      `;

      set((state) => ({
        isLoading: false,
        messages: [
          ...state.messages,
          {
            type: 'assistant',
            content: estimateText,
            model: state.selectedModel,
          }
        ]
      }));

    } catch (error) {
      console.error('Error generating estimate:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to generate estimate'
      });
    }
  },
  
  setSuggestions: (suggestions) => {
    set({ suggestions });
  },
  
  setSelectedModel: (modelId) => {
    set({ selectedModel: modelId });
  },
  
  setDealContext: (context) => {
    set({ dealContext: context });
    if (context.dealName) {
      set((state) => ({
        messages: [
          ...state.messages,
          {
            type: 'assistant',
            content: `I see you're creating a SOW for "${context.dealName}". I'll help you tailor the content based on the deal information. Would you like me to analyze any meeting notes or start generating specific sections?`,
          },
        ],
      }));
    }
  },

  setMeetingNotes: (notes) => {
    set((state) => ({
      dealContext: {
        ...state.dealContext,
        meetingNotes: notes,
      },
    }));
  },

  clearError: () => {
    set({ error: null });
  },
}));