import { useState } from 'react';
import styles from './ContactUs.module.scss';
import { supabase } from '../../../../lib/supabase';

export const ContactUs = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsLoading(true);
    setErrorMessage('');
    setIsSuccess(false);

    try {
      const { error } = await supabase.functions.invoke('send-contact-email', {
        body: { firstName, lastName, email, message },
      });

      if (error) {
        throw error;
      }

      setIsSuccess(true);

      setFirstName('');
      setLastName('');
      setEmail('');
      setMessage('');
      setAgreeToTerms(false);
    } catch (error) {
      console.error('Resolve error:', error);
      setErrorMessage('Failed to send the message. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <h2 className={styles.title}>Contact us</h2>

      <div className={styles.container}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.fieldGroup}>
            <label htmlFor='first-name' className={styles.label}>
              First name
            </label>
            <input
              id='first-name'
              name='first-name'
              type='text'
              placeholder='Place your first name'
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor='last-name' className={styles.label}>
              Last name
            </label>
            <input
              id='last-name'
              name='last-name'
              type='text'
              placeholder='Place your last name'
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor='email' className={styles.label}>
              Email
            </label>
            <input
              id='email'
              name='email'
              type='email'
              placeholder='example@gmail.com'
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor='message' className={styles.label}>
              Message
            </label>
            <textarea
              id='message'
              name='message'
              placeholder='Describe your problem or solution...'
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              className={styles.inputTextarea}
              required
            />
          </div>

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
                I agree to the Terms of Service and Privacy Policy
              </span>
            </label>
          </div>

          <div aria-live='polite'>
            {errorMessage && (
              <div className={styles.errorCard} role='alert'>
                <p className={styles.errorText}>{errorMessage}</p>
              </div>
            )}
            {isSuccess && (
              <div className={styles.successCard}>
                <p className={styles.successText}>Message sent successfully!</p>
              </div>
            )}
          </div>

          <button
            type='submit'
            className={styles.submitBtn}
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send Message'}
          </button>
        </form>

        <address className={styles.additional}>
          <div className={styles.infoBlock}>
            <h3 className={styles.infoTitle}>Phone</h3>
            <a href='tel:+380733060097' className={styles.infoDescription}>
              +380 73 306 00 97
            </a>
          </div>

          <div className={styles.infoBlock}>
            <h3 className={styles.infoTitle}>Email</h3>
            <a
              href='mailto:school.between@gmail.com'
              className={styles.infoDescription}
            >
              school.between@gmail.com
            </a>
          </div>
        </address>
      </div>
    </div>
  );
};
