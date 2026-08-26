import { Link } from 'react-router-dom';
import styles from './ChooseLevel.module.scss';
import { useEffect, useState } from 'react';
import type { Level } from '../../../../types/database';
import { getLevelsById } from '../../../../services/quiz';

type Props = {
  title: string;
};

export const ChooseLevel: React.FC<Props> = ({ title }) => {
  const [levels, setLevels] = useState<Level[]>([]);

  useEffect(() => {
    const loadLevels = async () => {
      try {
        const data = await getLevelsById();
        setLevels(data);
      } catch (error) {
        console.error('Failed to load levels:', error);
      }
    };
    loadLevels();
  }, []);

  return (
    <div className={styles.page}>
      <h2 className={styles.title}>{title}</h2>
      <ul className={styles.wrapper}>
        {levels.slice(0, 3).map((level) => (
          <li key={level.id} className={styles.levelItem}>
            <Link to={`/tests/level/${level.id}`} className={styles.link}>
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
