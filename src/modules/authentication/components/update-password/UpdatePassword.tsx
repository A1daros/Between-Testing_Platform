import { useState, type FormEvent } from 'react';
import styles from './UpdatePassword.module.scss';
import { supabase } from '../../../../lib/supabase';
import { Link } from 'react-router-dom';

export const UpdatePassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isPasswordUpdated, setIsPasswordUpdated] = useState(false);

  const handleUpdatePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrorMessage('');

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
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setIsPasswordUpdated(true);

      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Failed to update password:', error);

      setErrorMessage('Something went wrong. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className={styles.wrapper}>
      <div className={styles.card}>
        {isPasswordUpdated ? (
          <div className={styles.successState}>
            <span className={styles.label}>BETWEEN / ACCOUNT</span>

            <h1 className={styles.title}>Password updated</h1>

            <p className={styles.description}>
              Your password has been successfully updated. You can now sign in
              with your new password.
            </p>

            <Link to='/login' className={styles.btnSecondary}>
              Go to sign in
            </Link>
          </div>
        ) : (
          <>
            <header className={styles.header}>
              <span className={styles.label}>BETWEEN / ACCOUNT</span>

              <h1 className={styles.title}>Create new password</h1>

              <p className={styles.subtitle}>
                Enter and confirm your new password.
              </p>
            </header>

            <form onSubmit={handleUpdatePassword} className={styles.form}>
              {errorMessage && (
                <div className={styles.errorCard}>
                  <p className={styles.errorText}>{errorMessage}</p>
                </div>
              )}

              <div className={styles.inputContainer}>
                <input
                  id='new-password'
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

                <label htmlFor='new-password' className={styles.inputLabel}>
                  New password
                </label>
              </div>

              <div className={styles.inputContainer}>
                <input
                  id='confirm-password'
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

                <label htmlFor='confirm-password' className={styles.inputLabel}>
                  Confirm password
                </label>
              </div>

              <button
                type='submit'
                className={styles.btnSubmit}
                disabled={isLoading}
              >
                {isLoading ? 'Updating password...' : 'Update password'}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
};
