import styles from './AwaitingApproval.module.scss';
import { useState } from 'react';
import { Link, Navigate, generatePath } from 'react-router-dom';
import { useAuth } from '../../../../hooks/useAuth';
import { ROUTES } from '../../../../constants/routes';
import { SCHOOL_INSTAGRAM_URL } from '../../../../constants/constants';
import { isProfileApproved } from '../../../../utils/isProfileApproved';
import { Loader } from '../../../Loader';

export const AwaitingApproval = () => {
  const { user, profile, loading, refreshProfile } = useAuth();

  const [isChecking, setIsChecking] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (loading) {
    return <Loader />;
  }

  if (isProfileApproved(profile)) {
    return <Navigate to={ROUTES.tests} replace />;
  }

  const isRejected = profile?.status === 'rejected';

  const handleCheckStatus = async () => {
    setIsChecking(true);
    setMessage('');
    setErrorMessage('');

    try {
      await refreshProfile();

      setMessage('Статус поки не змінився. Спробуйте пізніше.');
    } catch (error) {
      console.error('Failed to refresh profile:', error);
      setErrorMessage('Не вдалося перевірити статус. Спробуйте ще раз.');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <header className={styles.header}>
          <span className={styles.label}>BETWEEN / ACCOUNT</span>

          <h1 className={styles.title}>
            {isRejected ? 'Доступ не надано' : 'Акаунт очікує підтвердження'}
          </h1>

          <p className={styles.description}>
            {isRejected
              ? 'Адміністратор школи не підтвердив цей акаунт. Якщо це помилка, напишіть нам.'
              : 'Дякуємо за реєстрацію! Адміністратор школи перевірить ваш акаунт і відкриє доступ до тестів.'}
          </p>
        </header>

        {errorMessage && (
          <div className={styles.errorCard} role='alert'>
            <p className={styles.errorText}>{errorMessage}</p>
          </div>
        )}

        {message && (
          <div className={styles.infoCard} role='status'>
            <p className={styles.infoText}>{message}</p>
          </div>
        )}

        <div className={styles.actions}>
          {!isRejected && (
            <button
              type='button'
              className={styles.btnSubmit}
              disabled={isChecking}
              onClick={handleCheckStatus}
            >
              {isChecking ? 'Перевіряємо...' : 'Перевірити статус'}
            </button>
          )}

          <a
            href={SCHOOL_INSTAGRAM_URL}
            target='_blank'
            rel='noopener noreferrer'
            className={styles.btnSecondary}
          >
            Написати школі в Instagram
          </a>

          {user && (
            <Link
              to={generatePath(ROUTES.profile, { userId: user.id })}
              className={styles.btnSecondary}
            >
              Мій профіль
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
