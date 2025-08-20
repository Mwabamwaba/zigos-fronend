import React from 'react';
import { Sparkles, AlertCircle, Send, Loader2, FileText, BarChart3 } from 'lucide-react';
import { useAIStore } from '../../store/aiStore';
import { Template } from '../../types';
import ModelSelector from './ModelSelector';
import { AI_MODELS } from '../../data/aiModels';
import { useLocation } from 'react-router-dom';

interface AssistantPanelProps {
  template: Template;
  activeSection: number | null;
  onUpdateSection: (content: string) => void;
}

export default function AssistantPanel({ template, activeSection, onUpdateSection }: AssistantPanelProps) {
  const { 
    messages, 
    sendMessage, 
    setDealContext, 
    isLoading, 
    error, 
    clearError,
    analyzeMeetingNotes,
    generateContent,
    dealContext
  } = useAIStore();
  
  const [contextMessage, setContextMessage] = React.useState<string>('');
  const [inputMessage, setInputMessage] = React.useState<string>('');
  const location = useLocation();
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Debug: Log what the component is receiving from the store
  React.useEffect(() => {
    console.log('AssistantPanel re-rendered');
    console.log('Messages count:', messages.length);
    console.log('Loading state:', isLoading);
  }, [messages, isLoading]);

  React.useEffect(() => {
    const state = location.state as any;
    if (state?.dealId) {
      setDealContext({
        dealId: state.dealId,
        dealName: state.dealName,
        company: state.company,
        value: state.value,
      });
    }
  }, [location.state]);

  React.useEffect(() => {
    if (activeSection !== null) {
      const section = template.sections[activeSection];
      setContextMessage(`Now editing: ${section.title} section`);
    } else {
      setContextMessage('');
    }
  }, [activeSection]);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;
    
    const currentSection = activeSection !== null ? template.sections[activeSection]?.title : undefined;
    await sendMessage(inputMessage, currentSection);
    setInputMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAnalyzeMeetings = async () => {
    // For demo purposes, we'll use mock meeting notes
    // In production, this would come from the actual meeting notes
    const mockMeetingNotes = [
      "Client discussed need for e-commerce platform with payment integration",
      "Requirements: React frontend, Node.js backend, PostgreSQL database",
      "Timeline: 3-4 months, Budget: $50,000-$75,000",
      "Key features: user authentication, product catalog, shopping cart, order management"
    ];
    
    await analyzeMeetingNotes(mockMeetingNotes);
  };

  const handleGenerateSection = async () => {
    if (activeSection === null) return;
    
    try {
      const section = template.sections[activeSection];
      const content = await generateContent(section.title);
      onUpdateSection(content);
    } catch (error) {
      console.error('Failed to generate content:', error);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">AI Assistant</h2>
          <ModelSelector />
        </div>
        {contextMessage && (
          <p className="mt-2 text-sm text-blue-600">{contextMessage}</p>
        )}
        
        {/* Error Display */}
        {error && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
            <button
              onClick={clearError}
              className="text-red-600 hover:text-red-700 text-sm"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleAnalyzeMeetings}
            disabled={isLoading}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Analyze Meeting Notes</span>
          </button>
          
          {activeSection !== null && (
            <button
              onClick={handleGenerateSection}
              disabled={isLoading}
              className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              <FileText className="w-4 h-4" />
              <span>Generate {template.sections[activeSection]?.title}</span>
            </button>
          )}
        </div>
      </div>

      {/* Compact Meeting Context */}
      <div className="p-3 bg-blue-50 border-b border-blue-200">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-blue-900 text-sm">Context from selected meeting</h4>
          <span className="text-xs text-blue-600">AEL Team Weekly Meeting</span>
        </div>
        <div className="text-xs text-blue-800 bg-white p-2 rounded border max-h-20 overflow-y-auto">
          - Louisa missed last weekend's meeting due to an appointment but remains engaged with team updates while on sick leave. 
          - Alick successfully confirmed files via email during his first weekend duty, reporting no major concerns from Lewis. 
          - Alick has yet to update the project tracker but is working on the landing page setup and endpoint verification...
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">

        {/* Chat Messages */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 text-sm py-8">
              Start a conversation with the AI Assistant
              <br/>
              <span className="text-xs">Try: "Summarize the key points from this meeting"</span>
            </div>
          )}
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.type === 'user' 
                  ? 'bg-blue-500 text-white rounded-br-none' 
                  : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'
              }`}>
                <div className="text-sm whitespace-pre-wrap break-words">
                  {message.content}
                </div>
                {message.model && message.type === 'assistant' && (
                  <div className="flex items-center mt-2 pt-2 border-t border-gray-100">
                    <Sparkles className="w-3 h-3 text-gray-400 mr-1" />
                    <span className="text-xs text-gray-500">
                      {AI_MODELS.find(m => m.id === message.model)?.name}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-lg rounded-bl-none shadow-sm px-4 py-2">
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                  <span className="text-sm text-gray-600">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="px-4 py-3 bg-white border-t border-gray-100">
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => sendMessage("Summarize the key points from this meeting")}
            disabled={isLoading}
            className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs rounded-full border border-blue-200 disabled:opacity-50"
          >
            Summarize meeting
          </button>
          <button 
            onClick={() => sendMessage("Generate project timeline based on the discussion")}
            disabled={isLoading}
            className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs rounded-full border border-blue-200 disabled:opacity-50"
          >
            Generate timeline
          </button>
          <button 
            onClick={() => sendMessage("Create technical requirements based on this meeting")}
            disabled={isLoading}
            className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs rounded-full border border-blue-200 disabled:opacity-50"
          >
            Technical requirements
          </button>
          <button 
            onClick={() => sendMessage("Estimate project cost based on the scope discussed")}
            disabled={isLoading}
            className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs rounded-full border border-blue-200 disabled:opacity-50"
          >
            Estimate cost
          </button>
          <button 
            onClick={() => sendMessage("Identify potential risks mentioned in the meeting")}
            disabled={isLoading}
            className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs rounded-full border border-blue-200 disabled:opacity-50"
          >
            Identify risks
          </button>
        </div>
      </div>

      {/* Chat Input */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about this meeting or project..."
              className="w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-3 text-sm resize-none"
              rows={2}
              disabled={isLoading}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        
        <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
          <span>
            Press Enter to send, Shift+Enter for new line
            {dealContext.dealName && ` • Working on ${dealContext.dealName}`}
          </span>
          <span>Powered by AI • Always review suggestions</span>
        </div>
      </div>
    </div>
  );
}