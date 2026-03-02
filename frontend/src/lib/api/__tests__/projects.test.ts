import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getUserProjects,
  getProjectTemplates,
  getProjectById,
  updateProject
} from '../projects';
import { supabase } from '@/integrations/supabase/client';

// Mock supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('Project API Tests', () => {
  let selectMock: any;
  let orderMock: any;
  let limitMock: any;
  let eqMock: any;
  let singleMock: any;
  let updateMock: any;

  beforeEach(() => {
    vi.clearAllMocks();

    limitMock = vi.fn();
    singleMock = vi.fn();

    orderMock = vi.fn().mockReturnValue({ limit: limitMock });
    eqMock = vi.fn().mockReturnValue({ single: singleMock, select: vi.fn().mockReturnValue({ single: singleMock }) });
    selectMock = vi.fn().mockReturnValue({ order: orderMock, eq: eqMock, single: singleMock });
    updateMock = vi.fn().mockReturnValue({ eq: eqMock });

    (supabase.from as any).mockReturnValue({ select: selectMock, update: updateMock });
  });

  describe('getUserProjects', () => {
    it('should fetch user projects and transform requirements correctly', async () => {
      const mockData = [
        {
          id: '1',
          title: 'Project 1',
          status: 'draft',
          requirements: [{ id: 'req1', text: 'Requirement 1' }],
        },
        {
          id: '2',
          title: 'Project 2',
          status: 'published',
          requirements: null,
        },
        {
          id: '3',
          title: 'Project 3',
          status: 'published',
          requirements: 'invalid-json',
        }
      ];

      limitMock.mockResolvedValue({ data: mockData, error: null });

      const result = await getUserProjects();

      expect(supabase.from).toHaveBeenCalledWith('projects');
      expect(selectMock).toHaveBeenCalledWith('*');
      expect(orderMock).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(limitMock).toHaveBeenCalledWith(100);

      expect(result).toHaveLength(3);

      // Check first project (valid array)
      expect(result[0].id).toBe('1');
      expect(result[0].status).toBe('draft');
      expect(result[0].requirements).toEqual([{ id: 'req1', text: 'Requirement 1' }]);

      // Check second project (null requirements)
      expect(result[1].id).toBe('2');
      expect(result[1].requirements).toEqual([]);

      // Check third project (invalid format)
      expect(result[2].id).toBe('3');
      expect(result[2].requirements).toEqual([]);
    });

    it('should throw an error if supabase query fails', async () => {
      const mockError = new Error('Database error');
      limitMock.mockResolvedValue({ data: null, error: mockError });

      await expect(getUserProjects()).rejects.toThrow('Database error');
    });

    it('should return empty array if no data is returned', async () => {
      limitMock.mockResolvedValue({ data: null, error: null });

      const result = await getUserProjects();
      expect(result).toEqual([]);
    });
  });

  describe('getProjectTemplates', () => {
    it('should fetch templates and transform default_requirements correctly', async () => {
      const mockData = [
        {
          id: 'tmpl1',
          name: 'Template 1',
          default_requirements: [{ id: 'req1', text: 'Req 1' }],
        },
        {
          id: 'tmpl2',
          name: 'Template 2',
          default_requirements: null,
        }
      ];

      limitMock.mockResolvedValue({ data: mockData, error: null });

      const result = await getProjectTemplates();

      expect(supabase.from).toHaveBeenCalledWith('project_templates');
      expect(selectMock).toHaveBeenCalledWith('*');
      expect(orderMock).toHaveBeenCalledWith('name');
      expect(limitMock).toHaveBeenCalledWith(100);

      expect(result).toHaveLength(2);
      expect(result[0].default_requirements).toEqual([{ id: 'req1', text: 'Req 1' }]);
      expect(result[1].default_requirements).toEqual([]);
    });

    it('should throw an error if supabase query fails', async () => {
      const mockError = new Error('Database error');
      limitMock.mockResolvedValue({ data: null, error: mockError });

      await expect(getProjectTemplates()).rejects.toThrow('Database error');
    });
  });

  describe('getProjectById', () => {
    it('should fetch a single project and transform requirements correctly', async () => {
      const mockData = {
        id: '123',
        title: 'Test Project',
        status: 'draft',
        requirements: [{ id: 'req1', text: 'Requirement 1' }],
      };

      singleMock.mockResolvedValue({ data: mockData, error: null });

      const result = await getProjectById('123');

      expect(supabase.from).toHaveBeenCalledWith('projects');
      expect(selectMock).toHaveBeenCalledWith('*');
      expect(eqMock).toHaveBeenCalledWith('id', '123');
      expect(singleMock).toHaveBeenCalled();

      expect(result).toBeDefined();
      expect(result?.id).toBe('123');
      expect(result?.requirements).toEqual([{ id: 'req1', text: 'Requirement 1' }]);
    });

    it('should handle project not found correctly', async () => {
      singleMock.mockResolvedValue({ data: null, error: { code: 'PGRST116' } });

      const result = await getProjectById('999');
      expect(result).toBeNull();
    });

    it('should throw an error for other supabase errors', async () => {
      const mockError = new Error('Database error');
      singleMock.mockResolvedValue({ data: null, error: mockError });

      await expect(getProjectById('123')).rejects.toThrow('Database error');
    });
  });

  describe('updateProject', () => {
    it('should update project details and transform returned requirements correctly', async () => {
      const mockUpdates = {
        title: 'Updated Title',
        requirements: [{ id: 'req2', text: 'New Req' }] as any,
      };

      const mockData = {
        id: '123',
        title: 'Updated Title',
        status: 'draft',
        requirements: [{ id: 'req2', text: 'New Req' }],
      };

      singleMock.mockResolvedValue({ data: mockData, error: null });

      const result = await updateProject('123', mockUpdates);

      expect(supabase.from).toHaveBeenCalledWith('projects');
      expect(updateMock).toHaveBeenCalledWith(mockUpdates);
      expect(eqMock).toHaveBeenCalledWith('id', '123');
      expect(singleMock).toHaveBeenCalled();

      expect(result.title).toBe('Updated Title');
      expect(result.requirements).toEqual([{ id: 'req2', text: 'New Req' }]);
    });

    it('should throw an error if supabase query fails', async () => {
      const mockError = new Error('Database error');
      singleMock.mockResolvedValue({ data: null, error: mockError });

      await expect(updateProject('123', { title: 'New' })).rejects.toThrow('Database error');
    });
  });
});
