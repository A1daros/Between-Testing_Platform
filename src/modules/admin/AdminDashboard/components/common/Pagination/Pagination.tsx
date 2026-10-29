import styles from './Pagination.module.scss';

type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export const Pagination = ({
  page,
  totalPages,
  onPageChange,
}: PaginationProps) => {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav className={styles.pagination} aria-label='Сторінки'>
      <button
        type='button'
        className={styles.button}
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        Попередня
      </button>

      <span className={styles.info}>
        Сторінка {page} з {totalPages}
      </span>

      <button
        type='button'
        className={styles.button}
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Наступна
      </button>
    </nav>
  );
};
