import { useNavigate } from 'react-router-dom';
import styles from './AboutSchool.module.scss';
import { PostList } from '../shared/components/PostList';
import { posts } from '../../data/posts.data.ts';

export const AboutSchool = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <section className={styles.heroSection}>
            <span className={styles.sectionLabel}>BETWEEN / ABOUT</span>

            <h1 className={styles.pageTitle}>About School</h1>

            <div className={styles.heroLine} />
          </section>

          <section className={styles.introSection}>
            <article className={styles.storyBlock}>
              <span className={styles.sectionNumber}>01</span>

              <p className={styles.description}>
                Є школи, де вчать англійської. А є місця, де англійська стає
                способом відкривати світ. BETWEEN народився не з бізнес-плану й
                не з бажання створити ще одну школу. Він народився з
                переконання, що навчання може бути іншим. Без страху зробити
                помилку. Без зубріння заради оцінок. Без відчуття, що англійська
                — це «не для мене». Ми хочемо, щоб кожен урок був місцем, де
                хочеться говорити, ставити запитання, сміятися, помилятися й
                знову пробувати. Бо саме так народжується впевненість. Це
                історія Міри, засновниці BETWEEN. Історія про те, чому для нас
                англійська — це значно більше, ніж предмет у розкладі. Ласкаво
                просимо до BETWEEN.
              </p>
            </article>

            <article className={styles.storyBlock}>
              <span className={styles.sectionNumber}>02</span>

              <p className={styles.description}>
                Є момент, який знайомий майже кожному. Ти вже знаєш достатньо
                англійської, щоб зрозуміти фільм. Але ще боїшся заговорити. Ти
                вже можеш подати резюме в міжнародну компанію. Але ще
                сумніваєшся, чи достатньо хороший твій рівень. Ти вже мрієш про
                життя без кордонів. Але поки що стоїш на порозі. Усе
                найважливіше відбувається саме між. Між страхом і впевненістю.
                Між «колись» і «зараз». Між тим, ким ти є, і тим, ким можеш
                стати. Саме тому ми називаємося BETWEEN. Ми не вчимо англійської
                заради англійської. Ми допомагаємо зробити той самий крок, після
                якого світ стає трохи ближчим. Welcome to BETWEEN.
              </p>
            </article>

            <article className={styles.storyBlock}>
              <span className={styles.sectionNumber}>03</span>

              <p className={styles.description}>
                Кожен вік відкриває нові можливості. У 7 років — це перші
                діалоги англійською. У 12 — впевненість сказати свою думку. У 15
                — можливість вільно спілкуватися з однолітками з інших країн. У
                17 — вступ до омріяного університету та високий результат на
                НМТ. Саме тому ми не будуємо однакові програми для всіх. Ми
                враховуємо вік, рівень знань і головне — мету, заради якої
                дитина вивчає англійську. Відкриваємо набір у групи: 7–9 років ·
                10–12 років · 13–15 років · 16–17 років Доступні групові та
                індивідуальні заняття.
              </p>
            </article>
          </section>

          <section className={styles.ctaSection}>
            <button
              className={styles.button}
              onClick={() => navigate('/register')}
            >
              Розпочнемо наше знайомство!
            </button>
          </section>

          <section className={styles.postsSection}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionLabel}>BETWEEN / STORIES</span>

              <h2 className={styles.sectionTitle}>{/* Section title */}</h2>
            </div>

            <PostList posts={posts} />
          </section>

          <section className={styles.infoSection}>
            <article className={styles.infoBlock}>
              <span className={styles.sectionNumber}>01</span>

              <h3 className={styles.blockTitle}>Головна ідея</h3>

              <p className={styles.description}>{/* Content */}</p>
            </article>

            <article className={styles.infoBlock}>
              <span className={styles.sectionNumber}>02</span>

              <h3 className={styles.blockTitle}>Наші цілі</h3>

              <p className={styles.description}>{/* Content */}</p>
            </article>

            <article className={styles.infoBlock}>
              <span className={styles.sectionNumber}>03</span>

              <h3 className={styles.blockTitle}>Наша методика</h3>

              <p className={styles.description}>{/* Content */}</p>
            </article>
          </section>

          <section className={styles.progressSection}>
            <div className={styles.statBlock}>
              <span className={styles.statLabel}>Було</span>

              <div className={styles.statCircle}>
                <span className={styles.statLevel}>A1</span>
              </div>

              <p className={styles.statCaption}>Рівень на старті навчання</p>
            </div>

            <div className={styles.statArrow}>→</div>

            <div className={`${styles.statBlock} ${styles.statBlockAccent}`}>
              <span className={styles.statLabel}>Стало</span>

              <div className={styles.statCircle}>
                <span className={styles.statLevel}>B1</span>
              </div>

              <p className={styles.statCaption}>
                Рівень через 8 місяців навчання
              </p>
            </div>
          </section>

          <section className={styles.teachersSection}>
            <article className={styles.teacherCard}>
              <div className={styles.imageWrapper}>
                <img src='' alt='' />
              </div>

              <span className={styles.teacherNumber}>01</span>

              <h3 className={styles.personName}>Mira</h3>

              <div className={styles.teacherInfo}>
                <p className={styles.characteristics}>Grade:</p>

                <p className={styles.characteristics}>Age:</p>

                <p className={styles.characteristics}>Role:</p>
              </div>
            </article>

            <article className={styles.teacherCard}>
              <div className={styles.imageWrapper}>
                <img src='' alt='' />
              </div>

              <span className={styles.teacherNumber}>02</span>

              <h3 className={styles.personName}>Vita</h3>

              <div className={styles.teacherInfo}>
                <p className={styles.characteristics}>Grade:</p>

                <p className={styles.characteristics}>Age:</p>

                <p className={styles.characteristics}>Role:</p>
              </div>
            </article>
          </section>

          <section className={styles.finalSection}>
            <span className={styles.sectionLabel}>BETWEEN / START</span>

            <h2 className={styles.finalTitle}>{/* CTA title */}</h2>

            <button
              className={styles.button}
              onClick={() => navigate('/register')}
            >
              Готові розпочати?
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};
