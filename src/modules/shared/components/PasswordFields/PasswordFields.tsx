import { MIN_PASSWORD_LENGTH } from '../../../../constants/auth';
import { FormField } from '../FormField';

type PasswordFieldsProps = {
  idPrefix: string;
  password: string;
  confirmPassword: string;
  passwordLabel?: string;
  confirmLabel?: string;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
};

export const PasswordFields = ({
  idPrefix,
  password,
  confirmPassword,
  passwordLabel = 'Новий пароль',
  confirmLabel = 'Підтвердьте новий пароль',
  onPasswordChange,
  onConfirmPasswordChange,
}: PasswordFieldsProps) => {
  return (
    <>
      <FormField
        id={`${idPrefix}-new-password`}
        type='password'
        name='new-password'
        label={passwordLabel}
        autoComplete='new-password'
        minLength={MIN_PASSWORD_LENGTH}
        value={password}
        onChange={(event) => onPasswordChange(event.target.value)}
        required
      />

      <FormField
        id={`${idPrefix}-confirm-password`}
        type='password'
        name='confirm-password'
        label={confirmLabel}
        autoComplete='new-password'
        minLength={MIN_PASSWORD_LENGTH}
        value={confirmPassword}
        onChange={(event) => onConfirmPasswordChange(event.target.value)}
        required
      />
    </>
  );
};
