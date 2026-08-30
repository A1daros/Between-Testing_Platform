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

export const ProfilePage = () => {
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
        setErrorMessage('Failed to load page!');
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
      <main className={styles.page}>
        <p className={styles.errorMessage}>{errorMessage}</p>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className={styles.page}>
        <p className={styles.infoMessage}>Profile not found.</p>
      </main>
    );
  }

  return (
    <main className={styles.page}>
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
    </main>
  );
};
