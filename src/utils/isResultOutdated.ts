export const isResultOutdated = (
  resultCreatedAt: string,
  testContentUpdatedAt: string | null | undefined,
): boolean =>
  Boolean(testContentUpdatedAt) &&
  new Date(resultCreatedAt) < new Date(testContentUpdatedAt as string);
