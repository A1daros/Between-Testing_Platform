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
    } catch (error) {
      console.error('Failed to sign in:', error);

      setErrorMessage('Something went wrong while creating your account.');
    } finally {
      setIsLoading(false);
    }

    navigate('/');
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.loginContainer}>
        <div className={styles.header}>
          <h2 className={styles.title}>Welcome back</h2>
          <p className={styles.subtitle}>
            Enter your details to sign in to your account
          </p>
        </div>

        {errorMessage && (
          <div className={styles.errorCard}>
            <p className={styles.errorText}>{errorMessage}</p>
          </div>
        )}

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
              <label htmlFor='email' className={styles.label}>
                Email Address
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
              <label htmlFor='password' className={styles.label}>
                Password
              </label>
            </div>
          </div>

          <div className={styles.formActions}>
            <label className={styles.rememberMe}>
              <input
                type='checkbox'
                name='remember'
                className={styles.checkbox}
              />
              <span>Remember me</span>
            </label>
            <Link to='/forgot-password' className={styles.link}>
              Forgot password?
            </Link>
          </div>

          <button
            type='submit'
            className={styles.submitBtn}
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className={styles.signupLink}>
          Don't have an account?{' '}
          <Link to='/register' className={styles.linkAccent}>
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};
