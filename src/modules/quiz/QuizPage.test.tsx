import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getQuestionsWithAnswersByTestId } from '../../services/questions';
import {
  getQuizAttempt,
  startQuizAttempt,
} from '../../services/quizAttempts';
import type {
  QuestionWithAnswers,
  QuizAttempt,
  QuizAttemptState,
} from '../../types/database';
import { QuizPage } from './QuizPage';

vi.mock('../../services/questions', () => ({
  getQuestionsWithAnswersByTestId: vi.fn(),
}));
vi.mock('../../services/quizAttempts', () => ({
  getQuizAttempt: vi.fn(),
  startQuizAttempt: vi.fn(),
  saveQuizProgress: vi.fn(),
  submitQuizAttempt: vi.fn(),
  registerAudioPlay: vi.fn(),
}));
vi.mock('../../services/audio', () => ({ getTestAudioUrl: vi.fn() }));
vi.mock('../../utils/captureError', () => ({ captureError: vi.fn() }));

const questions = [
  {
    id: 1,
    question: 'Перше питання',
    description: null,
    test_parts: null,
    tests: {
      title: 'Фінальний тест',
      description: null,
      timer_enabled: false,
      timer_type: null,
      timer_duration: null,
    },
    answers: [{ id: 10, question_id: 1, answer_text: 'Відповідь' }],
  },
] as unknown as QuestionWithAnswers[];

const activeAttempt: QuizAttempt = {
  id: 7,
  answers: {},
  audio_plays: {},
  question_index: 0,
  seconds_left: null,
  question_seconds_left: null,
};

const state = (fields: Partial<QuizAttemptState> = {}): QuizAttemptState => ({
  attempt: null,
  expired_result: null,
  attempts_used: 0,
  attempts_allowed: 2,
  ...fields,
});

const renderPage = (path = '/tests/1') =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path='/tests/:testId' element={<QuizPage />} />
        <Route path='/tests/:testId/results' element={<p>Сторінка результату</p>} />
      </Routes>
    </MemoryRouter>,
  );

describe('QuizPage', () => {
  beforeEach(() => {
    vi.mocked(getQuestionsWithAnswersByTestId).mockResolvedValue(questions);
    vi.mocked(getQuizAttempt).mockResolvedValue(state());
  });

  it('shows the start screen without starting an attempt', async () => {
    renderPage();

    expect(
      await screen.findByRole('button', { name: 'Почати тест' }),
    ).toBeEnabled();
    expect(screen.getByText('0 з 2')).toBeInTheDocument();
    expect(startQuizAttempt).not.toHaveBeenCalled();
    expect(screen.queryByText('Перше питання')).not.toBeInTheDocument();
  });

  it('opens the session after the server starts an attempt', async () => {
    vi.mocked(startQuizAttempt).mockResolvedValue(
      state({ attempt: activeAttempt, attempts_used: 1 }),
    );
    renderPage();

    fireEvent.click(await screen.findByRole('button', { name: 'Почати тест' }));

    expect(await screen.findByText('Перше питання')).toBeInTheDocument();
    expect(startQuizAttempt).toHaveBeenCalledWith(1);
  });

  it('resumes an active attempt right away', async () => {
    vi.mocked(getQuizAttempt).mockResolvedValue(
      state({ attempt: activeAttempt, attempts_used: 1 }),
    );
    renderPage();

    expect(await screen.findByText('Перше питання')).toBeInTheDocument();
  });

  it('stays on the start screen when starting fails', async () => {
    vi.mocked(startQuizAttempt).mockRejectedValue(new Error('offline'));
    renderPage();

    fireEvent.click(await screen.findByRole('button', { name: 'Почати тест' }));

    expect(
      await screen.findByText('Не вдалося почати тест. Спробуйте ще раз.'),
    ).toBeInTheDocument();
  });

  it('offers no start when attempts are used up', async () => {
    vi.mocked(getQuizAttempt).mockResolvedValue(state({ attempts_used: 2 }));
    renderPage();

    expect(await screen.findByText('Мої результати')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Почати тест' }),
    ).not.toBeInTheDocument();
  });

  it('opens the result of an attempt that expired while away', async () => {
    vi.mocked(getQuizAttempt).mockResolvedValue(
      state({
        expired_result: {
          result_id: 1,
          score: 0,
          total: 1,
          attempts_used: 1,
          attempts_allowed: 2,
        },
      }),
    );
    renderPage();

    expect(await screen.findByText('Сторінка результату')).toBeInTheDocument();
  });

  it('offers a retry when loading fails', async () => {
    vi.mocked(getQuizAttempt).mockRejectedValueOnce(new Error('offline'));
    renderPage();

    expect(
      await screen.findByText('Не вдалося завантажити тест.'),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Спробувати ще раз' }));

    expect(
      await screen.findByRole('button', { name: 'Почати тест' }),
    ).toBeInTheDocument();
  });

  it('does not query the server for an invalid test id', async () => {
    renderPage('/tests/abc');

    expect(await screen.findByText('Питання не знайдено.')).toBeInTheDocument();
    expect(getQuizAttempt).not.toHaveBeenCalled();
  });
});
