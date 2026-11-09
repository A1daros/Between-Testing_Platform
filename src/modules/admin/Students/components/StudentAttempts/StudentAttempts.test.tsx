import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getStudentAttempts,
  grantExtraAttempt,
} from '../../../../../services/quizAttempts';
import type { StudentAttempts as StudentAttemptsRow } from '../../../../../types/database';
import { StudentAttempts } from './StudentAttempts';

vi.mock('../../../../../services/quizAttempts', () => ({
  getStudentAttempts: vi.fn(),
  grantExtraAttempt: vi.fn(),
}));
vi.mock('../../../../../utils/captureError', () => ({ captureError: vi.fn() }));

const row = (fields: Partial<StudentAttemptsRow> = {}): StudentAttemptsRow => ({
  test_id: 5,
  title: 'Фінальний тест',
  attempts_used: 1,
  attempts_allowed: 2,
  key_open: false,
  ...fields,
});

const clickGrant = async () =>
  fireEvent.click(await screen.findByRole('button', { name: 'Додати спробу' }));

describe('StudentAttempts', () => {
  beforeEach(() => {
    vi.mocked(grantExtraAttempt).mockReset();
    vi.mocked(grantExtraAttempt).mockResolvedValue();
    vi.mocked(getStudentAttempts).mockResolvedValue([row()]);
  });

  it('grants right away while the key is closed', async () => {
    render(<StudentAttempts studentId='user' />);

    await clickGrant();

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await waitFor(() =>
      expect(grantExtraAttempt).toHaveBeenCalledWith('user', 5),
    );
  });

  it('asks for confirmation when the key is open', async () => {
    vi.mocked(getStudentAttempts).mockResolvedValue([
      row({ attempts_used: 2, key_open: true }),
    ]);
    render(<StudentAttempts studentId='user' />);

    await clickGrant();

    expect(screen.getByRole('dialog')).toHaveTextContent('Після ключа');
    expect(grantExtraAttempt).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Так, додати' }));

    await waitFor(() =>
      expect(grantExtraAttempt).toHaveBeenCalledWith('user', 5),
    );
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  });

  it('does not grant when the confirmation is cancelled', async () => {
    vi.mocked(getStudentAttempts).mockResolvedValue([row({ key_open: true })]);
    render(<StudentAttempts studentId='user' />);

    await clickGrant();
    fireEvent.click(screen.getByRole('button', { name: 'Скасувати' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(grantExtraAttempt).not.toHaveBeenCalled();
  });

  it('keeps the confirmation open and shows the error when granting fails', async () => {
    vi.mocked(getStudentAttempts).mockResolvedValue([row({ key_open: true })]);
    vi.mocked(grantExtraAttempt).mockRejectedValue(new Error('offline'));
    render(<StudentAttempts studentId='user' />);

    await clickGrant();
    fireEvent.click(screen.getByRole('button', { name: 'Так, додати' }));

    expect(
      await screen.findByText('Не вдалося додати спробу. Спробуйте ще раз.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
