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
      setErrorMessage('New email must be different from the current one.');
      return;
    }

    setIsLoading(true);

    try {
      await updateEmail(newEmail);

      setSuccessMessage(
        'Confirmation links sent! Please check both your old and new email addresses to confirm the change.',
      );
      setNewEmail('');
    } catch (error) {
      console.error('Failed to change email:', error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Something went wrong. Please try again later.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <header className={styles.header}>
        <h2 className={styles.title}>Email Settings</h2>
        <p className={styles.subtitle}>
          Update your email address for account notifications
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
              New email address
            </label>
          </div>
        </div>

        <button type='submit' className={styles.btnSubmit} disabled={isLoading}>
          {isLoading ? 'Updating email...' : 'Update email'}
        </button>
      </form>
    </div>
  );
};
