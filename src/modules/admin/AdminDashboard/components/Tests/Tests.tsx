import { TestsList } from './components/TestsList/TestsList';
import styles from './Tests.module.scss';

export const Tests = () => {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <TestsList />
      </div>
    </div>
  );
};
