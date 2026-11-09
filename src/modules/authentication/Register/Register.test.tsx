import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { MIN_PASSWORD_LENGTH } from '../../../constants/auth';
import { ROUTES } from '../../../constants/routes';
import { signUp } from '../../../services/auth';
import { Register } from './Register';

vi.mock('../../../services/auth', () => ({ signUp: vi.fn() }));

const fill = (id: string, value: string) => {
  const input = document.getElementById(id);

  if (!input) {
    throw new Error(`No field ${id}`);
  }

  fireEvent.change(input, { target: { value } });
};

const renderForm = () => {
  render(
    <MemoryRouter initialEntries={[ROUTES.register]}>
      <Routes>
        <Route path={ROUTES.register} element={<Register />} />
        <Route path={ROUTES.home} element={<p>Головна</p>} />
      </Routes>
    </MemoryRouter>,
  );

  fill('reg-name', 'Ivan');
  fill('reg-surname', 'Koval');
  fill('reg-email', 'ivan@example.test');
};

const submit = () => {
  const form = document.querySelector('form');

  if (!form) {
    throw new Error('No form');
  }

  fireEvent.submit(form);
};

describe('Register', () => {
  const validPassword = 'a'.repeat(MIN_PASSWORD_LENGTH);

  it('does not call the server with a short password', () => {
    renderForm();
    fill('reg-password', 'a');
    submit();

    expect(screen.getByText(/щонайменше/)).toBeInTheDocument();
    expect(signUp).not.toHaveBeenCalled();
  });

  it('signs up and asks to confirm the email', async () => {
    vi.mocked(signUp).mockResolvedValue({ hasSession: false });
    renderForm();
    fill('reg-password', validPassword);
    submit();

    await waitFor(() =>
      expect(signUp).toHaveBeenCalledWith({
        name: 'Ivan',
        surname: 'Koval',
        email: 'ivan@example.test',
        password: validPassword,
      }),
    );
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });

  it('goes home when a session already exists', async () => {
    vi.mocked(signUp).mockResolvedValue({ hasSession: true });
    renderForm();
    fill('reg-password', validPassword);
    submit();

    expect(await screen.findByText('Головна')).toBeInTheDocument();
  });

  it('shows the translated server error', async () => {
    vi.mocked(signUp).mockRejectedValue(new Error('Користувач уже існує.'));
    renderForm();
    fill('reg-password', validPassword);
    submit();

    expect(await screen.findByText('Користувач уже існує.')).toBeInTheDocument();
  });
});
