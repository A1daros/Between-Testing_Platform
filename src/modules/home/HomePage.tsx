import { useEffect, useState } from 'react';
import type { Test } from '../../types/database';
import { getTests } from '../../services/quiz';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Loader } from '../Loader';

export const HomePage = () => {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const loadTests = async () => {
      setLoading(true);
      setErrorMessage('');

      try {
        const data = await getTests();

        setTests(data);
      } catch (error) {
        console.error('Failed to load tests:', error);
        setErrorMessage('Failed to load Home Page!');
      } finally {
        setLoading(false);
      }
    };

    loadTests();
  }, []);

  const { signOut, user, profile } = useAuth();

  console.log(user?.email);
  console.log(user?.role);
  console.log(profile?.role)

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  if (loading) {
    return <Loader />;
  }

  if (errorMessage) {
    return <p>{errorMessage}</p>;
  }

  return (
    <section id='center'>
      <button onClick={handleSignOut}>Log out</button>

      <button onClick={() => navigate('/login')}>Log in</button>

      <ul>
        {tests.map((test) => (
          <li key={test.id} style={{ cursor: 'pointer' }}>
            <Link to={`/tests/${test.id}`}>{test.title}</Link>
          </li>
        ))}
      </ul>
    </section>
  );
};
