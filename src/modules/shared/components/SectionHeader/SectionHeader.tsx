import type { ReactNode } from 'react';
import styles from './SectionHeader.module.scss';

type SectionHeaderProps = {
  label?: string;
  title: ReactNode;
  description?: ReactNode;
  titleId?: string;
  as?: 'h1' | 'h2';
};

export const SectionHeader = ({
  label,
  title,
  description,
  titleId,
  as: Heading = 'h2',
}: SectionHeaderProps) => {
  return (
    <div
      className={`${styles.header} ${Heading === 'h1' ? styles.pageHeader : ''}`}
    >
      {label && <span className={styles.label}>{label}</span>}

      <Heading
        id={titleId}
        className={Heading === 'h1' ? styles.pageTitle : styles.title}
      >
        {title}
      </Heading>

      {description && <p className={styles.description}>{description}</p>}
    </div>
  );
};
