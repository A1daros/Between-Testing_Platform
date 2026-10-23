import styles from './HomePage.module.scss';
import { ChooseLevel } from './components/ChooseLevel';
import { PicturesSlider } from './components/PictureSlider';
import { About } from './components/About/About.tsx';
import { FindLevel } from './components/FindLevel/FindLevel.tsx';
import { ContactUs } from './components/ContactUs/ContactUs.tsx';

export const HomePage = () => {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.hiddenTitle}>Ласкаво просимо до BETWEEN!</h1>
        <h1 className={styles.title}>Ласкаво просимо до BETWEEN!</h1>

        <FindLevel />

        <PicturesSlider />

        <ChooseLevel title='Виберіть свій рівень' />

        <About />

        <ContactUs />
      </div>
    </div>
  );
};
