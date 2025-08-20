import React from 'react';
import { BarChart3, Users, AlertTriangle, Clock, ArrowUpDown, Search, Filter, Grid, List, Plus, TrendingUp, TrendingDown, Bell } from 'lucide-react';
import { format } from 'date-fns';
import { SOWDocument } from '../types';
import { pastSows } from '../data/pastSows';
import ClientSelectionModal from './ClientSelectionModal';
import { useNavigate } from 'react-router-dom';
import { useProjectStore } from '../store/projectStore';

export default function Dashboard() {
  const navigate = useNavigate();
  const { projects } = useProjectStore();
  const [viewMode, setViewMode] = React.useState<'list' | 'grid'>('list');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [showClientModal, setShowClientModal] = React.useState(false);

  const totalValue = pastSows.reduce((sum, sow) => sum + (sow.value || 0), 0);
  const targetValue = 1000000;
  const progressPercentage = Math.min((totalValue / targetValue) * 100, 100);
  
  const activeClients = new Set(pastSows.map(sow => sow.client)).size;
  const clientGrowth = 15;
  
  const pendingApprovals = pastSows.filter(sow => sow.status === 'pending_review').length;
  const expiringCount = 2;

  const urgentItems = pastSows
    .filter(sow => sow.status === 'pending_review' || sow.status === 'draft')
    .slice(0, 3);

  const recentUpdates = [...pastSows]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3);

  const filteredSows = pastSows.filter(sow => {
    const matchesSearch = sow.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sow.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sow.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleRowClick = (sow: SOWDocument) => {
    // Check if a project exists for this SOW
    const existingProject = projects.find(p => p.sowId === sow.id);
    
    if (existingProject) {
      // If project exists, go to project management view
      navigate(`/project/${sow.id}/manage`);
    } else {
      // If no project exists yet, go to project details view
      navigate(`/project/${sow.id}`);
    }
  };

  const getStatusColor = (status: SOWDocument['status']) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      pending_review: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return colors[status] || colors.draft;
  };

  return (
    <div className="h-full bg-gray-50 overflow-auto">
      <div className="max-w-7xl mx-auto py-6 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <button
            onClick={() => setShowClientModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            <span>New SOW</span>
          </button>
        </div>

        {/* Analytics Header */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Value with Progress */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Total SOW Value</p>
                <p className="text-2xl font-semibold text-gray-900">${totalValue.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 rounded-full h-2" 
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              {progressPercentage.toFixed(1)}% of ${targetValue.toLocaleString()} target
            </p>
          </div>

          {/* Active Clients with Trend */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Clients</p>
                <p className="text-2xl font-semibold text-gray-900">{activeClients}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {clientGrowth > 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <span className={`text-sm ${clientGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {clientGrowth}% from last month
              </span>
            </div>
          </div>

          {/* Pending Approvals */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                <p className="text-2xl font-semibold text-gray-900">{pendingApprovals}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500">
              {pendingApprovals} SOWs awaiting review
            </p>
          </div>

          {/* Contract Alerts */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Contract Alerts</p>
                <p className="text-2xl font-semibold text-gray-900">{expiringCount}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <Bell className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <p className="text-sm text-red-500">
              {expiringCount} contracts expiring soon
            </p>
          </div>
        </div>

        {/* Action Items */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Urgent Items */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Urgent Items</h2>
            </div>
            <div className="p-6 space-y-4">
              {urgentItems.map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-center justify-between cursor-pointer hover:bg-gray-50 -mx-4 px-4 py-2 rounded-lg"
                  onClick={() => handleRowClick(item)}
                >
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{item.title}</h3>
                    <p className="text-sm text-gray-500">{item.client}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    item.status === 'pending_review' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {item.status.replace('_', ' ').charAt(0).toUpperCase() + item.status.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Updates */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Recent Updates</h2>
            </div>
            <div className="p-6 space-y-4">
              {recentUpdates.map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-center justify-between cursor-pointer hover:bg-gray-50 -mx-4 px-4 py-2 rounded-lg"
                  onClick={() => handleRowClick(item)}
                >
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{item.title}</h3>
                    <p className="text-sm text-gray-500">{item.client}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-gray-500">
                      {format(new Date(item.updatedAt), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Repository */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex items-center space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search SOWs..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select
                  className="pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="pending_review">Pending Review</option>
                  <option value="approved">Approved</option>
                  <option value="completed">Completed</option>
                </select>
                <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                  <Filter className="w-4 h-4" />
                  <span>Advanced Filters</span>
                </button>
              </div>
              <div className="ml-4 flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                >
                  <List className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {viewMode === 'list' ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button className="flex items-center space-x-1">
                        <span>Title</span>
                        <ArrowUpDown className="w-4 h-4" />
                      </button>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button className="flex items-center space-x-1">
                        <span>Client</span>
                        <ArrowUpDown className="w-4 h-4" />
                      </button>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button className="flex items-center space-x-1">
                        <span>Value</span>
                        <ArrowUpDown className="w-4 h-4" />
                      </button>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button className="flex items-center space-x-1">
                        <span>Last Updated</span>
                        <ArrowUpDown className="w-4 h-4" />
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSows.map((sow) => (
                    <tr
                      key={sow.id}
                      onClick={() => handleRowClick(sow)}
                      className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{sow.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{sow.client}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(sow.status)}`}>
                          {sow.status.replace('_', ' ').charAt(0).toUpperCase() + sow.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {sow.value ? `$${sow.value.toLocaleString()}` : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {format(new Date(sow.updatedAt), 'MMM d, yyyy')}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSows.map((sow) => (
                <div
                  key={sow.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md cursor-pointer"
                  onClick={() => handleRowClick(sow)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{sow.title}</h3>
                      <p className="text-sm text-gray-500">{sow.client}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(sow.status)}`}>
                      {sow.status.replace('_', ' ').charAt(0).toUpperCase() + sow.status.slice(1)}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      ${sow.value?.toLocaleString() || '-'}
                    </span>
                    <span className="text-gray-500">
                      {format(new Date(sow.updatedAt), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {showClientModal && (
          <ClientSelectionModal onClose={() => setShowClientModal(false)} />
        )}
      </div>
    </div>
  );
}