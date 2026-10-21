import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import SignUpPage from '../pages/SignUpPage';

// The registration form is the case where the client-side rules must line up
// with the server-side policy before any network call is attempted.
function renderSignUp() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <SignUpPage />
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe('SignUpPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the account creation form', () => {
    renderSignUp();
    expect(screen.getByRole('heading', { name: /create your account/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
  });

  it('blocks submission when the passwords do not match', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const user = userEvent.setup();
    renderSignUp();

    await user.type(screen.getByLabelText(/first name/i), 'Arthur');
    await user.type(screen.getByLabelText(/last name/i), 'Sterling');
    await user.type(screen.getByLabelText(/email address/i), 'arthur@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'RoyalPassword123');
    await user.type(screen.getByLabelText(/confirm password/i), 'different123');
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('requires the terms checkbox', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const user = userEvent.setup();
    renderSignUp();

    await user.type(screen.getByLabelText(/first name/i), 'Arthur');
    await user.type(screen.getByLabelText(/last name/i), 'Sterling');
    await user.type(screen.getByLabelText(/email address/i), 'arthur@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'RoyalPassword123');
    await user.type(screen.getByLabelText(/confirm password/i), 'RoyalPassword123');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/accept the terms/i)).toBeInTheDocument();
    });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  // Regression: the design shows "royalpassword123" as placeholder copy, but the
  // server's policy requires an upper-case letter and a digit. The form must
  // reject that string client-side rather than letting the API return a 400.
  it('rejects a password that does not meet the server policy', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const user = userEvent.setup();
    renderSignUp();

    await user.type(screen.getByLabelText(/first name/i), 'Arthur');
    await user.type(screen.getByLabelText(/last name/i), 'Sterling');
    await user.type(screen.getByLabelText(/email address/i), 'arthur@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'royalpassword123');
    await user.type(screen.getByLabelText(/confirm password/i), 'royalpassword123');
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/include an upper-case letter and a number/i)).toBeInTheDocument();
    });
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
