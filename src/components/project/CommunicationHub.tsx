import React from 'react';
import { Project } from '../../types/project';
import { useProjectStore } from '../../store/projectStore';
import { Send, Paperclip, FileText } from 'lucide-react';
import { format } from 'date-fns';

interface CommunicationHubProps {
  project: Project;
}

export default function CommunicationHub({ project }: CommunicationHubProps) {
  const { addCommunication } = useProjectStore();
  const [message, setMessage] = React.useState('');
  const [attachments, setAttachments] = React.useState<string[]>([]);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [project.communications]);

  const handleSend = () => {
    if (!message.trim()) return;
    addCommunication(project.id, message, 'current-user-id', attachments);
    setMessage('');
    setAttachments([]);
  };

  return (
    <div className="bg-white rounded-lg shadow flex flex-col h-[600px]">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Team Communication</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {project.communications.map((comm) => (
            <div key={comm.id} className="flex flex-col space-y-1">
              <div className="flex items-start space-x-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600">
                    {comm.sender.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="bg-gray-100 rounded-lg p-3">
                    <p className="text-sm text-gray-900">{comm.message}</p>
                    {comm.attachments && comm.attachments.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {comm.attachments.map((attachment, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700"
                          >
                            <FileText className="w-4 h-4" />
                            <span>{attachment}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 mt-1">
                    {format(new Date(comm.timestamp), 'MMM d, h:mm a')}
                  </span>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="p-4 border-t border-gray-200">
        {attachments.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {attachments.map((file, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 bg-gray-100 px-2 py-1 rounded text-sm"
              >
                <FileText className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700">{file}</span>
                <button
                  onClick={() => setAttachments(attachments.filter((_, i) => i !== index))}
                  className="text-gray-400 hover:text-gray-500"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <textarea
              className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              rows={2}
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
          </div>
          <div className="flex items-center space-x-2">
            <button
              className="p-2 text-gray-400 hover:text-gray-500"
              onClick={() => {
                // Simulated file upload
                setAttachments([...attachments, 'New Document.pdf']);
              }}
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <button
              onClick={handleSend}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}