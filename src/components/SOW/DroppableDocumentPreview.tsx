import React, { useState } from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { PencilIcon, TrashIcon, Bars3Icon } from '@heroicons/react/24/outline';
import ContactInformation, { ContactInformationData } from './ContactInformation';
import { Template } from '../../types';

// Allow flexible template shape while ensuring we can render a title
interface TemplateLike {
  title?: string;
  name?: string;
  contactInformation?: ContactInformationData;
  [key: string]: unknown;
}

interface DroppableSection {
  id: string;
  title: string;
  content: string;
  required: boolean;
}

interface DroppableDocumentPreviewProps {
  template: TemplateLike | Template;
  sections: DroppableSection[];
  onSectionsChange: (sections: DroppableSection[]) => void;
  onContactInformationChange?: (contactInfo: ContactInformationData) => void;
}

interface EditableSectionProps {
  section: DroppableSection;
  index: number;
  onEdit: (id: string, content: string) => void;
  onDelete: (id: string) => void;
}

const EditableSection: React.FC<EditableSectionProps> = ({ section, index, onEdit, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(section.content);

  const handleSave = () => {
    onEdit(section.id, editContent);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditContent(section.content);
    setIsEditing(false);
  };

  return (
    <Draggable draggableId={section.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`
            space-y-4 mb-6 p-4 rounded-lg transition-all duration-200
            ${snapshot.isDragging ? 'shadow-lg bg-blue-50 border-2 border-blue-300' : 'hover:bg-gray-50'}
            ${section.required ? 'border-l-4 border-l-orange-400' : ''}
          `}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                {...provided.dragHandleProps}
                className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
              >
                <Bars3Icon className="w-4 h-4" />
              </div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-semibold text-gray-900">{section.title}</h2>
                {section.required && (
                  <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded">Required</span>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
              >
                <PencilIcon className="w-4 h-4" />
              </button>
              {!section.required && (
                <button
                  onClick={() => onDelete(section.id)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="prose prose-gray max-w-none">
            {isEditing ? (
              <div className="space-y-3">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full h-32 p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter section content..."
                />
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={handleCancel}
                    className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-3 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div 
                className="cursor-pointer hover:bg-gray-50 p-2 rounded"
                onClick={() => setIsEditing(true)}
              >
                {section.content || (
                  <span className="text-gray-400 italic">Click to add content...</span>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default function DroppableDocumentPreview({ 
  template, 
  sections, 
  onSectionsChange,
  onContactInformationChange 
}: DroppableDocumentPreviewProps) {
  const handleEdit = (id: string, content: string) => {
    const updatedSections = sections.map(section =>
      section.id === id ? { ...section, content } : section
    );
    onSectionsChange(updatedSections);
  };

  const handleDelete = (id: string) => {
    const updatedSections = sections.filter(section => section.id !== id);
    onSectionsChange(updatedSections);
  };

  // Default contact information
  const defaultContactInfo: ContactInformationData = {
    contractor: {
      companyName: 'The Zig Group, Inc',
      contact: 'Christopher Chileshe',
      title: 'CEO',
      address: '450 Alaskan Way South\nSuite 200 - #9887\nSeattle, Washington, USA\n98104',
      email: 'chris@thezig.io',
      phone: '206-822-3804'
    },
    client: {
      companyName: '',
      contact: '',
      title: '',
      address: '',
      email: '',
      phone: ''
    },
    summary: {
      services: 'Custom software engineering',
      effectiveDate: 'TBC',
      termination: 'Upon completion.'
    },
    scopeDescription: 'The scope of this SOW is limited to creating a fully functional solution with the features detailed further in the SOW. Any functionality listed beyond the scope of the work breakdown sheet is purely for documentation and completeness. This SOW will outline the phases involved in developing such a solution, capture high-level client requirements, and provide details necessary for the successful delivery of the solution.',
    introduction: {
      introduction: 'Company bio & project overview',
      background: 'Project information'
    },
    scopeOfServices: {
      service: '',
      planningApproach: 'To decrease project risk and offer the Client better control and influence over the ongoing work, The Zig proposes the below approach to developing this platform. This will help provide predictable and well-understood solutions that support the Client\'s objectives.',
      auditDescription: '',
      analyzeDescription: '',
      implementationDescription: '',
      validationDescription: '',
      feedbackNote: 'The Zig will encourage feedback throughout all stages of the engagement to minimize the risk of significant changes taking place at the end of the project.'
    },
    milestones: {
      description: 'The below milestones are an estimate of what the project will incorporate. Sections marked in red are yet to be scoped.',
      wbsNote: 'Insert WBS.'
    },
    architecture: {
      diagramNote: '',
      descriptionNote: '',
      costEstimateNote: 'This is an example',
      costItems: [
        { serviceCategory: 'Databases', serviceType: 'Azure Database for PostgreSQL', region: 'South Africa North', description: 'Single Server Deployment, General Purpose Tier, 1 Gen 5 (2 vCore), 1 year reserved', estimatedMonthlyCost: '$132.50' },
        { serviceCategory: 'Analytics', serviceType: 'Azure Data Factory', region: 'East US', description: 'Azure Data Factory V2 Type', estimatedMonthlyCost: '$26.00' },
        { serviceCategory: 'Developer tools', serviceType: 'Azure DevOps', region: '', description: '2 Basic Plan license users, 1 Free tier - Hosted Pipeline', estimatedMonthlyCost: '$0.00' },
        { serviceCategory: 'Mobile', serviceType: 'App Center', region: '', description: '1 Build concurrencies,', estimatedMonthlyCost: '$40.00' },
        { serviceCategory: 'Analytics', serviceType: 'PowerBI Power User', region: '', description: '1 PowerBI license for Developing Dashboards', estimatedMonthlyCost: '$20.00' }
      ]
    },
    activities: {
      executionNote: 'The project will accomplish the following items during execution:',
      stageDescription: 'Stage Estimate Description (This is an example)',
      discoveryItems: ['Requirements gathering.', 'Audit of current platform', 'Validation of technical implementation'],
      executeItems: ['Develop the functions and integration scripts', 'Developer Testing'],
      deployItems: ['User Acceptance Testing', 'Minor Bug Fixes', 'Prepare platform for public release and deploy'],
      breakdownNote: '* This breakdown assumes the project takes the minimum amount of time allocated in the SOW based on the milestones breakdown in section 3.',
      deliverables: {
        discovery: 'Gather details for each milestone by interviewing stakeholders.',
        implement: 'Onsite/Offsite completion of all user stories identified and source code where applicable.',
        validate: 'Build/Release pipelines, dashboards & alerting, and testing.'
      }
    },
    rolesAndResponsibilities: {
      projectManager: {
        responsibilities: ['Overall project plan', 'Maintains schedule and delivery', 'Manages dependencies and upstream requirements', 'Provides regular status reports to clients (weekly project status updates)', 'End of Sprint Demos', 'Helps collect feedback from stakeholders (including pilot users)']
      },
      softwareEngineers: {
        responsibilities: ['Front/Back-end Development', 'Integrations with 3rd -party systems', 'Testing']
      },
      designer: {
        responsibilities: ['UI/UX design', 'Digital assets', 'Maintaining a cohesive user experience for all users', 'Design Demos', 'Helps collect feedback from stakeholders']
      },
      clientProjectSponsor: {
        responsibilities: ['Point of contact for financials', 'Approves project engagement documents', 'Participates in key project meetings', 'Actively participates in project communication', 'Subject matter expert', 'Reviews project status reports', 'Actively participates in project communication', 'Reviews and approves project documents'],
        additionalResponsibilities: []
      },
      mutualResponsibilities: ['Communication', 'Involvement in all aspects of the services', 'Timely and effective completion of responsibilities, as identified in this document.', 'Timely decisions and approvals'],
      changes: 'The Zig may remove or cancel assigned staff, subject to 30 days written notice. If any staff resigns or is required to be terminated without the ability to give 30 days\' notice, The Zig will have a reasonable time to assign replacement staff. The client may request staff changes, which The Zig will use its reasonable efforts to accommodate',
      additionalStaff: 'If the Services expand and The Zig or Client determines additional staffing is reasonably needed, additional staff may be assigned, and the Fees adjusted according per confirmed writing agreed upon by The Zig and Client.'
    }
  };

  return (
    <div className="p-8 max-w-[816px] mx-auto bg-white min-h-full shadow-sm">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center border-b pb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{(template as any).title ?? (template as any).name ?? 'Untitled SOW'}</h1>
          <p className="text-gray-500">Statement of Work</p>
        </div>

        {/* Contact Information */}
        <ContactInformation
          data={template.contactInformation || defaultContactInfo}
          onUpdate={(contactInfo) => {
            if (onContactInformationChange) {
              onContactInformationChange(contactInfo);
            }
          }}
        />
        
        {/* Droppable Content Area */}
        <Droppable droppableId="document-sections">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`
                min-h-[400px] transition-colors duration-200 rounded-lg overflow-auto
                ${snapshot.isDraggingOver ? 'bg-blue-50 border-2 border-dashed border-blue-300' : ''}
                group
              `}
            >
              {sections.length === 0 ? (
                <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="text-center">
                    <div className="text-gray-400 mb-2">
                      <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-600">Drop SOW components here</p>
                    <p className="text-sm text-gray-400 mt-1">Drag components from the Builder tab to start building your SOW</p>
                  </div>
                </div>
              ) : (
                sections.map((section, index) => (
                  <EditableSection
                    key={section.id}
                    section={section}
                    index={index}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    </div>
  );
}