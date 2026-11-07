import styles from './Register.module.scss';
import { useState, type FormEvent } from 'react';
import { signUp } from '../../../services/auth';
import { useNavigate } from 'react-router-dom';

import { MIN_PASSWORD_LENGTH } from '../../../constants/constants';
import { ROUTES } from '../../../constants/routes';
import { usePageMeta } from '../../../hooks/usePageMeta';

export const Register = () => {
  usePageMeta({ title: 'Реєстрація', noindex: true });

  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);

  const navigate = useNavigate();

  const handleSignUp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrorMessage('');

    if (password.length < MIN_PASSWORD_LENGTH) {
      setErrorMessage(
        `Пароль має містити щонайменше ${MIN_PASSWORD_LENGTH} символів.`,
      );
      return;
    }

    setIsLoading(true);

    try {
      const { hasSession } = await signUp({ name, surname, email, password });

      if (hasSession) {
        navigate(ROUTES.home);
        return;
      }

      setIsConfirmationModalOpen(true);

      setName('');
      setSurname('');
      setEmail('');
      setPassword('');
    } catch (error) {
      console.error('Failed to sign up:', error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Щось пішло не так. Будь ласка, спробуйте ще раз пізніше.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <form onSubmit={handleSignUp} className={styles.registerForm}>
        <div className={styles.header}>
          <h1 className={styles.title}>Створити акаунт</h1>
          <p className={styles.subtitle}>
            Введіть свої дані нижче, щоб зареєструватися
          </p>
        </div>

        {errorMessage && (
          <div className={styles.errorCard} role='alert' aria-live='assertive'>
            <p className={styles.errorText}>{errorMessage}</p>
          </div>
        )}

        <div className={styles.inputGroup}>
          <div className={styles.inputContainer}>
            <input
              id='reg-name'
              type='text'
              name='name'
              value={name}
              placeholder=' '
              required
              autoComplete='given-name'
              className={styles.input}
              onChange={(event) => setName(event.target.value)}
            />
            <label htmlFor='reg-name' className={styles.inputLabel}>
              Ім'я
            </label>
          </div>

          <div className={styles.inputContainer}>
            <input
              id='reg-surname'
              type='text'
              name='surname'
              value={surname}
              placeholder=' '
              required
              autoComplete='family-name'
              className={styles.input}
              onChange={(event) => setSurname(event.target.value)}
            />
            <label htmlFor='reg-surname' className={styles.inputLabel}>
              Прізвище
            </label>
          </div>

          <div className={styles.inputContainer}>
            <input
              id='reg-email'
              type='email'
              name='email'
              value={email}
              placeholder=' '
              required
              autoComplete='email'
              className={styles.input}
              onChange={(event) => setEmail(event.target.value)}
            />
            <label htmlFor='reg-email' className={styles.inputLabel}>
              Електронна пошта
            </label>
          </div>

          <div className={styles.inputContainer}>
            <input
              id='reg-password'
              type='password'
              name='password'
              value={password}
              placeholder=' '
              required
              minLength={MIN_PASSWORD_LENGTH}
              autoComplete='new-password'
              className={styles.input}
              onChange={(event) => setPassword(event.target.value)}
            />
            <label htmlFor='reg-password' className={styles.inputLabel}>
              Пароль
            </label>
          </div>
        </div>

        <button className={styles.btnSubmit} type='submit' disabled={isLoading}>
          {isLoading ? 'Виконується...' : 'Створити акаунт'}
        </button>
      </form>

      {isConfirmationModalOpen && (
        <div className={styles.modalOverlay} role='presentation'>
          <div
            className={styles.modal}
            role='dialog'
            aria-modal='true'
            aria-labelledby='confirmation-title'
          >
            <span className={styles.modalLabel}>BETWEEN / ACCOUNT</span>

            <h2 id='confirmation-title' className={styles.modalTitle}>
              Перевірте ваш email
            </h2>

            <p className={styles.modalDescription}>
              Ми надіслали посилання для підтвердження на вашу електронну
              адресу. Будь ласка, підтвердьте свій обліковий запис перед входом.
              Після цього адміністратор школи перевірить акаунт і відкриє доступ
              до тестів.
            </p>

            <button
              type='button'
              className={styles.modalButton}
              onClick={() => navigate(ROUTES.login)}
            >
              Зрозуміло →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
