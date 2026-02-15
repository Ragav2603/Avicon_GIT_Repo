import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import MyRFPsPage from '../MyRFPsPage';
import { MemoryRouter } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

// Mock the Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

// Mock the useAuth hook
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

describe('MyRFPsPage Performance', () => {
  const mockProjects = [
    { id: '1', title: 'Project 1', created_at: '2023-01-01', status: 'open', submissions: [{ count: 5 }] },
    { id: '2', title: 'Project 2', created_at: '2023-01-02', status: 'open', submissions: [{ count: 0 }] },
    { id: '3', title: 'Project 3', created_at: '2023-01-03', status: 'open', submissions: [{ count: 2 }] },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock useAuth to return a valid user
    (useAuth as unknown as Mock).mockReturnValue({
      user: { id: 'user-123' },
      role: 'airline',
      loading: false,
    });

    // Mock supabase behavior
    (supabase.from as unknown as Mock).mockImplementation((table: string) => {
      if (table === 'rfps') {
        const orderMock = vi.fn().mockResolvedValue({ data: mockProjects, error: null });
        const eqMock = vi.fn().mockReturnValue({ order: orderMock });
        const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
        return { select: selectMock };
      }
      if (table === 'submissions') {
        // Mock individual submission count query
        const eqMock = vi.fn().mockResolvedValue({ count: 5, data: [], error: null });
        const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
        return { select: selectMock };
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
      };
    });
  });

  it('should fetch counts in a single query (optimization verified)', async () => {
    render(
      <MemoryRouter>
        <MyRFPsPage />
      </MemoryRouter>
    );

    // Wait for projects to be displayed
    await waitFor(() => {
      expect(screen.getByText('Project 1')).toBeInTheDocument();
    });

    // Check calls to supabase.from('rfps') - should be 1
    const rfpCalls = (supabase.from as unknown as Mock).mock.calls.filter((call) => call[0] === 'rfps');
    expect(rfpCalls.length).toBe(1);

    // Check calls to supabase.from('submissions') - should be 0 in optimized version
    // The optimized implementation uses a single joined query
    const submissionCalls = (supabase.from as unknown as Mock).mock.calls.filter((call) => call[0] === 'submissions');

    // This assertion confirms the optimization: 1 RFP call + 0 Submission calls
    expect(submissionCalls.length).toBe(0);
  });
});
