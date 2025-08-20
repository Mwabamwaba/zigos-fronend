import React from 'react';
import { Send, Loader2 } from 'lucide-react';
import { useAIStore } from '../../../store/aiStore';

interface AIInputProps {
  onContentGenerated?: (content: string) => void;
}

export default function AIInput({ onContentGenerated }: AIInputProps) {
  const { sendMessage, isLoading, error } = useAIStore();
  const [inputValue, setInputValue] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    try {
      await sendMessage(inputValue);
      setInputValue('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Quick suggestion buttons
  const quickSuggestions = [
    "Generate project timeline"
  ];

  return (
    <div className="space-y-3">
      {/* Quick Suggestions */}
      <div className="flex flex-wrap gap-2">
        {quickSuggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => setInputValue(suggestion)}
            className="px-3 py-1 text-xs bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 border border-blue-200"
            disabled={isLoading}
          >
            {suggestion}
          </button>
        ))}
      </div>

      {/* Main Input */}
      <form onSubmit={handleSubmit} className="flex items-center space-x-3">
        <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-xs">AI</span>
        </div>
        <div className="flex-1 relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask SOW Assistant anything about this project..."
            className="w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-3 pr-12 text-sm"
            disabled={isLoading}
          />
          <button 
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-700 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </form>

      {/* Error Display */}
      {error && (
        <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
          {error}
        </div>
      )}
    </div>
  );
}
