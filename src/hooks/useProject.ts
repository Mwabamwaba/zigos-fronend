import { useQuery } from '@tanstack/react-query';
import { projectService } from '../services/projectService';

export function useProject(id: string | undefined) {
  const { data: project, isLoading, error } = useQuery({
    queryKey: ['project', id],
    queryFn: () => id ? projectService.getById(id) : null,
    enabled: !!id
  });

  return {
    project,
    isLoading,
    error
  };
} 