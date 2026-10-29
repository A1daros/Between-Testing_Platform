import { useState, type FormEvent } from 'react';
import styles from './UpdatePassword.module.scss';
import { supabase } from '../../../../lib/supabase';
import { Link } from 'react-router-dom';
import { getPasswordErrorMessage } from '../../../../utils/getPasswordErrorMessage';
import { MIN_PASSWORD_LENGTH } from '../../../../constants/constants';
import { usePageMeta } from '../../../../hooks/usePageMeta';

export const UpdatePassword = () => {
  usePageMeta({ title: 'Новий пароль', noindex: true });

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isPasswordUpdated, setIsPasswordUpdated] = useState(false);

  const handleUpdatePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrorMessage('');

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
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setErrorMessage(getPasswordErrorMessage(error));
        return;
      }

      setIsPasswordUpdated(true);

      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Failed to update password:', error);

      setErrorMessage(
        'Щось пішло не так. Будь ласка, спробуйте ще раз пізніше.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        {isPasswordUpdated ? (
          <div className={styles.successState}>
            <span className={styles.label}>BETWEEN / ACCOUNT</span>

            <h2 className={styles.title}>Пароль оновлено</h2>

            <p className={styles.description}>
              Ваш пароль успішно оновлено. Тепер ви можете увійти,
              використовуючи новий пароль.
            </p>

            <Link to='/login' className={styles.btnSecondary}>
              Перейти до входу
            </Link>
          </div>
        ) : (
          <>
            <header className={styles.header}>
              <span className={styles.label}>BETWEEN / ACCOUNT</span>

              <h2 className={styles.title}>Створити новий пароль</h2>

              <p className={styles.subtitle}>
                Введіть і підтвердьте свій новий пароль.
              </p>
            </header>

            <div aria-live='polite'>
              {errorMessage && (
                <div className={styles.errorCard} role='alert'>
                  <p className={styles.errorText}>{errorMessage}</p>
                </div>
              )}
            </div>

            <form onSubmit={handleUpdatePassword} className={styles.form}>
              <div className={styles.inputGroup}>
                <div className={styles.inputContainer}>
                  <input
                    id='new-password'
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

                  <label htmlFor='new-password' className={styles.inputLabel}>
                    Новий пароль
                  </label>
                </div>
              </div>

              <div className={styles.inputGroup}>
                <div className={styles.inputContainer}>
                  <input
                    id='confirm-password'
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
                    htmlFor='confirm-password'
                    className={styles.inputLabel}
                  >
                    Підтвердити пароль
                  </label>
                </div>
              </div>

              <button
                type='submit'
                className={styles.btnSubmit}
                disabled={isLoading}
              >
                {isLoading ? 'Виконується...' : 'Оновити пароль'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
