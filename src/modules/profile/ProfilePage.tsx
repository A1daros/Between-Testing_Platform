import { useEffect, useState } from 'react';
import { ChangePasswordForm } from './components/ChangePasswordForm';
import { EditProfileForm } from './components/EditProfileForm';
import styles from './ProfilePage.module.scss';
import type { Profile } from '../../types/database';
import { getProfile } from '../../services/profile';
import { useParams } from 'react-router-dom';
import { Loader } from '../Loader';
import { useAuth } from '../../hooks/useAuth';
import { ChangeEmailForm } from './components/ChangeEmailForm';
import { usePageMeta } from '../../hooks/usePageMeta';

export const ProfilePage = () => {
  usePageMeta({ title: 'Профіль', noindex: true });

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { userId } = useParams();
  const { user: currentUser } = useAuth();

  const isOwnProfile = currentUser?.id === userId;

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setErrorMessage('');

      try {
        const data = await getProfile(String(userId));

        setProfile(data);
      } catch (error) {
        console.error('Failed to load student profile', error);
        setErrorMessage('Не вдалось завантажити профіль!');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [userId]);

  if (loading) {
    return <Loader />;
  }

  if (errorMessage) {
    return (
      <div className={styles.page}>
        <p className={styles.errorMessage}>{errorMessage}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={styles.page}>
        <p className={styles.infoMessage}>Профіль не знайдено.</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {isOwnProfile && (
        <div className={styles.formsContainer}>
          <EditProfileForm
            userId={profile.id}
            profile={profile}
            onSaveSuccess={(updatedProfile) => setProfile(updatedProfile)}
          />

          <div className={styles.rightColumn}>
            <ChangePasswordForm />
            <ChangeEmailForm />
          </div>
        </div>
      )}
    </div>
  );
};
