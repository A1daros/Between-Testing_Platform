import { useEffect, useState } from 'react';
import styles from './TestsPage.module.scss';
import type { Test } from '../../types/database';
import { Loader } from '../shared/components/Loader';
import { Link, generatePath } from 'react-router-dom';
import { getTests } from '../../services/tests';
import { getDurationLabel } from '../../utils/getDurationLabel';
import { usePageMeta } from '../../hooks/usePageMeta';
import { ROUTES } from '../../constants/routes';
import { QUESTION_FORMS, pluralize } from '../../utils/pluralize';

export const TestsPage = () => {
  usePageMeta({ title: 'Тести', noindex: true });

  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadTests = async () => {
      setLoading(true);
      setErrorMessage('');

      try {
        const testsData = await getTests();

        setTests(testsData);
      } catch (error) {
        console.error('Failed to load tests:', error);
        setErrorMessage('Не вдалось завантажити тести!');
      } finally {
        setLoading(false);
      }
    };

    loadTests();
  }, []);

  if (loading) {
    return <Loader />;
  }

  if (errorMessage) {
    return (
      <div className={styles.page}>
        <div className={styles.errorCard}>
          <div className={styles.errorText}>{errorMessage}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>Знайдіть свій тест</h1>

        <div className={styles.wrapper}>
          <section className={styles.heroSection}>
            <span className={styles.sectionLabel}>BETWEEN / TESTS</span>
            <h2 className={styles.sectionTitle}>
              Перевірте свої знання англійської мови
            </h2>

            <p className={styles.sectionDescription}>
              Оберіть тест і дізнайтеся свій поточний рівень англійської мови.
            </p>
          </section>

          <section className={styles.testsSection}>
            <div className={styles.testsHeader}>
              <span className={styles.testsLabel}>ДОСТУПНІ ТЕСТИ</span>

              <span className={styles.testsCount}>
                {String(tests.length).padStart(2, '0')}
              </span>
            </div>

            <ul className={styles.testsList}>
              {tests.map((test, index) => {
                const testTitle = test.title ?? 'Тест без назви';
                const testId = `test-title-${test.id}`;
                const questionCount = Array.isArray(test.questions)
                  ? (test.questions[0]?.count ?? 0)
                  : 0;

                return (
                  <li key={test.id} className={styles.testItem}>
                    <Link
                      to={generatePath(ROUTES.quiz, {
                        testId: String(test.id),
                      })}
                      className={styles.testCard}
                      aria-labelledby={testId}
                    >
                      <div className={styles.testCardHeader}>
                        <span className={styles.testNumber}>
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <h3 id={testId} className={styles.testTitle}>
                          {testTitle}
                        </h3>
                      </div>

                      {test.description && (
                        <p className={styles.testDescription}>
                          {test.description}
                        </p>
                      )}

                      <div className={styles.testInfo}>
                        <div className={styles.metaBox}>
                          <span className={styles.metaBadge}>
                            {getDurationLabel(test)}
                          </span>
                          <span
                            className={styles.metaBadge}
                          >
                            {questionCount}{' '}
                            {pluralize(questionCount, QUESTION_FORMS)}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};
