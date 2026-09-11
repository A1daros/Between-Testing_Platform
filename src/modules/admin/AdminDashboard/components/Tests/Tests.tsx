import { TestsList } from './components/TestsList/TestsList';
import styles from './Tests.module.scss';

export const Tests = () => {
  return (
    <div className={styles.page}>
      <h2 className={styles.title}>BETWEEN/TESTS</h2>
      <div className={styles.container}>
        <TestsList />
      </div>
    </div>
  );
};
