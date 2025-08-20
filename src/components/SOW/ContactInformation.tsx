import React from 'react';

export interface ContactInfo {
  companyName: string;
  contact: string;
  title: string;
  address: string;
  email: string;
  phone: string;
}

export interface ContactInformationData {
  contractor: ContactInfo;
  client: ContactInfo;
  summary?: {
    services: string;
    effectiveDate: string;
    termination: string;
  };
  scopeDescription?: string;
  introduction?: {
    introduction: string;
    background: string;
  };
  scopeOfServices?: {
    service: string;
    planningApproach: string;
    auditDescription: string;
    analyzeDescription: string;
    implementationDescription: string;
    validationDescription: string;
    feedbackNote: string;
  };
  milestones?: {
    description: string;
    wbsNote: string;
  };
  architecture?: {
    diagramNote: string;
    descriptionNote: string;
    costEstimateNote: string;
    costItems: Array<{
      serviceCategory: string;
      serviceType: string;
      region: string;
      description: string;
      estimatedMonthlyCost: string;
    }>;
  };
  activities?: {
    executionNote: string;
    stageDescription: string;
    discoveryItems: string[];
    executeItems: string[];
    deployItems: string[];
    breakdownNote: string;
    deliverables: {
      discovery: string;
      implement: string;
      validate: string;
    };
  };
  rolesAndResponsibilities?: {
    projectManager: {
      responsibilities: string[];
    };
    softwareEngineers: {
      responsibilities: string[];
    };
    designer: {
      responsibilities: string[];
    };
    clientProjectSponsor: {
      responsibilities: string[];
      additionalResponsibilities: string[];
    };
    mutualResponsibilities: string[];
    changes: string;
    additionalStaff: string;
  };
}

interface ContactInformationProps {
  data: ContactInformationData;
  onUpdate: (data: ContactInformationData) => void;
  readonly?: boolean;
}

