import type { ReactNode } from 'react';
import styles from './Alert.module.scss';

type AlertProps = {
  type?: 'error' | 'success';
  children: ReactNode;
};

export const Alert = ({ type = 'error', children }: AlertProps) => {
  if (type === 'success') {
    return (
      <div className={styles.success} role='status'>
        <p className={styles.successText}>✓ {children}</p>
      </div>
    );
  }

  return (
    <div className={styles.error} role='alert'>
      <p className={styles.errorText}>{children}</p>
    </div>
  );
};
