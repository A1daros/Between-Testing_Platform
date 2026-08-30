import { useState, type FormEvent } from 'react';
import styles from './ForgotPassword.module.scss';
import { supabase } from '../../../../lib/supabase';
import { Link } from 'react-router-dom';

export const ForgotPassword = () => {
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

      setErrorMessage('Something went wrong. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className={styles.wrapper}>
      <div className={styles.card}>
        {isEmailSent ? (
          <div className={styles.successState}>
            <span className={styles.label}>BETWEEN / ACCOUNT</span>

            <h1 className={styles.title}>Check your email</h1>

            <p className={styles.description}>
              We sent a password reset link to your email address. Follow the
              instructions in the email to create a new password.
            </p>

            <Link to='/login' className={styles.btnSecondary}>
              Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <header className={styles.header}>
              <span className={styles.label}>BETWEEN / ACCOUNT</span>

              <h1 className={styles.title}>Forgot password?</h1>

              <p className={styles.subtitle}>
                Enter your email address and we'll send you a link to reset your
                password.
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
                  Email address
                </label>
              </div>

              <button
                type='submit'
                className={styles.btnSubmit}
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send reset link'}
              </button>
            </form>

            <Link to='/login' className={styles.backLink}>
              ← Back to sign in
            </Link>
          </>
        )}
      </div>
    </main>
  );
};
