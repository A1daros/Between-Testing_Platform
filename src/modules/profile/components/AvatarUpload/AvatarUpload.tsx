import styles from './AvatarUpload.module.scss';
import { useState, type ChangeEvent } from 'react';
import {
  ALLOWED_AVATAR_TYPES,
  uploadAvatar,
  validateAvatarFile,
} from '../../../../services/profile';
import { getErrorMessage } from '../../../../utils/getErrorMessage';
import { Alert } from '../../../shared/components/Alert';

type AvatarUploadProps = {
  userId: string;
  avatarUrl: string | null;
  onUploadSuccess: () => Promise<void>;
};

export const AvatarUpload = ({
  userId,
  avatarUrl,
  onUploadSuccess,
}: AvatarUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    const file = input.files?.[0];

    input.value = '';

    if (!file) {
      return;
    }

    const validationError = validateAvatarFile(file);

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setErrorMessage('');
    setIsUploading(true);

    try {
      await uploadAvatar(userId, file, avatarUrl);
      await onUploadSuccess();
    } catch (error) {
      console.error('Avatar upload failed:', error);
      setErrorMessage(
        getErrorMessage(error, 'Під час завантаження щось пішло не так.'),
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={styles.avatarWrapper}>
      <div className={styles.previewContainer}>
        {avatarUrl ? (
          <img src={avatarUrl} alt='Аватар' className={styles.avatarImage} />
        ) : (
          <div className={styles.avatarPlaceholder}>
            <span>Немає фото</span>
          </div>
        )}

        {isUploading && (
          <div className={styles.loadingOverlay}>
            <span className={styles.loadingText}>ЗБЕРЕЖЕННЯ...</span>
          </div>
        )}
      </div>

      <div className={styles.controls}>
        <label htmlFor='avatar-file-input' className={styles.uploadLabel}>
          {isUploading ? 'Виконується...' : 'Змінити аватар'}
        </label>
        <input
          id='avatar-file-input'
          type='file'
          accept={Object.keys(ALLOWED_AVATAR_TYPES).join(',')}
          disabled={isUploading}
          className={styles.hiddenInput}
          onChange={handleFileChange}
        />
        <p className={styles.hint}>PNG, JPEG або WebP. Максимум 2 МБ.</p>
      </div>

      {errorMessage && <Alert>{errorMessage}</Alert>}
    </div>
  );
};
