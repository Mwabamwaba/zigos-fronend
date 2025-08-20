import React from 'react';
import { Template } from '../types';

interface ComponentLibraryProps {
  template: Template;
  onTemplateChange: (template: Template) => void;
}

export default function ComponentLibrary({ template, onTemplateChange }: ComponentLibraryProps) {
  const components = [
    { title: 'Project Scope', content: 'Define the scope of your project...', required: true },
    { title: 'Timeline', content: 'Specify project timeline and milestones...', required: false },
    { title: 'Deliverables', content: 'List all project deliverables...', required: true },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {components.map((component, index) => (
          <div
            key={index}
            className="p-4 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-blue-500 hover:shadow-sm"
            onClick={() => {
              onTemplateChange({
                ...template,
                sections: [...template.sections, component],
              });
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">{component.title}</h4>
              {component.required && (
                <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded">
                  Required
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 line-clamp-2">{component.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}