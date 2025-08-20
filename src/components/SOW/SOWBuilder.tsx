import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import { nanoid } from 'nanoid';
import { useSOWStore } from '../../store/sowStore';
import { useAIStore } from '../../store/aiStore';
import DroppableDocumentPreview from './DroppableDocumentPreview';
import ComponentLibrary from './SOWBuilder/ComponentLibrary';
import SOWHeader from './SOWHeader';
import { useAutoSave } from '../../hooks/useAutoSave';
import { defaultTemplate } from '../../data/templates';
import { components } from '../../data/sowComponents';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { ContactInformationData } from './ContactInformation';
import MeetingNotesTab from './SOWBuilder/MeetingNotesTab';
import AIInput from './SOWBuilder/AIInput';
import WorkBreakdownDisplay from './WorkBreakdownDisplay';
import NotificationContainer from '../ui/NotificationContainer';
import { useNotification } from '../../hooks/useNotification';

interface SOWSection {
  id: string;
  title: string;
  content: string;
  required: boolean;
}

export default function SOWBuilder() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { documents } = useSOWStore();
  const { messages, sendMessage, isLoading } = useAIStore();
  const { notifications, showNotification, hideNotification } = useNotification();
  
  // Resizable panels state
  const [leftWidth, setLeftWidth] = React.useState(50); // percentage
  const [isDragging, setIsDragging] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Tab navigation state
  const [activeTab, setActiveTab] = React.useState('meeting-notes');

  // Function to switch tabs (for WBS generation)
  const switchToTab = React.useCallback((tab: string) => {
    setActiveTab(tab);
  }, []);

  
  // Early return if no ID
  if (!id) {
    navigate('/sow');
    return null;
  }

  // Find the SOW document
  const sowDocument = documents.find(d => d.id === id);
  
  // If SOW not found, show loading or redirect
  if (!sowDocument) {
    return (
      <div className="h-full bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-600 leading-relaxed">Loading SOW...</p>
        </div>
      </div>
    );
  }

  // Only try to get project if we have a SOW that might be linked to a project
  // For now, we'll comment this out since SOWs are created before projects
  // const { project } = useProject(sowDocument.projectId); // This would be the correct approach if SOW had projectId

  const [template, setTemplate] = React.useState(() => {
    return sowDocument.content || defaultTemplate;
  });

  // Initialize sections from template if they exist
  const [sections, setSections] = React.useState<SOWSection[]>(() => {
    if (sowDocument.content?.sections) {
      return sowDocument.content.sections.map((section: any, index: number) => ({
        id: `section-${index}`,
        title: section.title,
        content: section.content || '',
        required: section.required || false,
      }));
    }
    return [];
  });

  // Selected meeting state for cross-tab context
  const [selectedMeeting, setSelectedMeeting] = React.useState<any>(null);

  // Auto-save functionality
  useAutoSave(template, id);

  // Update template when sections change
  const handleSectionsChange = React.useCallback((newSections: SOWSection[]) => {
    setSections(newSections);
    const updatedSections = newSections.map(section => ({
      title: section.title,
      required: section.required,
      allowedComponents: [],
      validationRules: [],
      content: section.content,
    }));
    setTemplate({ ...(template as any), sections: updatedSections } as any);
  }, [template]);

  // Handle contact information changes
  const handleContactInformationChange = React.useCallback((contactInfo: ContactInformationData) => {
    setTemplate({ ...(template as any), contactInformation: contactInfo } as any);
  }, [template]);

  // Handle resizable divider
  const handleMouseDown = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleMouseMove = React.useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
    
    // Constrain width between 20% and 80%
    const constrainedWidth = Math.min(Math.max(newLeftWidth, 20), 80);
    setLeftWidth(constrainedWidth);
  }, [isDragging]);

  const handleMouseUp = React.useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add/remove global mouse event listeners
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Pre-fill contact info from navigation state (HubSpot selection)
  React.useEffect(() => {
    const state: any = (location as any).state;
    if (!state) return;
    const { company, contact } = state as { company?: string; contact?: { firstName?: string; lastName?: string; jobTitle?: string; email?: string; phone?: string; address?: string; website?: string } };
    if (company || contact) {
      const current = template.contactInformation || {
        contractor: { companyName: 'ZigOS', contact: 'The Zig', title: 'CEO', address: '', email: 'zig@zigos.com', phone: '206-822-3804' },
        client: { companyName: '', contact: '', title: '', address: '', email: '', phone: '' }
      };
      const fullName = [contact?.firstName, contact?.lastName].filter(Boolean).join(' ').trim();
      const updated: ContactInformationData = {
        ...current,
        client: {
          companyName: company || current.client.companyName,
          contact: fullName || current.client.contact,
          title: contact?.jobTitle || current.client.title,
          address: contact?.address || current.client.address,
          email: contact?.email || current.client.email,
          phone: contact?.phone || current.client.phone,
        }
      };
      setTemplate({ ...template, contactInformation: updated });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location?.state]);

  // Handle drag and drop
  const onDragEnd = React.useCallback((result: DropResult) => {
    const { destination, source, draggableId } = result;

    // If dropped outside a valid drop area
    if (!destination) {
      return;
    }

    // If dropped in the same place
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Handle dropping from component library to document sections
    if (
      source.droppableId === 'component-library' &&
      destination.droppableId === 'document-sections'
    ) {
      // Support default components by title and custom components by id
      if (draggableId.startsWith('component-')) {
        const componentTitle = draggableId.replace('component-', '');
        const component = components.find(c => c.title === componentTitle);
        if (component) {
          const newSection: SOWSection = {
            id: nanoid(),
            title: component.title,
            content: component.defaultContent,
            required: component.required,
          };
          const newSections = [...sections];
          newSections.splice(destination.index, 0, newSection);
          handleSectionsChange(newSections);
        }
      } else if (draggableId.startsWith('custom-')) {
        // custom-<id> carries the data via dataset would require context; re-hydrate via localStorage
        try {
          const raw = localStorage.getItem('zigos-custom-components');
          if (raw) {
            const list = JSON.parse(raw) as Array<{ id: string; title: string; description: string; defaultContent: string; required: boolean }>;
            const custom = list.find((c) => `custom-${c.id}` === draggableId);
            if (custom) {
              const newSection: SOWSection = {
                id: nanoid(),
                title: custom.title,
                content: custom.defaultContent,
                required: custom.required,
              };
              const newSections = [...sections];
              newSections.splice(destination.index, 0, newSection);
              handleSectionsChange(newSections);
            }
          }
        } catch {
          // ignore
        }
      }
      return;
    }

    // Handle reordering within document sections
    if (
      source.droppableId === 'document-sections' &&
      destination.droppableId === 'document-sections'
    ) {
      const newSections = Array.from(sections);
      const [reorderedSection] = newSections.splice(source.index, 1);
      newSections.splice(destination.index, 0, reorderedSection);
      handleSectionsChange(newSections);
      return;
    }
  }, [sections, handleSectionsChange]);

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="h-full flex flex-col bg-gray-50">
        <SOWHeader sowId={id} template={template} />
        
        <div ref={containerRef} className="flex-1 flex overflow-hidden relative gap-4 p-4">
          <div 
            className="bg-white rounded-2xl shadow-sm overflow-auto"
            style={{ width: `${leftWidth}%` }}
          >
            <DroppableDocumentPreview 
              template={template} 
              sections={sections}
              onSectionsChange={handleSectionsChange}
              onContactInformationChange={handleContactInformationChange}
            />
          </div>
          
          {/* Resizable Divider */}
          <div 
            className={`
              w-1 bg-gray-200 hover:bg-blue-600 cursor-col-resize 
              relative flex items-center justify-center
              transition-colors duration-150 rounded-lg
              ${isDragging ? 'bg-blue-600' : ''}
            `}
            onMouseDown={handleMouseDown}
          >
            <div className="absolute w-3 h-12 bg-gray-300 hover:bg-blue-600 rounded-full flex items-center justify-center transition">
              <div className="w-0.5 h-6 bg-white"></div>
            </div>
          </div>
          
          <div 
            className="bg-white rounded-2xl shadow-sm overflow-auto flex flex-col min-h-0"
            style={{ width: `${100 - leftWidth}%` }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col min-h-0">
              <TabsList className="border-b border-gray-200 px-4 flex-shrink-0">
                <TabsTrigger value="meeting-notes">Meeting Notes</TabsTrigger>
                <TabsTrigger value="wbs">Work Breakdown</TabsTrigger>
                <TabsTrigger value="assistant">Assistant</TabsTrigger>
                <TabsTrigger value="builder">Builder</TabsTrigger>
              </TabsList>

              <TabsContent value="meeting-notes" className="flex-1 overflow-auto">
                <MeetingNotesTab 
                  onMeetingSelect={setSelectedMeeting}
                  showNotification={showNotification}
                  switchToTab={switchToTab}
                />
              </TabsContent>

              <TabsContent value="wbs" className="flex-1 overflow-hidden">
                <WorkBreakdownDisplay />
              </TabsContent>

              <TabsContent value="assistant" className="flex-1 overflow-auto">
                <div className="p-6 h-full flex flex-col">
                  {/* Header */}
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">AI</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">SOW Assistant</h3>
                  </div>

                  {/* Meeting Context */}
                  {selectedMeeting ? (
                    <div className="bg-blue-50 rounded-2xl p-4 mb-6 border border-blue-200">
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium text-blue-700">Context from selected meeting</span>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-blue-200">
                        <h4 className="text-sm font-semibold text-gray-900 mb-1">{selectedMeeting.title}</h4>
                        <div className="flex items-center space-x-4 text-xs text-gray-600 mb-2">
                          <span>{new Date(selectedMeeting.date).toLocaleDateString()}</span>
                          <span>{selectedMeeting.duration}</span>
                          <span>{selectedMeeting.participants?.length || 0} participants</span>
                        </div>
                        {selectedMeeting.summary && (
                          <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
                            {selectedMeeting.summary}
                          </p>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed mt-3">
                        I can analyze the selected meeting content and help you create relevant SOW sections, suggest scope items, and generate work breakdown structures based on the discussion.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-2xl p-4 mb-6 border border-gray-200">
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-700">Ready to assist with SOW creation</span>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        I can help you streamline your Statement of Work creation process using meeting insights, suggest content, and automate repetitive tasks. Select a meeting from the Meeting Notes tab to get context-specific suggestions.
                      </p>
                    </div>
                  )}

                  {/* Chat Messages Area */}
                  <div className="flex-1 overflow-auto mb-4 bg-gray-50 p-4 rounded-xl">
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                        {/* Chat Messages */}
                        {messages.length === 0 ? (
                          <div className="text-center py-8">
                            <div className="text-gray-500 text-sm mb-4">Start a conversation with your SOW Assistant</div>
                            <p className="text-xs text-gray-400">Ask questions about your project or use the quick actions below</p>
                          </div>
                        ) : (
                          messages.map((message, index) => (
                            <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-sm px-4 py-2 rounded-lg ${
                                message.type === 'user' 
                                  ? 'bg-blue-500 text-white rounded-br-none' 
                                  : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'
                              }`}>
                                <div className="text-sm whitespace-pre-wrap break-words">
                                  {message.content}
                                </div>
                                {message.model && message.type === 'assistant' && (
                                  <div className="flex items-center mt-2 pt-2 border-t border-gray-100">
                                    <span className="text-xs text-gray-500">AI Assistant</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                        
                        {isLoading && (
                          <div className="flex justify-start">
                            <div className="bg-white border border-gray-200 rounded-lg rounded-bl-none shadow-sm px-4 py-2">
                              <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-sm text-gray-600">AI is thinking...</span>
                              </div>
                            </div>
                          </div>
                        )}
                    </div>
                  </div>

                  {/* Input Area */}
                  <div className="border-t border-gray-200 pt-4">
                    <AIInput />
                    <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                      <span>Powered by AI • Always review suggestions</span>
                      <button className="text-blue-600 hover:text-blue-700">
                        Help
                      </button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="builder" className="flex-1 overflow-auto min-h-0">
                <Droppable droppableId="component-library" isDropDisabled={true}>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className="h-full">
                      <ComponentLibrary />
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </TabsContent>
          </Tabs>
          </div>
        </div>
      </div>
      
      {/* Notifications */}
      <NotificationContainer 
        notifications={notifications} 
        onDismiss={hideNotification} 
      />
    </DragDropContext>
  );
}