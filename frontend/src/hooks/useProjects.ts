import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getProjectTemplates, 
  getUserProjects, 
  getProjectById, 
  createProject, 
  updateProject,
  updateProjectStatus,
  submitProposal,
  getProjectSubmissions,
} from '@/lib/api/projects';
import type { Project, Requirement } from '@/types/projects';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook to fetch all project templates
 */
export function useProjectTemplates() {
  return useQuery({
    queryKey: ['project-templates'],
    queryFn: getProjectTemplates,
    staleTime: 1000 * 60 * 10, // 10 minutes - templates don't change often
  });
}

/**
 * Hook to fetch all projects for the current user
 */
export function useUserProjects() {
  return useQuery({
    queryKey: ['user-projects'],
    queryFn: getUserProjects,
  });
}

/**
 * Hook to fetch a single project by ID
 */
export function useProject(id: string | undefined) {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => getProjectById(id!),
    enabled: !!id,
  });
}

/**
 * Hook to create a new project
 */
export function useCreateProject() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ 
      title, 
      templateId, 
      dueDate, 
      requirements 
    }: { 
      title: string; 
      templateId: string | null; 
      dueDate?: Date;
      requirements?: Requirement[];
    }) => createProject(title, templateId, dueDate, requirements),
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ['user-projects'] });
      toast({
        title: 'Project Created',
        description: `"${project.title}" has been created successfully.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create project',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook to update a project
 */
export function useUpdateProject() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ 
      id, 
      updates 
    }: { 
      id: string; 
      updates: Partial<Pick<Project, 'title' | 'due_date' | 'requirements' | 'status'>>; 
    }) => updateProject(id, updates),
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ['user-projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', project.id] });
      toast({
        title: 'Project Updated',
        description: 'Changes saved successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update project',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook to update just the project status with OPTIMISTIC update.
 * The UI updates instantly — rolls back on error.
 */
export function useUpdateProjectStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Project['status'] }) => 
      updateProjectStatus(id, status),
    onMutate: async ({ id, status }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['user-projects'] });
      await queryClient.cancelQueries({ queryKey: ['project', id] });

      // Snapshot previous values
      const previousProjects = queryClient.getQueryData<Project[]>(['user-projects']);
      const previousProject = queryClient.getQueryData<Project>(['project', id]);

      // Optimistically update the cache
      if (previousProjects) {
        queryClient.setQueryData<Project[]>(['user-projects'],
          previousProjects.map(p => p.id === id ? { ...p, status } : p)
        );
      }
      if (previousProject) {
        queryClient.setQueryData<Project>(['project', id], { ...previousProject, status });
      }

      return { previousProjects, previousProject };
    },
    onError: (error: Error, variables, context) => {
      // Rollback on error
      if (context?.previousProjects) {
        queryClient.setQueryData(['user-projects'], context.previousProjects);
      }
      if (context?.previousProject) {
        queryClient.setQueryData(['project', variables.id], context.previousProject);
      }
      toast({
        title: 'Error',
        description: error.message || 'Failed to update status',
        variant: 'destructive',
      });
    },
    onSettled: (_, __, variables) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['user-projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', variables.id] });
    },
    onSuccess: (_, variables) => {
      toast({
        title: 'Status Updated',
        description: `Project status changed to "${variables.status}".`,
      });
    },
  });
}

/**
 * Hook to submit a proposal for a project (vendor)
 */
export function useSubmitProposal() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ projectId, file, pitchText }: { projectId: string; file: File; pitchText: string }) =>
      submitProposal(projectId, file, pitchText),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project-submissions', variables.projectId] });
      toast({
        title: 'Proposal Submitted',
        description: 'Your proposal has been submitted successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit proposal',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook to fetch submissions for a project
 */
export function useProjectSubmissions(projectId: string | undefined) {
  return useQuery({
    queryKey: ['project-submissions', projectId],
    queryFn: () => getProjectSubmissions(projectId!),
    enabled: !!projectId,
  });
}
