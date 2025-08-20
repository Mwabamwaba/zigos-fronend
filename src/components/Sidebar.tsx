import React from 'react';
import { FileText, Settings, Users, MessageSquare, FolderOpen, CheckSquare, Home, Shield } from 'lucide-react';

interface SidebarProps {
  onViewChange: (view: 'dashboard' | 'sow' | 'repository' | 'approvals' | 'settings' | 'admin') => void;
  currentView: 'dashboard' | 'sow' | 'repository' | 'approvals' | 'settings' | 'admin';
}

export default function Sidebar({ onViewChange, currentView }: SidebarProps) {
  type View = SidebarProps['currentView'];

  const primaryItems: Array<{ label: string; icon: React.ElementType; view: View }>= [
    { label: 'Dashboard', icon: Home, view: 'dashboard' },
    { label: 'SOW Builder', icon: FileText, view: 'sow' },
    { label: 'Repository', icon: FolderOpen, view: 'repository' },
    { label: 'Approvals', icon: CheckSquare, view: 'approvals' },
  ];

  // Admin panel disabled until authentication is implemented
  const isAdmin = false;
  const adminItems: Array<{ label: string; icon: React.ElementType; view: View }> = [
    // Admin features will be added when authentication is implemented
  ];

  const secondaryItems: Array<{ label: string; icon: React.ElementType; disabled?: boolean }>= [
    { label: 'Team', icon: Users, disabled: true },
    { label: 'Messages', icon: MessageSquare, disabled: true },
  ];

  const isActive = (view?: View) => view && currentView === view;

  return (
    <div className="w-64 bg-gray-50 h-full flex flex-col border-r border-gray-200">
      {/* Brand/Header */}
      <div className="bg-white rounded-2xl shadow-sm m-4 p-6">
        <div className="flex flex-col">
          <span className="text-xl font-semibold text-gray-900">ZigOS</span>
          <span className="text-sm text-gray-600 leading-relaxed">SOW Platform</span>
        </div>
      </div>

      <div className="flex-1 px-4">
        <nav className="space-y-2">
          {primaryItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.view);
            return (
              <button
                key={item.label}
                onClick={() => onViewChange(item.view)}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                  active ? 'bg-blue-600 text-white hover:bg-blue-700' : 'text-gray-700 hover:bg-gray-50'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-gray-400'}`} />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}

          {/* Admin Section */}
          {isAdmin && (
            <div className="mt-6">
              <div className="bg-white rounded-2xl shadow-sm p-4">
                <div className="px-2 mb-3">
                  <span className="text-sm font-semibold text-gray-900">
                    Administration
                  </span>
                </div>
                <div className="space-y-1">
                  {adminItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.view);
                    return (
                      <button
                        key={item.label}
                        onClick={() => onViewChange(item.view)}
                        className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                          active ? 'bg-red-600 text-white hover:bg-red-700' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                        aria-current={active ? 'page' : undefined}
                      >
                        <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-gray-400'}`} />
                        <span className="text-sm font-medium">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <div className="mt-6">
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <div className="space-y-1">
                {secondaryItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-gray-500"
                      aria-disabled
                    >
                      <Icon className="w-5 h-5 text-gray-400" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </nav>
      </div>

      <div className="p-4">
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <button
            onClick={() => onViewChange('settings')}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${
              currentView === 'settings' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'text-gray-700 hover:bg-gray-50'
            }`}
            aria-current={currentView === 'settings' ? 'page' : undefined}
          >
            <Settings className={`w-5 h-5 ${currentView === 'settings' ? 'text-white' : 'text-gray-400'}`} />
            <span className="text-sm font-medium">Settings</span>
          </button>
          
          {/* Placeholder for user profile - no authentication */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600 leading-relaxed">No authentication active</div>
          </div>
        </div>
      </div>
    </div>
  );
}