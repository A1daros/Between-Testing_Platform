import styles from './ChunkError.module.scss';

export const ChunkError = () => {
  return (
    <div className={styles.container}>
      <p className={styles.errorText}>Не вдалося завантажити сторінку.</p>
      <div
        className={styles.errorButton}
        onClick={() => window.location.reload()}
      >
        Оновити
      </div>
    </div>
  );
};
