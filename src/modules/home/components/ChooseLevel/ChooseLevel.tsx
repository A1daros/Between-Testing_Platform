import { Link, generatePath } from 'react-router-dom';
import styles from './ChooseLevel.module.scss';
import type { Level } from '../../../../types/database';
import { ROUTES } from '../../../../constants/routes';

type ChooseLevelProps = {
  title: string;
  levels: Level[];
};

export const ChooseLevel = ({ title, levels }: ChooseLevelProps) => {
  return (
    <div className={styles.page}>
      <h2 className={styles.title}>{title}</h2>

      <ul className={styles.wrapper}>
        {levels.map((level) => (
          <li key={level.id} className={styles.levelItem}>
            <Link
              to={generatePath(ROUTES.testsByLevel, {
                levelId: String(level.id),
              })}
              className={styles.link}
            >
              <div className={styles.itemWrapper}>
                <h3 className={styles.itemLevel}>{level.code}</h3>
                <h3 className={styles.itemTitle}>{level.title}</h3>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};
