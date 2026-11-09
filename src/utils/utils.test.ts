import { describe, expect, it } from 'vitest';
import { MIN_PASSWORD_LENGTH } from '../constants/auth';
import { ADMIN_ROUTES } from '../constants/routes';
import type { Profile } from '../types/database';
import { formatDate } from './formatDate';
import { getAdminPath } from './getAdminPath';
import { getAuthErrorMessage } from './getAuthErrorMessage';
import { getDurationLabel } from './getDurationLabel';
import { DEFAULT_ERROR_MESSAGE, getErrorMessage } from './getErrorMessage';
import { getQuizResultState } from './getQuizResultState';
import { isProfileApproved } from './isProfileApproved';
import { isResultOutdated } from './isResultOutdated';
import { padNumber } from './padNumber';
import { QUESTION_FORMS, pluralize } from './pluralize';
import { validatePassword } from './validatePassword';

const profile = (fields: Partial<Profile>) => fields as Profile;

describe('padNumber', () => {
  it('pads single digits and keeps longer numbers', () => {
    expect(padNumber(1)).toBe('01');
    expect(padNumber(12)).toBe('12');
    expect(padNumber(123)).toBe('123');
  });
});

describe('pluralize', () => {
  it.each([
    [1, 'питання'],
    [2, 'питання'],
    [5, 'питань'],
    [11, 'питань'],
    [21, 'питання'],
    [0, 'питань'],
  ])('picks the Ukrainian form for %i', (count, form) => {
    expect(pluralize(count, QUESTION_FORMS)).toBe(form);
  });
});

describe('getDurationLabel', () => {
  it('reports no timer without a type or a duration', () => {
    expect(getDurationLabel({ timer_type: null, timer_duration: 60 })).toBe(
      'Без таймера',
    );
    expect(getDurationLabel({ timer_type: 'test', timer_duration: 0 })).toBe(
      'Без таймера',
    );
  });

  it('formats the duration with its scope', () => {
    expect(getDurationLabel({ timer_type: 'test', timer_duration: 120 })).toBe(
      '2 хв на весь тест',
    );
    expect(getDurationLabel({ timer_type: 'test', timer_duration: 90 })).toBe(
      '1 хв 30 с на весь тест',
    );
    expect(
      getDurationLabel({ timer_type: 'question', timer_duration: 45 }),
    ).toBe('45 с на кожне питання');
  });
});

describe('getQuizResultState', () => {
  const result = { result_id: 1, score: 3, total: 5 };

  it('counts the attempts left', () => {
    expect(
      getQuizResultState({ ...result, attempts_used: 1, attempts_allowed: 2 }),
    ).toEqual({ score: 3, totalScore: 5, attemptsLeft: 1 });
  });

  it('never goes below zero', () => {
    expect(
      getQuizResultState({ ...result, attempts_used: 3, attempts_allowed: 2 })
        .attemptsLeft,
    ).toBe(0);
  });

  it('keeps null for users without a limit', () => {
    expect(
      getQuizResultState({
        ...result,
        attempts_used: 7,
        attempts_allowed: null,
      }).attemptsLeft,
    ).toBeNull();
  });
});

describe('isProfileApproved', () => {
  it('mirrors private.is_approved', () => {
    expect(isProfileApproved(null)).toBe(false);
    expect(
      isProfileApproved(profile({ role: 'student', status: 'pending' })),
    ).toBe(false);
    expect(
      isProfileApproved(profile({ role: 'student', status: 'rejected' })),
    ).toBe(false);
    expect(
      isProfileApproved(profile({ role: 'student', status: 'approved' })),
    ).toBe(true);
    expect(
      isProfileApproved(profile({ role: 'admin', status: 'pending' })),
    ).toBe(true);
  });
});

describe('isResultOutdated', () => {
  it('marks only results older than the last content change', () => {
    expect(isResultOutdated('2026-01-01T00:00:00Z', '2026-01-02T00:00:00Z')).toBe(
      true,
    );
    expect(isResultOutdated('2026-01-03T00:00:00Z', '2026-01-02T00:00:00Z')).toBe(
      false,
    );
    expect(isResultOutdated('2026-01-01T00:00:00Z', null)).toBe(false);
    expect(isResultOutdated('2026-01-01T00:00:00Z', undefined)).toBe(false);
  });
});

describe('getErrorMessage', () => {
  it('uses the error message, then the fallback', () => {
    expect(getErrorMessage(new Error('Текст'))).toBe('Текст');
    expect(getErrorMessage(new Error(''), 'Запасний')).toBe('Запасний');
    expect(getErrorMessage('not an error', 'Запасний')).toBe('Запасний');
    expect(getErrorMessage(null)).toBe(DEFAULT_ERROR_MESSAGE);
  });
});

describe('getAuthErrorMessage', () => {
  it('translates known codes', () => {
    expect(getAuthErrorMessage({ code: 'invalid_credentials' })).toBe(
      'Невірна електронна пошта або пароль.',
    );
    expect(getAuthErrorMessage({ code: 'weak_password' })).toContain(
      String(MIN_PASSWORD_LENGTH),
    );
  });

  it('never leaks an unknown code', () => {
    expect(getAuthErrorMessage({ code: 'something_new' })).toBe(
      DEFAULT_ERROR_MESSAGE,
    );
    expect(getAuthErrorMessage({})).toBe(DEFAULT_ERROR_MESSAGE);
  });
});

describe('validatePassword', () => {
  const valid = 'a'.repeat(MIN_PASSWORD_LENGTH);

  it('accepts the minimum length', () => {
    expect(validatePassword(valid)).toBeNull();
    expect(validatePassword(valid, valid)).toBeNull();
  });

  it('refuses a short password', () => {
    expect(validatePassword(valid.slice(1))).toContain(
      String(MIN_PASSWORD_LENGTH),
    );
  });

  it('checks the confirmation first', () => {
    expect(validatePassword('short', 'other')).toBe('Паролі не збігаються.');
  });
});

describe('getAdminPath', () => {
  it('builds absolute admin paths with params', () => {
    expect(getAdminPath(ADMIN_ROUTES.tests)).toBe('/admin/tests');
    expect(getAdminPath(ADMIN_ROUTES.testEdit, { testId: 7 })).toBe(
      '/admin/tests/7/edit',
    );
  });
});

describe('formatDate', () => {
  it('uses the Ukrainian date format', () => {
    expect(formatDate('2026-11-09T12:00:00Z')).toBe('09.11.2026');
  });
});
