import styles from './Register.module.scss';
import { useState, type FormEvent } from 'react';
import { supabase } from '../../../../lib/supabase';

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: name } },
    });

    if (error) {
      setErrorMessage(error.message);
    }
    setIsLoading(false);
  };

  return (
    <div className={styles.wrapper}>
      <form onSubmit={handleSignUp} className={styles.registerForm}>
        <div className={styles.header}>
          <h2 className={styles.title}>Create an account</h2>
          <p className={styles.subtitle}>Enter your details below to sign up</p>
        </div>

        {errorMessage && (
          <div className={styles.errorCard}>
            <span className={styles.errorIcon}>Paragraph/Alert Sign</span>
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
              className={styles.input}
              onChange={(event) => setName(event.target.value)}
            />
            <label htmlFor='reg-name' className={styles.label}>
              Full Name
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
              className={styles.input}
              onChange={(event) => setEmail(event.target.value)}
            />
            <label htmlFor='reg-email' className={styles.label}>
              Email Address
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
              minLength={6}
              autoComplete='new-password'
              className={styles.input}
              onChange={(event) => setPassword(event.target.value)}
            />
            <label htmlFor='reg-password' className={styles.label}>
              Password
            </label>
          </div>
        </div>

        <button className={styles.btnSubmit} type='submit' disabled={isLoading}>
          {isLoading ? 'Creating account...' : 'Get Started'}
        </button>
      </form>
    </div>
  );
};
