import React from 'react';
import { Search, X, Plus } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';
// import { useSOWStore } from '../store/sowStore';
import TemplateSelectionModal from './SOW/modals/TemplateSelectionModal';
import hubspotService, { HubSpotCompany, HubSpotContact } from '../services/hubspotService';

interface Deal {
  id: string;
  name: string;
  company: string;
  value: number;
  stage?: string;
  lastActivity?: string;
}

export default function ClientSelectionModal({ onClose }: { onClose: () => void }) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedDeal, setSelectedDeal] = React.useState<Deal | null>(null);
  const [isNewClient, setIsNewClient] = React.useState(false);
  const [companies, setCompanies] = React.useState<HubSpotCompany[]>([]);
  const [companyContacts, setCompanyContacts] = React.useState<Record<string, HubSpotContact | null>>({});
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showTemplateModal, setShowTemplateModal] = React.useState(false);
  // const navigate = useNavigate();
  // const { createFromDeal } = useSOWStore();

  React.useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // Validate token before calling
        const token = hubspotService.getAccessToken?.();
        if (!token) {
          setError('HubSpot not connected');
          setCompanies([]);
          return;
        }
        const list = await hubspotService.getCompanies();
        setCompanies(list);
        // Prefetch first company's primary contact if needed (optional)
      } catch (e: any) {
        setError(e?.message || 'Failed to load companies from HubSpot');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredDeals = companies
    .map<Deal>(c => ({ id: c.id, name: c.name, company: c.name, value: 0 }))
    .filter(deal =>
      deal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.company.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const handleDealSelect = async (deal: Deal) => {
    setSelectedDeal(deal);
    setIsNewClient(false);
    if (!companyContacts[deal.id]) {
      try {
        const contact = await hubspotService.getCompanyPrimaryContact(deal.id);
        setCompanyContacts(prev => ({ ...prev, [deal.id]: contact }));
      } catch {
        setCompanyContacts(prev => ({ ...prev, [deal.id]: null }));
      }
    }
  };

  const handleNewClientSelect = () => {
    setSelectedDeal({
      id: 'new-client',
      name: 'New Client',
      company: 'New Client',
      value: 0
    });
    setIsNewClient(true);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] flex flex-col">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Select Client</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search clients..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <div className="space-y-2">
            {/* New Client Option */}
            <button
              className={`w-full text-left p-4 rounded-lg border ${
                isNewClient
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
              onClick={handleNewClientSelect}
            >
              <div className="flex items-center">
                <Plus className="w-5 h-5 text-blue-600 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900">New Client</h3>
                  <p className="text-sm text-gray-500">Create SOW for a client not in HubSpot</p>
                </div>
              </div>
            </button>

            {loading && <div className="text-sm text-gray-500">Loading companies…</div>}
            {error && <div className="text-sm text-red-600">{error}</div>}
            {filteredDeals.map((deal) => (
              <button
                key={deal.id}
                className={`w-full text-left p-4 rounded-lg border ${
                  selectedDeal?.id === deal.id && !isNewClient
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => handleDealSelect(deal)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{deal.name}</h3>
                    <p className="text-sm text-gray-500">{deal.company}</p>
                    {companyContacts[deal.id] && (
                      <p className="text-xs text-gray-500 mt-1">
                        Contact: {companyContacts[deal.id]?.firstName} {companyContacts[deal.id]?.lastName} {companyContacts[deal.id]?.jobTitle ? `• ${companyContacts[deal.id]?.jobTitle}` : ''}
                      </p>
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-900"></span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={() => setShowTemplateModal(true)}
            disabled={!selectedDeal}
            className={`px-4 py-2 rounded-md ${
              selectedDeal
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            Proceed with Selected Client
          </button>
        </div>
      </div>
      
      {showTemplateModal && selectedDeal && (
        <TemplateSelectionModal
          deal={{
            ...selectedDeal,
            company: selectedDeal.company,
          }}
          contact={isNewClient ? undefined : (companyContacts[selectedDeal.id] || undefined)}
          onClose={() => {
            setShowTemplateModal(false);
            onClose();
          }}
        />
      )}
    </div>
  );
}