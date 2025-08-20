import React from 'react';
import { BarChart3, Users, Clock, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { SOWDocument } from '../../types/sow';
import { format } from 'date-fns';

interface SOWAnalyticsProps {
  sows: SOWDocument[];
  onCreateNew: () => void;
  onUpdateStatus: (id: string, status: string) => void;
}

export default function SOWAnalytics({ sows, onCreateNew, onUpdateStatus }: SOWAnalyticsProps) {
  const totalValue = sows.reduce((sum, sow) => sum + sow.value, 0);
  const targetValue = 1000000; // Example target
  const progressPercentage = Math.min((totalValue / targetValue) * 100, 100);

  const uniqueClients = new Set(sows.map(sow => sow.client)).size;
  const clientGrowth = 15; // Example growth rate

  const pendingApprovals = sows.filter(sow => sow.status === 'pending_review').length;
  const expiringCount = sows.filter(sow => {
    const lastUpdate = new Date(sow.updatedAt);
    const daysSinceUpdate = Math.floor((Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceUpdate > 30;
  }).length;

  return (
    <div className="space-y-6">
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Value */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Total SOW Value</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${totalValue.toLocaleString()}
              </p>
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

        {/* Active Clients */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Clients</p>
              <p className="text-2xl font-semibold text-gray-900">{uniqueClients}</p>
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

        {/* Expiring SOWs */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Expiring SOWs</p>
              <p className="text-2xl font-semibold text-gray-900">{expiringCount}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <p className="text-sm text-red-500">
            {expiringCount} SOWs need attention
          </p>
        </div>
      </div>

      {/* Recent SOWs */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Recent SOWs</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {sows.slice(0, 5).map((sow) => (
            <div key={sow.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{sow.title}</h3>
                  <p className="text-sm text-gray-500">{sow.client}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    sow.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                    sow.status === 'pending_review' ? 'bg-yellow-100 text-yellow-800' :
                    sow.status === 'approved' ? 'bg-green-100 text-green-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {sow.status.replace('_', ' ').charAt(0).toUpperCase() + sow.status.slice(1)}
                  </span>
                  <span className="text-sm text-gray-500">
                    {format(new Date(sow.updatedAt), 'MMM d, yyyy')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}