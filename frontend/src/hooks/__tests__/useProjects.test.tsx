import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUpdateProjectStatus } from '../useProjects';
import * as api from '@/lib/api/projects';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import type { Project } from '@/types/projects';

// Mock the API module
vi.mock('@/lib/api/projects', () => ({
  updateProjectStatus: vi.fn(),
}));

describe('useUpdateProjectStatus', () => {
  let queryClient: QueryClient;
  let wrapper: React.FC<{ children: React.ReactNode }>;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
        mutations: {
          retry: false,
        },
      },
    });

    wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  });

  it('should optimistically update project status and rollback on error', async () => {
    // Initial data setup
    const initialProjects = [
      { id: '1', title: 'Project 1', status: 'DRAFT' },
      { id: '2', title: 'Project 2', status: 'DRAFT' },
    ];
    const initialProject = { id: '1', title: 'Project 1', status: 'DRAFT' };

    queryClient.setQueryData(['user-projects'], initialProjects);
    queryClient.setQueryData(['project', '1'], initialProject);

    // Create a controlled promise to delay the API rejection
    let rejectApi: (err: unknown) => void;
    const apiPromise = new Promise((_, reject) => {
      rejectApi = reject;
    });

    const mockUpdateProjectStatus = vi.mocked(api.updateProjectStatus);
    mockUpdateProjectStatus.mockReturnValueOnce(apiPromise as unknown as ReturnType<typeof api.updateProjectStatus>);

    const { result } = renderHook(() => useUpdateProjectStatus(), { wrapper });

    // Trigger the mutation
    act(() => {
      result.current.mutate({ id: '1', status: 'PUBLISHED' });
    });

    // Check optimistic update immediately (react-query onMutate is synchronous during mutate call)
    // or wait for it to be pending
    await waitFor(() => {
      expect(result.current.isPending).toBe(true);
    });

    const optimisticProjects = queryClient.getQueryData<Project[]>(['user-projects']);
    expect(optimisticProjects?.find(p => p.id === '1')?.status).toBe('PUBLISHED');

    const optimisticProject = queryClient.getQueryData<Project>(['project', '1']);
    expect(optimisticProject?.status).toBe('PUBLISHED');

    // Reject the API call
    act(() => {
      rejectApi!(new Error('API Error'));
    });

    // Wait for the mutation to fail
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    // Check rollback
    const rolledBackProjects = queryClient.getQueryData<Project[]>(['user-projects']);
    expect(rolledBackProjects?.find(p => p.id === '1')?.status).toBe('DRAFT');

    const rolledBackProject = queryClient.getQueryData<Project>(['project', '1']);
    expect(rolledBackProject?.status).toBe('DRAFT');

    expect(mockUpdateProjectStatus).toHaveBeenCalledWith('1', 'PUBLISHED');
  });

  it('should optimistically update project status and keep it on success', async () => {
    // Initial data setup
    const initialProjects = [
      { id: '1', title: 'Project 1', status: 'DRAFT' },
    ];
    const initialProject = { id: '1', title: 'Project 1', status: 'DRAFT' };

    queryClient.setQueryData(['user-projects'], initialProjects);
    queryClient.setQueryData(['project', '1'], initialProject);

    // Create a controlled promise to delay the API resolution
    let resolveApi: (data: unknown) => void;
    const apiPromise = new Promise((resolve) => {
      resolveApi = resolve;
    });

    const mockUpdateProjectStatus = vi.mocked(api.updateProjectStatus);
    mockUpdateProjectStatus.mockReturnValueOnce(apiPromise as unknown as ReturnType<typeof api.updateProjectStatus>);

    const { result } = renderHook(() => useUpdateProjectStatus(), { wrapper });

    // Trigger the mutation
    act(() => {
      result.current.mutate({ id: '1', status: 'PUBLISHED' });
    });

    // Wait for mutation to be pending
    await waitFor(() => {
      expect(result.current.isPending).toBe(true);
    });

    // Check optimistic update immediately
    const optimisticProjects = queryClient.getQueryData<Project[]>(['user-projects']);
    expect(optimisticProjects?.find(p => p.id === '1')?.status).toBe('PUBLISHED');

    const optimisticProject = queryClient.getQueryData<Project>(['project', '1']);
    expect(optimisticProject?.status).toBe('PUBLISHED');

    // Resolve the API call
    act(() => {
      resolveApi!({ id: '1', status: 'PUBLISHED' });
    });

    // Wait for the mutation to settle (success)
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Ensure status is still updated
    const finalProjects = queryClient.getQueryData<Project[]>(['user-projects']);
    expect(finalProjects?.find(p => p.id === '1')?.status).toBe('PUBLISHED');

    const finalProject = queryClient.getQueryData<Project>(['project', '1']);
    expect(finalProject?.status).toBe('PUBLISHED');

    expect(mockUpdateProjectStatus).toHaveBeenCalledWith('1', 'PUBLISHED');
  });
});
