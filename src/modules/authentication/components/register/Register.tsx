import { useState, type FormEvent } from 'react';
import { supabase } from '../../../../lib/supabase';

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSignUp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: name } },
    });

    if (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <form onSubmit={handleSignUp} className='registerForm'>
      {errorMessage && <p>{errorMessage}</p>}

      <h2 className='title'>Registration Form</h2>

      <div className='inputContainer'>
        <label htmlFor='reg-name'>Name</label>
        <input
          id='reg-name'
          type='text'
          name='name'
          value={name}
          placeholder='Enter Name'
          required
          onChange={(event) => {
            setName(event.target.value);
          }}
        />
      </div>

      <div className='inputContainer'>
        <label htmlFor='reg-email'>Email</label>
        <input
          id='reg-email'
          type='email'
          name='email'
          value={email}
          placeholder='Enter Email'
          required
          onChange={(event) => {
            setEmail(event.target.value);
          }}
        />
      </div>

      <div className='inputContainer'>
        <label htmlFor='reg-password'>Password</label>
        <input
          id='reg-password'
          type='password'
          name='password'
          value={password}
          placeholder='Enter Password'
          required
          minLength={6}
          autoComplete='new-password'
          onChange={(event) => {
            setPassword(event.target.value);
          }}
        />
      </div>

      <button className='btnSubmit' type='submit'>
        Register
      </button>
    </form>
  );
};
