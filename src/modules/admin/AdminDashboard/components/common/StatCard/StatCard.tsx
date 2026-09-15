import type React from 'react';
import styles from './StatCard.module.scss';

type Props = {
  label: string;
  value: number | string | null;
};

export const StatCard: React.FC<Props> = ({ label, value }) => {
  return (
    <li className={styles.item}>
      <h3 className={styles.subtitle}>{label}</h3>
      <p className={styles.description}>{value}</p>
    </li>
  );
};
