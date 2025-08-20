import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import TeamRoster from './TeamRoster';
import TeamCalendar from './TeamCalendar';
import ResourcePlanning from './ResourcePlanning';
import TeamUtilization from './TeamUtilization';
import { useTeamStore } from '../../store/teamStore';

export default function TeamManagementPage() {
  const { loading } = useTeamStore();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Loading team data...</p>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 overflow-auto">
      <div className="max-w-7xl mx-auto py-6 px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Team Management</h1>
          <p className="mt-2 text-gray-600">
            Manage team members, track utilization, and plan resources
          </p>
        </div>

        <Tabs defaultValue="roster" className="space-y-6">
          <TabsList className="bg-white border-b border-gray-200 w-full justify-start">
            <TabsTrigger value="roster">Team Roster</TabsTrigger>
            <TabsTrigger value="utilization">Utilization</TabsTrigger>
            <TabsTrigger value="calendar">Team Calendar</TabsTrigger>
            <TabsTrigger value="planning">Resource Planning</TabsTrigger>
          </TabsList>

          <TabsContent value="roster">
            <TeamRoster />
          </TabsContent>

          <TabsContent value="utilization">
            <TeamUtilization />
          </TabsContent>

          <TabsContent value="calendar">
            <TeamCalendar />
          </TabsContent>

          <TabsContent value="planning">
            <ResourcePlanning />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}