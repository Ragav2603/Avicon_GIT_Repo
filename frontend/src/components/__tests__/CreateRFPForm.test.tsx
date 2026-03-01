/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CreateRFPForm from '../CreateRFPForm';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  },
}));

// ResizeObserver mock
globalThis.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock pointer events (often needed for radix UI dialogs)
if (typeof window !== 'undefined') {
  window.PointerEvent = class PointerEvent extends Event {} as unknown as any;
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
  window.HTMLElement.prototype.hasPointerCapture = vi.fn();
  window.HTMLElement.prototype.releasePointerCapture = vi.fn();
}

describe('CreateRFPForm', () => {
  const mockOnOpenChange = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (useAuth as unknown as any).mockReturnValue({
      user: { id: 'airline-123' },
    });

    (useToast as unknown as any).mockReturnValue({ toast: vi.fn() });

    // Setup Supabase mock chain
    const mockSingle = vi.fn().mockResolvedValue({ data: { id: 'rfp-new-123' }, error: null });
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect, error: null });

    (supabase.from as unknown as any).mockImplementation((table: string) => {
      if (table === 'rfps') {
        return { insert: mockInsert };
      }
      if (table === 'rfp_requirements') {
        // rfp_requirements insert returns immediately or error
        return { insert: vi.fn().mockResolvedValue({ error: null }) };
      }
      return {};
    });
  });

  it('renders correctly', () => {
    render(
      <CreateRFPForm
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    // Check header
    expect(screen.getByRole('heading', { name: /Create New RFP/i })).toBeInTheDocument();

    // Check input fields
    expect(screen.getByLabelText(/RFP Title \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Maximum Budget/i)).toBeInTheDocument();
    expect(screen.getByText('Deadline')).toBeInTheDocument();

    // Check requirements section
    expect(screen.getByText(/Requirements \*/i)).toBeInTheDocument();

    // Check buttons
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Publish RFP/i })).toBeInTheDocument();
  });

  it('shows validation error for empty form submission', async () => {
    const { container } = render(
      <CreateRFPForm
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    // Clear the default empty requirement text just in case
    const reqInput = screen.getByLabelText(/Requirement 1 description/i);
    fireEvent.change(reqInput, { target: { value: '' } });

    // Form inputs have "required" attribute, so we must submit the form directly to bypass HTML5 validation
    const form = screen.getByRole('dialog').querySelector('form');
    fireEvent.submit(form!);

    // Check Zod errors for title, description
    await waitFor(() => {
      // The Zod validation errors should pop up
      expect(screen.getByText(/Title must be at least 5 characters/i)).toBeInTheDocument();
      expect(screen.getByText(/Description must be at least 20 characters/i)).toBeInTheDocument();

      // Also check accessibility roles
      const alerts = screen.getAllByRole('alert');
      expect(alerts.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('shows validation error if requirements are all empty', async () => {
    render(
      <CreateRFPForm
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    // Fill valid basic details
    fireEvent.change(screen.getByLabelText(/RFP Title \*/i), { target: { value: 'Valid RFP Title' } });
    fireEvent.change(screen.getByLabelText(/Description \*/i), { target: { value: 'This is a description that is long enough to pass validation.' } });

    // Leave the requirement empty and submit
    const form = screen.getByRole('dialog').querySelector('form');
    fireEvent.submit(form!);

    // Check custom requirements error
    await waitFor(() => {
      expect(screen.getByText(/Add at least one requirement/i)).toBeInTheDocument();
    });
  });

  it('shows validation error for budget too low', async () => {
    render(
      <CreateRFPForm
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    fireEvent.change(screen.getByLabelText(/RFP Title \*/i), { target: { value: 'Valid RFP Title' } });
    fireEvent.change(screen.getByLabelText(/Description \*/i), { target: { value: 'This is a description that is long enough to pass validation.' } });
    fireEvent.change(screen.getByLabelText(/Maximum Budget/i), { target: { value: '500' } }); // Below $1000 limit

    const form = screen.getByRole('dialog').querySelector('form');
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(screen.getByText(/Budget must be at least \$1,000/i)).toBeInTheDocument();
    });
  });

  it('allows adding and removing requirements', async () => {
    render(
      <CreateRFPForm
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    // Initial state: 1 requirement
    expect(screen.getAllByLabelText(/Requirement \d+ description/i)).toHaveLength(1);

    // Add requirement
    const addBtn = screen.getByRole('button', { name: /Add new requirement/i });
    fireEvent.click(addBtn);

    // Now 2 requirements
    const reqInputs = screen.getAllByLabelText(/Requirement \d+ description/i);
    expect(reqInputs).toHaveLength(2);

    // Change value of second requirement
    fireEvent.change(reqInputs[1], { target: { value: 'Second requirement' } });
    expect(reqInputs[1]).toHaveValue('Second requirement');

    // Remove first requirement
    const removeBtns = screen.getAllByRole('button', { name: /Remove requirement/i });
    expect(removeBtns).toHaveLength(2);
    fireEvent.click(removeBtns[0]);

    // Now back to 1 requirement, and it should be the "Second requirement"
    await waitFor(() => {
      const remainingReqs = screen.getAllByLabelText(/Requirement \d+ description/i);
      expect(remainingReqs).toHaveLength(1);
      expect(remainingReqs[0]).toHaveValue('Second requirement');
    });
  });

  it('submits successfully with valid data', async () => {
    const { toast: mockToast } = useToast();

    // Re-setup the precise mock structure for this test
    const mockSingle = vi.fn().mockResolvedValue({ data: { id: 'rfp-new-123' }, error: null });
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
    const mockInsertRfp = vi.fn().mockReturnValue({ select: mockSelect, error: null });
    const mockInsertReq = vi.fn().mockResolvedValue({ error: null });

    (supabase.from as unknown as any).mockImplementation((table: string) => {
      if (table === 'rfps') return { insert: mockInsertRfp };
      if (table === 'rfp_requirements') return { insert: mockInsertReq };
      return {};
    });

    render(
      <CreateRFPForm
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    // Fill valid data
    fireEvent.change(screen.getByLabelText(/RFP Title \*/i), { target: { value: 'Valid RFP Title' } });
    fireEvent.change(screen.getByLabelText(/Description \*/i), { target: { value: 'This is a description that is long enough to pass validation.' } });
    fireEvent.change(screen.getByLabelText(/Maximum Budget/i), { target: { value: '5000' } });
    fireEvent.change(screen.getByLabelText(/Requirement 1 description/i), { target: { value: 'Must fly fast' } });

    // Change weight of requirement
    const weightInput = screen.getByLabelText(/Weight:/i);
    fireEvent.change(weightInput, { target: { value: '5' } });

    // Submit
    const form = screen.getByRole('dialog').querySelector('form');
    fireEvent.submit(form!);

    // Verify submission
    await waitFor(() => {
      expect(mockInsertRfp).toHaveBeenCalledWith({
        airline_id: 'airline-123',
        title: 'Valid RFP Title',
        description: 'This is a description that is long enough to pass validation.',
        budget_max: 5000,
        deadline: null,
        status: 'open',
      });

      expect(mockInsertReq).toHaveBeenCalledWith([
        {
          rfp_id: 'rfp-new-123',
          requirement_text: 'Must fly fast',
          is_mandatory: true,
          weight: 5,
        }
      ]);

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Success',
        description: 'RFP created successfully!',
      });

      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('handles supabase submission error gracefully', async () => {
    const { toast: mockToast } = useToast();

    // Mock a failure for RFP insertion
    const mockSingle = vi.fn().mockResolvedValue({ data: null, error: new Error('Database connection failed') });
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
    const mockInsertRfp = vi.fn().mockReturnValue({ select: mockSelect, error: new Error('Database connection failed') });

    (supabase.from as unknown as any).mockImplementation((table: string) => {
      if (table === 'rfps') return { insert: mockInsertRfp };
      return {};
    });

    render(
      <CreateRFPForm
        open={true}
        onOpenChange={mockOnOpenChange}
        onSuccess={mockOnSuccess}
      />
    );

    // Fill valid data
    fireEvent.change(screen.getByLabelText(/RFP Title \*/i), { target: { value: 'Valid RFP Title' } });
    fireEvent.change(screen.getByLabelText(/Description \*/i), { target: { value: 'This is a description that is long enough to pass validation.' } });
    fireEvent.change(screen.getByLabelText(/Requirement 1 description/i), { target: { value: 'Must fly fast' } });

    // Submit
    const form = screen.getByRole('dialog').querySelector('form');
    fireEvent.submit(form!);

    // Verify error toast
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Database connection failed',
        variant: 'destructive',
      });
      // Should not close modal or call onSuccess
      expect(mockOnOpenChange).not.toHaveBeenCalled();
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });
  });
});
