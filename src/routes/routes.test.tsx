import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { ROUTES } from '../constants/routes';
import { AuthContext } from '../context/AuthContext';
import type { Profile } from '../types/database';
import type { AuthContextType } from '../types/auth';
import { AdminRoute } from './AdminRoute';
import { ApprovedRoute } from './ApprovedRoute';
import { ProtectedRoute } from './ProtectedRoute';

const LoginPage = () => {
  const location = useLocation();

  return <p>Вхід з {(location.state as { from?: string } | null)?.from}</p>;
};

const renderGuarded = (auth: Partial<AuthContextType>) =>
  render(
    <AuthContext.Provider value={{ loading: false, ...auth } as AuthContextType}>
      <MemoryRouter initialEntries={['/protected/approved/admin']}>
        <Routes>
          <Route path={ROUTES.home} element={<p>Головна</p>} />
          <Route path={ROUTES.login} element={<LoginPage />} />
          <Route path={ROUTES.awaitingApproval} element={<p>Очікування</p>} />
          <Route element={<ProtectedRoute />}>
            <Route element={<ApprovedRoute />}>
              <Route element={<AdminRoute />}>
                <Route
                  path='/protected/approved/admin'
                  element={<p>Закрито</p>}
                />
              </Route>
            </Route>
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );

const user = { id: 'user' } as AuthContextType['user'];
const profile = (fields: Partial<Profile>) => fields as Profile;

describe('route guards', () => {
  it('holds the content while auth is loading', () => {
    renderGuarded({ loading: true });

    expect(screen.queryByText('Закрито')).not.toBeInTheDocument();
    expect(screen.queryByText(/Вхід/)).not.toBeInTheDocument();
  });

  it('sends a guest to login and remembers the page', () => {
    renderGuarded({ user: null, profile: null });

    expect(
      screen.getByText('Вхід з /protected/approved/admin'),
    ).toBeInTheDocument();
  });

  it('offers a retry when the profile fails to load', () => {
    const retryProfileLoad = vi.fn();

    renderGuarded({
      user,
      profile: null,
      profileLoadFailed: true,
      retryProfileLoad,
    });
    fireEvent.click(screen.getByRole('button', { name: 'Спробувати ще раз' }));

    expect(retryProfileLoad).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Закрито')).not.toBeInTheDocument();
  });

  it.each(['pending', 'rejected'] as const)(
    'sends a %s user to the waiting page',
    (status) => {
      renderGuarded({ user, profile: profile({ role: 'student', status }) });

      expect(screen.getByText('Очікування')).toBeInTheDocument();
    },
  );

  it('keeps an approved student out of the admin area', () => {
    renderGuarded({
      user,
      profile: profile({ role: 'student', status: 'approved' }),
    });

    expect(screen.getByText('Головна')).toBeInTheDocument();
    expect(screen.queryByText('Закрито')).not.toBeInTheDocument();
  });

  it('lets an admin in, whatever the status is', () => {
    renderGuarded({
      user,
      profile: profile({ role: 'admin', status: 'pending' }),
    });

    expect(screen.getByText('Закрито')).toBeInTheDocument();
  });
});
