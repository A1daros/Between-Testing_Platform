import type React from 'react';
import styles from './StatCard.module.scss';

type Props = {
  label: string;
  value: number | string | null;
  iconPath: string;
};

export const StatCard: React.FC<Props> = ({ label, value, iconPath }) => {
  return (
    <li className={styles.item}>
      <div className={styles.section}>
        <div className={styles.itemInfo}>
          <h3 className={styles.subtitle}>{label}</h3>
          <p className={styles.description}>{value}</p>
        </div>

        <div className={styles.iconWrapper}>
          <img
            src={iconPath}
            alt='icon'
            aria-hidden='true'
            className={styles.icon}
          />
        </div>
      </div>
    </li>
  );
};
