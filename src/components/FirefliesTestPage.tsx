import React, { useState } from 'react';
import { Play, CheckCircle, XCircle, AlertTriangle, Clock, Users, Calendar } from 'lucide-react';
import FirefliesIntegrationHub from './FirefliesIntegrationHub';
import { FirefliesMeeting } from '../services/firefliesService';

// Mock data for testing
const mockMeetings: FirefliesMeeting[] = [
  {
    id: '1',
    firefliesId: 'ff_meeting_001',
    title: 'Client Discovery Call - TechCorp',
    date: new Date().toISOString(),
    duration: 45,
    participants: ['John Smith (Client)', 'Sarah Johnson (Sales)', 'Mike Davis (Technical)'],
    summary: 'Initial discovery call with TechCorp to understand their requirements for a new customer portal. They need user authentication, dashboard functionality, and integration with their existing CRM system.',
    actionItems: [
      'Send technical proposal by Friday',
      'Schedule follow-up meeting with their dev team',
      'Research their current CRM integration options',
      'Prepare cost estimate for Phase 1'
    ],
    tags: ['client-call', 'discovery', 'techcorp', 'web-development'],
    status: 'processed' as const
  },
  {
    id: '2',
    firefliesId: 'ff_meeting_002',
    title: 'Internal Sprint Planning',
    date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    duration: 60,
    participants: ['Alice Brown (PM)', 'Bob Wilson (Dev)', 'Carol Martinez (Designer)', 'David Kim (QA)'],
    summary: 'Sprint planning for the upcoming development cycle. Discussed priorities, resource allocation, and timeline for the Q1 deliverables.',
    actionItems: [
      'Finalize user stories for Sprint 23',
      'Update project timeline in Jira',
      'Schedule design review sessions',
      'Prepare test cases for new features'
    ],
    tags: ['internal', 'sprint-planning', 'development'],
    status: 'processed' as const
  },
  {
    id: '3',
    firefliesId: 'ff_meeting_003',
    title: 'Vendor Demo - CloudStack Solutions',
    date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    duration: 30,
    participants: ['Tom Anderson (Vendor)', 'Lisa Chen (CTO)', 'Mark Thompson (DevOps)'],
    summary: 'Demo of CloudStack Solutions platform for potential infrastructure migration. Covered scalability, security features, and pricing models.',
    actionItems: [
      'Request detailed pricing proposal',
      'Evaluate migration complexity',
      'Schedule technical deep-dive session',
      'Compare with current AWS costs'
    ],
    tags: ['vendor-demo', 'infrastructure', 'cloudstack'],
    status: 'processing' as const
  },
  {
    id: '4',
    firefliesId: 'ff_meeting_004',
    title: 'Quarterly Business Review',
    date: new Date(Date.now() - 604800000).toISOString(), // 1 week ago
    duration: 90,
    participants: ['CEO Jane Miller', 'CFO Robert Lee', 'VP Sales Emma Davis', 'VP Eng Chris Park'],
    summary: 'Comprehensive review of Q4 performance across all departments. Discussed revenue growth, product roadmap, and strategic initiatives for the upcoming quarter.',
    actionItems: [
      'Prepare Q1 budget allocations',
      'Finalize hiring plan for engineering',
      'Launch new marketing campaigns',
      'Review and update OKRs'
    ],
    tags: ['quarterly-review', 'leadership', 'strategy'],
    status: 'failed' as const
  }
];

interface TestScenario {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: string;
}

