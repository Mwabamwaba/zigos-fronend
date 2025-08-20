export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:7071/api';

export const API_ENDPOINTS = {
  sow: {
    base: '/sow',
    createFromTemplate: '/sow/from-template',
    approve: (id: string) => `/sow/${id}/approve`,
    reject: (id: string) => `/sow/${id}/reject`,
    submit: (id: string) => `/sow/${id}/submit`,
  },
  project: {
    base: '/project',
    team: (id: string) => `/project/${id}/team`,
    milestones: (id: string) => `/project/${id}/milestones`,
    risks: (id: string) => `/project/${id}/risks`,
    changes: (id: string) => `/project/${id}/changes`,
    communications: (id: string) => `/project/${id}/communications`,
  },
  team: {
    base: '/team',
    members: '/team/members',
    availability: '/team/availability',
  },
  fireflies: {
    connections: '/fireflies/connections',
    userConnections: (userId: string) => `/fireflies/connections/${userId}`,
    disconnect: (connectionId: string) => `/fireflies/connections/${connectionId}`,
    testConnection: (connectionId: string) => `/fireflies/connections/${connectionId}/test`,
    connectionStats: (connectionId: string) => `/fireflies/connections/${connectionId}/stats`,
    sync: '/fireflies/sync',
    meetings: (connectionId: string) => `/fireflies/meetings/${connectionId}`,
    meetingDetails: (meetingId: string) => `/fireflies/meetings/details/${meetingId}`,
    importToSOW: (meetingId: string) => `/fireflies/meetings/${meetingId}/import`,
    syncHistory: (connectionId: string) => `/fireflies/sync/${connectionId}/history`,
  },
};

export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};