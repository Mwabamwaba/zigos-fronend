import { AIModel } from '../types';

export const AI_MODELS: AIModel[] = [
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    description: 'Fast and cost-effective model for SOW generation',
    isDefault: true,
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    description: 'Most capable model for complex SOW analysis and generation',
  },
  {
    id: 'gpt-4',
    name: 'GPT-4',
    description: 'Powerful model for detailed and nuanced content',
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    description: 'Fast and efficient for standard documents',
  },
];