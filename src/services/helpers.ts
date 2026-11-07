type QueryError = { message: string } | null;

export const unwrap = <T>({
  data,
  error,
}: {
  data: T | null;
  error: QueryError;
}): T => {
  if (error) {
    throw new Error(error.message);
  }

  return data as T;
};

export const unwrapCount = ({
  count,
  error,
}: {
  count: number | null;
  error: QueryError;
}): number => {
  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
};
