import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Auth from '../Auth.tsx';
import { BrowserRouter } from 'react-router-dom';

// Mocks (simplified for this test)
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    signIn: vi.fn().mockResolvedValue({ error: { message: 'Invalid login credentials' } }),
    signUp: vi.fn(),
    user: null,
    role: null,
    loading: false,
  }),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe('Auth Page Accessibility', () => {
  it('associates error messages with inputs using aria-describedby and aria-invalid', async () => {
    render(
      <BrowserRouter>
        <Auth />
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    // Initially valid
    expect(emailInput).not.toHaveAttribute('aria-invalid', 'true');
    expect(emailInput).not.toHaveAttribute('aria-describedby');
    expect(passwordInput).not.toHaveAttribute('aria-invalid', 'true');
    expect(passwordInput).not.toHaveAttribute('aria-describedby');

    // Submit empty form to trigger validation
    fireEvent.click(submitButton);

    // Wait for validation errors
    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    });

    // Check email input
    expect(emailInput).toHaveAttribute('aria-invalid', 'true');
    expect(emailInput).toHaveAttribute('aria-describedby', 'email-error');
    const emailError = document.getElementById('email-error');
    expect(emailError).toBeInTheDocument();
    expect(emailError).toHaveTextContent(/please enter a valid email address/i);

    // Check password input
    expect(passwordInput).toHaveAttribute('aria-invalid', 'true');
    expect(passwordInput).toHaveAttribute('aria-describedby', 'password-error');
    const passwordError = document.getElementById('password-error');
    expect(passwordError).toBeInTheDocument();
    expect(passwordError).toHaveTextContent(/password must be at least 8 characters/i);
  });
});
