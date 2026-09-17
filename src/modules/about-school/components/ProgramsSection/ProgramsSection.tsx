import type React from 'react';
import type { Program } from '../../../../types/landing';
import styles from './ProgramsSection.module.scss';

type Props = {
  programsData: Program[];
  onRegister: () => void;
};

export const ProgramsSection: React.FC<Props> = ({
  programsData,
  onRegister,
}) => {
  return (
    <section className={styles.programsSection}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionLabel}>BETWEEN / PROGRAMS</span>
        <h2 className={styles.sectionTitle}>Напрямки навчання та вартість</h2>
        <p className={styles.sectionSubtitle}>
          Обирайте формат, який найліпше підходить під цілі та графік вашої
          дитини
        </p>
      </div>

      <div className={styles.programsContainer}>
        {programsData.map((program) => (
          <article key={program.id} className={styles.programCard}>
            <span className={styles.ageBadge}>{program.ageGroup}</span>
            <h3 className={styles.programTitle}>{program.title}</h3>
            <p className={styles.programDescription}>{program.description}</p>

            <div className={styles.formatList}>
              {program.formats.map((format, index) => (
                <div
                  key={index}
                  className={`${styles.formatItem} ${format.isPopular ? styles.popularFormat : ''}`}
                >
                  {format.isPopular && (
                    <span className={styles.popularTag}>Популярний вибір</span>
                  )}
                  <div className={styles.formatMeta}>
                    <strong>{format.type}</strong>
                    <span className={styles.formatTimeline}>
                      {format.lessonsCount} · {format.duration}
                    </span>
                  </div>
                  <div className={styles.formatPrice}>
                    <p>{format.price}</p>
                  </div>
                </div>
              ))}
            </div>

            <button className={styles.cardButton} onClick={onRegister}>
              Записатися на рівень
            </button>
          </article>
        ))}
      </div>
    </section>
  );
};
