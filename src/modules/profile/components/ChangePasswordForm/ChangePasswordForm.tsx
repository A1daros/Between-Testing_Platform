import styles from './ChangePasswordForm.module.scss';
import { useState, type FormEvent } from 'react';
import { updatePassword } from '../../../../services/auth';
import { getErrorMessage } from '../../../../utils/getErrorMessage';
import { validatePassword } from '../../../../utils/validatePassword';
import { PasswordFields } from '../../../shared/components/PasswordFields';
import { Alert } from '../../../shared/components/Alert';

export const ChangePasswordForm = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChangePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setSuccessMessage('');

    const validationError = validatePassword(newPassword, confirmPassword);

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    try {
      await updatePassword(newPassword);

      setSuccessMessage('Ваш пароль успішно змінено.');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <header className={styles.header}>
        <h2 className={styles.title}>Налаштування безпеки</h2>
        <p className={styles.subtitle}>
          Оновіть пароль, щоб убезпечити свій обліковий запис
        </p>
      </header>

      {successMessage && <Alert type='success'>{successMessage}</Alert>}
      {errorMessage && <Alert>{errorMessage}</Alert>}

      <form onSubmit={handleChangePassword} className={styles.form}>
        <div className={styles.inputGroup}>
          <PasswordFields
            idPrefix='change'
            password={newPassword}
            confirmPassword={confirmPassword}
            onPasswordChange={setNewPassword}
            onConfirmPasswordChange={setConfirmPassword}
          />
        </div>

        <button type='submit' className={styles.btnSubmit} disabled={isLoading}>
          {isLoading ? 'Виконується...' : 'Оновити пароль'}
        </button>
      </form>
    </div>
  );
};
