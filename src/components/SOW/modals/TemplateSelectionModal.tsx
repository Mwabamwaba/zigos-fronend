import React from 'react';
import { X, FileText, Check, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSOWStore } from '../../../store/sowStore';
import { useTemplateStore } from '../../../store/templateStore';
import { sowService } from '../../../services/sowService';

interface Deal {
  id: string;
  name: string;
  company: string;
  value: number;
}

interface TemplateSelectionModalProps {
  deal: Deal;
  contact?: {
    firstName?: string;
    lastName?: string;
    jobTitle?: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  onClose: () => void;
}

export default function TemplateSelectionModal({ deal, contact, onClose }: TemplateSelectionModalProps) {
  const navigate = useNavigate();
  const { templates, getTemplateByName } = useTemplateStore();
  const { createFromDeal, insertFromTemplate, createFromTemplateByName } = useSOWStore();
  const [selectedMode, setSelectedMode] = React.useState<'ai' | 'predefined'>('ai');
  const [isCreating, setIsCreating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleCreate = async () => {
    setError(null);
    setIsCreating(true);
    try {
      let sowId: string;
      if (selectedMode === 'predefined') {
        const templateName = 'SOW Template';
        const exists = getTemplateByName(templateName);
        if (!exists) {
          setError('The "SOW Template" is missing. Please contact an administrator.');
          setIsCreating(false);
          return;
        }
        try {
          const created = await sowService.createFromTemplate({ templateName, title: deal.name, clientId: deal.id, generatedBy: 'current-user' });
          sowId = created.id;
          insertFromTemplate({ id: sowId, templateName, title: deal.name, clientId: deal.id, generatedBy: 'current-user' });
        } catch (err: any) {
          // Fallback: if backend route is missing (404) or network error, create locally so user can proceed
          if (err?.status === 404 || err?.message?.toLowerCase?.().includes('not found') || err?.name === 'TypeError') {
            sowId = createFromTemplateByName({ templateName, title: deal.name, clientId: deal.id, generatedBy: 'current-user' });
          } else {
            throw err;
          }
        }
      } else {
        // Use the first available template or a default one for AI mode
        const defaultTemplate = templates[0]?.id || 'default-template';
        sowId = createFromDeal(
          deal.id,
          deal.name,
          deal.company,
          deal.value,
          defaultTemplate
        );
      }
      navigate(`/sow/${sowId}`, { 
        state: { 
          dealId: deal.id,
          dealName: deal.name,
          company: deal.company,
          value: deal.value,
          contact: contact,
        } 
      });
      onClose();
    } catch (e: any) {
      setError(e?.message ?? 'Failed to create SOW.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-sm max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Select Template</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-600 leading-relaxed">
            Choose a template to start with. You can customize it further after creation.
          </p>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-1 gap-4">
            <button
              onClick={() => setSelectedMode('ai')}
              className={`w-full flex items-start p-4 rounded-2xl border transition ${
                selectedMode === 'ai' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex-1 text-left">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900">Standard SOW Template</h3>
                </div>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                  Traditional SOW structure with predefined sections. Fully customizable after creation.
                </p>
              </div>
              {selectedMode === 'ai' && <Check className="w-5 h-5 text-blue-600" />}
            </button>

            <button
              onClick={() => setSelectedMode('predefined')}
              className={`w-full flex items-start p-4 rounded-2xl border transition ${
                selectedMode === 'predefined' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex-1 text-left">
                <div className="flex items-center space-x-3">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  <h3 className="text-lg font-semibold text-gray-900">AI-Assisted Template</h3>
                </div>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                  Smart template with AI assistance. Placeholders can be auto-filled via HubSpot integration.
                </p>
              </div>
              {selectedMode === 'predefined' && <Check className="w-5 h-5 text-blue-600" />}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-2xl">
              <p className="text-sm text-red-600 leading-relaxed">{error}</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={isCreating}
              className={`px-4 py-2 rounded-lg transition ${
                isCreating 
                  ? 'bg-blue-400 text-white cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isCreating ? 'Creating…' : 'Create SOW'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}