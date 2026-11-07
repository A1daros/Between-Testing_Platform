export const DEFAULT_ERROR_MESSAGE =
  'Щось пішло не так. Будь ласка, спробуйте ще раз пізніше.';

export const getErrorMessage = (
  error: unknown,
  fallback: string = DEFAULT_ERROR_MESSAGE,
): string => (error instanceof Error && error.message) || fallback;
