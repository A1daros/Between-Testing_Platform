import { Link, generatePath } from 'react-router-dom';
import styles from './TestsList.module.scss';
import type { Test } from '../../../../types/database';
import { ROUTES } from '../../../../constants/routes';
import { getDurationLabel } from '../../../../utils/getDurationLabel';
import { getQuestionCount } from '../../../../utils/getQuestionCount';
import { padNumber } from '../../../../utils/padNumber';
import { QUESTION_FORMS, pluralize } from '../../../../utils/pluralize';

type TestsListProps = {
  tests: Test[];
  emptyMessage: string;
};

export const TestsList = ({ tests, emptyMessage }: TestsListProps) => {
  return (
    <section>
      <div className={styles.testsHeader}>
        <span className={styles.testsLabel}>ДОСТУПНІ ТЕСТИ</span>

        <span className={styles.testsCount}>{padNumber(tests.length)}</span>
      </div>

      {tests.length > 0 ? (
        <ul className={styles.testsList}>
          {tests.map((test, index) => {
            const titleId = `test-title-${test.id}`;
            const questionCount = getQuestionCount(test);

            return (
              <li key={test.id}>
                <Link
                  to={generatePath(ROUTES.quiz, { testId: String(test.id) })}
                  className={styles.testCard}
                  aria-labelledby={titleId}
                >
                  <div className={styles.testCardHeader}>
                    <span className={styles.testNumber}>
                      {padNumber(index + 1)}
                    </span>
                    <span className={styles.arrow} aria-hidden='true'>
                      →
                    </span>
                  </div>

                  <div className={styles.testBody}>
                    <h3 id={titleId} className={styles.testTitle}>
                      {test.title || 'Тест без назви'}
                    </h3>

                    {test.description && (
                      <p className={styles.testDescription}>
                        {test.description}
                      </p>
                    )}
                  </div>

                  <div className={styles.testInfo}>
                    <span className={styles.metaBadge}>
                      {getDurationLabel(test)}
                    </span>

                    <span className={styles.metaBadge}>
                      {questionCount} {pluralize(questionCount, QUESTION_FORMS)}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className={styles.emptyText}>{emptyMessage}</p>
      )}
    </section>
  );
};
