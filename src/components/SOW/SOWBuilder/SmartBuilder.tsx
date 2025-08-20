import React from 'react';
import { Template } from '../../../types/sow';
import { Trash2, GripVertical } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

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

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const sections = Array.from(template.sections);
    const [reorderedSection] = sections.splice(result.source.index, 1);
    sections.splice(result.destination.index, 0, reorderedSection);

    onTemplateChange({ ...template, sections });
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
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="sections">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {template.sections.map((section, index) => (
                  <Draggable key={index} draggableId={`section-${index}`} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`p-4 bg-white rounded-lg border mb-4 ${
                          section.required ? 'border-gray-200' : 'border-dashed border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div {...provided.dragHandleProps}>
                              <GripVertical className="w-5 h-5 text-gray-400 cursor-grab" />
                            </div>
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
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
}