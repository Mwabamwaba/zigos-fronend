import React from 'react';
import { useLocation } from 'react-router-dom';
import { Plus, FileText, Copy, Trash2, Eye, Edit2, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useTemplateStore } from '../store/templateStore';
import { Template } from '../types';
import Editor from '@monaco-editor/react';
import firefliesService from '../services/firefliesService';

export default function Settings() {
  const location = useLocation();
  
  // Check URL parameters for initial tab
  const getInitialTab = (): 'templates' | 'integrations' | 'workflow' => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    return tabParam === 'integrations' || tabParam === 'workflow' ? tabParam : 'templates';
  };
  
  const [activeTab, setActiveTab] = React.useState<'templates' | 'integrations' | 'workflow'>(getInitialTab());
  const [newTemplateName, setNewTemplateName] = React.useState('');
  const [selectedTemplate, setSelectedTemplate] = React.useState<Template | null>(null);
  const [editedContent, setEditedContent] = React.useState('');
  const [isEditing, setIsEditing] = React.useState(false);
  const [showPreview, setShowPreview] = React.useState(false);
  
  // Fireflies integration state
  const [firefliesApiKey, setFirefliesApiKey] = React.useState('');
  const [firefliesConnectionStatus, setFirefliesConnectionStatus] = React.useState<'idle' | 'testing' | 'connected' | 'failed'>('idle');
  const [firefliesError, setFirefliesError] = React.useState('');
  const [hubspotConnected, setHubspotConnected] = React.useState(false);
  
  const { templates, addTemplate, updateTemplate, deleteTemplate } = useTemplateStore();

  // Update active tab when URL parameters change
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam === 'integrations' || tabParam === 'workflow') {
      setActiveTab(tabParam);
    }
  }, [location.search]);

  const handleAddTemplate = () => {
    if (!newTemplateName.trim()) return;
    
    const newTemplate: Template = {
      id: Date.now().toString(),
      name: newTemplateName,
      content: '',
      sections: [],
    };
    
    addTemplate(newTemplate);
    setNewTemplateName('');
  };

  const handleConnectFireflies = async () => {
    if (!firefliesApiKey.trim()) {
      setFirefliesError('Please enter your Fireflies API key');
      return;
    }

    setFirefliesConnectionStatus('testing');
    setFirefliesError('');

    try {
      console.log('Testing Fireflies connection...');
      
      // Test the connection by trying to transcribe with a test URL
      // This will validate the API key without actually processing audio
      const testRequest = {
        meeting_url: 'https://httpbin.org/status/404', // This will fail but validate auth
        title: 'Connection Test'
      };

      // We expect this to fail due to invalid URL, but if it fails with auth error, we know the key is wrong
      try {
        await firefliesService.transcribeAudio(testRequest);
      } catch (error: any) {
        // Check if it's an authentication error vs other error
        if (error.message.includes('401') || error.message.includes('403') || error.message.includes('Unauthorized')) {
          throw new Error('Invalid API key. Please check your Fireflies API key.');
        }
        // If it's not an auth error, the key is probably valid
        console.log('API key appears to be valid (non-auth error occurred)');
      }

      setFirefliesConnectionStatus('connected');
      console.log('Fireflies connection successful!');
      
      // Save to localStorage for persistence
      localStorage.setItem('fireflies_api_key', firefliesApiKey);
      
    } catch (error: any) {
      console.error('Fireflies connection failed:', error);
      setFirefliesConnectionStatus('failed');
      setFirefliesError(error.message || 'Connection failed. Please check your API key.');
    }
  };

  // Load saved API key on component mount
  React.useEffect(() => {
    const savedKey = localStorage.getItem('fireflies_api_key');
    if (savedKey) {
      setFirefliesApiKey(savedKey);
      setFirefliesConnectionStatus('connected');
    }
    const hasToken = !!localStorage.getItem('hubspot_access_token');
    setHubspotConnected(hasToken);
  }, []);

  const handleUpdateTemplate = () => {
    if (!selectedTemplate) return;
    updateTemplate(selectedTemplate.id, { content: editedContent });
    setIsEditing(false);
  };

  const handleDeleteTemplate = (id: string) => {
    deleteTemplate(id);
    if (selectedTemplate?.id === id) {
      setSelectedTemplate(null);
      setEditedContent('');
    }
  };

  const handleDuplicateTemplate = (template: Template) => {
    const duplicatedTemplate: Template = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Copy)`,
    };
    addTemplate(duplicatedTemplate);
  };

  const handleConnectHubSpot = () => {
    const clientId = import.meta.env.VITE_HUBSPOT_CLIENT_ID as string;
    const redirectUri = (import.meta.env.VITE_HUBSPOT_REDIRECT_URI as string) || `${window.location.origin}/oauth/hubspot/callback`;
    if (!clientId) {
      console.error('Missing VITE_HUBSPOT_CLIENT_ID');
      return;
    }

    const scopes = [
      'crm.objects.companies.read',
      'crm.objects.contacts.read',
      'crm.objects.deals.read',
    ].join(' ');

    const baseUrl = 'https://app.hubspot.com/oauth/authorize';
    const url = `${baseUrl}?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&response_type=code`;
    window.location.href = url;
  };

  return (
    <div className="h-full bg-gray-50 overflow-auto">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        </div>

        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('templates')}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'templates'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Templates
              </button>
              <button
                onClick={() => setActiveTab('integrations')}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'integrations'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Integrations
              </button>
              <button
                onClick={() => setActiveTab('workflow')}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'workflow'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Workflow
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'templates' && (
              <div className="flex space-x-4">
                <div className="w-1/3 border-r border-gray-200 pr-4">
                  <div className="mb-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder="New template name"
                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        value={newTemplateName}
                        onChange={(e) => setNewTemplateName(e.target.value)}
                      />
                      <button
                        onClick={handleAddTemplate}
                        className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {templates.map((template) => (
                      <div
                        key={template.id}
                        className={`w-full flex items-center justify-between p-2 rounded-md ${
                          selectedTemplate?.id === template.id
                            ? 'bg-blue-50 border border-blue-200'
                            : 'hover:bg-gray-50'
                        } cursor-pointer`}
                        onClick={() => {
                          setSelectedTemplate(template);
                          setEditedContent(template.content);
                          setIsEditing(false);
                        }}
                      >
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{template.name}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDuplicateTemplate(template);
                            }}
                            className="p-1 text-gray-400 hover:text-gray-500"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTemplate(template.id);
                            }}
                            className="p-1 text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex-1">
                  {selectedTemplate ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900">
                          {selectedTemplate.name}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setShowPreview(!showPreview)}
                            className={`flex items-center space-x-1 px-3 py-2 rounded-md ${
                              showPreview
                                ? 'bg-gray-100 text-gray-700'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <Eye className="w-4 h-4" />
                            <span>Preview</span>
                          </button>
                          <button
                            onClick={() => {
                              if (isEditing) {
                                handleUpdateTemplate();
                              } else {
                                setIsEditing(true);
                              }
                            }}
                            className={`flex items-center space-x-1 px-3 py-2 rounded-md ${
                              isEditing
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <Edit2 className="w-4 h-4" />
                            <span>{isEditing ? 'Save' : 'Edit'}</span>
                          </button>
                        </div>
                      </div>

                      {showPreview ? (
                        <div className="prose prose-sm max-w-none border rounded-md p-4">
                          {editedContent}
                        </div>
                      ) : (
                        <Editor
                          height="400px"
                          defaultLanguage="html"
                          value={editedContent}
                          onChange={(value) => setEditedContent(value || '')}
                          options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            readOnly: !isEditing,
                          }}
                        />
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-64 text-gray-500">
                      Select a template to view or edit
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'integrations' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">CRM Integration</h3>
                  <div className="space-y-4">
                    {hubspotConnected && (
                      <div className="flex items-center space-x-2 text-green-600">
                        <CheckCircle className="w-5 h-5" />
                        <span className="text-sm">Connected to HubSpot</span>
                      </div>
                    )}
                    <button
                      onClick={handleConnectHubSpot}
                      disabled={hubspotConnected}
                      className={`px-4 py-2 rounded-md ${hubspotConnected ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                    >
                      {hubspotConnected ? 'Connected' : 'Connect HubSpot'}
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">AI Note Taker Integration</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Fireflies.ai API Key</label>
                      <input
                        type="password"
                        value={firefliesApiKey}
                        onChange={(e) => setFirefliesApiKey(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Enter your Fireflies.ai API key"
                        disabled={firefliesConnectionStatus === 'testing'}
                      />
                    </div>
                    
                    {/* Connection Status */}
                    {firefliesConnectionStatus === 'connected' && (
                      <div className="flex items-center space-x-2 text-green-600">
                        <CheckCircle className="w-5 h-5" />
                        <span className="text-sm">Connected to Fireflies.ai</span>
                      </div>
                    )}
                    
                    {firefliesConnectionStatus === 'failed' && firefliesError && (
                      <div className="flex items-center space-x-2 text-red-600">
                        <XCircle className="w-5 h-5" />
                        <span className="text-sm">{firefliesError}</span>
                      </div>
                    )}
                    
                    <div className="flex space-x-3">
                      <button 
                        onClick={handleConnectFireflies}
                        disabled={firefliesConnectionStatus === 'testing'}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {firefliesConnectionStatus === 'testing' ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Testing Connection...</span>
                          </>
                        ) : firefliesConnectionStatus === 'connected' ? (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            <span>Reconnect</span>
                          </>
                        ) : (
                          <span>Connect Fireflies.ai</span>
                        )}
                      </button>
                    </div>
                    
                    <div className="text-sm text-gray-500 space-y-2">
                      <p>Get your API key from <a href="https://fireflies.ai/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Fireflies.ai API Keys page</a></p>
                      {firefliesConnectionStatus === 'connected' && (
                        <p className="text-blue-600">✓ Connected! Access meeting notes in the SOW Builder → Meeting Notes tab</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Digital Signature Integration</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">DocuSign API Key</label>
                      <input
                        type="password"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Enter your DocuSign API key"
                      />
                    </div>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                      Connect DocuSign
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'workflow' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Approval Chain Configuration</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Number of Required Approvers
                      </label>
                      <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                        <option>1</option>
                        <option>2</option>
                        <option>3</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Value Threshold for Additional Approval
                      </label>
                      <input
                        type="number"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Enter amount"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="email-notifications"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="email-notifications" className="ml-2 text-sm text-gray-700">
                        Enable email notifications
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="slack-notifications"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="slack-notifications" className="ml-2 text-sm text-gray-700">
                        Enable Slack notifications
                      </label>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Escalation Rules</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Escalation Timeout (hours)
                      </label>
                      <input
                        type="number"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Enter hours"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Escalation Path
                      </label>
                      <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                        <option>Team Lead</option>
                        <option>Department Head</option>
                        <option>Executive</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}