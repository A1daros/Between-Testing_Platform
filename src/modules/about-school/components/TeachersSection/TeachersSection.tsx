import type { Teacher } from '../../../../types/database';
import styles from './TeachersSection.module.scss';
import { SectionHeader } from '../../../shared/components/SectionHeader';

type TeachersSectionProps = {
  teachers: Teacher[];
};

export const TeachersSection = ({ teachers }: TeachersSectionProps) => {
  return (
    <section className={styles.teachersSection}>
      <SectionHeader label='BETWEEN / TEAM' title='Наші викладачі' />

      <div className={styles.teachersContainer}>
        {teachers.map((teacher) => (
          <article key={teacher.id} className={styles.teacherCard}>
            <div className={styles.imageWrapper}>
              <img src={teacher.photo_url} alt={teacher.name} loading='lazy' />
            </div>

            <div className={styles.teacherContent}>
              <h3 className={styles.teacherName}>{teacher.name}</h3>

              <dl className={styles.teacherInfo}>
                <div className={styles.infoRow}>
                  <dt className={styles.infoLabel}>Вік</dt>
                  <dd className={styles.infoValue}>{teacher.age}</dd>
                </div>
                <div className={styles.infoRow}>
                  <dt className={styles.infoLabel}>Роль</dt>
                  <dd className={styles.infoValue}>{teacher.role}</dd>
                </div>
                <div className={styles.infoRow}>
                  <dt className={styles.infoLabel}>Досвід</dt>
                  <dd className={styles.infoValue}>{teacher.experience}</dd>
                </div>
                <div className={styles.infoRow}>
                  <dt className={styles.infoLabel}>Фокус навчання</dt>
                  <dd className={styles.infoValue}>{teacher.specialties}</dd>
                </div>
              </dl>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
