import { FunctionsHttpError } from '@supabase/supabase-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LEGAL_VERSION } from '../constants/legal';
import { supabase } from '../lib/supabase';
import { getCorrectAnswers, getCorrectAnswersIfUnlocked } from './answers';
import { MAX_AUDIO_SIZE, uploadTestAudio, validateAudioFile } from './audio';
import { signIn, signUp } from './auth';
import { sendContactMessage } from './contact';
import { unwrap, unwrapCount } from './helpers';
import {
  grantExtraAttempt,
  registerAudioPlay,
  saveQuizProgress,
  startQuizAttempt,
  submitQuizAttempt,
} from './quizAttempts';
import { getResultDetails } from './resultAnswers';

vi.mock('../lib/supabase', () => ({
  supabase: {
    rpc: vi.fn(),
    from: vi.fn(),
    functions: { invoke: vi.fn() },
    storage: { from: vi.fn() },
    auth: { signInWithPassword: vi.fn(), signUp: vi.fn() },
  },
}));

const rpc = vi.mocked(supabase.rpc) as unknown as ReturnType<typeof vi.fn>;

describe('helpers', () => {
  it('unwrap returns data or throws', () => {
    expect(unwrap({ data: 1, error: null })).toBe(1);
    expect(() => unwrap({ data: null, error: { message: 'bad' } })).toThrow(
      'bad',
    );
  });

  it('unwrapCount defaults to zero or throws', () => {
    expect(unwrapCount({ count: 3, error: null })).toBe(3);
    expect(unwrapCount({ count: null, error: null })).toBe(0);
    expect(() => unwrapCount({ count: 1, error: { message: 'bad' } })).toThrow(
      'bad',
    );
  });
});

describe('quiz attempts', () => {
  it('sends only ids and answers, never a user or a score', async () => {
    rpc.mockResolvedValue({ data: { score: 3, total: 5 }, error: null });

    await submitQuizAttempt(7, { 1: 2 });

    expect(rpc).toHaveBeenCalledWith('submit_quiz_attempt', {
      p_attempt_id: 7,
      p_answers: { 1: 2 },
    });
  });

  it('returns the progress status', async () => {
    rpc.mockResolvedValue({ data: { status: 'expired' }, error: null });

    await expect(saveQuizProgress(7, {}, 2)).resolves.toBe('expired');
    expect(rpc).toHaveBeenCalledWith('save_quiz_progress', {
      p_attempt_id: 7,
      p_answers: {},
      p_question_index: 2,
    });
  });

  it('returns the number of audio plays', async () => {
    rpc.mockResolvedValue({ data: { plays_used: 2 }, error: null });

    await expect(registerAudioPlay(7, 9)).resolves.toBe(2);
  });

  it('throws when the server refuses', async () => {
    rpc.mockResolvedValue({
      data: null,
      error: { message: 'No attempts left' },
    });

    await expect(startQuizAttempt(1)).rejects.toThrow('No attempts left');
    await expect(grantExtraAttempt('user', 1)).rejects.toThrow(
      'No attempts left',
    );
  });
});

describe('answer key', () => {
  it('treats access denied as a locked key', async () => {
    rpc.mockResolvedValue({
      data: null,
      error: { code: '42501', message: 'Access denied' },
    });

    await expect(getCorrectAnswersIfUnlocked(1)).resolves.toBeNull();
  });

  it('still throws other errors', async () => {
    rpc.mockResolvedValue({
      data: null,
      error: { code: '500', message: 'boom' },
    });

    await expect(getCorrectAnswersIfUnlocked(1)).rejects.toThrow('boom');
  });

  it('returns an empty list instead of null', async () => {
    rpc.mockResolvedValue({ data: null, error: null });

    await expect(getCorrectAnswersIfUnlocked(1)).resolves.toEqual([]);
    await expect(getCorrectAnswers(1)).resolves.toEqual([]);
  });
});

