import styles from './FindLevel.module.scss';
import { Link } from 'react-router-dom';

export const FindLevel = () => {
  return (
    <section className={styles.page}>
      <div className={styles.wrapper}>
        <div className={styles.descriptionWrapper}>
          <h2 className={styles.title}>Перевірте свій рівень англійської</h2>
          <p className={styles.description}>
            Визначте свій приблизний рівень володіння англійською мовою за
            допомогою короткого тесту. Реєстрація не потрібна.
          </p>
        </div>

        <div className={styles.buttonWrapper}>
          <Link className={styles.button} to='/placement-test'>
            Спробуймо!
          </Link>
        </div>
      </div>
    </section>
  );
};
