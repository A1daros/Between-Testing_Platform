import styles from './FindLevel.module.scss';

export const FindLevel = () => {
  return (
    <section className={styles.page}>
      <div className={styles.wrapper}>
        <div className={styles.descriptionWrapper}>
          <h3 className={styles.title}>Test your English</h3>
          <p className={styles.description}>
            Find your approximate English level with a short placement test. No
            registration required.
          </p>
        </div>

        <div className={styles.buttonWrapper}>
          <button className={styles.button}>Let&rsquo;s try!</button>
        </div>
      </div>
    </section>
  );
};
