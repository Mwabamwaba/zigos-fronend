import { Template } from '../types';

export const defaultTemplate: Template = {
  id: 'default',
  name: 'Professional Services Agreement',
  content: '',
  contactInformation: {
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
      introduction: 'The Zig is pleased to present this proposal to [Company name] to create the [product] that will enable [Company name] stakeholders to [project aim].\n\nThe core functionality will allow for the following:\n• List functionality and purposes in bullet point form.',
      service: '',
      planningApproach: 'To decrease project risk and offer the Client better control and influence over the ongoing work, The Zig proposes the below approach to developing this platform. This will help provide predictable and well-understood solutions that support the Client\'s objectives.',
      phasesDescription: 'Detailed planning, clear roles, responsibilities, and strong governance are essential to project success. The Zig will provide Audit, Analyze, Implement, and Validate services to support Client objectives.',
      auditDescription: 'The outcome of the Audit process will be an architecture document that will map the current state to the desired state.\n\nAdd audit process details...',
      analyzeDescription: 'The outcome of the Analyze phase will be an implementation document that maps specific tasks to the desired state.\n\nAdd analyze phase details...',
      implementationDescription: 'The Implementation phase assigns tasks and aligns the work to a developer/team/stakeholder to achieve the desired state.\n\nAdd implementation phase details...',
      validationDescription: 'The Validation phase ensures that work performed during the Implementation phase meets stated goals. Otherwise referred to as User Accepted Testing, end-users (in this case, all stakeholders) provide additional feedback. Only minor changes are permitted to address bugs or less than ideal implementation.\n\nAdd validation phase details...',
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
      discoveryItems: '• Requirements gathering.\n• Audit of current platform\n• Validation of technical implementation',
      executeItems: '• Develop the functions and integration scripts\n• Developer Testing',
      deployItems: '• User Acceptance Testing\n• Minor Bug Fixes\n• Prepare platform for public release and deploy',
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
      projectManagerResponsibilities: '• Overall project plan\n• Maintains schedule and delivery\n• Manages dependencies and upstream requirements\n• Provides regular status reports to clients (weekly project status updates)\n• End of Sprint Demos\n• Helps collect feedback from stakeholders (including pilot users)',
      softwareEngineersResponsibilities: '• Front/Back-end Development\n• Integrations with 3rd party systems\n• Testing',
      designerResponsibilities: '• UI/UX design\n• Digital assets\n• Maintaining a cohesive user experience for all users\n• Design Demos\n• Helps collect feedback from stakeholders',
      clientResponsibilities: '• Point of contact for financials\n• Approves project engagement documents\n• Participates in key project meetings\n• Actively participates in project communication\n• Subject matter expert\n• Reviews project status reports\n• Reviews and approves project documents',
      mutualResponsibilities: '• Communication\n• Involvement in all aspects of the services\n• Timely and effective completion of responsibilities, as identified in this document.\n• Timely decisions and approvals',
      changes: 'The Zig may remove or cancel assigned staff, subject to 30 days written notice. If any staff resigns or is required to be terminated without the ability to give 30 days\' notice, The Zig will have a reasonable time to assign replacement staff. The client may request staff changes, which The Zig will use its reasonable efforts to accommodate',
      additionalStaff: 'If the Services expand and The Zig or Client determines additional staffing is reasonably needed, additional staff may be assigned, and the Fees adjusted according per confirmed writing agreed upon by The Zig and Client.'
    },
    deliverables: {
      agreedDeliverables: 'Company is expected to deliver the following:\n\nAn example:\n\n1. Android Mobile application\n2. PowerApps App\n3. PowerBI Dashboards\n4. Architectural documentation',
      reviewAndRevision: 'Client review of each end of sprint (based on cadence determined with the Client, typically 2-week cadence). The Zig and Client to coordinate on meetings to discuss revisions.',
      nativeFiles: 'Deployed to repository of the client\'s choosing',
      expenses: 'The Zig may request pre-approval and reimbursement from the Client (but subject to pre-approval at the Client\'s sole discretion): travel at the request of the Client, software licenses required by Client, or specialty hardware.'
    },
    riskAssessment: {
      projectScore: 'This is a 1-10 score that helps both parties determine the overall level of risk associated with the project. Higher scoring projects contain a greater number of known risks that have been classified as high. Ultimately the score will help identify a need for providing clarity and solutions early on for the high-risk items. The project manager will be responsible for tackling the risks beginning with highest risk and working to adjust the score downwards.',
      riskItems: [
        {
          risk: 'Availability of Stakeholder',
          riskLevel: '3',
          description: 'The Zig\'s ability to deliver on the scope of this SOW largely depends on the availability of all stakeholders to answer questions and participate in interviews and meetings.'
        },
        {
          risk: 'Unforeseen Interruptions',
          riskLevel: '3',
          description: 'Unexpected personal issues with either the Client or the staff responsible for delivery at The Zig.'
        }
      ]
    },
    masterServicesAgreement: {
      agreementText: 'This Statement of Work ("SOW") is made under and pursuant to that Master Services Agreement entered into between The ZIG and Client, dated 12/07/2023 (the "MSA"). In the event of any conflict with this SOW and the Agreement, the Agreement will govern.\n\nThe parties may modify the terms of this SOW by submitting a written proposed change order, which will become part of the applicable SOW when executed by both parties, and the services described therein will become part of the Services. All terms not defined in this SOW have the meaning in the MSA.'
    },
    authorization: {
      clientSignature: '',
      clientDate: '',
      clientName: '',
      clientTitle: 'CEO',
      contractorSignature: '',
      contractorDate: '',
      contractorName: 'Christopher Chileshe',
      contractorTitle: 'CEO'
    }
  },
  sections: [
    {
      title: 'Project Overview',
      required: true,
      allowedComponents: ['project-overview'],
      validationRules: ['required']
    },
    {
      title: 'Scope of Work',
      required: true,
      allowedComponents: ['scope-of-work'],
      validationRules: ['required']
    },
    {
      title: 'Timeline and Milestones',
      required: false,
      allowedComponents: ['timeline'],
      validationRules: []
    },
    {
      title: 'Terms',
      required: true,
      allowedComponents: ['terms-conditions'],
      validationRules: ['required']
    }
  ],
};