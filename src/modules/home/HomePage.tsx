import styles from './HomePage.module.scss';
import { ChooseLevel } from './components/ChooseLevel';
import { PictureSlider } from './components/PictureSlider';
import { About } from './components/About';
import { FindLevel } from './components/FindLevel';
import { ContactUs } from './components/ContactUs';
import { getLevels } from '../../services/levels';
import { Loader } from '../shared/components/Loader';
import { Alert } from '../shared/components/Alert';
import { useAsyncData } from '../../hooks/useAsyncData';
import { usePageMeta } from '../../hooks/usePageMeta';
import { ROUTES } from '../../constants/routes';

export const HomePage = () => {
  usePageMeta({ path: ROUTES.home });

  const { data: levels, loading, error } = useAsyncData(getLevels);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {loading && <Loader />}

        <h1 className={styles.title}>Ласкаво просимо до BETWEEN!</h1>

        <FindLevel />

        <PictureSlider />

        {Boolean(error) && <Alert>Не вдалося завантажити рівні тестів.</Alert>}

        <ChooseLevel title='Виберіть свій рівень' levels={levels ?? []} />

        <About />

        <ContactUs />
      </div>
    </div>
  );
};
