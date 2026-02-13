import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Header } from '../components/Header';

describe('Header Component', () => {
  it('should render logo', () => {
    render(
      <Header
        isLoggedIn={false}
        userRole={null}
        onLoginClick={vi.fn()}
        onLogoutClick={vi.fn()}
        onHomeClick={vi.fn()}
        credits={0}
      />
    );

    // Check if main elements are rendered
    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
  });

  it('should show login button when not logged in', () => {
    render(
      <Header
        isLoggedIn={false}
        userRole={null}
        onLoginClick={vi.fn()}
        onLogoutClick={vi.fn()}
        onHomeClick={vi.fn()}
        credits={0}
      />
    );

    // Login button should be visible
    const loginButton = screen.getByText(/giriş/i);
    expect(loginButton).toBeInTheDocument();
  });

  it('should show credits when logged in', () => {
    render(
      <Header
        isLoggedIn={true}
        userRole="user"
        onLoginClick={vi.fn()}
        onLogoutClick={vi.fn()}
        onHomeClick={vi.fn()}
        credits={100}
      />
    );

    // Credits should be displayed
    const credits = screen.getByText(/100/);
    expect(credits).toBeInTheDocument();
  });

  it('should show admin button for admin users', () => {
    const onAdminClick = vi.fn();
    render(
      <Header
        isLoggedIn={true}
        userRole="admin"
        onLoginClick={vi.fn()}
        onLogoutClick={vi.fn()}
        onHomeClick={vi.fn()}
        onAdminClick={onAdminClick}
        credits={100}
      />
    );

    // Admin panel button should be visible
    const adminButton = screen.getByText(/admin/i);
    expect(adminButton).toBeInTheDocument();
  });
});
