import styles from './EditProfileForm.module.scss';
import { useEffect, useState, type FormEvent } from 'react';
import { updateProfile } from '../../../../services/profile';
import type { Profile } from '../../../../types/database';
import { useAuth } from '../../../../hooks/useAuth';
import { FormField } from '../../../shared/components/FormField';
import { Alert } from '../../../shared/components/Alert';
import { AvatarUpload } from '../AvatarUpload';

const SUCCESS_MESSAGE_TIMEOUT_MS = 3000;

type EditProfileFormProps = {
  profile: Profile;
};

export const EditProfileForm = ({ profile }: EditProfileFormProps) => {
  const [displayName, setDisplayName] = useState(profile.display_name || '');
  const [birthDate, setBirthDate] = useState(profile.birth_date || '');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { user, refreshProfile } = useAuth();

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    const timeoutId = setTimeout(
      () => setSuccessMessage(''),
      SUCCESS_MESSAGE_TIMEOUT_MS,
    );

    return () => clearTimeout(timeoutId);
  }, [successMessage]);

  const handleAvatarSuccess = async () => {
    setSuccessMessage('Аватар успішно оновлено.');
    await refreshProfile();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      await updateProfile(profile.id, {
        display_name: displayName.trim(),
        birth_date: birthDate || null,
      });
      await refreshProfile();

      setSuccessMessage('Дані профілю успішно оновлено.');
    } catch (error) {
      console.error('Failed to update profile:', error);
      setErrorMessage('Під час збереження вашого профілю щось пішло не так.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Налаштування профілю</h2>
        <p className={styles.subtitle}>
          Оновіть свої особисті дані та фотографію профілю
        </p>
      </div>

      <div className={styles.avatarSection}>
        <AvatarUpload
          userId={profile.id}
          avatarUrl={profile.avatar_url}
          onUploadSuccess={handleAvatarSuccess}
        />
      </div>

      {successMessage && <Alert type='success'>{successMessage}</Alert>}
      {errorMessage && <Alert>{errorMessage}</Alert>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <FormField
            id='profile-name'
            type='text'
            name='displayName'
            label="Повне ім'я"
            autoComplete='name'
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            required
          />

          <FormField
            id='profile-email'
            type='email'
            label='Електронна пошта користувача'
            value={user?.email ?? ''}
            disabled
          />

          <FormField
            id='profile-birth'
            type='date'
            name='birthDate'
            label='Дата народження'
            value={birthDate}
            onChange={(event) => setBirthDate(event.target.value)}
          />
        </div>

        <button className={styles.btnSubmit} type='submit' disabled={isLoading}>
          {isLoading ? 'Збереження...' : 'Зберегти зміни'}
        </button>
      </form>
    </div>
  );
};
