import styles from './Register.module.scss';
import { useState, type FormEvent } from 'react';
import { supabase } from '../../../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { getPasswordErrorMessage } from '../../../../utils/getPasswordErrorMessage';
import { MIN_PASSWORD_LENGTH } from '../../../../constants/constants';
import { ROUTES } from '../../../../constants/routes';

export const Register = () => {
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
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: `${name} ${surname}`,
            name,
            surname,
          },
        },
      });

      if (error) {
        setErrorMessage(getPasswordErrorMessage(error));
        return;
      }

      if (data.session) {
        navigate(ROUTES.home);
        return;
      }

      if (password.length < 10) {
        setErrorMessage('Пароль має містити щонайменше 10 символів.');
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
        'Щось пішло не так. Будь ласка, спробуйте ще раз пізніше.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <form onSubmit={handleSignUp} className={styles.registerForm}>
        <div className={styles.header}>
          <h2 className={styles.title}>Створити акаунт</h2>
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
              Got it →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
