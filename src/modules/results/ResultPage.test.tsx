import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import type { QuizResultState } from '../../types/quiz';
import { ResultPage } from './ResultPage';

const renderPage = (state: QuizResultState | null) =>
  render(
    <MemoryRouter initialEntries={[{ pathname: '/tests/1/results', state }]}>
      <Routes>
        <Route path='/tests/:testId/results' element={<ResultPage />} />
      </Routes>
    </MemoryRouter>,
  );

describe('ResultPage', () => {
  it('shows the score and the percentage', () => {
    renderPage({ score: 3, totalScore: 4, attemptsLeft: 1 });

    expect(screen.getByLabelText('Результат: 3 з 4')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('offers a retake while attempts are left', () => {
    renderPage({ score: 3, totalScore: 4, attemptsLeft: 1 });

    expect(screen.getByRole('link', { name: 'Спробуйте ще раз' })).toHaveAttribute(
      'href',
      '/tests/1',
    );
    expect(screen.getByText(/Залишилось спроб: 1/)).toBeInTheDocument();
  });

  it('offers no retake when attempts are used up', () => {
    renderPage({ score: 3, totalScore: 4, attemptsLeft: 0 });

    expect(
      screen.queryByRole('link', { name: 'Спробуйте ще раз' }),
    ).not.toBeInTheDocument();
    expect(screen.getByText(/Спроби вичерпано/)).toBeInTheDocument();
  });

  it('lets an admin retake without an attempts note', () => {
    renderPage({ score: 3, totalScore: 4, attemptsLeft: null });

    expect(
      screen.getByRole('link', { name: 'Спробуйте ще раз' }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/спроб/i, { selector: 'p' })).not.toBeInTheDocument();
  });

  it('does not divide by zero', () => {
    renderPage({ score: 0, totalScore: 0, attemptsLeft: 1 });

    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('explains when the page is opened without a result', () => {
    renderPage(null);

    expect(
      screen.getByText('Не знайдено жодного результату.'),
    ).toBeInTheDocument();
  });
});
