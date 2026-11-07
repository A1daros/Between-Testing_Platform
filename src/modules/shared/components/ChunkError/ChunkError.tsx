import styles from './ChunkError.module.scss';

export const ChunkError = () => {
  return (
    <div className={styles.container}>
      <p className={styles.errorText}>Не вдалося завантажити сторінку.</p>
      <button
        type='button'
        className={styles.errorButton}
        onClick={() => window.location.reload()}
      >
        Оновити
      </button>
    </div>
  );
};
