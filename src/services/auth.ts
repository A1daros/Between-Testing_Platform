import { supabase } from '../lib/supabase';
import { ROUTES } from '../constants/routes';
import { getAuthErrorMessage } from '../utils/getAuthErrorMessage';

export const signIn = async (email: string, password: string) => {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(getAuthErrorMessage(error));
  }
};

type SignUpInput = {
  name: string;
  surname: string;
  email: string;
  password: string;
};

export const signUp = async ({
  name,
  surname,
  email,
  password,
}: SignUpInput): Promise<{ hasSession: boolean }> => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: `${name} ${surname}`,
        name,
        surname,
      },
    },
  });

  if (error) {
    throw new Error(getAuthErrorMessage(error));
  }

  return { hasSession: Boolean(data.session) };
};

export const sendPasswordResetEmail = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}${ROUTES.updatePassword}`,
  });

  if (error) {
    throw new Error(getAuthErrorMessage(error));
  }
};
