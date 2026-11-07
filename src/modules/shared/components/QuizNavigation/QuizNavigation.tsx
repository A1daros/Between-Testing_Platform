import styles from './QuizNavigation.module.scss';

type QuizNavigationProps = {
  isFirst: boolean;
  isLast: boolean;
  canGoNext: boolean;
  showBack?: boolean;
  onPrev: () => void;
  onNext: () => void;
  onFinish: () => void;
};

export const QuizNavigation = ({
  isFirst,
  isLast,
  canGoNext,
  showBack = true,
  onPrev,
  onNext,
  onFinish,
}: QuizNavigationProps) => {
  return (
    <nav className={styles.navigation} aria-label='Навігація тестом'>
      {showBack && (
        <button
          type='button'
          className={styles.backButton}
          disabled={isFirst}
          onClick={onPrev}
        >
          ← Назад
        </button>
      )}

      <button
        type='button'
        className={styles.nextButton}
        disabled={!canGoNext}
        onClick={isLast ? onFinish : onNext}
      >
        {isLast ? 'Завершити тест' : 'Наступне питання →'}
      </button>
    </nav>
  );
};
