import styles from './AboutSchool.module.scss';
import { Link } from 'react-router-dom';
import { posts } from '../../data/posts.data';
import { companyValues } from '../../data/companyValues.data';
import { TeachersSection } from './components/TeachersSection';
import { ProgramsSection } from './components/ProgramsSection';
import { PostList } from './components/PostList';
import { Loader } from '../shared/components/Loader';
import { Alert } from '../shared/components/Alert';
import { loadTeachers } from '../../services/teachers';
import { loadProgramFormats, loadPrograms } from '../../services/programs';
import { SCHOOL_INSTAGRAM_URL } from '../../constants/school';
import { ROUTES } from '../../constants/routes';
import { useAsyncData } from '../../hooks/useAsyncData';
import { usePageMeta } from '../../hooks/usePageMeta';

const loadPageData = async () => {
  const [teachers, programs, programFormats] = await Promise.all([
    loadTeachers(),
    loadPrograms(),
    loadProgramFormats(),
  ]);

  return { teachers, programs, programFormats };
};

export const AboutSchool = () => {
  usePageMeta({
    title: 'Про школу',
    description:
      'Школа англійської мови BETWEEN: простір, де зникає страх помилки. Викладачі, програми й формати навчання, запис на навчання.',
    path: ROUTES.aboutSchool,
  });

  const { data, loading, error } = useAsyncData(loadPageData);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {loading && <Loader />}
        {Boolean(error) && (
          <Alert>Не вдалося завантажити дані сторінки.</Alert>
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

              <Link to={ROUTES.placementTest} className={styles.button}>
                Пройти безкоштовний тест
              </Link>
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
                  aria-hidden='true'
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

          <TeachersSection teachers={data?.teachers ?? []} />

          <ProgramsSection
            programsData={data?.programs ?? []}
            programFormats={data?.programFormats ?? []}
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
                <a
                  href={SCHOOL_INSTAGRAM_URL}
                  className={styles.finalButton}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  Записатися на рівень
                </a>

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
