import { useState, type FormEvent } from 'react';
import styles from './ChangePasswordForm.module.scss';
import { updatePassword } from '../../../../services/profile';
import { MIN_PASSWORD_LENGTH } from '../../../../constants/constants';

export const ChangePasswordForm = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChangePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrorMessage('');
    setSuccessMessage('');

    if (newPassword !== confirmPassword) {
      setErrorMessage('Паролі не збігаються.');
      return;
    }
    if (newPassword.length < 10) {
      setErrorMessage('Пароль має містити щонайменше 10 символів.');
      return;
    }

    setIsLoading(true);

    try {
      await updatePassword(newPassword);

      setSuccessMessage('Ваш пароль успішно змінено.');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Failed to change password::', error);
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
        <h2 className={styles.title}>Налаштування безпеки</h2>
        <p className={styles.subtitle}>
          Оновіть пароль, щоб убезпечити свій обліковий запис
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

      <form onSubmit={handleChangePassword} className={styles.form}>
        <div className={styles.inputGroup}>
          <div className={styles.inputContainer}>
            <input
              id='change-new-password'
              type='password'
              name='new-password'
              value={newPassword}
              placeholder=' '
              required
              minLength={MIN_PASSWORD_LENGTH}
              autoComplete='new-password'
              className={styles.input}
              onChange={(event) => setNewPassword(event.target.value)}
            />
            <label htmlFor='change-new-password' className={styles.inputLabel}>
              Новий пароль
            </label>
          </div>

          <div className={styles.inputContainer}>
            <input
              id='change-confirm-password'
              type='password'
              name='confirm-password'
              value={confirmPassword}
              placeholder=' '
              required
              minLength={MIN_PASSWORD_LENGTH}
              autoComplete='new-password'
              className={styles.input}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
            <label
              htmlFor='change-confirm-password'
              className={styles.inputLabel}
            >
              Підтвердьте новий пароль
            </label>
          </div>
        </div>

        <button type='submit' className={styles.btnSubmit} disabled={isLoading}>
          {isLoading ? 'Виконується...' : 'Оновити пароль'}
        </button>
      </form>
    </div>
  );
};
