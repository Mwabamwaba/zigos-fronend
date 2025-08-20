import { useState, useEffect } from 'react';
import { FileSpreadsheet, Clock, Users, TrendingUp, Download, Edit, Save, AlertTriangle, Send } from 'lucide-react';
import wbsApprovalService from '../../services/wbsApprovalService';
import { useNotification } from '../../hooks/useNotification';
import NotificationContainer from '../ui/NotificationContainer';

interface WBSItem {
  id: string;
  number: string;
  component: string;
  description: string;
  complexityRating: 'Low' | 'Medium' | 'High';
  hoursEstimate: number;
  platform?: string;
  isCategory?: boolean;
  totalHours?: number;
  parentId?: string;
  level: number;
}

interface GeneratedWBS {
  title: string;
  items: WBSItem[];
  totalEstimate: {
    hours: number;
    daysWithOneDev: number;
    daysWithTwoDevs: number;
  };
  summary: string;
}

export default function WorkBreakdownDisplay() {
  const [wbs, setWBS] = useState<GeneratedWBS | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedItems, setEditedItems] = useState<WBSItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { notifications, showNotification, hideNotification } = useNotification();

  useEffect(() => {
    loadWBS();
  }, []);

  const loadWBS = () => {
    try {
      const savedWBS = localStorage.getItem('generated_wbs');
      if (savedWBS) {
        const parsedWBS = JSON.parse(savedWBS);
        setWBS(parsedWBS);
        setEditedItems([...parsedWBS.items]);
      }
    } catch (error) {
      console.error('Failed to load WBS:', error);
    }
  };

  const saveWBS = () => {
    if (!wbs) return;
    
    const updatedWBS = {
      ...wbs,
      items: editedItems
    };
    
    // Recalculate totals
    updatedWBS.totalEstimate.hours = editedItems
      .filter(item => !item.isCategory)
      .reduce((sum, item) => sum + item.hoursEstimate, 0);
    updatedWBS.totalEstimate.daysWithOneDev = Math.ceil(updatedWBS.totalEstimate.hours / 8);
    updatedWBS.totalEstimate.daysWithTwoDevs = Math.ceil(updatedWBS.totalEstimate.hours / 16);
    
    localStorage.setItem('generated_wbs', JSON.stringify(updatedWBS));
    setWBS(updatedWBS);
    setIsEditing(false);
  };

  const updateItem = (itemId: string, field: keyof WBSItem, value: any) => {
    setEditedItems(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, [field]: value } : item
      )
    );
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'Low': return 'text-green-600 bg-green-50';
      case 'Medium': return 'text-yellow-600 bg-yellow-50';
      case 'High': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const exportToCSV = () => {
    if (!wbs) return;
    
    const csvContent = [
      'Number,Component,Complexity,Hours,Platform,Description',
      ...wbs.items.map(item => 
        `"${item.number}","${item.component}","${item.complexityRating}","${item.hoursEstimate}","${item.platform || ''}","${item.description}"`
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${wbs.title.replace(/\s+/g, '_')}_WBS.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleSubmitForApproval = async () => {
    if (!wbs) return;
    
    setIsSubmitting(true);
    try {
      // In a real app, you'd get the current user from authentication
      const currentUser = 'Current User'; // Placeholder
      const comments = 'WBS ready for review and approval';
      
      const approvalRequest = await wbsApprovalService.submitForApproval(
        wbs, 
        currentUser, 
        comments
      );
      
      showNotification({
        type: 'success',
        title: 'WBS Submitted for Approval',
        message: `Approval request ${approvalRequest.id} has been created`,
        duration: 5000,
        actions: [
          {
            label: 'View Approvals',
            action: () => window.location.href = '/approvals',
            primary: true
          }
        ]
      });
      
    } catch (error: any) {
      console.error('Failed to submit WBS for approval:', error);
      showNotification({
        type: 'error',
        title: 'Submission Failed',
        message: error.message || 'Failed to submit WBS for approval',
        duration: 6000
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!wbs) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center">
          <FileSpreadsheet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Work Breakdown Structure</h3>
          <p className="text-gray-600 mb-6">
            Use the Meeting Notes tab to select meetings and generate a WBS from your project discussions.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-left max-w-md mx-auto">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm text-blue-700">
                  <strong>How to generate a WBS:</strong>
                </p>
                <ol className="text-sm text-blue-600 mt-2 space-y-1">
                  <li>1. Go to Meeting Notes tab</li>
                  <li>2. Select relevant meetings using checkboxes</li>
                  <li>3. Click "Generate WBS" button</li>
                  <li>4. Return here to view and edit the structure</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{wbs.title}</h2>
            <p className="text-gray-600 mt-1">{wbs.summary}</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={exportToCSV}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            {isEditing ? (
              <button
                onClick={saveWBS}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit WBS</span>
                </button>
                <button
                  onClick={handleSubmitForApproval}
                  disabled={isSubmitting}
                  className="flex items-center space-x-1.5 px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isSubmitting ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>{isSubmitting ? 'Submitting...' : 'Submit for Approval'}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 hover:shadow-md transition-all">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-blue-100 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Total Hours</p>
                <p className="text-2xl font-bold text-blue-900">{wbs.totalEstimate.hours}</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 hover:shadow-md transition-all">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-green-100 rounded-lg">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-green-600 uppercase tracking-wide">Days (1 Developer)</p>
                <p className="text-2xl font-bold text-green-900">{wbs.totalEstimate.daysWithOneDev}</p>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 hover:shadow-md transition-all">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-purple-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-purple-600 uppercase tracking-wide">Days (2 Developers)</p>
                <p className="text-2xl font-bold text-purple-900">{wbs.totalEstimate.daysWithTwoDevs}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* WBS Table */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Component</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Complexity</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Platform</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(isEditing ? editedItems : wbs.items).map((item, index) => (
                  <tr 
                    key={item.id} 
                    className={`${item.isCategory ? 'bg-blue-50' : ''} ${index % 2 === 0 ? '' : 'bg-gray-50'}`}
                  >
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.number}
                    </td>
                    <td className="px-4 py-4">
                      {isEditing ? (
                        <input
                          type="text"
                          value={item.component}
                          onChange={(e) => updateItem(item.id, 'component', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                        />
                      ) : (
                        <div className={`text-sm ${item.isCategory ? 'font-bold text-blue-900' : 'text-gray-900'}`}>
                          {item.component}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {isEditing && !item.isCategory ? (
                        <select
                          value={item.complexityRating}
                          onChange={(e) => updateItem(item.id, 'complexityRating', e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded-md text-sm"
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                        </select>
                      ) : !item.isCategory ? (
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getComplexityColor(item.complexityRating)}`}>
                          {item.complexityRating}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {isEditing && !item.isCategory ? (
                        <input
                          type="number"
                          value={item.hoursEstimate}
                          onChange={(e) => updateItem(item.id, 'hoursEstimate', parseInt(e.target.value) || 0)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm"
                        />
                      ) : (
                        <div className={`text-sm ${item.isCategory ? 'font-bold text-blue-900' : 'text-gray-900'}`}>
                          {item.isCategory ? item.totalHours || item.hoursEstimate : item.hoursEstimate}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {isEditing && !item.isCategory ? (
                        <input
                          type="text"
                          value={item.platform || ''}
                          onChange={(e) => updateItem(item.id, 'platform', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                          placeholder="Platform"
                        />
                      ) : (
                        <div className="text-sm text-gray-600">
                          {item.platform || ''}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {isEditing ? (
                        <textarea
                          value={item.description}
                          onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm resize-none"
                          rows={2}
                        />
                      ) : (
                        <div className="text-sm text-gray-600">
                          {item.description}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Notifications */}
      <NotificationContainer 
        notifications={notifications} 
        onDismiss={hideNotification} 
      />
    </div>
  );
}
