import styles from './ProgramsSection.module.scss';
import type { Program, ProgramFormat } from '../../../../types/database';
import { SCHOOL_INSTAGRAM_URL } from '../../../../constants/school';
import { SectionHeader } from '../../../shared/components/SectionHeader';

type ProgramsSectionProps = {
  programsData: Program[];
  programFormats: ProgramFormat[];
};

export const ProgramsSection = ({
  programsData,
  programFormats,
}: ProgramsSectionProps) => {
  return (
    <section className={styles.programsSection}>
      <SectionHeader
        label='BETWEEN / PROGRAMS'
        title='Напрямки навчання та вартість'
        description='Обирайте формат, який найліпше підходить під цілі та графік вашої дитини'
      />

      <div className={styles.programsContainer}>
        {programsData.map((program) => (
          <article key={program.id} className={styles.programCard}>
            <span className={styles.ageBadge}>{program.age_group}</span>
            <h3 className={styles.programTitle}>{program.title}</h3>
            <p className={styles.programDescription}>{program.description}</p>

            <div className={styles.formatList}>
              {programFormats
                .filter(
                  (format) => String(format.program_id) === String(program.id),
                )
                .map((format) => {
                  const correctPrice = Intl.NumberFormat('uk-UA').format(
                    format.price,
                  );

                  return (
                    <div
                      key={format.id}
                      className={`${styles.formatItem} ${format.is_popular ? styles.popularFormat : ''}`}
                    >
                      <div className={styles.formatMeta}>
                        <strong className={styles.formatType}>
                          {format.type}
                          {format.is_popular && (
                            <span className={styles.popularTag}>
                              Популярний вибір
                            </span>
                          )}
                        </strong>
                        <span className={styles.formatTimeline}>
                          {format.lessons_per_month} занять / міс ·{' '}
                          {format.duration_minutes}хв
                        </span>
                      </div>
                      <p className={styles.formatPrice}>{correctPrice} грн</p>
                    </div>
                  );
                })}
            </div>

            <a
              href={SCHOOL_INSTAGRAM_URL}
              className={styles.cardButton}
              target='_blank'
              rel='noopener noreferrer'
            >
              Записатися на рівень
            </a>
          </article>
        ))}
      </div>
    </section>
  );
};
