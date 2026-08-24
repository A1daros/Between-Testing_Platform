// import { useState } from 'react';
// import { Loader } from '../Loader';
import { ChooseLevel } from './components/ChooseLevel';
import styles from './HomePage.module.scss';

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
    <section id='center'>
      <h1 className={styles.title}>Wellcome to Beetwen English Hub!</h1>

      <ChooseLevel title='Select your level' />
    </section>
  );
};
