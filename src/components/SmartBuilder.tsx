import React from 'react';
import { Template } from '../types';
import { Trash2, GripVertical } from 'lucide-react';

interface SmartBuilderProps {
  template: Template;
  onTemplateChange: (template: Template) => void;
  onSectionFocus: (index: number | null) => void;
}

export default function SmartBuilder({ template, onTemplateChange, onSectionFocus }: SmartBuilderProps) {
  const handleRemoveSection = (index: number) => {
    if (template.sections[index].required) return;
    
    const newSections = template.sections.filter((_, i) => i !== index);
    onTemplateChange({ ...template, sections: newSections });
    onSectionFocus(null);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Document Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Document Title</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={template.title}
              onChange={(e) => onTemplateChange({ ...template, title: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Sections</h3>
        {template.sections.map((section, index) => (
          <div 
            key={index} 
            className={`p-4 bg-white rounded-lg border ${
              section.required ? 'border-gray-200' : 'border-dashed border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <button className="text-gray-400 hover:text-gray-500 cursor-grab">
                  <GripVertical className="w-5 h-5" />
                </button>
                <h4 className="font-medium text-gray-900">{section.title}</h4>
                {section.required && (
                  <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded">
                    Required
                  </span>
                )}
              </div>
              {!section.required && (
                <button 
                  onClick={() => handleRemoveSection(index)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
            <textarea
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={4}
              value={section.content}
              onChange={(e) => {
                const newSections = [...template.sections];
                newSections[index] = { ...section, content: e.target.value };
                onTemplateChange({ ...template, sections: newSections });
              }}
              onFocus={() => onSectionFocus(index)}
              onBlur={() => onSectionFocus(null)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}