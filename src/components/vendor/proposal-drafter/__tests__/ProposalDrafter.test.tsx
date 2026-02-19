import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProposalDrafter from '../../ProposalDrafter';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

// Mock the hooks
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    storage: { from: vi.fn() },
    auth: { getSession: vi.fn() },
    functions: { invoke: vi.fn() },
  },
}));

describe('ProposalDrafter', () => {
  const mockRfp = {
    id: 'rfp-123',
    title: 'Test RFP',
    description: 'Test description',
    budget_max: 10000,
    deadline: '2023-12-31',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as unknown as Mock).mockReturnValue({
      user: { id: 'user-123' },
    });

    // Mock supabase requirements fetch
    (supabase.from as unknown as Mock).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
    });
  });

  it('renders upload step initially', () => {
    render(
      <ProposalDrafter
        rfp={mockRfp}
        open={true}
        onOpenChange={vi.fn()}
      />
    );

    expect(screen.getByText(/Upload Source Documents/i)).toBeInTheDocument();
    expect(screen.getByText(/Drop files here or click to browse/i)).toBeInTheDocument();
  });

  it('navigates to editor step when skipping upload', async () => {
    render(
      <ProposalDrafter
        rfp={mockRfp}
        open={true}
        onOpenChange={vi.fn()}
      />
    );

    const skipButton = screen.getByText(/Skip & Start Manually/i);
    fireEvent.click(skipButton);

    await waitFor(() => {
      expect(screen.getByText(/Compliance Score:/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Start typing your proposal/i)).toBeInTheDocument();
    });
  });
});
