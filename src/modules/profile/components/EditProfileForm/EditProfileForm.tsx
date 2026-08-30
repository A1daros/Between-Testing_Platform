import styles from './EditProfileForm.module.scss';
import { useState, type FormEvent } from 'react';
import { updateProfile } from '../../../../services/profile'; // Скоригуйте шлях до сервісів
import { AvatarUpload } from '../AvatarUpload/AvatarUpload';
import type { Profile } from '../../../../types/database';
import { useAuth } from '../../../../hooks/useAuth';

type EditProfileFormProps = {
  userId: string;
  profile: Profile;
  onSaveSuccess?: (updatedProfile: Profile) => void;
};

export const EditProfileForm = ({
  userId,
  profile,
  onSaveSuccess,
}: EditProfileFormProps) => {
  const [displayName, setDisplayName] = useState(profile.display_name || '');
  const [birthDate, setBirthDate] = useState(profile.birth_date || '');
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(
    profile.avatar_url,
  );

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { user: currentUser } = useAuth();

  const handleAvatarSuccess = (updatedProfile: Profile) => {
    setCurrentAvatarUrl(updatedProfile.avatar_url);
    setSuccessMessage('Avatar updated successfully.');
    onSaveSuccess?.(updatedProfile);

    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const updatedProfile = await updateProfile(userId, {
        display_name: displayName,
        birth_date: birthDate || null,
      });

      if (updatedProfile) {
        setSuccessMessage('Profile details updated successfully.');
        if (onSaveSuccess) {
          onSaveSuccess(updatedProfile);
        }
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Something went wrong while saving your profile.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <div className={styles.header}>
        <h2 className={styles.title}>Profile Settings</h2>
        <p className={styles.subtitle}>
          Update your personal information and profile picture
        </p>
      </div>

      <div className={styles.avatarSection}>
        <AvatarUpload
          userId={userId}
          avatarUrl={currentAvatarUrl}
          onUploadSuccess={handleAvatarSuccess}
        />
      </div>

      {successMessage && (
        <div className={styles.successCard}>
          <p className={styles.successText}>✓ {successMessage}</p>
        </div>
      )}

      {errorMessage && (
        <div className={styles.errorCard}>
          <p className={styles.errorText}>{errorMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <div className={styles.inputContainer}>
            <input
              id='profile-name'
              type='text'
              name='displayName'
              value={displayName}
              placeholder=' '
              required
              className={styles.input}
              onChange={(event) => setDisplayName(event.target.value)}
            />
            <label htmlFor='profile-name' className={styles.label}>
              Full Name
            </label>
          </div>

          <div className={styles.inputContainer}>
            <p className={styles.input}>{currentUser?.email}</p>
            <label htmlFor='profile-name' className={styles.label}>
              User Email
            </label>
          </div>

          <div className={styles.inputContainer}>
            <input
              id='profile-birth'
              type='date'
              name='birthDate'
              value={birthDate}
              placeholder=' '
              className={styles.input}
              onChange={(event) => setBirthDate(event.target.value)}
            />
            <label htmlFor='profile-birth' className={styles.label}>
              Birth Date
            </label>
          </div>
        </div>

        <button className={styles.btnSubmit} type='submit' disabled={isLoading}>
          {isLoading ? 'Saving adjustments...' : 'Save changes'}
        </button>
      </form>
    </div>
  );
};
