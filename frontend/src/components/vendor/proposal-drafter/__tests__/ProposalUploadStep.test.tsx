import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ProposalUploadStep from '../ProposalUploadStep';

describe('ProposalUploadStep Accessibility', () => {
  const mockProps = {
    uploadedFiles: [],
    onUpload: vi.fn(),
    onRemove: vi.fn(),
    onStartAnalysis: vi.fn(),
    onSkip: vi.fn(),
  };

  it('Drop zone is accessible with keyboard', () => {
    render(<ProposalUploadStep {...mockProps} />);

    // The drop zone should have role="button"
    const dropZone = screen.getByRole('button', { name: /upload proposal documents/i });
    expect(dropZone).toBeInTheDocument();

    // It should be focusable
    expect(dropZone).toHaveAttribute('tabIndex', '0');
  });

  it('Remove button has accessible label', () => {
    const file = new File(['content'], 'test-proposal.pdf', { type: 'application/pdf' });
    render(<ProposalUploadStep {...mockProps} uploadedFiles={[file]} />);

    // The remove button should have a specific label, not just an icon
    const removeButton = screen.getByRole('button', { name: /remove test-proposal.pdf/i });
    expect(removeButton).toBeInTheDocument();
  });
});
