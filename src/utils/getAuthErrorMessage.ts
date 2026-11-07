import { MIN_PASSWORD_LENGTH } from '../constants/auth';
import { DEFAULT_ERROR_MESSAGE } from './getErrorMessage';

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials: 'Невірна електронна пошта або пароль.',
  email_not_confirmed:
    'Електронну пошту не підтверджено. Перейдіть за посиланням з листа.',
  user_already_exists: 'Користувач з такою електронною поштою вже існує.',
  email_exists: 'Користувач з такою електронною поштою вже існує.',
  email_address_invalid: 'Некоректна електронна адреса.',
  weak_password: `Пароль надто слабкий. Використайте щонайменше ${MIN_PASSWORD_LENGTH} символів і уникайте поширених паролів.`,
  same_password: 'Новий пароль має відрізнятися від поточного.',
  over_email_send_rate_limit:
    'Забагато запитів. Спробуйте ще раз за кілька хвилин.',
  over_request_rate_limit:
    'Забагато запитів. Спробуйте ще раз за кілька хвилин.',
};

export const getAuthErrorMessage = (error: { code?: string }): string =>
  (error.code && AUTH_ERROR_MESSAGES[error.code]) || DEFAULT_ERROR_MESSAGE;
