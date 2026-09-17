import styles from './TeachersSection.module.scss';
import type { Teacher } from '../../../../types/landing';
import type React from 'react';

type Props = {
  teachers: Teacher[];
};

export const TeachersSection: React.FC<Props> = ({ teachers }) => {
  return (
    <section className={styles.teachersSection}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionLabel}>BETWEEN / TEAM</span>
        <h2 className={styles.sectionTitle}>Наші викладачі</h2>
      </div>

      <div className={styles.teachersContainer}>
        {teachers.map((teacher) => (
          <article key={teacher.id} className={styles.teacherCard}>
            <div className={styles.imageWrapper}>
              <img src={teacher.imgSrc} alt={teacher.name} />
            </div>

            <div className={styles.teacherContent}>
              <div className={styles.cardHeader}>
                <span className={styles.teacherNumber}>{teacher.id}</span>
                <h3 className={styles.teacherName}>{teacher.name}</h3>
              </div>

              <div className={styles.teacherInfo}>
                <p className={styles.characteristics}>
                  <strong>Роль:</strong> {teacher.role}
                </p>
                <p className={styles.characteristics}>
                  <strong>Досвід:</strong> {teacher.experience}
                </p>
                <p className={styles.characteristics}>
                  <strong>Фокус навчання:</strong> {teacher.specialties}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
