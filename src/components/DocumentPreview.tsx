import React from 'react';
import { Template } from '../types';

interface DocumentPreviewProps {
  template: Template;
}

export default function DocumentPreview({ template }: DocumentPreviewProps) {
  return (
    <div className="p-8 max-w-[816px] mx-auto bg-white min-h-full shadow-sm">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center border-b pb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{template.title}</h1>
          <p className="text-gray-500">Statement of Work</p>
        </div>
        
        {/* Content */}
        {template.sections.map((section, index) => (
          <div key={index} className="space-y-4">
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-semibold text-gray-900">{section.title}</h2>
              {section.required && (
                <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded">Required</span>
              )}
            </div>
            <div className="prose prose-gray max-w-none">
              {section.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}