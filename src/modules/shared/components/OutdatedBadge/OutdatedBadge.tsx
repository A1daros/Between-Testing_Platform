import styles from './OutdatedBadge.module.scss';

type OutdatedBadgeProps = {
  inline?: boolean;
};

export const OutdatedBadge = ({ inline = false }: OutdatedBadgeProps) => {
  return (
    <span
      className={`${styles.badge} ${inline ? styles.inline : ''}`}
      title='Питання тесту змінили після цієї спроби. Бал збережено таким, яким він був під час проходження.'
    >
      Тест змінено
    </span>
  );
};
