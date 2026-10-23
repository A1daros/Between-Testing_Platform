import styles from './Login.module.scss';
import { useState, type FormEvent } from 'react';
import { supabase } from '../../../../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      navigate('/');
    } catch (error) {
      console.error('Failed to sign in:', error);

      setErrorMessage('Something went wrong while while signing in.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.loginContainer}>
        <div className={styles.header}>
          <h2 className={styles.title}>З поверненням</h2>
          <p className={styles.subtitle}>
            Введіть свої дані, щоб увійти в обліковий запис
          </p>
        </div>

        <div aria-live='polite'>
          {errorMessage && (
            <div className={styles.errorCard} role='alert'>
              <p className={styles.errorText}>{errorMessage}</p>
            </div>
          )}
        </div>

        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.inputGroup}>
            <div className={styles.inputContainer}>
              <input
                type='email'
                id='email'
                name='email'
                value={email}
                placeholder=' '
                required
                className={styles.input}
                onChange={(event) => setEmail(event.target.value)}
              />
              <label htmlFor='email' className={styles.inputLabel}>
                Email
              </label>
            </div>

            <div className={styles.inputContainer}>
              <input
                type='password'
                id='password'
                name='password'
                value={password}
                placeholder=' '
                required
                className={styles.input}
                onChange={(event) => setPassword(event.target.value)}
              />
              <label htmlFor='password' className={styles.inputLabel}>
                Пароль
              </label>
            </div>
          </div>

          <div className={styles.formActions}>
            <Link to='/forgot-password' className={styles.link}>
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
          <Link to='/register' className={styles.linkAccent}>
            Створіть обліковий запис
          </Link>
        </div>
      </div>
    </div>
  );
};
