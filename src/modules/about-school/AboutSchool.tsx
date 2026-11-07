import styles from './AboutSchool.module.scss';
import { Link } from 'react-router-dom';
import { posts } from '../../data/posts.data';
import { companyValues } from '../../data/companyValues.data';
import { TeachersSection } from './components/TeachersSection';
import { ProgramsSection } from './components/ProgramsSection';
import { PostList } from './components/PostList';
import { Loader } from '../shared/components/Loader';
import { Alert } from '../shared/components/Alert';
import { SectionHeader } from '../shared/components/SectionHeader';
import { padNumber } from '../../utils/padNumber';
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
        <header className={styles.hero}>
          <span className={styles.sectionLabel}>BETWEEN / ABOUT</span>
          <h1 className={styles.title}>Про школу англійської мови BETWEEN</h1>
          <p className={styles.heroDescription}>
            Простір, де зникає страх помилки та народжується впевненість у
            спілкуванні.
          </p>
        </header>

        {loading && <Loader />}
        {Boolean(error) && (
          <Alert>Не вдалося завантажити дані сторінки.</Alert>
        )}

        <div className={styles.wrapper}>
          <section className={styles.section}>
            <SectionHeader title='Більше, ніж просто школа англійської' />

            <div className={styles.values}>
              {companyValues.map((item) => (
                <article key={item.id} className={styles.value}>
                  <span className={styles.valueNumber}>
                    {padNumber(item.id)}
                  </span>
                  <h3 className={styles.valueTitle}>{item.title}</h3>
                  <p className={styles.valueDescription}>{item.description}</p>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <SectionHeader
              label='BETWEEN / LEVEL TEST'
              title='Дізнайтеся свій точний рівень англійської'
            />

            <div className={styles.ctaBlock}>
              <p className={styles.ctaDescription}>
                Пройдіть інтерактивний тест та отримайте миттєву оцінку за
                шкалою CEFR (A1-C1) з детальною рекомендацією щодо форми
                навчання.
              </p>

              <ul className={styles.ctaFacts}>
                <li className={styles.fact}>5–7 хвилин</li>
                <li className={styles.fact}>Без реєстрації та пошти</li>
                <li className={styles.fact}>Автоматичний результат</li>
              </ul>

              <Link to={ROUTES.placementTest} className={styles.button}>
                Пройти безкоштовний тест
              </Link>
            </div>
          </section>

          <section className={styles.section}>
            <SectionHeader
              title='Видимий результат навчання'
              description='Середній прогрес наших студентів за 8 місяців регулярних занять'
            />

            <div className={styles.progress}>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Старт</span>
                <span className={styles.statLevel}>A1</span>
                <p className={styles.statCaption}>Початковий рівень</p>
              </div>

              <span className={styles.statLine} aria-hidden='true' />

              <div className={`${styles.stat} ${styles.statAccent}`}>
                <span className={styles.statLabel}>Результат</span>
                <span className={styles.statLevel}>B1</span>
                <p className={styles.statCaption}>Вільне спілкування</p>
              </div>
            </div>
          </section>

          <TeachersSection teachers={data?.teachers ?? []} />

          <ProgramsSection
            programsData={data?.programs ?? []}
            programFormats={data?.programFormats ?? []}
          />

          <section className={styles.section}>
            <SectionHeader
              label='BETWEEN / STORIES'
              title='Історії та корисні матеріали'
            />
            <PostList posts={posts} />
          </section>
        </div>
      </div>

      <section className={styles.final}>
        <div className={styles.finalContainer}>
          <span className={styles.finalLabel}>BETWEEN / START</span>

          <h2 className={styles.finalTitle}>
            Розпочніть свій шлях до англійської вже сьогодні
          </h2>

          <div className={styles.finalContent}>
            <p className={styles.finalDescription}>
              Створіть акаунт на <strong>BETWEEN</strong>. Після реєстрації з
              вами особисто зв’яжеться <strong>Mira</strong>, засновниця школи.
              Разом ви визначите ваші цілі, сплануєте зручний графік навчання
              та підберете оптимальну програму.
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
        </div>
      </section>
    </div>
  );
};
