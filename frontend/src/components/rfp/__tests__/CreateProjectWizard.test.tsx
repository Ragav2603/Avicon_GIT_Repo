import { render } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach, type MockInstance } from 'vitest';
import CreateProjectWizard from '@/components/rfp/CreateProjectWizard.tsx';

// Mock dependencies
vi.mock('@/hooks/useProjects', () => ({
  useCreateProject: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
  useProjectTemplates: () => ({
    data: [],
    isLoading: false,
  }),
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id' },
  }),
}));

// Mock ResizeObserver which is often needed for UI components
globalThis.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('CreateProjectWizard', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    onSuccess: vi.fn(),
  };

  const prefillData = {
    title: 'Test Project',
    description: 'A test project description',
    requirements: [
      { text: 'Req 1', is_mandatory: false, weight: 10 },
      { text: 'Req 2', is_mandatory: true, weight: 20 },
    ],
    budget: 10000,
  };

  let consoleLogSpy: MockInstance;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log');
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    vi.clearAllMocks();
  });

  it('does NOT log prefillData to console when provided', () => {
    render(
      <CreateProjectWizard
        {...defaultProps}
        prefillData={prefillData}
      />
    );

    expect(consoleLogSpy).not.toHaveBeenCalledWith("Applying Prefill Data:", prefillData);
  });
});
