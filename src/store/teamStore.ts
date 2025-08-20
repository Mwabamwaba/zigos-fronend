import { create } from 'zustand';
import { TeamMember } from '../types/project';
import { teamService } from '../services/teamService';

interface TeamStore {
  members: TeamMember[];
  loading: boolean;
  error: Error | null;
  fetchMembers: () => Promise<void>;
  addMember: (member: Omit<TeamMember, 'id'>) => Promise<void>;
  updateMember: (id: string, updates: Partial<TeamMember>) => Promise<void>;
  deleteMember: (id: string) => Promise<void>;
}

export const useTeamStore = create<TeamStore>((set, get) => ({
  members: [],
  loading: false,
  error: null,

  fetchMembers: async () => {
    try {
      set({ loading: true, error: null });
      const members = await teamService.getAllMembers();
      set({ members, loading: false });
    } catch (error) {
      set({ error: error as Error, loading: false });
    }
  },

  addMember: async (member) => {
    try {
      set({ loading: true, error: null });
      const newMember = await teamService.addMember(member);
      set(state => ({
        members: [...state.members, newMember],
        loading: false,
      }));
    } catch (error) {
      set({ error: error as Error, loading: false });
    }
  },

  updateMember: async (id, updates) => {
    try {
      set({ loading: true, error: null });
      const updatedMember = await teamService.updateMember(id, updates);
      set(state => ({
        members: state.members.map(m => m.id === id ? updatedMember : m),
        loading: false,
      }));
    } catch (error) {
      set({ error: error as Error, loading: false });
    }
  },

  deleteMember: async (id) => {
    try {
      set({ loading: true, error: null });
      await teamService.deleteMember(id);
      set(state => ({
        members: state.members.filter(m => m.id !== id),
        loading: false,
      }));
    } catch (error) {
      set({ error: error as Error, loading: false });
    }
  },
}));