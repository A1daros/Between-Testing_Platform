import styles from './HomePage.module.scss';
import { ChooseLevel } from './components/ChooseLevel';
import { PicturesSlider } from './components/PictureSlider';
import { About } from './components/About/About.tsx';
import { FindLevel } from './components/FindLevel/FindLevel.tsx';
import { ContactUs } from './components/ContactUs/ContactUs.tsx';

export const HomePage = () => {
  // const [loading, setLoading] = useState(true);
  // const [errorMessage, setErrorMessage] = useState('');

  // if (loading) {
  //   return <Loader />;
  // }

  // if (errorMessage) {
  //   return <p>{errorMessage}</p>;
  // }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.hiddenTitle}>Wellcome to Between English Hub!</h1>
        <h1 className={styles.title}>Wellcome to Between English Hub!</h1>

        <FindLevel />

        <PicturesSlider />

        <ChooseLevel title='Select your level' />

        <About />

        <ContactUs />
      </div>
    </div>
  );
};
