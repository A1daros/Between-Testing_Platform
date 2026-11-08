import { supabase } from '../lib/supabase';
import { LEGAL_VERSION } from '../constants/legal';
import { ROUTES } from '../constants/routes';
import { getAuthErrorMessage } from '../utils/getAuthErrorMessage';

const throwAuthError = (error: { code?: string } | null) => {
  if (error) {
    throw new Error(getAuthErrorMessage(error));
  }
};

export const signIn = async (email: string, password: string) => {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  throwAuthError(error);
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
        terms_version: LEGAL_VERSION,
      },
    },
  });

  throwAuthError(error);

  return { hasSession: Boolean(data.session) };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();

  throwAuthError(error);
};

export const sendPasswordResetEmail = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}${ROUTES.updatePassword}`,
  });

  throwAuthError(error);
};

export const updatePassword = async (newPassword: string) => {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  throwAuthError(error);
};

export const updateEmail = async (newEmail: string) => {
  const { error } = await supabase.auth.updateUser({
    email: newEmail,
  });

  throwAuthError(error);
};
