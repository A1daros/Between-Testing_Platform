import styles from './SearchInput.module.scss';

type SearchInputProps = {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
};

export const SearchInput = ({
  placeholder,
  value,
  onChange,
}: SearchInputProps) => {
  return (
    <div className={styles.searchContainer}>
      <input
        type='search'
        placeholder={placeholder}
        aria-label={placeholder}
        className={styles.input}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
};