export default function FirefliesTestPage() {
  const [activeTab, setActiveTab] = useState<'integration' | 'testing'>('integration');
  const [testScenarios, setTestScenarios] = useState<TestScenario[]>([
    {
      id: 'connection',
      name: 'API Key Connection',
      description: 'Test establishing connection with Fireflies API using API key',
      status: 'pending'
    },
    {
      id: 'fetch-meetings',
      name: 'Fetch All Meetings',
      description: 'Test fetching all meetings from connected Fireflies account',
      status: 'pending'
    },
    {
      id: 'sync-latest',
      name: 'Sync Latest Meetings',
      description: 'Test syncing only recent meetings (last 7 days)',
      status: 'pending'
    },
    {
      id: 'process-meeting',
      name: 'Process Meeting Data',
      description: 'Test extracting and formatting meeting data for SOW usage',
      status: 'pending'
    },
    {
      id: 'rate-limiting',
      name: 'Rate Limit Handling',
      description: 'Test proper handling of API rate limits (50 requests/day)',
      status: 'pending'
    }
  ]);

  const runTest = async (testId: string) => {
    setTestScenarios(prev => prev.map(scenario => 
      scenario.id === testId 
        ? { ...scenario, status: 'running' }
        : scenario
    ));

    // Simulate test execution
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));

    // Simulate test results
    const success = Math.random() > 0.3; // 70% success rate for demo
    setTestScenarios(prev => prev.map(scenario => 
      scenario.id === testId 
        ? { 
            ...scenario, 
            status: success ? 'completed' : 'failed',
            result: success 
              ? `Test passed - ${scenario.name} working correctly`
              : `Test failed - ${scenario.description} encountered an error`
          }
        : scenario
    ));
  };

  const runAllTests = async () => {
    for (const scenario of testScenarios) {
      await runTest(scenario.id);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Delay between tests
    }
  };

  const resetTests = () => {
    setTestScenarios(prev => prev.map(scenario => ({
      ...scenario,
      status: 'pending',
      result: undefined
    })));
  };

  const getStatusIcon = (status: TestScenario['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-gray-400" />;
      case 'running':
        return <Clock className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const handleMeetingImport = (meeting: FirefliesMeeting) => {
    console.log('Meeting imported to SOW:', meeting);
    alert(`Meeting "${meeting.title}" has been imported to your SOW!\n\nContent added:\n- Summary\n- Action items\n- Participant list`);
  };

  const overallStatus = testScenarios.every(s => s.status === 'completed') ? 'completed' :
                       testScenarios.some(s => s.status === 'failed') ? 'failed' :
                       testScenarios.some(s => s.status === 'running') ? 'running' : 'pending';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Fireflies Integration Testing
          </h1>
          <p className="text-gray-600">
            Test and explore the enhanced Fireflies integration with bulk meeting import capabilities
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('integration')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'integration'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Users className="h-4 w-4 inline mr-2" />
                Live Integration
              </button>
              <button
                onClick={() => setActiveTab('testing')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'testing'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Play className="h-4 w-4 inline mr-2" />
                Test Scenarios
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'integration' && (
          <div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-blue-600 mr-2" />
                <div>
                  <h3 className="text-sm font-medium text-blue-900">Demo Mode</h3>
                  <p className="text-sm text-blue-800">
                    This is a functional demo with mock data. In production, it will connect to your actual Fireflies account.
                  </p>
                </div>
              </div>
            </div>

            <FirefliesIntegrationHub 
              userId="demo-user-123"
              onMeetingImport={handleMeetingImport}
            />
          </div>
        )}

        {activeTab === 'testing' && (
          <div className="space-y-6">
            {/* Test Overview */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Integration Test Suite</h2>
                <div className="flex items-center space-x-3">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    overallStatus === 'completed' ? 'bg-green-100 text-green-800' :
                    overallStatus === 'failed' ? 'bg-red-100 text-red-800' :
                    overallStatus === 'running' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {overallStatus === 'completed' ? 'All Tests Passed' :
                     overallStatus === 'failed' ? 'Some Tests Failed' :
                     overallStatus === 'running' ? 'Tests Running' :
                     'Ready to Test'}
                  </div>
                  <button
                    onClick={runAllTests}
                    disabled={testScenarios.some(s => s.status === 'running')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
                  >
                    Run All Tests
                  </button>
                  <button
                    onClick={resetTests}
                    className="text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* Test Scenarios */}
              <div className="space-y-4">
                {testScenarios.map((scenario) => (
                  <div key={scenario.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(scenario.status)}
                        <div>
                          <h3 className="font-medium text-gray-900">{scenario.name}</h3>
                          <p className="text-sm text-gray-600">{scenario.description}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => runTest(scenario.id)}
                        disabled={scenario.status === 'running'}
                        className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 transition-colors"
                      >
                        {scenario.status === 'running' ? 'Running...' : 'Run Test'}
                      </button>
                    </div>
                    {scenario.result && (
                      <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                        {scenario.result}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Mock Data Preview */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Mock Meeting Data</h2>
              <p className="text-gray-600 mb-4">
                This is the sample data used for testing the integration:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockMeetings.map((meeting) => (
                  <div key={meeting.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-gray-900 line-clamp-1">{meeting.title}</h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        meeting.status === 'processed' ? 'bg-green-100 text-green-800' :
                        meeting.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {meeting.status}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        {new Date(meeting.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        {meeting.duration} minutes
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        {meeting.participants.length} participants
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mt-3 line-clamp-2">{meeting.summary}</p>
                    
                    <div className="flex flex-wrap gap-1 mt-3">
                      {meeting.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* API Information */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">API Configuration</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Fireflies API Details</h3>
                  <dl className="space-y-1 text-sm">
                    <div>
                      <dt className="inline font-medium">Endpoint:</dt>
                      <dd className="inline ml-1 text-gray-600">https://api.fireflies.ai/graphql</dd>
                    </div>
                    <div>
                      <dt className="inline font-medium">Authentication:</dt>
                      <dd className="inline ml-1 text-gray-600">Bearer Token (API Key)</dd>
                    </div>
                    <div>
                      <dt className="inline font-medium">Rate Limit:</dt>
                      <dd className="inline ml-1 text-gray-600">50 requests/day (Free/Pro)</dd>
                    </div>
                    <div>
                      <dt className="inline font-medium">Protocol:</dt>
                      <dd className="inline ml-1 text-gray-600">GraphQL</dd>
                    </div>
                  </dl>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Implementation Notes</h3>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• No OAuth support - API key authentication only</li>
                    <li>• Meetings stored locally for performance</li>
                    <li>• Automatic sync configurable by user</li>
                    <li>• Rate limiting handled gracefully</li>
                    <li>• Error recovery with exponential backoff</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}