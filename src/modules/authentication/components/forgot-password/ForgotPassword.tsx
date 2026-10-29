import { useState, type FormEvent } from 'react';
import styles from './ForgotPassword.module.scss';
import { supabase } from '../../../../lib/supabase';
import { Link } from 'react-router-dom';
import { usePageMeta } from '../../../../hooks/usePageMeta';

export const ForgotPassword = () => {
  usePageMeta({ title: 'Відновлення пароля', noindex: true });

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleResetPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrorMessage('');
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setIsEmailSent(true);
    } catch (error) {
      console.error('Failed to send password reset email:', error);

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
        {isEmailSent ? (
          <div className={styles.successState}>
            <span className={styles.label}>BETWEEN / ACCOUNT</span>

            <h2 className={styles.title}>Перевірте свою електронну пошту</h2>

            <p className={styles.description}>
              Ми надіслали посилання для скидання пароля на вашу електронну
              адресу. Дотримуйтесь інструкцій у листі, щоб створити новий
              пароль.
            </p>

            <Link to='/login' className={styles.btnSecondary}>
              Повернутися до входу
            </Link>
          </div>
        ) : (
          <>
            <header className={styles.header}>
              <span className={styles.label}>BETWEEN / ACCOUNT</span>

              <h2 className={styles.title}>Забули пароль?</h2>

              <p className={styles.subtitle}>
                Введіть свою електронну адресу і ми надішлемо вам посилання для
                скидання пароля.
              </p>
            </header>

            <form onSubmit={handleResetPassword} className={styles.form}>
              {errorMessage && (
                <div className={styles.errorCard}>
                  <p className={styles.errorText}>{errorMessage}</p>
                </div>
              )}

              <div className={styles.inputContainer}>
                <input
                  id='reset-email'
                  type='email'
                  name='email'
                  value={email}
                  placeholder=' '
                  required
                  autoComplete='email'
                  className={styles.input}
                  onChange={(event) => setEmail(event.target.value)}
                />

                <label htmlFor='reset-email' className={styles.inputLabel}>
                  Електронна пошта
                </label>
              </div>

              <button
                type='submit'
                className={styles.btnSubmit}
                disabled={isLoading}
              >
                {isLoading ? 'Виконується...' : 'Надіслати запит на скидання'}
              </button>
            </form>

            <Link to='/login' className={styles.backLink}>
              Повернутися до входу
            </Link>
          </>
        )}
      </div>
    </div>
  );
};
