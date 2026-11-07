import type { InputHTMLAttributes } from 'react';
import styles from './FormField.module.scss';

type FormFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'id' | 'placeholder' | 'className'
> & {
  id: string;
  label: string;
};

export const FormField = ({ id, label, ...inputProps }: FormFieldProps) => {
  return (
    <div className={styles.inputContainer}>
      <input id={id} placeholder=' ' className={styles.input} {...inputProps} />

      <label htmlFor={id} className={styles.inputLabel}>
        {label}
      </label>
    </div>
  );
};
