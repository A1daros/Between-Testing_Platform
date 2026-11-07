import styles from './OutdatedBadge.module.scss';

export const OutdatedBadge = () => {
  return (
    <span
      className={styles.badge}
      title='Питання тесту змінили після цієї спроби. Бал збережено таким, яким він був під час проходження.'
    >
      Тест змінено
    </span>
  );
};
