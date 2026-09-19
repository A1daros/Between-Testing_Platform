import type React from 'react';
import styles from './SearchInput.module.scss';

type Props = {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
};

export const SearchInput: React.FC<Props> = ({
  placeholder,
  value,
  onChange,
}) => {
  return (
    <div className={styles.searchContainer}>
      <input
        id='input-id'
        type='search'
        placeholder={placeholder}
        className={styles.input}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
};
