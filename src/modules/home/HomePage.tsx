import { useEffect, useState } from 'react';
import type { Test } from '../../types/database';
import { getTest } from '../../services/quiz';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

export const HomePage = () => {
  const [tests, setTests] = useState<Test[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    const loadTests = async () => {
      try {
        const data = await getTest();

        setTests(data);
      } catch (error) {
        console.log(error);
      }
    };

    loadTests();
  }, []);

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      console.log(session?.user.email);
    };

    getSession();
  }, []);

  const { user, session, loading, signOut } = useAuth();
  console.log('User:', user);
  console.log('Session:', session);
  console.log('Loading:', loading);

  return (
    <section id='center'>
      <button
        onClick={async () => {
          await supabase.auth.signOut();

          navigate('/login');
        }}
      >
        Log out
      </button>

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
