import { useState, type FormEvent } from 'react';
import styles from './ChangeEmailForm.module.scss';
import { updateEmail } from '../../../../services/profile';

type ChangeEmailFormProps = {
  currentEmail?: string;
};

export const ChangeEmailForm = ({ currentEmail }: ChangeEmailFormProps) => {
  const [newEmail, setNewEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChangeEmail = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrorMessage('');
    setSuccessMessage('');

    if (newEmail === currentEmail) {
      setErrorMessage('Нова електронна адреса має відрізнятися від поточної.');
      return;
    }

    setIsLoading(true);

    try {
      await updateEmail(newEmail);

      setSuccessMessage(
        'Посилання для підтвердження надіслано! Будь ласка, перевірте як стару, так і нову електронні адреси, щоб підтвердити зміну.',
      );
      setNewEmail('');
    } catch (error) {
      console.error('Failed to change email:', error);
      setErrorMessage(
        'Щось пішло не так. Будь ласка, спробуйте ще раз пізніше.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <header className={styles.header}>
        <h2 className={styles.title}>Налаштування електронної пошти</h2>
        <p className={styles.subtitle}>
          Оновіть свою електронну адресу для отримання сповіщень облікового
          запису
        </p>
      </header>

      {successMessage && (
        <div className={styles.successCard}>
          <p className={styles.successText}>✓ {successMessage}</p>
        </div>
      )}

      {errorMessage && (
        <div className={styles.errorCard}>
          <p className={styles.errorText}>{errorMessage}</p>
        </div>
      )}

      <form onSubmit={handleChangeEmail} className={styles.form}>
        <div className={styles.inputGroup}>
          <div className={styles.inputContainer}>
            <input
              id='change-new-email'
              type='email'
              name='new-email'
              value={newEmail}
              placeholder=' '
              required
              autoComplete='email'
              className={styles.input}
              onChange={(event) => setNewEmail(event.target.value)}
            />
            <label htmlFor='change-new-email' className={styles.inputLabel}>
              Нова електронна адреса
            </label>
          </div>
        </div>

        <button type='submit' className={styles.btnSubmit} disabled={isLoading}>
          {isLoading ? 'Виконується...' : 'Оновити електронну пошту'}
        </button>
      </form>
    </div>
  );
};
