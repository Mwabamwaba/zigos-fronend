import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { Plus } from 'lucide-react';
import { components } from '../../../data/sowComponents';
import AddComponentModal from './AddComponentModal';
import { useCustomComponents } from '../../../hooks/useCustomComponents';

interface DraggableComponentProps {
  component: {
    title: string;
    description: string;
    defaultContent: string;
    required: boolean;
  };
  index: number;
}

const DraggableComponent: React.FC<DraggableComponentProps> = ({ component, index }) => {
  return (
    <Draggable draggableId={`component-${component.title}`} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`
            p-4 mb-3 bg-white border-2 border-gray-200 rounded-lg cursor-grab active:cursor-grabbing
            hover:border-blue-300 hover:shadow-md transition-all duration-200
            ${snapshot.isDragging ? 'shadow-lg border-blue-400 rotate-2' : ''}
            ${component.required ? 'border-l-4 border-l-orange-400' : ''}
          `}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 mb-1">
                {component.title}
                {component.required && (
                  <span className="ml-2 text-xs text-orange-600 font-normal">Required</span>
                )}
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                {component.description}
              </p>
            </div>
            <div className="ml-3 text-gray-400">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path>
              </svg>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default function ComponentLibrary() {
  const { customComponents, addComponent } = useCustomComponents();
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">SOW Components</h3>
          <p className="text-sm text-gray-600">Drag components from here to build your Statement of Work</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center space-x-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          <span>New</span>
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Default</h4>
          <div className="space-y-2">
            {components.map((component, index) => (
              <DraggableComponent
                key={component.title}
                component={component}
                index={index}
              />
            ))}
          </div>
        </div>

        <div className="mt-6">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Custom</h4>
          {customComponents.length === 0 ? (
            <div className="text-sm text-gray-500 border border-dashed rounded p-3">No custom components yet. Click New to create one.</div>
          ) : (
            <div className="space-y-2">
              {customComponents.map((component, index) => (
                <Draggable key={component.id} draggableId={`custom-${component.id}`} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`p-4 mb-3 bg-white border-2 border-gray-200 rounded-lg cursor-grab active:cursor-grabbing hover:border-blue-300 hover:shadow-md transition-all duration-200 ${snapshot.isDragging ? 'shadow-lg border-blue-400 rotate-2' : ''} ${component.required ? 'border-l-4 border-l-orange-400' : ''}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">
                            {component.title}
                            {component.required && (
                              <span className="ml-2 text-xs text-orange-600 font-normal">Required</span>
                            )}
                          </h4>
                          <p className="text-sm text-gray-600 leading-relaxed">{component.description}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">How to use:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Drag components to the right panel</li>
            <li>• Click on dropped components to edit</li>
            <li>• Reorder sections by dragging</li>
            <li>• Required components are marked in orange</li>
          </ul>
        </div>
      </div>

      <AddComponentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={(data) => {
          addComponent(data);
          setIsModalOpen(false);
        }}
      />
    </div>
  );
}