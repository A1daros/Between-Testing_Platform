import styles from './Login.module.scss';
import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { signIn } from '../../../services/auth';
import { ROUTES } from '../../../constants/routes';
import type { LoginRedirectState } from '../../../types/auth';
import { usePageMeta } from '../../../hooks/usePageMeta';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import { FormField } from '../../shared/components/FormField';
import { Alert } from '../../shared/components/Alert';

export const Login = () => {
  usePageMeta({ title: 'Вхід', noindex: true });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo =
    (location.state as LoginRedirectState | null)?.from ?? ROUTES.home;

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      await signIn(email, password);

      navigate(redirectTo, { replace: true });
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.loginContainer}>
        <div className={styles.header}>
          <span className={styles.label}>BETWEEN / ACCOUNT</span>
          <h1 className={styles.title}>З поверненням</h1>
          <p className={styles.subtitle}>
            Введіть свої дані, щоб увійти в обліковий запис
          </p>
        </div>

        <div aria-live='polite'>
          {errorMessage && <Alert>{errorMessage}</Alert>}
        </div>

        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.inputGroup}>
            <FormField
              id='login-email'
              type='email'
              name='email'
              label='Електронна пошта'
              autoComplete='email'
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            <FormField
              id='login-password'
              type='password'
              name='password'
              label='Пароль'
              autoComplete='current-password'
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          <div className={styles.formActions}>
            <Link to={ROUTES.forgotPassword} className={styles.link}>
              Забули пароль?
            </Link>
          </div>

          <button
            type='submit'
            className={styles.submitBtn}
            disabled={isLoading}
          >
            {isLoading ? 'Виконується...' : 'Увійти'}
          </button>
        </form>

        <div className={styles.signupLink}>
          Немаєте акаунту?{' '}
          <Link to={ROUTES.register} className={styles.linkAccent}>
            Створіть обліковий запис
          </Link>
        </div>
      </div>
    </div>
  );
};
