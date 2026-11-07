import styles from './ChangeEmailForm.module.scss';
import { useState, type FormEvent } from 'react';
import { updateEmail } from '../../../../services/auth';
import { getErrorMessage } from '../../../../utils/getErrorMessage';
import { FormField } from '../../../shared/components/FormField';
import { Alert } from '../../../shared/components/Alert';

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

    if (newEmail.trim().toLowerCase() === currentEmail?.toLowerCase()) {
      setErrorMessage('Нова електронна адреса має відрізнятися від поточної.');
      return;
    }

    setIsLoading(true);

    try {
      await updateEmail(newEmail.trim());

      setSuccessMessage(
        'Посилання для підтвердження надіслано! Будь ласка, перевірте як стару, так і нову електронні адреси, щоб підтвердити зміну.',
      );
      setNewEmail('');
    } catch (error) {
      console.error('Failed to change email:', error);
      setErrorMessage(getErrorMessage(error));
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

      {successMessage && <Alert type='success'>{successMessage}</Alert>}
      {errorMessage && <Alert>{errorMessage}</Alert>}

      <form onSubmit={handleChangeEmail} className={styles.form}>
        <div className={styles.inputGroup}>
          <FormField
            id='change-new-email'
            type='email'
            name='new-email'
            label='Нова електронна адреса'
            autoComplete='email'
            value={newEmail}
            onChange={(event) => setNewEmail(event.target.value)}
            required
          />
        </div>

        <button type='submit' className={styles.btnSubmit} disabled={isLoading}>
          {isLoading ? 'Виконується...' : 'Оновити електронну пошту'}
        </button>
      </form>
    </div>
  );
};
