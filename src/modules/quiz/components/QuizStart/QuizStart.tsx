import styles from './QuizStart.module.scss';
import { Link } from 'react-router-dom';
import type { TestOverview } from '../../../../types/database';
import { ROUTES } from '../../../../constants/routes';
import { getDurationLabel } from '../../../../utils/getDurationLabel';
import { QUESTION_FORMS, pluralize } from '../../../../utils/pluralize';
import { Alert } from '../../../shared/components/Alert';

type QuizStartProps = {
  test: TestOverview;
  attemptsUsed: number;
  attemptsAllowed: number | null;
  isStarting: boolean;
  errorMessage: string;
  onStart: () => void;
};

export const QuizStart = ({
  test,
  attemptsUsed,
  attemptsAllowed,
  isStarting,
  errorMessage,
  onStart,
}: QuizStartProps) => {
  const isExhausted =
    attemptsAllowed !== null && attemptsUsed >= attemptsAllowed;

  const duration = getDurationLabel({
    timer_type: test.timer_enabled ? test.timer_type : null,
    timer_duration: test.timer_duration,
  });

  return (
    <section className={styles.wrapper}>
      <span className={styles.label}>BETWEEN / TEST</span>

      <h1 className={styles.title}>{test.title}</h1>

      {test.description && (
        <p className={styles.description}>{test.description}</p>
      )}

      <dl className={styles.facts}>
        <div className={styles.fact}>
          <dt className={styles.factLabel}>Питання</dt>
          <dd className={styles.factValue}>
            {test.question_count} {pluralize(test.question_count, QUESTION_FORMS)}
          </dd>
        </div>

        <div className={styles.fact}>
          <dt className={styles.factLabel}>Час</dt>
          <dd className={styles.factValue}>{duration}</dd>
        </div>

        {attemptsAllowed !== null && (
          <div className={styles.fact}>
            <dt className={styles.factLabel}>Використано спроб</dt>
            <dd className={styles.factValue}>
              {attemptsUsed} з {attemptsAllowed}
            </dd>
          </div>
        )}
      </dl>

      {isExhausted ? (
        <>
          <p className={styles.note}>
            Спроби вичерпано. Якщо потрібна ще одна, зверніться до школи.
            Правильні відповіді доступні в розборі результату.
          </p>

          <Link to={ROUTES.myResults} className={styles.button}>
            Мої результати
          </Link>
        </>
      ) : (
        <>
          <p className={styles.note}>
            Спроба зараховується одразу після старту, навіть якщо ви не дасте
            жодної відповіді. Час не зупиняється, якщо закрити сторінку.
            Відповіді зберігаються автоматично, тож ви зможете продовжити.
            Правильні відповіді відкриються після останньої спроби.
          </p>

          {errorMessage && <Alert>{errorMessage}</Alert>}

          <button
            type='button'
            className={styles.button}
            disabled={isStarting}
            onClick={onStart}
          >
            {isStarting ? 'Запуск...' : 'Почати тест'}
          </button>
        </>
      )}
    </section>
  );
};
