import { Link, generatePath } from 'react-router-dom';
import styles from './ChooseLevel.module.scss';
import type { Level } from '../../../../types/database';
import { ROUTES } from '../../../../constants/routes';
import { SectionHeader } from '../../../shared/components/SectionHeader';

type ChooseLevelProps = {
  title: string;
  levels: Level[];
};

export const ChooseLevel = ({ title, levels }: ChooseLevelProps) => {
  return (
    <section className={styles.page}>
      <SectionHeader label='BETWEEN / LEVELS' title={title} />

      <ul className={styles.grid}>
        {levels.map((level) => (
          <li key={level.id} className={styles.cell}>
            <Link
              to={generatePath(ROUTES.testsByLevel, {
                levelId: String(level.id),
              })}
              className={styles.link}
            >
              <span className={styles.arrow} aria-hidden='true'>
                ↗
              </span>
              <span className={styles.code}>{level.code}</span>
              <span className={styles.title}>{level.title}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
};
