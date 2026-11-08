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
import { padNumber } from '../../../../utils/padNumber';
import { FormField } from '../../../shared/components/FormField';
import { FormTextarea } from '../../../shared/components/FormTextarea';
import { Alert } from '../../../shared/components/Alert';
import { SectionHeader } from '../../../shared/components/SectionHeader';

const STEPS = [
  {
    title: 'Залиште заявку',
    description: 'Опрацювання протягом 15 хвилин.',
  },
  {
    title: 'Дзвінок менеджера',
    description: 'Підбір зручного часу та безкоштовний урок.',
  },
  {
    title: 'Старт навчання',
    description: 'Реєстрація та початок навчання.',
  },
];

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
    <section id={CONTACTS_SECTION_ID} className={styles.page}>
      <SectionHeader label='BETWEEN / CONTACT' title="Зв'язатися з нами" />

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
          <address className={styles.contacts}>
            <div className={styles.contactRow}>
              <span className={styles.contactLabel}>Телефон</span>
              <a href={`tel:${SCHOOL_PHONE}`} className={styles.contactValue}>
                {SCHOOL_PHONE_LABEL}
              </a>
            </div>

            <div className={styles.contactRow}>
              <span className={styles.contactLabel}>Email</span>
              <a href={`mailto:${SCHOOL_EMAIL}`} className={styles.contactValue}>
                {SCHOOL_EMAIL}
              </a>
            </div>

            <div className={styles.contactRow}>
              <span className={styles.contactLabel}>Instagram</span>
              <a
                href={SCHOOL_INSTAGRAM_URL}
                target='_blank'
                rel='noopener noreferrer'
                className={styles.contactValue}
              >
                {SCHOOL_INSTAGRAM_HANDLE}
              </a>
            </div>
          </address>

          <ol className={styles.steps}>
            {STEPS.map((step, index) => (
              <li key={step.title} className={styles.step}>
                <span className={styles.stepNumber}>
                  {padNumber(index + 1)}
                </span>
                <div>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepDescription}>{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
};
