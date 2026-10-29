import styles from './AboutSchool.module.scss';
import { Link, useNavigate } from 'react-router-dom';

import { posts } from '../../data/posts.data.ts';
import { companyValues } from '../../data/companyValues.data.ts';

import { TeachersSection } from './components/TeachersSection';
import { ProgramsSection } from './components/ProgramsSection';
import { PostList } from '../shared/components/PostList';
import { useEffect, useState } from 'react';
import type { Program, ProgramFormat, Teacher } from '../../types/database.ts';
import { loadTeachers } from '../../services/teachers.ts';
import { Loader } from '../Loader/Loader.tsx';
import { loadProgramFormats, loadPrograms } from '../../services/programs.ts';
import { SCHOOL_INSTAGRAM_URL } from '../../constants/constants';

export const AboutSchool = () => {
  const [teacher, setTeacher] = useState<Teacher[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [programFormats, setProgramFormats] = useState<ProgramFormat[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const [teachersData, programsData, programFormatsData] =
          await Promise.all([
            loadTeachers(),
            loadPrograms(),
            loadProgramFormats(),
          ]);

        setTeacher(teachersData);
        setPrograms(programsData);
        setProgramFormats(programFormatsData);
      } catch (error) {
        console.error(error);
        setErrorMessage('Не вдалось завантажити дані сторінки!');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {isLoading && <Loader />}
        {errorMessage && (
          <div className={styles.errorCard} role='alert' aria-live='assertive'>
            <p className={styles.errorText}>{errorMessage}</p>
          </div>
        )}
        <h1 className={styles.title}>Про школу англійської мови BETWEEN</h1>

        <div className={styles.wrapper}>
          <section className={styles.heroSection}>
            <span className={styles.sectionLabel}>BETWEEN / ABOUT</span>

            <h2 className={styles.sectionTitle}>
              Більше, ніж просто школа англійської
            </h2>
            <p className={styles.sectionDescription}>
              Простір, де зникає страх помилки та народжується впевненість у
              спілкуванні.
            </p>

            <div className={styles.heroLine} />
          </section>

          <section className={styles.infoSection}>
            {companyValues.map((item) => (
              <article key={item.id} className={styles.storyBlock}>
                <span className={styles.storySectionNumber}>{item.id}</span>
                <h3 className={styles.storyTitle}>{item.title}</h3>
                <p className={styles.storyDescription}>{item.description}</p>
              </article>
            ))}
          </section>

          <section className={styles.ctaSection}>
            <span className={styles.sectionLabel}>BETWEEN / LEVEL TEST</span>

            <h2 className={styles.sectionTitle}>
              Дізнайтеся свій точний рівень англійської
            </h2>

            <div className={styles.ctaBlock}>
              <p
                className={`${styles.sectionDescription} ${styles.ctaDescription}`}
              >
                Пройдіть інтерактивний тест та отримайте миттєву оцінку за
                шкалою CEFR (A1-C1) з детальною рекомендацією щодо форми
                навчання.
              </p>

              <div className={styles.ctaBadges}>
                <span className={styles.badge}>⏱ Займе 5-7 хвилин</span>
                <span className={styles.badge}>🔓 Без реєстрації та пошти</span>
                <span className={styles.badge}>📊 Автоматичний результат</span>
              </div>

              <button
                className={styles.button}
                onClick={() => navigate('/placement-test')}
              >
                Пройти безкоштовний тест
              </button>
            </div>
          </section>

          <section className={styles.progressSection}>
            <div className={styles.progressText}>
              <h2 className={styles.sectionTitle}>
                Видимий результат навчання
              </h2>
              <p className={styles.sectionDescription}>
                Середній прогрес наших студентів за 8 місяців регулярних занять
              </p>
            </div>

            <div className={styles.progressMetrics}>
              <div className={styles.statBlock}>
                <span className={styles.statLabel}>Старт</span>

                <div className={styles.statCircle}>
                  <span className={styles.statLevel}>A1</span>
                </div>

                <p className={styles.statCaption}>Початковий рівень</p>
              </div>

              <div className={styles.statArrow}>
                <svg
                  width='24'
                  height='24'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                >
                  <path d='M5 12h14M12 5l7 7-7 7' />
                </svg>
              </div>

              <div className={`${styles.statBlock} ${styles.statBlockAccent}`}>
                <span className={styles.statLabel}>Результат</span>

                <div className={styles.statCircle}>
                  <span className={styles.statLevel}>B1</span>
                </div>

                <p className={styles.statCaption}>Вільне спілкування</p>
              </div>
            </div>
          </section>

          <TeachersSection teachers={teacher} />

          <ProgramsSection
            programsData={programs}
            programFormats={programFormats}
          />

          <section className={styles.postsSection}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionLabel}>BETWEEN / STORIES</span>
              <h2 className={styles.sectionTitle}>
                Історії та корисні матеріали
              </h2>
            </div>
            <PostList posts={posts} />
          </section>

          <section className={styles.finalSection}>
            <div className={styles.finalCard}>
              <span className={styles.sectionLabel}>BETWEEN / START</span>

              <h2 className={styles.sectionTitle}>
                Розпочніть свій шлях до англійської вже сьогодні
              </h2>

              <p className={styles.sectionDescription}>
                Створіть акаунт на <strong>BETWEEN</strong>. Після реєстрації з
                вами особисто зв’яжеться <strong>Mira</strong>, засновниця
                школи. Разом ви визначите ваші цілі, сплануєте зручний графік
                навчання та підберете оптимальну програму.
              </p>

              <div className={styles.finalActions}>
                <Link
                  to={SCHOOL_INSTAGRAM_URL}
                  className={styles.finalButton}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  Записатися на рівень
                </Link>

                <p className={styles.thankYouNote}>
                  Дякуємо, що обираєте BETWEEN! Ми цінуємо вашу довіру та готові
                  підтримувати вас на кожному етапі.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
