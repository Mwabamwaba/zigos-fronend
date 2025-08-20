import React, { useState, useEffect } from 'react';
import { Save, Eye, FileText } from 'lucide-react';
import { SOWTemplate, templateService, TemplateProcessingRequest } from '../../services/templateService';
import { ProcessedTemplate } from '../../types/sow';

interface TemplateFormProps {
  template: SOWTemplate;
  clientId: string;
  projectName: string;
  onTemplateProcessed: (processedTemplate: ProcessedTemplate) => void;
  onSaveDraft?: (formData: Record<string, string>) => void;
}

export const TemplateForm: React.FC<TemplateFormProps> = ({
  template,
  clientId,
  projectName,
  onTemplateProcessed,
  onSaveDraft
}) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [processedTemplate, setProcessedTemplate] = useState<ProcessedTemplate | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const showToastMessage = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000); // Show for 3 seconds
  };

  useEffect(() => {
    // Initialize form data with empty values for all placeholders
    const initialData: Record<string, string> = {};
    template.placeholders.forEach(placeholder => {
      // Remove {{ }} brackets for display
      const cleanPlaceholder = placeholder.replace(/[{}]/g, '');
      initialData[cleanPlaceholder] = '';
    });
    
    // Set some default values
    initialData['CLIENT_NAME'] = clientId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    initialData['PROJECT_NAME'] = projectName;
    initialData['START_DATE'] = new Date().toISOString().split('T')[0];
    initialData['END_DATE'] = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    setFormData(initialData);
  }, [template, clientId, projectName]);

  const handleInputChange = (placeholder: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [placeholder]: value
    }));
  };

  const handleProcessTemplate = async () => {
    setIsProcessing(true);
    try {
      // Convert form data back to {{PLACEHOLDER}} format for API
      const placeholderValues: Record<string, string> = {};
      Object.entries(formData).forEach(([key, value]) => {
        placeholderValues[`{{${key}}}`] = value;
      });

      const request: TemplateProcessingRequest = {
        templateId: template.id,
        placeholderValues,
        clientId,
        projectName
      };

      const processed = await templateService.processTemplate(request);
      setProcessedTemplate(processed);
      onTemplateProcessed(processed);
      setShowPreview(true);
    } catch (error) {
      console.error('Failed to process template:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      // Get the raw template content with placeholders replaced
      const placeholderValues: Record<string, string> = {};
      Object.entries(formData).forEach(([key, value]) => {
        placeholderValues[`{{${key}}}`] = value;
      });

      const request: TemplateProcessingRequest = {
        templateId: template.id,
        placeholderValues,
        clientId,
        projectName
      };

      // Get the raw template content (exact template copy with placeholders replaced)
      const rawContent = await templateService.getRawTemplateContent(request);
      
      // Create a mock ProcessedTemplate object with the raw content
      const mockProcessedTemplate = {
        templateId: template.id,
        title: projectName,
        executiveSummary: rawContent, // Put the entire template content here
        projectScope: '',
        deliverables: [],
        timeline: [],
        pricing: [],
        termsAndConditions: '',
        assumptions: [],
        processedAt: new Date().toISOString()
      };

      // Process template and populate SOW immediately (before alert)
      if (onTemplateProcessed) {
        onTemplateProcessed(mockProcessedTemplate);
      }
      
      // Save the draft immediately
      if (onSaveDraft) {
        onSaveDraft(formData);
      }
      
      // Show success feedback after SOW is already populated (non-blocking)
      setTimeout(() => {
        showToastMessage('Draft saved and SOW generated successfully!');
      }, 100); // Small delay to ensure SOW populates first
    } catch (error) {
      console.error('Failed to save draft:', error);
      showToastMessage('Failed to save draft. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const getPlaceholderLabel = (placeholder: string): string => {
    return placeholder
      .replace(/[{}]/g, '')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const getPlaceholderType = (placeholder: string): string => {
    const cleanPlaceholder = placeholder.toLowerCase();
    if (cleanPlaceholder.includes('date')) return 'date';
    if (cleanPlaceholder.includes('cost') || cleanPlaceholder.includes('price')) return 'text';
    if (cleanPlaceholder.includes('email')) return 'email';
    if (cleanPlaceholder.includes('phone')) return 'tel';
    return 'text';
  };

  const isRequiredField = (placeholder: string): boolean => {
    const requiredFields = ['CLIENT_NAME', 'PROJECT_NAME', 'TOTAL_COST'];
    return requiredFields.includes(placeholder.replace(/[{}]/g, ''));
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-blue-600" />
          <h3 className="font-medium text-blue-900">Template: {template.name}</h3>
        </div>
        <p className="text-blue-700 text-sm mt-1">{template.description}</p>
        <div className="flex items-center space-x-4 mt-2 text-xs text-blue-600">
          <span>Estimated: {template.estimatedHours} hours</span>
          <span>{template.placeholders.length} fields to complete</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {template.placeholders.map((placeholder) => {
          const cleanPlaceholder = placeholder.replace(/[{}]/g, '');
          const fieldType = getPlaceholderType(placeholder);
          const isRequired = isRequiredField(placeholder);

          return (
            <div key={placeholder} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {getPlaceholderLabel(placeholder)}
                {isRequired && <span className="text-red-500 ml-1">*</span>}
              </label>
              
              {fieldType === 'date' ? (
                <input
                  type="date"
                  value={formData[cleanPlaceholder] || ''}
                  onChange={(e) => handleInputChange(cleanPlaceholder, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required={isRequired}
                />
              ) : cleanPlaceholder.includes('DESCRIPTION') || cleanPlaceholder.includes('SCOPE') ? (
                <textarea
                  value={formData[cleanPlaceholder] || ''}
                  onChange={(e) => handleInputChange(cleanPlaceholder, e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={`Enter ${getPlaceholderLabel(placeholder).toLowerCase()}`}
                  required={isRequired}
                />
              ) : (
                <input
                  type={fieldType}
                  value={formData[cleanPlaceholder] || ''}
                  onChange={(e) => handleInputChange(cleanPlaceholder, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={`Enter ${getPlaceholderLabel(placeholder).toLowerCase()}`}
                  required={isRequired}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="flex space-x-4 pt-6 border-t border-gray-200">
        {onSaveDraft && (
          <button
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Draft</span>
              </>
            )}
          </button>
        )}
        
        <button
          onClick={handleProcessTemplate}
          disabled={isProcessing}
          className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Processing...</span>
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" />
              <span>Generate SOW Preview</span>
            </>
          )}
        </button>
      </div>

      {showPreview && processedTemplate && (
        <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Generated SOW Preview</h3>
          <div className="bg-white p-6 rounded border space-y-4 max-h-96 overflow-y-auto">
            <div>
              <h4 className="font-semibold text-gray-900">{processedTemplate.title}</h4>
              <p className="text-sm text-gray-500">Generated on {new Date(processedTemplate.processedAt).toLocaleDateString()}</p>
            </div>
            
            {processedTemplate.executiveSummary && (
              <div>
                <h5 className="font-medium text-gray-800">Executive Summary</h5>
                <p className="text-gray-700 text-sm">{processedTemplate.executiveSummary}</p>
              </div>
            )}
            
            {processedTemplate.projectScope && (
              <div>
                <h5 className="font-medium text-gray-800">Project Scope</h5>
                <p className="text-gray-700 text-sm">{processedTemplate.projectScope}</p>
              </div>
            )}
            
            {processedTemplate.deliverables && processedTemplate.deliverables.length > 0 && (
              <div>
                <h5 className="font-medium text-gray-800">Deliverables</h5>
                <ul className="list-disc list-inside text-gray-700 text-sm">
                  {processedTemplate.deliverables.map((deliverable, index) => (
                    <li key={index}>{deliverable}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 z-50 transform transition-all duration-300 ease-in-out animate-slide-in-right">
          <div className={`${
            toastType === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 transform transition-all duration-300`}>
            <div className={`w-2 h-2 bg-white rounded-full ${
              toastType === 'success' ? 'animate-pulse' : 'animate-bounce'
            }`}></div>
            <span className="font-medium">{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};