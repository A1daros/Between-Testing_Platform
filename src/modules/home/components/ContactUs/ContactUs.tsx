import styles from './ContactUs.module.scss';
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { sendContactMessage } from '../../../../services/contact';
import { CONTACTS_SECTION_ID, ROUTES } from '../../../../constants/routes';
import {
  SCHOOL_EMAIL,
  SCHOOL_INSTAGRAM_HANDLE,
  SCHOOL_INSTAGRAM_URL,
  SCHOOL_PHONE,
  SCHOOL_PHONE_LABEL,
} from '../../../../constants/school';
import { getErrorMessage } from '../../../../utils/getErrorMessage';
import { FormField } from '../../../shared/components/FormField';
import { FormTextarea } from '../../../shared/components/FormTextarea';
import { Alert } from '../../../shared/components/Alert';

export const ContactUs = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsLoading(true);
    setErrorMessage('');
    setIsSuccess(false);

    try {
      await sendContactMessage({
        firstName,
        lastName,
        email,
        message,
        website,
      });

      setIsSuccess(true);

      setFirstName('');
      setLastName('');
      setEmail('');
      setMessage('');
      setAgreeToTerms(false);
    } catch (error) {
      console.error('Failed to send contact message:', error);

      setErrorMessage(
        getErrorMessage(
          error,
          'Не вдалося надіслати повідомлення. Спробуйте ще раз пізніше.',
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id={CONTACTS_SECTION_ID} className={styles.page}>
      <h2 className={styles.title}>Зв'язатися з нами</h2>

      <div className={styles.container}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <FormField
              id='contact-first-name'
              name='first-name'
              type='text'
              label="Ім'я"
              autoComplete='given-name'
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              required
            />

            <FormField
              id='contact-last-name'
              name='last-name'
              type='text'
              label='Прізвище'
              autoComplete='family-name'
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              required
            />

            <FormField
              id='contact-email'
              name='email'
              type='email'
              label='Електронна пошта'
              autoComplete='email'
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            <FormTextarea
              id='contact-message'
              name='message'
              label='Повідомлення'
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              required
            />
          </div>

          <input
            type='text'
            name='website'
            tabIndex={-1}
            autoComplete='off'
            aria-hidden='true'
            className={styles.honeypot}
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
          />

          <div className={styles.formAction}>
            <label className={styles.checkboxWrapper}>
              <input
                id='terms'
                type='checkbox'
                checked={agreeToTerms}
                onChange={(event) => setAgreeToTerms(event.target.checked)}
                className={styles.checkbox}
                required
              />
              <span className={styles.checkboxDescription}>
                Я погоджуюся з{' '}
                <Link
                  to={ROUTES.terms}
                  target='_blank'
                  className={styles.legalLink}
                >
                  Умовами користування
                </Link>{' '}
                та{' '}
                <Link
                  to={ROUTES.privacy}
                  target='_blank'
                  className={styles.legalLink}
                >
                  Політикою конфіденційності
                </Link>
              </span>
            </label>
          </div>

          <div aria-live='polite'>
            {errorMessage && <Alert>{errorMessage}</Alert>}
            {isSuccess && (
              <Alert type='success'>Повідомлення успішно надіслано!</Alert>
            )}
          </div>

          <button
            type='submit'
            className={styles.submitBtn}
            disabled={isLoading}
          >
            {isLoading ? 'Виконується...' : 'Надіслати повідомлення'}
          </button>
        </form>

        <div className={styles.additionalInfo}>
          <address className={styles.address}>
            <div className={styles.addressBlock}>
              <span className={styles.addressTitle}>Тел:</span>
              <a
                href={`tel:${SCHOOL_PHONE}`}
                className={styles.addressDescription}
              >
                {SCHOOL_PHONE_LABEL}
              </a>
            </div>

            <div className={styles.addressBlock}>
              <span className={styles.addressTitle}>Email:</span>
              <a
                href={`mailto:${SCHOOL_EMAIL}`}
                className={styles.addressDescription}
              >
                {SCHOOL_EMAIL}
              </a>
            </div>

            <div className={styles.addressBlock}>
              <span className={styles.addressTitle}>Instagram:</span>
              <a
                href={SCHOOL_INSTAGRAM_URL}
                target='_blank'
                rel='noopener noreferrer'
                className={styles.addressDescription}
              >
                {SCHOOL_INSTAGRAM_HANDLE}
              </a>
            </div>
          </address>

          <div className={styles.info}>
            <div className={styles.infoBlock}>
              <span className={styles.infoTitle}>1. Залиште заявку</span>
              <p className={styles.infoDescription}>
                Опрацювання протягом 15 хвилин.
              </p>
            </div>
            <div className={styles.infoBlock}>
              <span className={styles.infoTitle}>2. Дзвінок менеджера</span>
              <p className={styles.infoDescription}>
                Підбір зручного часу та безкоштовний урок.
              </p>
            </div>
            <div className={styles.infoBlock}>
              <span className={styles.infoTitle}>3. Старт навчання</span>
              <p className={styles.infoDescription}>
                Реєстрація та початок навчання.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
