import { ErrorState } from '../ErrorState';

export const ChunkError = () => {
  return (
    <ErrorState
      message='Не вдалося завантажити сторінку.'
      actionLabel='Оновити'
      onAction={() => window.location.reload()}
    />
  );
};
