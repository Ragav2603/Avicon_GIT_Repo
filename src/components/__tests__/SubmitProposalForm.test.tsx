import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SubmitProposalForm from '../SubmitProposalForm';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MemoryRouter } from 'react-router-dom';

// Mocks
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn(),
}));

// Mock Supabase with correct structure
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    storage: {
      from: vi.fn(),
    },
    functions: {
      invoke: vi.fn(),
    },
  },
}));

// ResizeObserver mock
globalThis.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('SubmitProposalForm', () => {
  const mockRfp = {
    id: 'rfp-123',
    title: 'Test RFP',
    description: 'Test Description',
    budget_max: 10000,
    status: 'open',
    created_at: '2023-01-01',
    airline_id: 'airline-123',
  };

  const mockRequirements = [
    { id: 'req-1', requirement_text: 'Test Requirement', is_mandatory: true, weight: 1 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    (useAuth as any).mockReturnValue({
      user: { id: 'vendor-123' },
      profile: { company_name: 'Vendor Co' },
    });

    (useToast as any).mockReturnValue({ toast: vi.fn() });

    // Mock Supabase methods
    const mockSelect = vi.fn();
    const mockInsert = vi.fn().mockReturnValue({ error: null });

    // Chain for select: select -> eq -> eq -> maybeSingle
    const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null });
    const mockEq2 = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
    const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
    mockSelect.mockReturnValue({ eq: mockEq1 });

    (supabase.from as any).mockImplementation((table: string) => {
      if (table === 'submissions') {
        return {
          select: mockSelect,
          insert: mockInsert,
        };
      }
      return {};
    });

    (supabase.storage.from as any).mockReturnValue({
      upload: vi.fn().mockResolvedValue({ data: { path: 'path/to/file' }, error: null }),
    });

    (supabase.functions.invoke as any).mockResolvedValue({ error: null });
  });

  it('renders correctly', () => {
    render(
      <MemoryRouter>
        <SubmitProposalForm
          rfp={mockRfp}
          requirements={mockRequirements}
          open={true}
          onOpenChange={vi.fn()}
        />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { name: 'Submit Proposal' })).toBeInTheDocument();
    expect(screen.getByText('Test RFP')).toBeInTheDocument();
  });


  it('submit button shows loading state and text', async () => {
    const { container } = render(
      <MemoryRouter>
        <SubmitProposalForm
          rfp={mockRfp}
          requirements={mockRequirements}
          open={true}
          onOpenChange={vi.fn()}
        />
      </MemoryRouter>
    );

    // Fill required pitch text
    const pitchInput = screen.getByLabelText(/Your Proposal/i);
    fireEvent.change(pitchInput, { target: { value: 'This is a long enough proposal text for the test requirement validation.' } });

    // Mock long running upload or submission
    (supabase.from as any).mockImplementation((table: string) => {
      if (table === 'submissions') {
        return {
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        maybeSingle: vi.fn().mockResolvedValue({ data: null })
                    })
                })
            }),
            insert: vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ error: null }), 100))),
        };
      }
      return {};
    });

    const submitButton = screen.getByRole('button', { name: /Submit Proposal/i });
    fireEvent.click(submitButton);

    // Check for "Submitting..." text (expect failure initially)
    await waitFor(() => expect(screen.getByText(/Submitting.../i)).toBeInTheDocument());
  });
});
