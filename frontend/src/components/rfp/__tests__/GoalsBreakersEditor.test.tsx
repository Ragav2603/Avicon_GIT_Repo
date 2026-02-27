// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import GoalsBreakersEditor from '../GoalsBreakersEditor';

expect.extend(matchers);

describe('GoalsBreakersEditor Accessibility', () => {
  const mockGoals = [
    { id: 'g1', text: 'Reduce costs', enabled: true, weight: 50 },
  ];
  const mockBreakers = [
    { id: 'b1', text: 'Must be cloud-based', enabled: true, weight: 0 },
  ];

  it('renders inputs and controls with accessible labels', () => {
    render(
      <GoalsBreakersEditor
        goals={mockGoals}
        onGoalsChange={vi.fn()}
        dealBreakers={mockBreakers}
        onDealBreakersChange={vi.fn()}
      />
    );

    // Check for Requirement (Goal) labels
    expect(screen.getByLabelText('Requirement text')).toBeInTheDocument();
    expect(screen.getByLabelText('Toggle Requirement')).toBeInTheDocument();
    expect(screen.getByLabelText('Requirement weight')).toBeInTheDocument();
    expect(screen.getByLabelText('Remove Requirement')).toBeInTheDocument();

    // Check for Deal Breaker labels
    expect(screen.getByLabelText('Deal Breaker text')).toBeInTheDocument();
    expect(screen.getByLabelText('Toggle Deal Breaker')).toBeInTheDocument();
    // Deal breakers in GoalsBreakersEditor pass showWeight=false, so no weight input check for them
    expect(screen.getByLabelText('Remove Deal Breaker')).toBeInTheDocument();
  });
});