const ContactInformation: React.FC<ContactInformationProps> = ({ 
  data, 
  onUpdate, 
  readonly = false 
}) => {
  const updateContractor = (field: keyof ContactInfo, value: string) => {
    if (readonly) return;
    onUpdate({
      ...data,
      contractor: {
        ...data.contractor,
        [field]: value
      }
    });
  };

  const updateClient = (field: keyof ContactInfo, value: string) => {
    if (readonly) return;
    onUpdate({
      ...data,
      client: {
        ...data.client,
        [field]: value
      }
    });
  };

  const updateSummary = (field: string, value: string) => {
    if (readonly) return;
    onUpdate({
      ...data,
      summary: {
        ...data.summary,
        [field]: value
      } as any
    });
  };

  const updateScopeDescription = (value: string) => {
    if (readonly) return;
    onUpdate({
      ...data,
      scopeDescription: value
    });
  };

  const updateIntroduction = (field: string, value: string) => {
    if (readonly) return;
    onUpdate({
      ...data,
      introduction: {
        ...data.introduction,
        [field]: value
      } as any
    });
  };

  const updateScopeOfServices = (field: string, value: string) => {
    if (readonly) return;
    onUpdate({
      ...data,
      scopeOfServices: {
        ...data.scopeOfServices,
        [field]: value
      } as any
    });
  };

  const updateMilestones = (field: string, value: string) => {
    if (readonly) return;
    onUpdate({
      ...data,
      milestones: {
        ...data.milestones,
        [field]: value
      } as any
    });
  };

  const updateArchitecture = (field: string, value: any) => {
    if (readonly) return;
    onUpdate({
      ...data,
      architecture: {
        ...data.architecture,
        [field]: value
      } as any
    });
  };

  const updateActivities = (field: string, value: any) => {
    if (readonly) return;
    onUpdate({
      ...data,
      activities: {
        ...data.activities,
        [field]: value
      } as any
    });
  };

  const updateRoles = (field: string, value: any) => {
    if (readonly) return;
    onUpdate({
      ...data,
      rolesAndResponsibilities: {
        ...data.rolesAndResponsibilities,
        [field]: value
      } as any
    });
  };

  const updateDeliverables = (field: string, value: string) => {
    if (readonly) return;
    onUpdate({
      ...data,
      deliverables: {
        ...data.deliverables,
        [field]: value
      } as any
    });
  };

  const updateRiskAssessment = (field: string, value: any) => {
    if (readonly) return;
    onUpdate({
      ...data,
      riskAssessment: {
        ...data.riskAssessment,
        [field]: value
      } as any
    });
  };

  const updateMasterServices = (field: string, value: string) => {
    if (readonly) return;
    onUpdate({
      ...data,
      masterServicesAgreement: {
        ...data.masterServicesAgreement,
        [field]: value
      } as any
    });
  };

  const updateAuthorization = (field: string, value: string) => {
    if (readonly) return;
    onUpdate({
      ...data,
      authorization: {
        ...data.authorization,
        [field]: value
      } as any
    });
  };



  return (
    <div className="bg-white border border-gray-300 mb-6">
      {/* Header */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-300">
        <h2 className="text-lg font-bold text-gray-900">1. CONTACT INFORMATION</h2>
      </div>

      {/* Contact Information Table */}
      <div className="overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="w-1/2 bg-gray-100 border border-gray-300 px-4 py-3 text-left font-bold text-gray-900">
                CONTRACTOR INFORMATION
              </th>
              <th className="w-1/2 bg-gray-100 border border-gray-300 px-4 py-3 text-left font-bold text-gray-900">
                CLIENT INFORMATION
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Company Name */}
            <tr>
              <td className="border border-gray-300 p-0">
                <div className="flex">
                  <div className="w-24 bg-gray-50 border-r border-gray-300 px-3 py-2 font-medium text-sm">
                    Company Name:
                  </div>
                                      <div className="flex-1">
                      <input
                        type="text"
                        value={data.contractor.companyName}
                        onChange={(e) => updateContractor('companyName', e.target.value)}
                        placeholder="The Zig Group, Inc"
                        className="w-full p-2 text-sm border-0 focus:outline-none bg-transparent"
                        readOnly={readonly}
                      />
                    </div>
                </div>
              </td>
              <td className="border border-gray-300 p-0">
                <div className="flex">
                  <div className="w-24 bg-gray-50 border-r border-gray-300 px-3 py-2 font-medium text-sm">
                    Company Name:
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={data.client.companyName}
                      onChange={(e) => updateClient('companyName', e.target.value)}
                      placeholder="Client Company Name"
                      className="w-full p-2 text-sm border-0 focus:outline-none bg-transparent"
                      readOnly={readonly}
                    />
                  </div>
                </div>
              </td>
            </tr>

            {/* Contact */}
            <tr>
              <td className="border border-gray-300 p-0">
                <div className="flex">
                  <div className="w-24 bg-gray-50 border-r border-gray-300 px-3 py-2 font-medium text-sm">
                    Contact:
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={data.contractor.contact}
                      onChange={(e) => updateContractor('contact', e.target.value)}
                      placeholder="Christopher Chileshe"
                      className="w-full p-2 text-sm border-0 focus:outline-none bg-transparent"
                      readOnly={readonly}
                    />
                  </div>
                </div>
              </td>
              <td className="border border-gray-300 p-0">
                <div className="flex">
                  <div className="w-24 bg-gray-50 border-r border-gray-300 px-3 py-2 font-medium text-sm">
                    Contact:
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={data.client.contact}
                      onChange={(e) => updateClient('contact', e.target.value)}
                      placeholder="Client Contact Name"
                      className="w-full p-2 text-sm border-0 focus:outline-none bg-transparent"
                      readOnly={readonly}
                    />
                  </div>
                </div>
              </td>
            </tr>

            {/* Title */}
            <tr>
              <td className="border border-gray-300 p-0">
                <div className="flex">
                  <div className="w-24 bg-gray-50 border-r border-gray-300 px-3 py-2 font-medium text-sm">
                    Title:
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={data.contractor.title}
                      onChange={(e) => updateContractor('title', e.target.value)}
                      placeholder="CEO"
                      className="w-full p-2 text-sm border-0 focus:outline-none bg-transparent"
                      readOnly={readonly}
                    />
                  </div>
                </div>
              </td>
              <td className="border border-gray-300 p-0">
                <div className="flex">
                  <div className="w-24 bg-gray-50 border-r border-gray-300 px-3 py-2 font-medium text-sm">
                    Title:
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={data.client.title}
                      onChange={(e) => updateClient('title', e.target.value)}
                      placeholder="Client Title"
                      className="w-full p-2 text-sm border-0 focus:outline-none bg-transparent"
                      readOnly={readonly}
                    />
                  </div>
                </div>
              </td>
            </tr>

            {/* Address */}
            <tr>
              <td className="border border-gray-300 p-0">
                <div className="flex">
                  <div className="w-24 bg-gray-50 border-r border-gray-300 px-3 py-2 font-medium text-sm">
                    Address:
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={data.contractor.address}
                      onChange={(e) => updateContractor('address', e.target.value)}
                      placeholder="450 Alaskan Way South&#10;Suite 200 - #9887&#10;Seattle, Washington, USA&#10;98104"
                      className="w-full p-2 text-sm border-0 focus:outline-none bg-transparent resize-none"
                      rows={3}
                      readOnly={readonly}
                    />
                  </div>
                </div>
              </td>
              <td className="border border-gray-300 p-0">
                <div className="flex">
                  <div className="w-24 bg-gray-50 border-r border-gray-300 px-3 py-2 font-medium text-sm">
                    Address:
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={data.client.address}
                      onChange={(e) => updateClient('address', e.target.value)}
                      placeholder="Client Address"
                      className="w-full p-2 text-sm border-0 focus:outline-none bg-transparent resize-none"
                      rows={3}
                      readOnly={readonly}
                    />
                  </div>
                </div>
              </td>
            </tr>

            {/* Email */}
            <tr>
              <td className="border border-gray-300 p-0">
                <div className="flex">
                  <div className="w-24 bg-gray-50 border-r border-gray-300 px-3 py-2 font-medium text-sm">
                    Email:
                  </div>
                  <div className="flex-1">
                    <input
                      type="email"
                      value={data.contractor.email}
                      onChange={(e) => updateContractor('email', e.target.value)}
                      placeholder="chris@thezig.io"
                      className="w-full p-2 text-sm border-0 focus:outline-none bg-transparent"
                      readOnly={readonly}
                    />
                  </div>
                </div>
              </td>
              <td className="border border-gray-300 p-0">
                <div className="flex">
                  <div className="w-24 bg-gray-50 border-r border-gray-300 px-3 py-2 font-medium text-sm">
                    Email:
                  </div>
                  <div className="flex-1">
                    <input
                      type="email"
                      value={data.client.email}
                      onChange={(e) => updateClient('email', e.target.value)}
                      placeholder="client@company.com"
                      className="w-full p-2 text-sm border-0 focus:outline-none bg-transparent"
                      readOnly={readonly}
                    />
                  </div>
                </div>
              </td>
            </tr>

            {/* Phone */}
            <tr>
              <td className="border border-gray-300 p-0">
                <div className="flex">
                  <div className="w-24 bg-gray-50 border-r border-gray-300 px-3 py-2 font-medium text-sm">
                    Phone:
                  </div>
                  <div className="flex-1">
                    <input
                      type="tel"
                      value={data.contractor.phone}
                      onChange={(e) => updateContractor('phone', e.target.value)}
                      placeholder="206-822-3804"
                      className="w-full p-2 text-sm border-0 focus:outline-none bg-transparent"
                      readOnly={readonly}
                    />
                  </div>
                </div>
              </td>
              <td className="border border-gray-300 p-0">
                <div className="flex">
                  <div className="w-24 bg-gray-50 border-r border-gray-300 px-3 py-2 font-medium text-sm">
                    Phone:
                  </div>
                  <div className="flex-1">
                    <input
                      type="tel"
                      value={data.client.phone}
                      onChange={(e) => updateClient('phone', e.target.value)}
                      placeholder="Client Phone"
                      className="w-full p-2 text-sm border-0 focus:outline-none bg-transparent"
                      readOnly={readonly}
                    />
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Summary Section */}
      <div className="bg-white border border-gray-300 mt-6">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-300">
          <h2 className="text-lg font-bold text-gray-900">2. SUMMARY</h2>
        </div>
        
        <div className="overflow-hidden">
          <table className="w-full border-collapse">
            <tbody>
              {/* Services */}
              <tr>
                <td className="border border-gray-300 p-0">
                  <div className="flex">
                    <div className="w-32 bg-gray-50 border-r border-gray-300 px-3 py-2 font-medium text-sm">
                      Services:
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={data.summary?.services || ''}
                        onChange={(e) => updateSummary('services', e.target.value)}
                        placeholder="Custom software engineering"
                        className="w-full p-2 text-sm border-0 focus:outline-none bg-transparent"
                        readOnly={readonly}
                      />
                    </div>
                  </div>
                </td>
              </tr>

              {/* Effective Date */}
              <tr>
                <td className="border border-gray-300 p-0">
                  <div className="flex">
                    <div className="w-32 bg-gray-50 border-r border-gray-300 px-3 py-2 font-medium text-sm">
                      Effective Date:
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={data.summary?.effectiveDate || ''}
                        onChange={(e) => updateSummary('effectiveDate', e.target.value)}
                        placeholder="TBC"
                        className="w-full p-2 text-sm border-0 focus:outline-none bg-transparent"
                        readOnly={readonly}
                      />
                    </div>
                  </div>
                </td>
              </tr>

              {/* Termination */}
              <tr>
                <td className="border border-gray-300 p-0">
                  <div className="flex">
                    <div className="w-32 bg-gray-50 border-r border-gray-300 px-3 py-2 font-medium text-sm">
                      Termination:
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={data.summary?.termination || ''}
                        onChange={(e) => updateSummary('termination', e.target.value)}
                        placeholder="Upon completion."
                        className="w-full p-2 text-sm border-0 focus:outline-none bg-transparent"
                        readOnly={readonly}
                      />
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Scope Description Paragraph */}
      <div className="my-6">
        <textarea
          value={data.scopeDescription || 'The scope of this SOW is limited to creating a fully functional solution with the features detailed further in the SOW. Any functionality listed beyond the scope of the work breakdown sheet is purely for documentation and completeness. This SOW will outline the phases involved in developing such a solution, capture high-level client requirements, and provide details necessary for the successful delivery of the solution.'}
          onChange={(e) => updateScopeDescription(e.target.value)}
          className="w-full p-4 text-sm border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          style={{ height: '150px' }}
          readOnly={readonly}
        />
      </div>

      {/* Introduction Section */}
      <div className="bg-white border border-gray-300 mt-6">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-300">
          <h2 className="text-lg font-bold text-gray-900">3. INTRODUCTION</h2>
        </div>
        
        <div className="overflow-hidden">
          <table className="w-full border-collapse">
            <tbody>
              <tr>
                <td className="border border-gray-300 p-0">
                  <div className="flex">
                    <div className="w-32 bg-gray-50 border-r border-gray-300 px-3 py-2 font-medium text-sm">
                      Introduction:
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={data.introduction?.introduction || 'Company bio & project overview'}
                        onChange={(e) => updateIntroduction('introduction', e.target.value)}
                        className="w-full p-2 text-sm border-0 focus:outline-none bg-transparent"
                        readOnly={readonly}
                      />
                    </div>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-0">
                  <div className="flex">
                    <div className="w-32 bg-gray-50 border-r border-gray-300 px-3 py-2 font-medium text-sm">
                      Background:
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={data.introduction?.background || 'Project information'}
                        onChange={(e) => updateIntroduction('background', e.target.value)}
                        className="w-full p-2 text-sm border-0 focus:outline-none bg-transparent"
                        readOnly={readonly}
                      />
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Scope of Services Section */}
      <div className="bg-white border border-gray-300 mt-6">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-300">
          <h2 className="text-lg font-bold text-gray-900">4. SCOPE OF SERVICES</h2>
        </div>
        
        <div className="overflow-hidden">
          <table className="w-full border-collapse">
            <tbody>
              {/* Service Description */}
              <tr>
                <td className="border border-gray-300 p-0" colSpan={2}>
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">4.1 Service</h3>
                    <div className="bg-gray-50 p-4 rounded border mb-4">
                      <textarea
                        value={data.scopeOfServices?.introduction || 'The Zig is pleased to present this proposal to [Company name] to create the [product] that will enable [Company name] stakeholders to [project aim].\n\nThe core functionality will allow for the following:\n• List functionality and purposes in bullet point form.'}
                        onChange={(e) => updateScopeOfServices('introduction', e.target.value)}
                        className="w-full p-2 text-sm border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        rows={4}
                        readOnly={readonly}
                      />
                    </div>
                    <textarea
                      value={data.scopeOfServices?.service || 'The scope of this SOW is limited to creating a fully functional solution with the features listed above and detailed further in the SOW. Any functionality listed beyond the scope of the work breakdown sheet is purely for documentation and completeness. This SOW will outline the phases involved in developing such a solution, capture high-level client requirements, and provide details necessary for the successful delivery of the solution.'}
                      onChange={(e) => updateScopeOfServices('service', e.target.value)}
                      className="w-full p-3 text-sm border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      style={{ height: '150px' }}
                      readOnly={readonly}
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Planning Section */}
      <div className="bg-white border border-gray-300 mt-6">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-300">
          <h2 className="text-lg font-bold text-gray-900">4.2 Planning</h2>
        </div>
        
        <div className="overflow-hidden">
          <table className="w-full border-collapse">
            <tbody>
              {/* Planning Approach */}
              <tr>
                <td className="border border-gray-300 p-0">
                  <div className="flex">
                    <div className="w-40 bg-gray-50 border-r border-gray-300 px-3 py-2 font-medium text-sm">
                      4.2.1 Approach:
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={data.scopeOfServices?.planningApproach || 'To decrease project risk and offer the Client better control and influence over the ongoing work, The Zig proposes the below approach to developing this platform. This will help provide predictable and well-understood solutions that support the Client\'s objectives.'}
                        onChange={(e) => updateScopeOfServices('planningApproach', e.target.value)}
                        className="w-full p-2 text-sm border-0 focus:outline-none bg-transparent resize-none"
                        rows={4}
                        readOnly={readonly}
                      />
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      {/* Service Phases Section */}
      <div className="bg-white border border-gray-300 mt-6">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-300">
          <h2 className="text-lg font-bold text-gray-900">4.2.2 Service Phases</h2>
        </div>
        
        <div className="p-4">
          <textarea
            value={data.scopeOfServices?.phasesDescription || 'Detailed planning, clear roles, responsibilities, and strong governance are essential to project success. The Zig will provide Audit, Analyze, Implement, and Validate services to support Client objectives.'}
            onChange={(e) => updateScopeOfServices('phasesDescription', e.target.value)}
            className="w-full p-3 text-sm border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white mb-4"
            rows={2}
            readOnly={readonly}
          />
        </div>
        
        <div className="overflow-hidden">
          <table className="w-full border-collapse">
            <tbody>
              {/* Audit Phase */}
              <tr>
                <td className="border border-gray-300 p-0">
                  <div className="flex">
                    <div className="w-32 bg-gray-50 border-r border-gray-300 px-3 py-2 font-medium text-sm">
                      Audit:
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={data.scopeOfServices?.auditDescription || 'The outcome of the Audit process will be an architecture document that will map the current state to the desired state.\n\nAdd audit process details...'}
                        onChange={(e) => updateScopeOfServices('auditDescription', e.target.value)}
                        className="w-full p-2 text-sm border-0 focus:outline-none bg-transparent resize-none"
                        rows={4}
                        readOnly={readonly}
                      />
                    </div>
                  </div>
                </td>
              </tr>
              
              {/* Analyze Phase */}
              <tr>
                <td className="border border-gray-300 p-0">
                  <div className="flex">
                    <div className="w-32 bg-gray-50 border-r border-gray-300 px-3 py-2 font-medium text-sm">
                      Analyze:
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={data.scopeOfServices?.analyzeDescription || 'The outcome of the Analyze phase will be an implementation document that maps specific tasks to the desired state.\n\nAdd analyze phase details...'}
                        onChange={(e) => updateScopeOfServices('analyzeDescription', e.target.value)}
                        className="w-full p-2 text-sm border-0 focus:outline-none bg-transparent resize-none"
                        rows={4}
                        readOnly={readonly}
                      />
                    </div>
                  </div>
                </td>
              </tr>
              
              {/* Implementation Phase */}
              <tr>
                <td className="border border-gray-300 p-0">
                  <div className="flex">
                    <div className="w-32 bg-gray-50 border-r border-gray-300 px-3 py-2 font-medium text-sm">
                      Implementation:
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={data.scopeOfServices?.implementationDescription || 'The Implementation phase assigns tasks and aligns the work to a developer/team/stakeholder to achieve the desired state.\n\nAdd implementation phase details...'}
                        onChange={(e) => updateScopeOfServices('implementationDescription', e.target.value)}
                        className="w-full p-2 text-sm border-0 focus:outline-none bg-transparent resize-none"
                        rows={4}
                        readOnly={readonly}
                      />
                    </div>
                  </div>
                </td>
              </tr>
              
              {/* Validation Phase */}
              <tr>
                <td className="border border-gray-300 p-0">
                  <div className="flex">
                    <div className="w-32 bg-gray-50 border-r border-gray-300 px-3 py-2 font-medium text-sm">
                      Validation:
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={data.scopeOfServices?.validationDescription || 'The Validation phase ensures that work performed during the Implementation phase meets stated goals. Otherwise referred to as User Accepted Testing, end-users (in this case, all stakeholders) provide additional feedback. Only minor changes are permitted to address bugs or less than ideal implementation.\n\nAdd validation phase details...'}
                        onChange={(e) => updateScopeOfServices('validationDescription', e.target.value)}
                        className="w-full p-2 text-sm border-0 focus:outline-none bg-transparent resize-none"
                        rows={5}
                        readOnly={readonly}
                      />
                    </div>
                  </div>
                </td>
              </tr>
              
              {/* Feedback Note */}
              <tr>
                <td className="border border-gray-300 p-0">
                  <div className="flex">
                    <div className="w-32 bg-gray-50 border-r border-gray-300 px-3 py-2 font-medium text-sm">
                      Feedback:
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={data.scopeOfServices?.feedbackNote || 'The Zig will encourage feedback throughout all stages of the engagement to minimize the risk of significant changes taking place at the end of the project.'}
                        onChange={(e) => updateScopeOfServices('feedbackNote', e.target.value)}
                        className="w-full p-2 text-sm border-0 focus:outline-none bg-transparent resize-none"
                        rows={3}
                        readOnly={readonly}
                      />
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Milestones Section */}
      <div className="bg-white border border-gray-300 mt-6">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-300">
          <h2 className="text-lg font-bold text-gray-900">4.3 Milestones</h2>
        </div>
        
        <div className="overflow-hidden">
          <table className="w-full border-collapse">
            <tbody>
              {/* Milestones Description */}
              <tr>
                <td className="border border-gray-300 p-0">
                  <div className="flex">
                    <div className="w-32 bg-gray-50 border-r border-gray-300 px-3 py-2 font-medium text-sm">
                      Description:
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={data.milestones?.description || 'The below milestones are an estimate of what the project will incorporate. Sections marked in red are yet to be scoped.'}
                        onChange={(e) => updateMilestones('description', e.target.value)}
                        className="w-full p-2 text-sm border-0 focus:outline-none bg-transparent resize-none"
                        rows={3}
                        readOnly={readonly}
                      />
                    </div>
                  </div>
                </td>
              </tr>
              
              {/* WBS Note */}
              <tr>
                <td className="border border-gray-300 p-0">
                  <div className="flex">
                    <div className="w-32 bg-gray-50 border-r border-gray-300 px-3 py-2 font-medium text-sm">
                      WBS:
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={data.milestones?.wbsNote || 'Insert WBS.'}
                        onChange={(e) => updateMilestones('wbsNote', e.target.value)}
                        className="w-full p-2 text-sm border-0 focus:outline-none bg-transparent resize-none"
                        rows={2}
                        readOnly={readonly}
                      />
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Architecture Section */}
      <div className="bg-white border border-gray-300 mt-6">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-300">
          <h2 className="text-lg font-bold text-gray-900">4.4 Architecture</h2>
        </div>
        
        <div className="overflow-hidden">
          <table className="w-full border-collapse">
            <tbody>
              {/* Architectural Diagram */}
              <tr>
                <td className="border border-gray-300 p-0">
                  <div className="flex">
                    <div className="w-40 bg-gray-50 border-r border-gray-300 px-3 py-2 font-medium text-sm">
                      4.4.1 Diagram:
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={data.architecture?.diagramNote || 'Add architectural diagram or description...'}
                        onChange={(e) => updateArchitecture('diagramNote', e.target.value)}
                        className="w-full p-2 text-sm border-0 focus:outline-none bg-transparent resize-none"
                        rows={3}
                        readOnly={readonly}
                      />
                    </div>
                  </div>
                </td>
              </tr>
              
              {/* Architecture Description */}
              <tr>
                <td className="border border-gray-300 p-0">
                  <div className="flex">
                    <div className="w-40 bg-gray-50 border-r border-gray-300 px-3 py-2 font-medium text-sm">
                      4.4.2 Description:
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={data.architecture?.descriptionNote || 'Describe the technical architecture...'}
                        onChange={(e) => updateArchitecture('descriptionNote', e.target.value)}
                        className="w-full p-2 text-sm border-0 focus:outline-none bg-transparent resize-none"
                        rows={4}
                        readOnly={readonly}
                      />
                    </div>
                  </div>
                </td>
              </tr>
              
              {/* Cost Estimate Note */}
              <tr>
                <td className="border border-gray-300 p-0">
                  <div className="flex">
                    <div className="w-40 bg-gray-50 border-r border-gray-300 px-3 py-2 font-medium text-sm">
                      4.4.3 Cost Note:
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={data.architecture?.costEstimateNote || 'This is an example'}
                        onChange={(e) => updateArchitecture('costEstimateNote', e.target.value)}
                        className="w-full p-2 text-sm border-0 focus:outline-none bg-transparent resize-none"
                        rows={2}
                        readOnly={readonly}
                      />
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        {/* Cost Table */}
        <div className="p-4">
          <div className="mt-4 overflow-x-auto">
            <p className="text-sm text-gray-600 mb-2">Cost estimation table will be added here.</p>
          </div>
        </div>
      </div>

      {/* Activities Section */}
      <div className="bg-white border border-gray-300 mt-6">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-300">
          <h2 className="text-lg font-bold text-gray-900">4.5 Activities</h2>
        </div>
        
        <div className="overflow-hidden">
          <table className="w-full border-collapse">
            <tbody>
              {/* Execution Phases */}
              <tr>
                <td className="border border-gray-300 p-0">
                  <div className="flex">
                    <div className="w-48 bg-gray-50 border-r border-gray-300 px-3 py-2 font-medium text-sm">
                      4.5.1 Execution Phases:
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={data.activities?.executionNote || 'The project will accomplish the following items during execution:'}
                        onChange={(e) => updateActivities('executionNote', e.target.value)}
                        className="w-full p-2 text-sm border-0 focus:outline-none bg-transparent resize-none"
                        rows={2}
                        readOnly={readonly}
                      />
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

          <div>
            <h4 className="text-base font-bold text-gray-900 mb-3">Stage Estimate Description (This is an example)</h4>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3 bg-gray-50 font-bold w-1/3">
                      DISCOVERY (Audit & Analyze)
                    </td>
                    <td className="border border-gray-300 px-4 py-3">
                      <textarea
                        value={data.activities?.discoveryItems || '• Requirements gathering.\n• Audit of current platform\n• Validation of technical implementation'}
                        onChange={(e) => updateActivities('discoveryItems', e.target.value)}
                        className="w-full p-2 text-sm border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        rows={3}
                        readOnly={readonly}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3 bg-gray-50 font-bold">
                      EXECUTE (Implementation)
                    </td>
                    <td className="border border-gray-300 px-4 py-3">
                      <textarea
                        value={data.activities?.executeItems || '• Develop the functions and integration scripts\n• Developer Testing'}
                        onChange={(e) => updateActivities('executeItems', e.target.value)}
                        className="w-full p-2 text-sm border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        rows={2}
                        readOnly={readonly}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3 bg-gray-50 font-bold">
                      DEPLOY (Validation)
                    </td>
                    <td className="border border-gray-300 px-4 py-3">
                      <textarea
                        value={data.activities?.deployItems || '• User Acceptance Testing\n• Minor Bug Fixes\n• Prepare platform for public release and deploy'}
                        onChange={(e) => updateActivities('deployItems', e.target.value)}
                        className="w-full p-2 text-sm border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        rows={3}
                        readOnly={readonly}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-4">
              <textarea
                value={data.activities?.breakdownNote || '* This breakdown assumes the project takes the minimum amount of time allocated in the SOW based on the milestones breakdown in section 3.'}
                onChange={(e) => updateActivities('breakdownNote', e.target.value)}
                className="w-full p-3 text-sm border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white italic"
                rows={2}
                readOnly={readonly}
              />
            </div>
          </div>

        {/* Deliverables Section */}
        <div className="bg-white border border-gray-300 mt-6">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-300">
            <h2 className="text-lg font-bold text-gray-900">4.5.2 Deliverables</h2>
          </div>
          
          <div className="overflow-hidden">
            <table className="w-full border-collapse">
              <tbody>
                {/* Discovery */}
                <tr>
                  <td className="border border-gray-300 p-0">
                    <div className="flex">
                      <div className="w-32 bg-gray-50 border-r border-gray-300 px-3 py-2 font-medium text-sm italic">
                        Discovery:
                      </div>
                      <div className="flex-1">
                        <textarea
                          value={data.activities?.deliverables?.discovery || 'Gather details for each milestone by interviewing stakeholders.'}
                          onChange={(e) => updateActivities('deliverables', { ...data.activities?.deliverables, discovery: e.target.value })}
                          className="w-full p-2 text-sm border-0 focus:outline-none bg-transparent resize-none"
                          rows={2}
                          readOnly={readonly}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
                
                {/* Implement */}
                <tr>
                  <td className="border border-gray-300 p-0">
                    <div className="flex">
                      <div className="w-32 bg-gray-50 border-r border-gray-300 px-3 py-2 font-medium text-sm italic">
                        Implement:
                      </div>
                      <div className="flex-1">
                        <textarea
                          value={data.activities?.deliverables?.implement || 'Onsite/Offsite completion of all user stories identified and source code where applicable.'}
                          onChange={(e) => updateActivities('deliverables', { ...data.activities?.deliverables, implement: e.target.value })}
                          className="w-full p-2 text-sm border-0 focus:outline-none bg-transparent resize-none"
                          rows={2}
                          readOnly={readonly}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
                
                {/* Validate */}
                <tr>
                  <td className="border border-gray-300 p-0">
                    <div className="flex">
                      <div className="w-32 bg-gray-50 border-r border-gray-300 px-3 py-2 font-medium text-sm italic">
                        Validate:
                      </div>
                      <div className="flex-1">
                        <textarea
                          value={data.activities?.deliverables?.validate || 'Build/Release pipelines, dashboards & alerting, and testing.'}
                          onChange={(e) => updateActivities('deliverables', { ...data.activities?.deliverables, validate: e.target.value })}
                          className="w-full p-2 text-sm border-0 focus:outline-none bg-transparent resize-none"
                          rows={2}
                          readOnly={readonly}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Roles & Responsibilities Section */}
      <div className="bg-white border border-gray-300 mt-6">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-300">
          <h2 className="text-lg font-bold text-gray-900">4.6 Roles & responsibilities</h2>
        </div>
        
        <div className="p-6">
          <h3 className="text-base font-bold text-gray-900 mb-3">Assigned Resources</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-3 py-2 text-left font-bold text-sm">Staffing:</th>
                  <th className="border border-gray-300 px-3 py-2 text-left font-bold text-sm">Project Manager</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-3 py-2"></td>
                  <td className="border border-gray-300 px-3 py-2">
                    <div className="space-y-4">
                      <div>
                        <p className="font-bold text-sm mb-2">Project Manager - Responsible for:</p>
                        <textarea
                          value={data.rolesAndResponsibilities?.projectManagerResponsibilities || '• Overall project plan\n• Maintains schedule and delivery\n• Manages dependencies and upstream requirements\n• Provides regular status reports to clients (weekly project status updates)\n• End of Sprint Demos\n• Helps collect feedback from stakeholders (including pilot users)'}
                          onChange={(e) => updateRoles('projectManagerResponsibilities', e.target.value)}
                          className="w-full p-2 text-sm border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                          rows={4}
                          readOnly={readonly}
                        />
                      </div>
                      
                      <div>
                        <p className="font-bold text-sm mb-2">Software Engineers - Responsible for:</p>
                        <textarea
                          value={data.rolesAndResponsibilities?.softwareEngineersResponsibilities || '• Front/Back-end Development\n• Integrations with 3rd party systems\n• Testing'}
                          onChange={(e) => updateRoles('softwareEngineersResponsibilities', e.target.value)}
                          className="w-full p-2 text-sm border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                          rows={3}
                          readOnly={readonly}
                        />
                      </div>
                      
                      <div>
                        <p className="font-bold text-sm mb-2">Designer - Responsible for:</p>
                        <textarea
                          value={data.rolesAndResponsibilities?.designerResponsibilities || '• UI/UX design\n• Digital assets\n• Maintaining a cohesive user experience for all users\n• Design Demos\n• Helps collect feedback from stakeholders'}
                          onChange={(e) => updateRoles('designerResponsibilities', e.target.value)}
                          className="w-full p-2 text-sm border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                          rows={3}
                          readOnly={readonly}
                        />
                      </div>
                      
                      <div>
                        <p className="font-bold text-sm mb-2">Client Project Sponsor - Responsible for:</p>
                        <textarea
                          value={data.rolesAndResponsibilities?.clientResponsibilities || '• Point of contact for financials\n• Approves project engagement documents\n• Participates in key project meetings\n• Actively participates in project communication\n• Subject matter expert\n• Reviews project status reports\n• Reviews and approves project documents'}
                          onChange={(e) => updateRoles('clientResponsibilities', e.target.value)}
                          className="w-full p-2 text-sm border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                          rows={4}
                          readOnly={readonly}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2 bg-gray-50 font-bold text-sm">Mutual Responsibilities</td>
                  <td className="border border-gray-300 px-3 py-2">
                    <textarea
                      value={data.rolesAndResponsibilities?.mutualResponsibilities || '• Communication\n• Involvement in all aspects of the services\n• Timely and effective completion of responsibilities, as identified in this document.\n• Timely decisions and approvals'}
                      onChange={(e) => updateRoles('mutualResponsibilities', e.target.value)}
                      className="w-full p-2 text-sm border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      rows={3}
                      readOnly={readonly}
                    />
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2 bg-gray-50 font-bold text-sm">Changes:</td>
                  <td className="border border-gray-300 px-3 py-2">
                    <div className="space-y-3">
                      <textarea
                        value={data.rolesAndResponsibilities?.changes || 'The Zig may remove or cancel assigned staff, subject to 30 days written notice. If any staff resigns or is required to be terminated without the ability to give 30 days\' notice, The Zig will have a reasonable time to assign replacement staff. The client may request staff changes, which The Zig will use its reasonable efforts to accommodate'}
                        onChange={(e) => updateRoles('changes', e.target.value)}
                        className="w-full p-3 text-sm border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        rows={4}
                        readOnly={readonly}
                      />
                      <textarea
                        value={data.rolesAndResponsibilities?.additionalStaff || 'Should either party propose any changes that will directly affect the project scope covered in this Statement of Work (SOW), this shall be treated as a Change Request. This will have to be approved by both parties before any further implementation.'}
                        onChange={(e) => updateRoles('additionalStaff', e.target.value)}
                        className="w-full p-3 text-sm border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        rows={4}
                        readOnly={readonly}
                      />
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2 bg-gray-50 font-bold text-sm">Additional Staff:</td>
                  <td className="border border-gray-300 px-3 py-2">
                    <textarea
                      value={data.rolesAndResponsibilities?.additionalStaff || 'If the Services expand and The Zig or Client determines additional staffing is reasonably needed, additional staff may be assigned, and the Fees adjusted according per confirmed writing agreed upon by The Zig and Client.'}
                      onChange={(e) => updateRoles('additionalStaff', e.target.value)}
                      className="w-full p-3 text-sm border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      rows={3}
                      readOnly={readonly}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Deliverables Section */}
      <div className="bg-white border border-gray-300 mt-6">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-300">
          <h2 className="text-lg font-bold text-gray-900">5. DELIVERABLES</h2>
        </div>
        
        <div className="overflow-hidden">
          <table className="w-full border-collapse">
            <tbody>
              {/* Agreed Deliverables */}
              <tr>
                <td className="border border-gray-300 p-0">
                  <div className="flex">
                    <div className="w-48 bg-gray-50 border-r border-gray-300 px-3 py-2 font-medium text-sm">
                      Agreed Deliverables:
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={data.deliverables?.agreedDeliverables || 'Company is expected to deliver the following:\n\nAn example:\n\n1. Android Mobile application\n2. PowerApps App\n3. PowerBI Dashboards\n4. Architectural documentation'}
                        onChange={(e) => updateDeliverables('agreedDeliverables', e.target.value)}
                        className="w-full p-2 text-sm border-0 focus:outline-none bg-transparent resize-none"
                        rows={6}
                        readOnly={readonly}
                      />
                    </div>
                  </div>
                </td>
              </tr>
              
              {/* Review and Revision */}
              <tr>
                <td className="border border-gray-300 p-0">
                  <div className="flex">
                    <div className="w-48 bg-gray-50 border-r border-gray-300 px-3 py-2 font-medium text-sm">
                      Review and Revision:
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={data.deliverables?.reviewAndRevision || 'Client review of each end of sprint (based on cadence determined with the Client, typically 2-week cadence). The Zig and Client to coordinate on meetings to discuss revisions.'}
                        onChange={(e) => updateDeliverables('reviewAndRevision', e.target.value)}
                        className="w-full p-2 text-sm border-0 focus:outline-none bg-transparent resize-none"
                        rows={3}
                        readOnly={readonly}
                      />
                    </div>
                  </div>
                </td>
              </tr>
              
              {/* Native Files */}
              <tr>
                <td className="border border-gray-300 p-0">
                  <div className="flex">
                    <div className="w-48 bg-gray-50 border-r border-gray-300 px-3 py-2 font-medium text-sm">
                      Native Files:
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={data.deliverables?.nativeFiles || 'Deployed to repository of the client\'s choosing'}
                        onChange={(e) => updateDeliverables('nativeFiles', e.target.value)}
                        className="w-full p-2 text-sm border-0 focus:outline-none bg-transparent"
                        readOnly={readonly}
                      />
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        {/* Expenses */}
        <div className="border-t border-gray-300">
          <div className="overflow-hidden">
            <table className="w-full border-collapse">
              <tbody>
                <tr>
                  <td className="border border-gray-300 p-0">
                    <div className="flex">
                      <div className="w-48 bg-gray-50 border-r border-gray-300 px-3 py-2 font-medium text-sm">
                        Expenses:
                      </div>
                      <div className="flex-1">
                        <textarea
                          value={data.deliverables?.expenses || 'The Zig may request pre-approval and reimbursement from the Client (but subject to pre-approval at the Client\'s sole discretion): travel at the request of the Client, software licenses required by Client, or specialty hardware.'}
                          onChange={(e) => updateDeliverables('expenses', e.target.value)}
                          className="w-full p-2 text-sm border-0 focus:outline-none bg-transparent resize-none"
                          rows={3}
                          readOnly={readonly}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Risk Assessment Section */}
      <div className="bg-white border border-gray-300 mt-6">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-300">
          <h2 className="text-lg font-bold text-gray-900">5. RISK ASSESSMENT</h2>
        </div>
        
        <div className="overflow-hidden">
          <table className="w-full border-collapse">
            <tbody>
              {/* Project Risk Score */}
              <tr>
                <td className="border border-gray-300 p-0">
                  <div className="flex">
                    <div className="w-32 bg-gray-50 border-r border-gray-300 px-3 py-2 font-medium text-sm">
                      Project score:
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={data.riskAssessment?.projectScore || 'This is a 1-10 score that helps both parties determine the overall level of risk associated with the project. Higher scoring projects contain a greater number of known risks that have been classified as high. Ultimately the score will help identify a need for providing clarity and solutions early on for the high-risk items. The project manager will be responsible for tackling the risks beginning with highest risk and working to adjust the score downwards.'}
                        onChange={(e) => updateRiskAssessment('projectScore', e.target.value)}
                        className="w-full p-2 text-sm border-0 focus:outline-none bg-transparent resize-none"
                        rows={5}
                        readOnly={readonly}
                      />
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        {/* Risk Table */}
        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-3 py-2 text-left font-bold text-sm">Risk</th>
                  <th className="border border-gray-300 px-3 py-2 text-left font-bold text-sm">Risk level</th>
                  <th className="border border-gray-300 px-3 py-2 text-left font-bold text-sm">Description</th>
                </tr>
              </thead>
              <tbody>
                {(data.riskAssessment?.riskItems || [
                  { risk: 'Availability of Stakeholder', riskLevel: '3', description: 'The Zig\'s ability to deliver on the scope of this SOW largely depends on the availability of all stakeholders to answer questions and participate in interviews and meetings.' },
                  { risk: 'Unforeseen Interruptions', riskLevel: '3', description: 'Unexpected personal issues with either the Client or the staff responsible for delivery at The Zig.' }
                ]).map((item, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 px-3 py-2 text-sm">
                      <input
                        type="text"
                        value={item.risk}
                        onChange={(e) => {
                          const newItems = [...(data.riskAssessment?.riskItems || [])];
                          newItems[index] = { ...item, risk: e.target.value };
                          updateRiskAssessment('riskItems', newItems);
                        }}
                        className="w-full p-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        readOnly={readonly}
                      />
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-sm text-center">
                      <input
                        type="text"
                        value={item.riskLevel}
                        onChange={(e) => {
                          const newItems = [...(data.riskAssessment?.riskItems || [])];
                          newItems[index] = { ...item, riskLevel: e.target.value };
                          updateRiskAssessment('riskItems', newItems);
                        }}
                        className="w-full p-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-center"
                        readOnly={readonly}
                      />
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-sm">
                      <textarea
                        value={item.description}
                        onChange={(e) => {
                          const newItems = [...(data.riskAssessment?.riskItems || [])];
                          newItems[index] = { ...item, description: e.target.value };
                          updateRiskAssessment('riskItems', newItems);
                        }}
                        className="w-full p-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                        rows={2}
                        readOnly={readonly}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Master Services Agreement Section */}
      <div className="bg-white border border-gray-300 mt-6">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-300">
          <h2 className="text-lg font-bold text-gray-900">6. MASTER SERVICES AGREEMENT</h2>
        </div>
        
        <div className="p-4">
          <textarea
            value={data.masterServicesAgreement?.agreementText || 'This Statement of Work ("SOW") is made under and pursuant to that Master Services Agreement entered into between The ZIG and Client, dated 12/07/2023 (the "MSA"). In the event of any conflict with this SOW and the Agreement, the Agreement will govern.\n\nThe parties may modify the terms of this SOW by submitting a written proposed change order, which will become part of the applicable SOW when executed by both parties, and the services described therein will become part of the Services. All terms not defined in this SOW have the meaning in the MSA.'}
            onChange={(e) => updateMasterServices('agreementText', e.target.value)}
            className="w-full p-3 text-sm border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            rows={6}
            readOnly={readonly}
          />
        </div>
      </div>

      {/* Authorization Section */}
      <div className="bg-white border border-gray-300 mt-6">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-300">
          <h2 className="text-lg font-bold text-gray-900">7. AUTHORIZATION</h2>
        </div>
        
        <div className="overflow-hidden">
          <table className="w-full border-collapse">
            <tbody>
              {/* Client Signature */}
              <tr>
                <td className="border border-gray-300 p-0">
                  <div className="flex">
                    <div className="w-32 bg-gray-50 border-r border-gray-300 px-3 py-2 font-medium text-sm">
                      Client:
                    </div>
                    <div className="flex-1 p-3">
                      <div className="space-y-3">
                        <div className="flex space-x-4">
                          <div className="flex-1">
                            <label className="text-sm font-medium text-gray-700">Signature:</label>
                            <input
                              type="text"
                              value={data.authorization?.clientSignature || '________________________'}
                              onChange={(e) => updateAuthorization('clientSignature', e.target.value)}
                              className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              readOnly={readonly}
                            />
                          </div>
                          <div className="flex-1">
                            <label className="text-sm font-medium text-gray-700">Date:</label>
                            <input
                              type="text"
                              value={data.authorization?.clientDate || '______________'}
                              onChange={(e) => updateAuthorization('clientDate', e.target.value)}
                              className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              readOnly={readonly}
                            />
                          </div>
                        </div>
                        <div className="flex space-x-4">
                          <div className="flex-1">
                            <label className="text-sm font-medium text-gray-700">Name (Print):</label>
                            <input
                              type="text"
                              value={data.authorization?.clientName || ''}
                              onChange={(e) => updateAuthorization('clientName', e.target.value)}
                              className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              readOnly={readonly}
                            />
                          </div>
                          <div className="flex-1">
                            <label className="text-sm font-medium text-gray-700">Title:</label>
                            <input
                              type="text"
                              value={data.authorization?.clientTitle || 'CEO'}
                              onChange={(e) => updateAuthorization('clientTitle', e.target.value)}
                              className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              readOnly={readonly}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
              
              {/* Contractor Signature */}
              <tr>
                <td className="border border-gray-300 p-0">
                  <div className="flex">
                    <div className="w-32 bg-gray-50 border-r border-gray-300 px-3 py-2 font-medium text-sm">
                      The Zig Group, Inc:
                    </div>
                    <div className="flex-1 p-3">
                      <div className="space-y-3">
                        <div className="flex space-x-4">
                          <div className="flex-1">
                            <label className="text-sm font-medium text-gray-700">Signature:</label>
                            <input
                              type="text"
                              value={data.authorization?.contractorSignature || '________________________'}
                              onChange={(e) => updateAuthorization('contractorSignature', e.target.value)}
                              className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              readOnly={readonly}
                            />
                          </div>
                          <div className="flex-1">
                            <label className="text-sm font-medium text-gray-700">Date:</label>
                            <input
                              type="text"
                              value={data.authorization?.contractorDate || '______________'}
                              onChange={(e) => updateAuthorization('contractorDate', e.target.value)}
                              className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              readOnly={readonly}
                            />
                          </div>
                        </div>
                        <div className="flex space-x-4">
                          <div className="flex-1">
                            <label className="text-sm font-medium text-gray-700">Name (Print):</label>
                            <input
                              type="text"
                              value={data.authorization?.contractorName || 'Christopher Chileshe'}
                              onChange={(e) => updateAuthorization('contractorName', e.target.value)}
                              className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              readOnly={readonly}
                            />
                          </div>
                          <div className="flex-1">
                            <label className="text-sm font-medium text-gray-700">Title:</label>
                            <input
                              type="text"
                              value={data.authorization?.contractorTitle || 'CEO'}
                              onChange={(e) => updateAuthorization('contractorTitle', e.target.value)}
                              className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              readOnly={readonly}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ContactInformation;
