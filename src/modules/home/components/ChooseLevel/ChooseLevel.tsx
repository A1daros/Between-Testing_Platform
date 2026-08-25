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
        console.error('Failed to load leveles:', error);
      }
    };

    loadLevels();
  }, []);

  console.log(levels, setLevels);

  return (
    <div>
      <h2 className={styles.title}>{title}</h2>
      <div>
        {levels.slice(0, 3).map((level) => (
          <ul key={level.id}>
            <Link to={`/tests/level/${level.id}`}>
              <div>
                <h3>{level.code}</h3>
                <h3>{level.title}</h3>
              </div>
            </Link>
          </ul>
        ))}
      </div>
    </div>
  );
};
