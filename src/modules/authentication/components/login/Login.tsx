import { useState, type FormEvent } from 'react';
import { supabase } from '../../../../lib/supabase';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    if (error) {
      setErrorMessage(error.message);

      return;
    }
  };

  const handleGetSession = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    console.log(session);
  };

  console.log(handleGetSession);

  if (errorMessage) {
    return <p>{errorMessage}</p>;
  }

  return (
    <div className='login-container'>
      <h2>Login</h2>

      <form onSubmit={handleLogin}>
        <div className='input-group'>
          <label htmlFor='email'>Email</label>
          <input
            type='email'
            id='email'
            name='email'
            value={email}
            placeholder='example@mail.com'
            required
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div className='input-group'>
          <label htmlFor='password'>Password</label>
          <input
            type='password'
            id='password'
            name='password'
            value={password}
            placeholder='Enter your password'
            required
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        <div className='form-actions'>
          <label>
            <input type='checkbox' name='remember' /> Remember me
          </label>
          <a href='/forgot-password'>Forgot a password?</a>
        </div>

        <button type='submit' className='submit-btn'>
          Login
        </button>
      </form>

      <div className='signup-link'>
        Haven't account? <a href='/signup'>Create account</a>
      </div>
    </div>
  );
};
