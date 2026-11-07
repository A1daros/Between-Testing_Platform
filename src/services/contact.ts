import { FunctionsHttpError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

type ContactMessage = {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
  website: string;
};

const DEFAULT_CONTACT_ERROR =
  'Не вдалося надіслати повідомлення. Спробуйте ще раз пізніше.';

export const sendContactMessage = async (body: ContactMessage) => {
  const { error } = await supabase.functions.invoke('send-contact-email', {
    body,
  });

  if (!error) {
    return;
  }

  if (error instanceof FunctionsHttpError) {
    const payload = await error.context.json().catch(() => null);

    if (typeof payload?.error === 'string') {
      throw new Error(payload.error);
    }
  }

  throw new Error(DEFAULT_CONTACT_ERROR);
};
