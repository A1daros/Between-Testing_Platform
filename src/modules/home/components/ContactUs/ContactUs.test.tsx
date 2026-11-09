import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { sendContactMessage } from '../../../../services/contact';
import { ContactUs } from './ContactUs';

vi.mock('../../../../services/contact', () => ({
  sendContactMessage: vi.fn(),
}));

const fill = (id: string, value: string) => {
  fireEvent.change(document.getElementById(id) as HTMLElement, {
    target: { value },
  });
};

const fillAndSubmit = () => {
  render(
    <MemoryRouter>
      <ContactUs />
    </MemoryRouter>,
  );

  fill('contact-first-name', 'Ivan');
  fill('contact-last-name', 'Koval');
  fill('contact-email', 'ivan@example.test');
  fill('contact-message', 'Hello');
  fireEvent.click(document.getElementById('terms') as HTMLElement);
  fireEvent.submit(document.querySelector('form') as HTMLFormElement);
};

describe('ContactUs', () => {
  it('sends the form and clears it', async () => {
    vi.mocked(sendContactMessage).mockResolvedValue(undefined);
    fillAndSubmit();

    expect(
      await screen.findByText(/Повідомлення успішно надіслано!/),
    ).toBeInTheDocument();
    expect(sendContactMessage).toHaveBeenCalledWith({
      firstName: 'Ivan',
      lastName: 'Koval',
      email: 'ivan@example.test',
      message: 'Hello',
      website: '',
    });
    expect(document.getElementById('contact-message')).toHaveValue('');
    expect(document.getElementById('terms')).not.toBeChecked();
  });

  it('shows the error and keeps the text', async () => {
    vi.mocked(sendContactMessage).mockRejectedValue(
      new Error('Забагато запитів.'),
    );
    fillAndSubmit();

    expect(await screen.findByText('Забагато запитів.')).toBeInTheDocument();
    expect(document.getElementById('contact-message')).toHaveValue('Hello');
  });

  it('hides the honeypot from people', () => {
    render(
      <MemoryRouter>
        <ContactUs />
      </MemoryRouter>,
    );

    const honeypot = document.querySelector('input[name="website"]');

    expect(honeypot).toHaveAttribute('tabindex', '-1');
    expect(honeypot).toHaveAttribute('aria-hidden', 'true');
  });
});