describe('getResultDetails', () => {
  const mockRows = (rows: unknown[]) => {
    const eq = vi.fn().mockResolvedValue({ data: rows, error: null });

    vi.mocked(supabase.from).mockReturnValue({
      select: () => ({ eq }),
    } as unknown as ReturnType<typeof supabase.from>);
  };

  const rows = [
    { question_id: 2, questions: { sort_order: 2, test_id: 5 } },
    { question_id: 1, questions: { sort_order: 1, test_id: 5 } },
  ];

  it('sorts rows and attaches the key', async () => {
    mockRows(rows);
    rpc.mockResolvedValue({
      data: [{ question_id: 1, answer_id: 11 }],
      error: null,
    });

    const details = await getResultDetails(1);

    expect(details.isKeyLocked).toBe(false);
    expect(details.rows.map((row) => row.question_id)).toEqual([1, 2]);
    expect(details.rows[0].correct_answer_id).toBe(11);
    expect(details.rows[1].correct_answer_id).toBeNull();
  });

  it('reports a locked key', async () => {
    mockRows(rows);
    rpc.mockResolvedValue({ data: null, error: { code: '42501', message: '' } });

    const details = await getResultDetails(1);

    expect(details.isKeyLocked).toBe(true);
    expect(details.rows[0].correct_answer_id).toBeNull();
  });

  it('does not ask for the key without rows', async () => {
    mockRows([]);

    await expect(getResultDetails(1)).resolves.toEqual({
      rows: [],
      isKeyLocked: false,
    });
    expect(rpc).not.toHaveBeenCalled();
  });
});

describe('auth', () => {
  const signUpInput = {
    name: 'Ivan',
    surname: 'Koval',
    email: 'ivan@example.test',
    password: 'secret-password',
  };

  it('records the consent version on sign up', async () => {
    vi.mocked(supabase.auth.signUp).mockResolvedValue({
      data: { session: null, user: null },
      error: null,
    });

    await expect(signUp(signUpInput)).resolves.toEqual({ hasSession: false });

    expect(supabase.auth.signUp).toHaveBeenCalledWith({
      email: signUpInput.email,
      password: signUpInput.password,
      options: {
        data: {
          display_name: 'Ivan Koval',
          name: 'Ivan',
          surname: 'Koval',
          terms_version: LEGAL_VERSION,
        },
      },
    });
  });

  it('translates auth errors', async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: { session: null, user: null },
      error: { code: 'invalid_credentials', message: 'Invalid login' },
    } as unknown as Awaited<
      ReturnType<typeof supabase.auth.signInWithPassword>
    >);

    await expect(signIn('a@b.c', 'x')).rejects.toThrow(
      'Невірна електронна пошта або пароль.',
    );
  });
});

describe('sendContactMessage', () => {
  const message = {
    firstName: 'Ivan',
    lastName: 'Koval',
    email: 'ivan@example.test',
    message: 'Hello',
    website: '',
  };
  const invoke = vi.mocked(supabase.functions.invoke);

  beforeEach(() => {
    invoke.mockResolvedValue({ data: { ok: true }, error: null });
  });

  it('resolves on success', async () => {
    await expect(sendContactMessage(message)).resolves.toBeUndefined();
    expect(invoke).toHaveBeenCalledWith('send-contact-email', {
      body: message,
    });
  });

  it('shows the text from the function', async () => {
    invoke.mockResolvedValue({
      data: null,
      error: new FunctionsHttpError({
        json: async () => ({ error: 'Забагато запитів.' }),
      }),
    });

    await expect(sendContactMessage(message)).rejects.toThrow(
      'Забагато запитів.',
    );
  });

  it('falls back to a Ukrainian message', async () => {
    invoke.mockResolvedValue({ data: null, error: new Error('network') });

    await expect(sendContactMessage(message)).rejects.toThrow(
      'Не вдалося надіслати повідомлення. Спробуйте ще раз пізніше.',
    );
  });
});

describe('audio files', () => {
  const file = (type: string, size = 10) => {
    const audio = new File(['x'], 'a.mp3', { type });

    Object.defineProperty(audio, 'size', { value: size });

    return audio;
  };

  it('accepts allowed audio', () => {
    expect(validateAudioFile(file('audio/mpeg'))).toBeNull();
    expect(validateAudioFile(file('audio/mpeg', MAX_AUDIO_SIZE))).toBeNull();
  });

  it('refuses other types and big files', () => {
    expect(validateAudioFile(file('video/mp4'))).toContain('Дозволені формати');
    expect(validateAudioFile(file('audio/mpeg', MAX_AUDIO_SIZE + 1))).toContain(
      'занадто великий',
    );
  });

  it('does not upload an invalid file', async () => {
    await expect(uploadTestAudio(file('video/mp4'))).rejects.toThrow(
      'Дозволені формати',
    );
    expect(supabase.storage.from).not.toHaveBeenCalled();
  });
});
