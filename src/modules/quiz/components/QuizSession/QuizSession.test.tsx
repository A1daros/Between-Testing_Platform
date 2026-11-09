import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { QuizResultState } from '../../../../types/quiz';
import type {
  QuestionWithAnswers,
  QuizAttempt,
} from '../../../../types/database';
import {
  saveQuizProgress,
  submitQuizAttempt,
} from '../../../../services/quizAttempts';
import { captureError } from '../../../../utils/captureError';
import { QuizSession } from './QuizSession';

vi.mock('../../../../services/quizAttempts', () => ({
  registerAudioPlay: vi.fn(),
  saveQuizProgress: vi.fn(),
  submitQuizAttempt: vi.fn(),
}));
vi.mock('../../../../services/audio', () => ({ getTestAudioUrl: vi.fn() }));
vi.mock('../../../../utils/captureError', () => ({ captureError: vi.fn() }));

const save = vi.mocked(saveQuizProgress);
const submit = vi.mocked(submitQuizAttempt);

const question = (id: number, timerDuration: number | null = null) =>
  ({
    id,
    question: `Питання ${id}`,
    description: null,
    tests: {
      title: 'Тест',
      description: null,
      timer_enabled: timerDuration !== null,
      timer_type: null,
      timer_duration: timerDuration,
    },
    test_parts: null,
    answers: [
      { id: id * 10, question_id: id, answer_text: `Правильна ${id}` },
      { id: id * 10 + 1, question_id: id, answer_text: `Хибна ${id}` },
    ],
  }) as unknown as QuestionWithAnswers;

const attempt = (fields: Partial<QuizAttempt> = {}): QuizAttempt => ({
  id: 7,
  answers: {},
  audio_plays: {},
  question_index: 0,
  seconds_left: null,
  question_seconds_left: null,
  ...fields,
});

const ResultStub = () => {
  const state = useLocation().state as QuizResultState;

  return (
    <p>
      Результат {state.score} з {state.totalScore}, спроб {state.attemptsLeft}
    </p>
  );
};

const renderSession = (
  questions: QuestionWithAnswers[],
  currentAttempt: QuizAttempt,
) =>
  render(
    <MemoryRouter initialEntries={['/tests/1']}>
      <Routes>
        <Route
          path='/tests/:testId'
          element={
            <QuizSession
              testId={1}
              questions={questions}
              attempt={currentAttempt}
            />
          }
        />
        <Route path='/tests/:testId/results' element={<ResultStub />} />
      </Routes>
    </MemoryRouter>,
  );

const pick = (name: string) =>
  fireEvent.click(screen.getByRole('radio', { name: new RegExp(name) }));

const button = (name: string) => screen.getByRole('button', { name });

