import React from 'react';
import { Settings } from 'lucide-react';
import { useAIStore } from '../../store/aiStore';
import { AI_MODELS } from '../../data/aiModels';

export default function ModelSelector() {
  const { selectedModel, setSelectedModel } = useAIStore();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
      >
        <Settings className="w-4 h-4" />
        <span>AI Model: {AI_MODELS.find(m => m.id === selectedModel)?.name}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Select AI Model</h3>
            <div className="space-y-2">
              {AI_MODELS.map((model) => (
                <button
                  key={model.id}
                  className={`w-full flex flex-col items-start p-2 rounded-md text-left ${
                    selectedModel === model.id
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    setSelectedModel(model.id);
                    setIsOpen(false);
                  }}
                >
                  <span className="text-sm font-medium text-gray-900">{model.name}</span>
                  <span className="text-xs text-gray-500">{model.description}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}