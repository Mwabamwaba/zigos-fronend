import React from 'react';
import { Lightbulb } from 'lucide-react';

interface SuggestionsProps {
  suggestions: Array<{
    text: string;
    action: () => void;
  }>;
}

export default function Suggestions({ suggestions }: SuggestionsProps) {
  return (
    <div className="space-y-2">
      {suggestions.map((suggestion, index) => (
        <button
          key={index}
          className="w-full flex items-center space-x-2 p-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-md"
          onClick={suggestion.action}
        >
          <Lightbulb className="w-4 h-4 text-yellow-500" />
          <span>{suggestion.text}</span>
        </button>
      ))}
    </div>
  );
}