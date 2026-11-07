import { Alert } from '../Alert';
import styles from './ErrorState.module.scss';

type ErrorStateProps = {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

export const ErrorState = ({
  message,
  actionLabel = 'Спробувати ще раз',
  onAction,
}: ErrorStateProps) => {
  return (
    <div className={styles.container}>
      <Alert>{message}</Alert>

      {onAction && (
        <button type='button' className={styles.button} onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
};
