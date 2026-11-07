import styles from './ProfilePage.module.scss';
import { ChangePasswordForm } from './components/ChangePasswordForm';
import { EditProfileForm } from './components/EditProfileForm';
import { ChangeEmailForm } from './components/ChangeEmailForm';
import { useAuth } from '../../hooks/useAuth';
import { usePageMeta } from '../../hooks/usePageMeta';
import { ErrorState } from '../shared/components/ErrorState';

export const ProfilePage = () => {
  usePageMeta({ title: 'Профіль', noindex: true });

  const { user, profile, refreshProfile } = useAuth();

  if (!profile) {
    return (
      <div className={styles.page}>
        <ErrorState
          message='Не вдалося завантажити профіль.'
          onAction={() => {
            refreshProfile().catch((error) =>
              console.error('Failed to reload profile:', error),
            );
          }}
        />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.formsContainer}>
        <EditProfileForm profile={profile} />

        <div className={styles.rightColumn}>
          <ChangePasswordForm />
          <ChangeEmailForm currentEmail={user?.email} />
        </div>
      </div>
    </div>
  );
};
