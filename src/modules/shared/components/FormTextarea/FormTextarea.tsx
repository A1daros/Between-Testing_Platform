import type { TextareaHTMLAttributes } from 'react';
import styles from './FormTextarea.module.scss';

type FormTextareaProps = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  'id' | 'placeholder' | 'className'
> & {
  id: string;
  label: string;
};

export const FormTextarea = ({
  id,
  label,
  ...textareaProps
}: FormTextareaProps) => {
  return (
    <div className={styles.inputContainer}>
      <textarea
        id={id}
        placeholder=' '
        className={styles.textarea}
        {...textareaProps}
      />

      <label htmlFor={id} className={styles.inputLabel}>
        {label}
      </label>
    </div>
  );
};
