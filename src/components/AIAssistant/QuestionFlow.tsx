import React from 'react';
import { useAIStore } from '../../store/aiStore';

export default function QuestionFlow() {
  const { activeStep, updateResponse } = useAIStore();

  if (!activeStep.question) return null;

  return (
    <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4">
      <h4 className="font-medium text-gray-900 mb-3">{activeStep.question}</h4>
      
      {activeStep.type === 'text' && (
        <textarea
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          rows={3}
          placeholder={activeStep.placeholder}
          onChange={(e) => updateResponse(activeStep.id, e.target.value)}
        />
      )}

      {activeStep.type === 'select' && (
        <select
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          onChange={(e) => updateResponse(activeStep.id, e.target.value)}
        >
          <option value="">Select an option...</option>
          {activeStep.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}

      {activeStep.type === 'multiselect' && (
        <div className="space-y-2">
          {activeStep.options?.map((option) => (
            <label key={option.value} className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                value={option.value}
                onChange={(e) => {
                  const value = e.target.checked ? option.value : '';
                  updateResponse(activeStep.id, value);
                }}
              />
              <span className="text-sm text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}