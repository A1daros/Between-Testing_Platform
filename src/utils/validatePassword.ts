import { MIN_PASSWORD_LENGTH } from '../constants/auth';

export const validatePassword = (
  password: string,
  confirmPassword?: string,
): string | null => {
  if (confirmPassword !== undefined && password !== confirmPassword) {
    return 'Паролі не збігаються.';
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Пароль має містити щонайменше ${MIN_PASSWORD_LENGTH} символів.`;
  }

  return null;
};
