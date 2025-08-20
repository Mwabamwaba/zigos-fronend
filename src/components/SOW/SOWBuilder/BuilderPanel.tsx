import React from 'react';
import { Template } from '../../../types/sow';
import { Sparkles, Blocks, FileText } from 'lucide-react';
import SmartBuilder from './SmartBuilder';
import ComponentLibrary from './ComponentLibrary';
import AIAssistant from './AIAssistant';

interface BuilderPanelProps {
  activeTab: 'builder' | 'components' | 'assistant';
  setActiveTab: (tab: 'builder' | 'components' | 'assistant') => void;
  template: Template;
  onTemplateChange: (template: Template) => void;
}

export default function BuilderPanel({ 
  activeTab, 
  setActiveTab, 
  template, 
  onTemplateChange 
}: BuilderPanelProps) {
  const [activeSection, setActiveSection] = React.useState<number | null>(null);

  return (
    <div className="h-full flex flex-col">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white">
        <button
          onClick={() => setActiveTab('assistant')}
          className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium ${
            activeTab === 'assistant'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>AI Assistant</span>
        </button>
        <button
          onClick={() => setActiveTab('builder')}
          className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium ${
            activeTab === 'builder'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Smart Builder</span>
        </button>
        <button
          onClick={() => setActiveTab('components')}
          className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium ${
            activeTab === 'components'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Blocks className="w-4 h-4" />
          <span>Components</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'builder' && (
          <div className="p-6">
            <SmartBuilder 
              template={template} 
              onTemplateChange={onTemplateChange}
              onSectionFocus={setActiveSection}
            />
          </div>
        )}
        {activeTab === 'components' && (
          <div className="p-6">
            <ComponentLibrary template={template} onTemplateChange={onTemplateChange} />
          </div>
        )}
        {activeTab === 'assistant' && (
          <AIAssistant 
            template={template}
            activeSection={activeSection}
            onUpdateSection={(content) => {
              if (activeSection !== null) {
                const newSections = [...template.sections];
                newSections[activeSection] = { ...newSections[activeSection], content };
                onTemplateChange({ ...template, sections: newSections });
              }
            }}
          />
        )}
      </div>
    </div>
  );
}