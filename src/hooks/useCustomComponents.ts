import { useState, useEffect } from 'react';
import { nanoid } from 'nanoid';

export interface CustomComponent {
  id: string;
  title: string;
  description: string;
  defaultContent: string;
  required: boolean;
  isCustom: true;
  createdAt: string;
}

export interface ComponentFormData {
  title: string;
  description: string;
  defaultContent: string;
  required: boolean;
}

const STORAGE_KEY = 'zigos-custom-components';

export function useCustomComponents() {
  const [customComponents, setCustomComponents] = useState<CustomComponent[]>([]);

  // Load custom components from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setCustomComponents(parsed);
      }
    } catch (error) {
      console.error('Error loading custom components:', error);
    }
  }, []);

  // Save custom components to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customComponents));
    } catch (error) {
      console.error('Error saving custom components:', error);
    }
  }, [customComponents]);

  const addComponent = (componentData: ComponentFormData): CustomComponent => {
    const newComponent: CustomComponent = {
      id: nanoid(),
      ...componentData,
      isCustom: true,
      createdAt: new Date().toISOString(),
    };

    setCustomComponents(prev => [...prev, newComponent]);
    return newComponent;
  };

  const updateComponent = (id: string, updates: Partial<ComponentFormData>): void => {
    setCustomComponents(prev =>
      prev.map(component =>
        component.id === id
          ? { ...component, ...updates }
          : component
      )
    );
  };

  const deleteComponent = (id: string): void => {
    setCustomComponents(prev => prev.filter(component => component.id !== id));
  };

  const getComponentById = (id: string): CustomComponent | undefined => {
    return customComponents.find(component => component.id === id);
  };

  // Check if a component title already exists (case-insensitive)
  const isComponentTitleTaken = (title: string, excludeId?: string): boolean => {
    return customComponents.some(
      component => 
        component.title.toLowerCase() === title.toLowerCase() && 
        component.id !== excludeId
    );
  };

  return {
    customComponents,
    addComponent,
    updateComponent,
    deleteComponent,
    getComponentById,
    isComponentTitleTaken,
  };
}