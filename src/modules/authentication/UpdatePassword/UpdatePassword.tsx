import styles from './UpdatePassword.module.scss';
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { updatePassword } from '../../../services/auth';
import { ROUTES } from '../../../constants/routes';
import { usePageMeta } from '../../../hooks/usePageMeta';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import { validatePassword } from '../../../utils/validatePassword';
import { PasswordFields } from '../../shared/components/PasswordFields';
import { Alert } from '../../shared/components/Alert';

export const UpdatePassword = () => {
  usePageMeta({ title: 'Новий пароль', noindex: true });

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isPasswordUpdated, setIsPasswordUpdated] = useState(false);

  const handleUpdatePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationError = validatePassword(newPassword, confirmPassword);

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    try {
      await updatePassword(newPassword);

      setIsPasswordUpdated(true);
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Failed to update password:', error);
      setErrorMessage(getErrorMessage(error));
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

            <h1 className={styles.title}>Пароль оновлено</h1>

            <p className={styles.description}>
              Ваш пароль успішно оновлено. Тепер ви можете увійти,
              використовуючи новий пароль.
            </p>

            <Link to={ROUTES.login} className={styles.btnSecondary}>
              Перейти до входу
            </Link>
          </div>
        ) : (
          <>
            <header className={styles.header}>
              <span className={styles.label}>BETWEEN / ACCOUNT</span>

              <h1 className={styles.title}>Створити новий пароль</h1>

              <p className={styles.subtitle}>
                Введіть і підтвердьте свій новий пароль.
              </p>
            </header>

            <div aria-live='polite'>
              {errorMessage && <Alert>{errorMessage}</Alert>}
            </div>

            <form onSubmit={handleUpdatePassword} className={styles.form}>
              <div className={styles.inputGroup}>
                <PasswordFields
                  idPrefix='update'
                  password={newPassword}
                  confirmPassword={confirmPassword}
                  confirmLabel='Підтвердити пароль'
                  onPasswordChange={setNewPassword}
                  onConfirmPasswordChange={setConfirmPassword}
                />
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
