import { useState, type ChangeEvent } from 'react';
import styles from './AvatarUpload.module.scss';
import type { Profile } from '../../../../types/database';
import { uploadAvatar } from '../../../../services/profile';

type AvatarUploadProps = {
  userId: string;
  avatarUrl: string | null;
  onUploadSuccess?: (updatedProfile: Profile) => void;
};

export const AvatarUpload = ({
  userId,
  avatarUrl,
  onUploadSuccess,
}: AvatarUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setErrorMessage('');
    setIsUploading(true);

    try {
      const updatedProfile = await uploadAvatar(userId, file);

      if (updatedProfile && onUploadSuccess) {
        onUploadSuccess(updatedProfile);
      }
    } catch (error) {
      console.error('Avatar upload failed:', error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Something went wrong during upload.',
      );
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  return (
    <div className={styles.avatarWrapper}>
      <div className={styles.previewContainer}>
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt='Profile preview'
            className={styles.avatarImage}
          />
        ) : (
          <div className={styles.avatarPlaceholder}>
            <span>NO_IMG</span>
          </div>
        )}

        {isUploading && (
          <div className={styles.loadingOverlay}>
            <span className={styles.loadingText}>SAVING...</span>
          </div>
        )}
      </div>

      <div className={styles.controls}>
        <label htmlFor='avatar-file-input' className={styles.uploadLabel}>
          {isUploading ? 'Uploading...' : 'Change avatar'}
        </label>
        <input
          id='avatar-file-input'
          type='file'
          accept='image/png, image/jpeg, image/webp'
          disabled={isUploading}
          className={styles.hiddenInput}
          onChange={handleFileChange}
        />
        <p className={styles.hint}>PNG, JPEG or WebP. Max 2MB.</p>
      </div>

      {errorMessage && (
        <div className={styles.errorCard}>
          <p className={styles.errorText}>{errorMessage}</p>
        </div>
      )}
    </div>
  );
};
