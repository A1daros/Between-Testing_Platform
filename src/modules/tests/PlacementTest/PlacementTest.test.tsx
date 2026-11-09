import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  calculatePlacementLevel,
  getPlacementQuestions,
} from '../../../services/placement';
import type { PlacementQuestion } from '../../../types/database';
import { PlacementTest } from './PlacementTest';

vi.mock('../../../services/placement', () => ({
  calculatePlacementLevel: vi.fn(),
  getPlacementQuestions: vi.fn(),
}));
vi.mock('../../../utils/captureError', () => ({ captureError: vi.fn() }));

const question = (id: number) =>
  ({
    id,
    question: `Питання ${id}`,
    description: null,
    sort_order: id,
    tests: { title: 'Placement', description: null },
    levels: { code: 'A1' },
    answers: [
      { id: id * 10, answer_text: `Варіант ${id}` },
      { id: id * 10 + 1, answer_text: `Інший ${id}` },
    ],
  }) as unknown as PlacementQuestion;

const renderTest = () =>
  render(
    <MemoryRouter>
      <PlacementTest />
    </MemoryRouter>,
  );

const pick = async (name: string) =>
  fireEvent.click(await screen.findByRole('radio', { name: new RegExp(name) }));

describe('PlacementTest', () => {
  beforeEach(() => {
    vi.mocked(getPlacementQuestions).mockResolvedValue([
      question(1),
      question(2),
    ]);
    vi.mocked(calculatePlacementLevel).mockResolvedValue({
      level_code: 'A2',
      level_title: 'Elementary',
    });
  });

  it('asks the server for the level and shows it', async () => {
    renderTest();

    await pick('Варіант 1');
    fireEvent.click(screen.getByRole('button', { name: 'Наступне питання →' }));
    await pick('Інший 2');
    fireEvent.click(screen.getByRole('button', { name: 'Завершити тест' }));

    expect((await screen.findAllByText(/A2/)).length).toBeGreaterThan(0);
    expect(calculatePlacementLevel).toHaveBeenCalledWith({ 1: 10, 2: 21 });
  });

  it('retries when the level cannot be calculated', async () => {
    vi.mocked(calculatePlacementLevel).mockRejectedValueOnce(new Error('down'));
    vi.mocked(getPlacementQuestions).mockResolvedValue([question(1)]);
    renderTest();

    await pick('Варіант 1');
    fireEvent.click(screen.getByRole('button', { name: 'Завершити тест' }));

    expect(
      await screen.findByText(
        'Не вдалося розрахувати ваш рівень. Будь ласка, спробуйте ще раз.',
      ),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Спробувати ще раз' }));

    expect((await screen.findAllByText(/A2/)).length).toBeGreaterThan(0);
  });

  it('reports a failed load', async () => {
    vi.mocked(getPlacementQuestions).mockRejectedValue(new Error('down'));
    renderTest();

    expect(
      await screen.findByText('Не вдалося завантажити тест.'),
    ).toBeInTheDocument();
  });

  it('reports an empty test', async () => {
    vi.mocked(getPlacementQuestions).mockResolvedValue([]);
    renderTest();

    expect(await screen.findByText('Питань не знайдено.')).toBeInTheDocument();
  });
});
