import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ProposalEditorStep from '../ProposalEditorStep';

describe('ProposalEditorStep', () => {
  const mockProps = {
    baseScore: 50,
    requirements: [
      { id: '1', requirement_text: 'Req 1', is_mandatory: true, weight: 10 }
    ],
    selectedRequirement: null,
    onSelectRequirement: vi.fn(),
    initialContent: 'Initial content',
    onBack: vi.fn(),
    onSave: vi.fn(),
    onSubmit: vi.fn(),
    submitting: false,
  };

  it('renders initial content', () => {
    render(<ProposalEditorStep {...mockProps} />);
    expect(screen.getByDisplayValue('Initial content')).toBeInTheDocument();
  });

  it('updates local content and score when typing', () => {
    render(<ProposalEditorStep {...mockProps} />);
    const textarea = screen.getByPlaceholderText(/Start typing your proposal/i);

    // Initial score (base 50 + 0 bonus)
    expect(screen.getByText('50%')).toBeInTheDocument();

    // Type "security" (one keyword -> +1 bonus)
    fireEvent.change(textarea, { target: { value: 'security' } });

    expect(screen.getByDisplayValue('security')).toBeInTheDocument();
    expect(screen.getByText('51%')).toBeInTheDocument();
  });

  it('calls onSave with content and score', () => {
    render(<ProposalEditorStep {...mockProps} />);
    const textarea = screen.getByPlaceholderText(/Start typing your proposal/i);
    fireEvent.change(textarea, { target: { value: 'security' } });

    const saveBtn = screen.getByRole('button', { name: /Save Draft/i });
    fireEvent.click(saveBtn);

    expect(mockProps.onSave).toHaveBeenCalledWith('security', 51);
  });

  it('calls onSubmit with content and score', () => {
    render(<ProposalEditorStep {...mockProps} />);
    const textarea = screen.getByPlaceholderText(/Start typing your proposal/i);
    fireEvent.change(textarea, { target: { value: 'security' } });

    const submitBtn = screen.getByRole('button', { name: /Submit Proposal/i });
    fireEvent.click(submitBtn);

    expect(mockProps.onSubmit).toHaveBeenCalledWith('security', 51);
  });

  it('calls onBack with content', () => {
    render(<ProposalEditorStep {...mockProps} />);
    const textarea = screen.getByPlaceholderText(/Start typing your proposal/i);
    fireEvent.change(textarea, { target: { value: 'New content' } });

    const backBtn = screen.getByRole('button', { name: /Back to Upload/i });
    fireEvent.click(backBtn);

    expect(mockProps.onBack).toHaveBeenCalledWith('New content');
  });

  it('renders with accessible label', () => {
    render(<ProposalEditorStep {...mockProps} />);
    expect(screen.getByLabelText(/Your Draft Response/i)).toBeInTheDocument();
  });

  it('displays word and character counts', () => {
    render(<ProposalEditorStep {...mockProps} />);

    // Initial content: "Initial content" -> 2 words, 15 chars
    expect(screen.getByText(/2 words/)).toBeInTheDocument();
    expect(screen.getByText(/15 characters/)).toBeInTheDocument();

    const textarea = screen.getByLabelText(/Your Draft Response/i);
    fireEvent.change(textarea, { target: { value: 'Hello world test' } });

    // New content: "Hello world test" -> 3 words, 16 chars
    expect(screen.getByText(/3 words/)).toBeInTheDocument();
    expect(screen.getByText(/16 characters/)).toBeInTheDocument();
  });
});
