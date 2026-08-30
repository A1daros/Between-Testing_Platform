import { useState, type FormEvent } from 'react';
import styles from './ChangePasswordForm.module.scss';
import { supabase } from '../../../../lib/supabase';

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
      setErrorMessage('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMessage('Password must contain at least 6 characters.');
      return;
    }

    setIsLoading(true);

    try {
      // Оновлення пароля для поточної авторизованої сесії
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setSuccessMessage('Your password has been successfully changed.');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Failed to change password:', error);
      setErrorMessage('Something went wrong. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <header className={styles.header}>
        <h2 className={styles.title}>Security Settings</h2>
        <p className={styles.subtitle}>
          Update your password to keep your account secure
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
              minLength={6}
              autoComplete='new-password'
              className={styles.input}
              onChange={(event) => setNewPassword(event.target.value)}
            />
            <label htmlFor='change-new-password' className={styles.inputLabel}>
              New password
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
              minLength={6}
              autoComplete='new-password'
              className={styles.input}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
            <label
              htmlFor='change-confirm-password'
              className={styles.inputLabel}
            >
              Confirm new password
            </label>
          </div>
        </div>

        <button type='submit' className={styles.btnSubmit} disabled={isLoading}>
          {isLoading ? 'Changing password...' : 'Update password'}
        </button>
      </form>
    </div>
  );
};
