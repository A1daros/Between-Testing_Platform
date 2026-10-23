import styles from './HomePage.module.scss';
import { ChooseLevel } from './components/ChooseLevel';
import { PicturesSlider } from './components/PictureSlider';
import { About } from './components/About/About.tsx';
import { FindLevel } from './components/FindLevel/FindLevel.tsx';
import { ContactUs } from './components/ContactUs/ContactUs.tsx';
import { useEffect, useState } from 'react';
import type { Level } from '../../types/database.ts';
import { getLevelsById } from '../../services/levels.ts';
import { Loader } from '../Loader/Loader.tsx';

export const HomePage = () => {
  const [levels, setLevels] = useState<Level[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadLevels = async () => {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const data = await getLevelsById();
        setLevels(data);
      } catch (error) {
        console.error('Failed to load levels:', error);
        setErrorMessage('Не вдалось завантажити рівні тестів!');
      } finally {
        setIsLoading(false);
      }
    };

    loadLevels();
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {isLoading && <Loader />}

        <h1 className={styles.hiddenTitle}>Ласкаво просимо до BETWEEN!</h1>
        <h1 className={styles.title}>Ласкаво просимо до BETWEEN!</h1>

        <FindLevel />

        <PicturesSlider />

        {errorMessage && (
          <div className={styles.errorCard} role='alert' aria-live='assertive'>
            <p className={styles.errorText}>{errorMessage}</p>
          </div>
        )}

        <ChooseLevel title='Виберіть свій рівень' levels={levels} />

        <About />

        <ContactUs />
      </div>
    </div>
  );
};
