import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Auth from '../Auth.tsx';
import { BrowserRouter } from 'react-router-dom';

// Hoist mockNavigate so it can be used in vi.mock
const { mockNavigate } = vi.hoisted(() => {
  return { mockNavigate: vi.fn() };
});

// Mocks
vi.mock('../../hooks/useAuth.tsx', () => ({
  useAuth: () => ({
    signIn: vi.fn(),
    signUp: vi.fn(),
    user: null,
    role: null,
    loading: false,
  }),
}));

vi.mock('../../hooks/use-toast.ts', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

vi.mock('../../integrations/supabase/client.ts', () => ({
  supabase: {
    auth: {
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
      signOut: vi.fn(),
    },
  },
}));

// Mock useNavigate from react-router-dom
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Auth Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders password input as password type initially', () => {
    render(
      <BrowserRouter>
        <Auth />
      </BrowserRouter>
    );

    // Using regex to match label text loosely
    const passwordInput = screen.getByLabelText(/^Password$/i);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('toggles password visibility when eye icon is clicked', () => {
    render(
      <BrowserRouter>
        <Auth />
      </BrowserRouter>
    );

    const passwordInput = screen.getByLabelText(/^Password$/i);
    expect(passwordInput).toHaveAttribute('type', 'password');

    // This is expected to fail initially as the button doesn't exist yet
    // I'm looking for a button with accessible name "Show password"
    const toggleButton = screen.getByRole('button', { name: /show password/i });
    fireEvent.click(toggleButton);

    expect(passwordInput).toHaveAttribute('type', 'text');

    // Toggle back
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });
});
