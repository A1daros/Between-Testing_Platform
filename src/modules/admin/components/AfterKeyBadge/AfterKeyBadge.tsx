import styles from './AfterKeyBadge.module.scss';

type AfterKeyBadgeProps = {
  inline?: boolean;
};

export const AfterKeyBadge = ({ inline = false }: AfterKeyBadgeProps) => {
  return (
    <span
      className={`${styles.badge} ${inline ? styles.inline : ''}`}
      title='Учень пройшов цю спробу після того, як йому вже були доступні правильні відповіді.'
    >
      Після ключа
    </span>
  );
};
