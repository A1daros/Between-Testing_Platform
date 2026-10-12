import { MIN_PASSWORD_LENGTH } from '../constants/constants';

export const getPasswordErrorMessage = (error: {
  code?: string;
  message: string;
}): string =>
  error.code === 'weak_password'
    ? `Password is too weak. Use at least ${MIN_PASSWORD_LENGTH} characters and avoid common passwords.`
    : error.message;
