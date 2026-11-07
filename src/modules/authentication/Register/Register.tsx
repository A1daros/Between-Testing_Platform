import styles from './Register.module.scss';
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signUp } from '../../../services/auth';
import { MIN_PASSWORD_LENGTH } from '../../../constants/auth';
import { ROUTES } from '../../../constants/routes';
import { usePageMeta } from '../../../hooks/usePageMeta';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import { validatePassword } from '../../../utils/validatePassword';
import { FormField } from '../../shared/components/FormField';
import { Alert } from '../../shared/components/Alert';
import { Modal } from '../../shared/components/Modal';

export const Register = () => {
  usePageMeta({ title: 'Реєстрація', noindex: true });

  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);

  const navigate = useNavigate();

  const goToLogin = () => navigate(ROUTES.login);

  const handleSignUp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationError = validatePassword(password);

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setErrorMessage('');
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
      setAgreeToTerms(false);
    } catch (error) {
      console.error('Failed to sign up:', error);
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <form onSubmit={handleSignUp} className={styles.registerForm}>
        <div className={styles.header}>
          <span className={styles.label}>BETWEEN / ACCOUNT</span>
          <h1 className={styles.title}>Створити акаунт</h1>
          <p className={styles.subtitle}>
            Введіть свої дані нижче, щоб зареєструватися
          </p>
        </div>

        {errorMessage && <Alert>{errorMessage}</Alert>}

        <div className={styles.inputGroup}>
          <FormField
            id='reg-name'
            type='text'
            name='name'
            label="Ім'я"
            autoComplete='given-name'
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />

          <FormField
            id='reg-surname'
            type='text'
            name='surname'
            label='Прізвище'
            autoComplete='family-name'
            value={surname}
            onChange={(event) => setSurname(event.target.value)}
            required
          />

          <FormField
            id='reg-email'
            type='email'
            name='email'
            label='Електронна пошта'
            autoComplete='email'
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <FormField
            id='reg-password'
            type='password'
            name='password'
            label='Пароль'
            autoComplete='new-password'
            minLength={MIN_PASSWORD_LENGTH}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        <label className={styles.consent}>
          <input
            type='checkbox'
            className={styles.checkbox}
            checked={agreeToTerms}
            onChange={(event) => setAgreeToTerms(event.target.checked)}
            required
          />
          <span>
            Я погоджуюся з{' '}
            <Link to={ROUTES.terms} target='_blank' className={styles.legalLink}>
              Умовами користування
            </Link>{' '}
            та{' '}
            <Link
              to={ROUTES.privacy}
              target='_blank'
              className={styles.legalLink}
            >
              Політикою конфіденційності
            </Link>
          </span>
        </label>

        <button className={styles.btnSubmit} type='submit' disabled={isLoading}>
          {isLoading ? 'Виконується...' : 'Створити акаунт'}
        </button>
      </form>

      {isConfirmationModalOpen && (
        <Modal labelledBy='confirmation-title' onClose={goToLogin}>
          <span className={styles.modalLabel}>BETWEEN / ACCOUNT</span>

          <h2 id='confirmation-title' className={styles.modalTitle}>
            Перевірте ваш email
          </h2>

          <p className={styles.modalDescription}>
            Ми надіслали посилання для підтвердження на вашу електронну адресу.
            Будь ласка, підтвердьте свій обліковий запис перед входом. Після
            цього адміністратор школи перевірить акаунт і відкриє доступ до
            тестів.
          </p>

          <button
            type='button'
            className={styles.modalButton}
            onClick={goToLogin}
          >
            Зрозуміло →
          </button>
        </Modal>
      )}
    </div>
  );
};
