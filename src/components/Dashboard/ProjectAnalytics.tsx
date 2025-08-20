import React from 'react';
import { Clock, DollarSign, Users, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { Project } from '../../types/project';
import { SOWDocument } from '../../types/sow';
import { format } from 'date-fns';

interface ProjectAnalyticsProps {
  projects: Project[];
  approvedSows: SOWDocument[];
  onCreateNew: () => void;
}

export default function ProjectAnalytics({ projects, approvedSows, onCreateNew }: ProjectAnalyticsProps) {
  const totalBudget = projects.reduce((sum, project) => sum + project.budget.total, 0);
  const totalAllocated = projects.reduce((sum, project) => sum + project.budget.allocated, 0);
  const budgetUtilization = totalBudget > 0 ? (totalAllocated / totalBudget) * 100 : 0;

  const activeProjects = projects.filter(p => p.status === 'active').length;
  const projectGrowth = 10; // Example growth rate

  const delayedMilestones = projects.reduce((count, project) => {
    const delayed = project.milestones.filter(milestone => {
      const endDate = new Date(milestone.endDate);
      return endDate < new Date() && milestone.status !== 'completed';
    }).length;
    return count + delayed;
  }, 0);

  const highRisks = projects.reduce((count, project) => {
    const critical = project.risks.filter(risk => 
      risk.impact === 'critical' && risk.status === 'identified'
    ).length;
    return count + critical;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Budget Utilization */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Budget Utilization</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${totalAllocated.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 rounded-full h-2"
              style={{ width: `${budgetUtilization}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-gray-500">
            {budgetUtilization.toFixed(1)}% of ${totalBudget.toLocaleString()} total budget
          </p>
        </div>

        {/* Active Projects */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Projects</p>
              <p className="text-2xl font-semibold text-gray-900">{activeProjects}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {projectGrowth > 0 ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
            <span className={`text-sm ${projectGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {projectGrowth}% from last month
            </span>
          </div>
        </div>

        {/* Delayed Milestones */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Delayed Milestones</p>
              <p className="text-2xl font-semibold text-gray-900">{delayedMilestones}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500">
            {delayedMilestones} milestones past due date
          </p>
        </div>

        {/* High Risk Items */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Critical Risks</p>
              <p className="text-2xl font-semibold text-gray-900">{highRisks}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <p className="text-sm text-red-500">
            {highRisks} critical risks need attention
          </p>
        </div>
      </div>

      {/* Recent Projects */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Active Projects</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {projects.filter(p => p.status === 'active').slice(0, 5).map((project) => (
            <div key={project.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{project.title}</h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span>Budget: ${project.budget.total.toLocaleString()}</span>
                    <span>•</span>
                    <span>
                      {project.milestones.filter(m => m.status === 'completed').length}/
                      {project.milestones.length} Milestones
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-500">
                    <div>Start: {format(new Date(project.startDate), 'MMM d')}</div>
                    <div>End: {format(new Date(project.endDate), 'MMM d')}</div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    project.status === 'active' ? 'bg-green-100 text-green-800' :
                    project.status === 'on_hold' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {project.status.replace('_', ' ').charAt(0).toUpperCase() + project.status.slice(1)}
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