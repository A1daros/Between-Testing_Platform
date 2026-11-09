import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { captureError } from '../utils/captureError';
import { useAsyncData } from './useAsyncData';
import { useCountdown } from './useCountdown';
import { useDebouncedValue } from './useDebouncedValue';
import { useQuiz } from './useQuiz';

vi.mock('../utils/captureError', () => ({ captureError: vi.fn() }));

describe('useQuiz', () => {
  const questions = [{ id: 1 }, { id: 2 }, { id: 3 }];

  it('starts at the first question without answers', () => {
    const { result } = renderHook(() => useQuiz(questions));

    expect(result.current.currentQuestion).toEqual({ id: 1 });
    expect(result.current.selectedAnswerId).toBeNull();
    expect(result.current.total).toBe(3);
  });

  it('restores a saved position and answers', () => {
    const { result } = renderHook(() =>
      useQuiz(questions, { initialIndex: 1, initialAnswers: { 2: 20 } }),
    );

    expect(result.current.currentQuestion).toEqual({ id: 2 });
    expect(result.current.selectedAnswerId).toBe(20);
  });

  it('stores an answer per question', () => {
    const { result } = renderHook(() => useQuiz(questions));

    act(() => result.current.handleChooseAnswer({ id: 10 }));
    act(() => result.current.handleNextQuestion());
    act(() => result.current.handleChooseAnswer({ id: 20 }));

    expect(result.current.userAnswers).toEqual({ 1: 10, 2: 20 });
  });

  it('replaces an answer to the same question', () => {
    const { result } = renderHook(() => useQuiz(questions));

    act(() => result.current.handleChooseAnswer({ id: 10 }));
    act(() => result.current.handleChooseAnswer({ id: 11 }));

    expect(result.current.userAnswers).toEqual({ 1: 11 });
  });

  it('stays inside the question list', () => {
    const { result } = renderHook(() => useQuiz(questions));

    act(() => result.current.handlePrevQuestion());
    expect(result.current.currentQuestionIndex).toBe(0);

    act(() => {
      result.current.handleNextQuestion();
      result.current.handleNextQuestion();
      result.current.handleNextQuestion();
      result.current.handleNextQuestion();
    });
    expect(result.current.currentQuestionIndex).toBe(2);
  });

  it('finishes', () => {
    const { result } = renderHook(() => useQuiz(questions));

    act(() => result.current.handleFinishQuiz());

    expect(result.current.isFinished).toBe(true);
  });
});

describe('useCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('counts down and expires once', () => {
    const onExpire = vi.fn();
    const { result } = renderHook(() => useCountdown(2, onExpire));

    expect(result.current).toBe(2);

    act(() => vi.advanceTimersByTime(1000));
    expect(result.current).toBe(1);
    expect(onExpire).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(5000));
    expect(result.current).toBe(0);
    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  it('calls the latest callback', () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = renderHook(({ fn }) => useCountdown(1, fn), {
      initialProps: { fn: first },
    });

    rerender({ fn: second });
    act(() => vi.advanceTimersByTime(1500));

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('does not run without a duration', () => {
    const onExpire = vi.fn();

    renderHook(() => useCountdown(0, onExpire));
    act(() => vi.advanceTimersByTime(5000));

    expect(onExpire).not.toHaveBeenCalled();
  });

  it('stops after unmount', () => {
    const onExpire = vi.fn();
    const { unmount } = renderHook(() => useCountdown(1, onExpire));

    unmount();
    act(() => vi.advanceTimersByTime(5000));

    expect(onExpire).not.toHaveBeenCalled();
  });
});

describe('useDebouncedValue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('updates only after the delay, keeping the last value', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 300),
      { initialProps: { value: 'a' } },
    );

    rerender({ value: 'b' });
    act(() => vi.advanceTimersByTime(200));
    rerender({ value: 'c' });
    act(() => vi.advanceTimersByTime(200));
    expect(result.current).toBe('a');

    act(() => vi.advanceTimersByTime(100));
    expect(result.current).toBe('c');
  });
});

describe('useAsyncData', () => {
  it('loads data', async () => {
    const load = vi.fn().mockResolvedValue('data');
    const { result } = renderHook(() => useAsyncData(load));

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toBe('data');
    expect(result.current.error).toBeNull();
  });

  it('skips loading without a function', () => {
    const { result } = renderHook(() => useAsyncData(null));

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeUndefined();
  });

  it('reports and exposes an error', async () => {
    const failure = new Error('boom');
    const load = vi.fn().mockRejectedValue(failure);
    const { result } = renderHook(() => useAsyncData(load));

    await waitFor(() => expect(result.current.error).toBe(failure));
    expect(result.current.loading).toBe(false);
    expect(captureError).toHaveBeenCalledWith(failure);
  });

  it('reloads and clears the error', async () => {
    const load = vi
      .fn()
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce('data');
    const { result } = renderHook(() => useAsyncData(load));

    await waitFor(() => expect(result.current.error).not.toBeNull());

    act(() => result.current.reload());

    await waitFor(() => expect(result.current.data).toBe('data'));
    expect(result.current.error).toBeNull();
  });

  it('updates data locally', async () => {
    const load = vi.fn(async () => 1);
    const { result } = renderHook(() => useAsyncData(load));

    await waitFor(() => expect(result.current.data).toBe(1));

    act(() => result.current.setData((prev) => (prev ?? 0) + 1));

    expect(result.current.data).toBe(2);
  });

  it('ignores a response after unmount', async () => {
    let resolve: (value: string) => void = () => {};
    const load = vi.fn(
      () =>
        new Promise<string>((done) => {
          resolve = done;
        }),
    );
    const { result, unmount } = renderHook(() => useAsyncData(load));

    unmount();
    await act(async () => resolve('late'));

    expect(result.current.data).toBeUndefined();
  });
});