describe('QuizSession', () => {
  beforeEach(() => {
    save.mockResolvedValue('active');
    submit.mockResolvedValue({
      result_id: 1,
      score: 1,
      total: 2,
      attempts_used: 1,
      attempts_allowed: 2,
    });
  });

  it('resumes from the saved position and answers', () => {
    renderSession(
      [question(1), question(2)],
      attempt({ question_index: 1, answers: { 2: 20 } }),
    );

    expect(screen.getByText('Питання 2')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Правильна 2/ })).toBeChecked();
    expect(save).not.toHaveBeenCalled();
  });

  it('survives a saved position past the end of the test', () => {
    renderSession([question(1)], attempt({ question_index: 5 }));

    expect(screen.getByText('Питання 1')).toBeInTheDocument();
  });

  it('needs an answer before moving on', () => {
    renderSession([question(1), question(2)], attempt());

    expect(button('Наступне питання →')).toBeDisabled();

    pick('Правильна 1');

    expect(button('Наступне питання →')).toBeEnabled();
  });

  it('saves every answer and position to the server', async () => {
    renderSession([question(1), question(2)], attempt());

    pick('Правильна 1');
    await waitFor(() => expect(save).toHaveBeenCalledWith(7, { 1: 10 }, 0));

    fireEvent.click(button('Наступне питання →'));
    await waitFor(() => expect(save).toHaveBeenCalledWith(7, { 1: 10 }, 1));
  });

  it('submits all answers and opens the result', async () => {
    renderSession([question(1), question(2)], attempt());

    pick('Правильна 1');
    fireEvent.click(button('Наступне питання →'));
    pick('Хибна 2');
    fireEvent.click(button('Завершити тест'));

    expect(
      await screen.findByText('Результат 1 з 2, спроб 1'),
    ).toBeInTheDocument();
    expect(submit).toHaveBeenCalledTimes(1);
    expect(submit).toHaveBeenCalledWith(7, { 1: 10, 2: 21 });
  });

  it('waits for pending saves before submitting', async () => {
    let finishSave: (status: 'active') => void = () => {};

    save.mockReturnValueOnce(
      new Promise((resolve) => {
        finishSave = resolve;
      }),
    );

    renderSession([question(1)], attempt());

    pick('Правильна 1');
    await waitFor(() => expect(save).toHaveBeenCalled());
    fireEvent.click(button('Завершити тест'));
    await Promise.resolve();

    expect(submit).not.toHaveBeenCalled();

    finishSave('active');

    await waitFor(() => expect(submit).toHaveBeenCalledTimes(1));
  });

  it('keeps answers and offers a retry when submit fails', async () => {
    const failure = new Error('offline');

    submit.mockRejectedValueOnce(failure);
    renderSession([question(1)], attempt());

    pick('Правильна 1');
    fireEvent.click(button('Завершити тест'));

    fireEvent.click(await screen.findByRole('button', { name: 'Надіслати ще раз' }));

    expect(
      await screen.findByText('Результат 1 з 2, спроб 1'),
    ).toBeInTheDocument();
    expect(submit).toHaveBeenCalledTimes(2);
    expect(submit).toHaveBeenLastCalledWith(7, { 1: 10 });
    expect(captureError).toHaveBeenCalledWith(failure);
  });

  it('does not block the student when a save fails', async () => {
    const failure = new Error('offline');

    save.mockRejectedValueOnce(failure);
    renderSession([question(1), question(2)], attempt());

    pick('Правильна 1');

    await waitFor(() => expect(captureError).toHaveBeenCalledWith(failure));
    expect(button('Наступне питання →')).toBeEnabled();
  });

  it('submits when the server says the time is over', async () => {
    save.mockResolvedValue('expired');
    renderSession([question(1), question(2)], attempt());

    pick('Правильна 1');

    expect(
      await screen.findByText('Результат 1 з 2, спроб 1'),
    ).toBeInTheDocument();
  });

  it('submits when the test timer ends', async () => {
    renderSession([question(1), question(2)], attempt({ seconds_left: 1 }));

    expect(
      await screen.findByText('Результат 1 з 2, спроб 1', {}, { timeout: 3000 }),
    ).toBeInTheDocument();
  });

  it('moves on when the question timer ends', async () => {
    renderSession(
      [question(1, 30), question(2, 30)],
      attempt({ question_seconds_left: 1 }),
    );

    expect(
      await screen.findByText('Питання 2', {}, { timeout: 3000 }),
    ).toBeInTheDocument();
    expect(submit).not.toHaveBeenCalled();
  });

  it('submits when the timer of the last question ends', async () => {
    renderSession(
      [question(1, 30), question(2, 30)],
      attempt({ question_index: 1, question_seconds_left: 1 }),
    );

    expect(
      await screen.findByText('Результат 1 з 2, спроб 1', {}, { timeout: 3000 }),
    ).toBeInTheDocument();
  });

  it('allows going back only without a question timer', () => {
    const { unmount } = renderSession(
      [question(1), question(2)],
      attempt({ question_index: 1 }),
    );

    expect(button('← Назад')).toBeEnabled();
    unmount();

    renderSession(
      [question(1, 30), question(2, 30)],
      attempt({ question_index: 1, question_seconds_left: 30 }),
    );

    expect(
      screen.queryByRole('button', { name: '← Назад' }),
    ).not.toBeInTheDocument();
  });

  it('warns before leaving during a test', () => {
    renderSession([question(1)], attempt());

    const event = new Event('beforeunload', { cancelable: true });

    window.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
  });
});
